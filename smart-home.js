require("v8-compile-cache");
const { app, BrowserWindow, Menu, ipcMain, Notification } = require("electron");

const path = require("path");
const contextMenu = require("electron-context-menu");
const express = require("express");

var weather = require("openweather-apis");
var cron = require("node-cron");

let location = {};

const { getIPLocation } = require("./lib/getIPLocation");
const { getNews } = require("./lib/getNews");
const { getForecast } = require("./lib/getForecast");
const { getFormattedTime } = require("./lib/getFormattedTime");
const {
  play,
  pause,
  next,
  setVolume,
  currentPlayingTrack,
  getFeaturedPlaylists,
  authorizationCode,
  accessTokenFromAuthCode,
  refreshToken,
  getMyCurrentPlaybackState,
} = require("./lib/spotify");

contextMenu({});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const port = 1118;
function createWindow() {
  const expressApp = express();
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true, // protect against prototype pollution
    },
  });

  mainWindow.loadFile("public/index.html");

  mainWindow.webContents.on("did-finish-load", async () => {
    authorizationCode();
    location = await getIPLocation();
    const news = await getNews();

    let footerInfo = ["chrome", "node", "electron"].reduce((a, v) => {
      a[v] = process.versions[v];
      return a;
    }, {});

    mainWindow.webContents.send("fromMain_FinishLoad", {
      footerInfo,
      location,
      news,
    });
    const forecast = await getForecast(
      location["zip_code"],
      location["lat"],
      location["lon"]
    );
    mainWindow.webContents.send("fromMain_Interval", forecast);

    setTimeout(async () => {
      const currentTrack = await currentPlayingTrack();

      currentTrack &&
        (await mainWindow.webContents.send(
          "fromMain_SpotifyTrack",
          currentTrack
        ));
      const recent = await getFeaturedPlaylists();

      const playbackState = await getMyCurrentPlaybackState();

      recent && mainWindow.webContents.send("fromMain_Spotify", recent);
      playbackState &&
        mainWindow.webContents.send("fromMain_playback", playbackState);
    }, 1000);
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  expressApp.get("/callback", async (req, res) => {
    await accessTokenFromAuthCode(req.query.code);
    BrowserWindow.getAllWindows().forEach(
      (win) => "spotifyToken" === win.title && win.close()
    );
  });

  expressApp.listen(port, () => {
    console.log(
      getFormattedTime() + ` :  listening at http://localhost:${port}`
    );
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("toMain", (event, message) => {
  console.log(
    getFormattedTime() + " : channel: toMain (sendMessage) :",
    message
  );
  sendMessage(message);
});

ipcMain.on("toMain_Spotify", async (event, action) => {
  console.log(
    getFormattedTime() + " : channel: toMain_Play :",
    action.uri ? "play" : action,
    action.uri
  );
  switch (action.action ? action.action : action) {
    case "play":
      const playbackState = await play(action.uri);
      if (playbackState) {
        mainWindow.webContents.send("fromMain_playback", playbackState);
        
        setTimeout(
          async () =>
            mainWindow.webContents.send(
              "fromMain_playback",
              await getMyCurrentPlaybackState()
            ),
          playbackState.item.duration_ms - playbackState.progress_ms + 100
        );
      }
      break;
    case "pause":
      pause();
      break;
    case "next":
      const playbackState1 = await next();
      playbackState1 &&
        mainWindow.webContents.send("fromMain_playback", playbackState1);
      setTimeout(
        async () =>
          mainWindow.webContents.send(
            "fromMain_playback",
            await getMyCurrentPlaybackState()
          ),
        playbackState1.item.duration_ms - playbackState1.progress_ms + 100
      );
      break;

    default:
      console.log(getFormattedTime() + " : not implemented");
  }
  setTimeout(async () => {
    const currentTrack = await currentPlayingTrack();
    console.log(getFormattedTime() + " : " + currentTrack.name);

    currentTrack &&
      mainWindow.webContents.send("fromMain_SpotifyTrack", currentTrack);

    const recent = await getFeaturedPlaylists();
    console.log(getFormattedTime() + " : " + recent.length);

    recent && mainWindow.webContents.send("fromMain_Spotify", recent);
  }, 1000);
});

ipcMain.on("toMain_SpotifyVolume", (event, volume) => {
  console.log(
    getFormattedTime() + " : channel: toMain_SpotifyVolume :",
    volume
  );
  setVolume(volume);
});

const publish = (channel, message) => {
  mainWindow.webContents.send(channel, message);
};
const sendMessage = (message) => {
  console.log(getFormattedTime() + " : sendMessage", message);
  new Notification({
    title: "Smart Home",
    body: message,
  }).show();
};

cron.schedule("*/10 * * * *", async () => {
  const forecast = await getForecast(
    location["zip_code"],
    location["lat"],
    location["lon"]
  );
  mainWindow.webContents.send("fromMain_Interval", forecast);
  console.log(getFormattedTime() + " : running a task 10 minutes");
});

cron.schedule("*/59 * * * *", async () => {
  await refreshToken();
  console.log(getFormattedTime() + " : refreshing token");
});
