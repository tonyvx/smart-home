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
const {
  getFeaturedPlaylists,
  getSpotifyToken,
  getSpotifyTokenFromAuthCode,
  play,
  pause,
  next,
  setVolume,
  currentPlayingTrack,
  getMyRecentlyPlayedTracks,
} = require("./lib/spotify");

contextMenu({});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let expressApp;
let spotifyToken;
function createWindow() {
  expressApp = express();
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true, // protect against prototype pollution
    },
  });

  var menu = Menu.buildFromTemplate([
    {
      label: "Menu",
      // submenu: submenu(mainWindow),
    },
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.loadFile("public/index.html");

  mainWindow.webContents.on("did-finish-load", async () => {
    location = await getIPLocation();
    await getSpotifyToken();
    const news = await getNews();

    console.log(location);
    console.log(news);

    let footerInfo = ["chrome", "node", "electron"].reduce((a, v) => {
      a[v] = process.versions[v];
      return a;
    }, {});

    // get the Temperature

    mainWindow.webContents.send("fromMain_FinishLoad", {
      footerInfo,
      location,
      news,
    });

    const forecast = await getForecast(location["zip_code"]);
    mainWindow.webContents.send("fromMain_Interval", forecast);

    spotifyToken &&
      setTimeout(async () => {
        const playlist =
          spotifyToken.access_token &&
          (await getFeaturedPlaylists(spotifyToken.access_token));

        const currentTrack =
          spotifyToken.access_token &&
          (await currentPlayingTrack(spotifyToken.access_token));
        console.log(currentTrack);
        playlist && mainWindow.webContents.send("fromMain_Spotify", playlist);
        currentTrack &&
          (await mainWindow.webContents.send(
            "fromMain_SpotifyTrack",
            currentTrack
          ));
      }, 1000);
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  expressApp.get("/callback", async (req, res) => {
    sendMessage(req.query.code);
    spotifyToken = await getSpotifyTokenFromAuthCode(req.query.code);
    console.log(spotifyToken);
    BrowserWindow.getAllWindows().forEach(
      (win) => "spotifyToken" === win.title && win.close()
    );
  });

  expressApp.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
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
  console.log("channel: toMain (sendMessage) :", message);
  sendMessage(message);
});

ipcMain.on("toMain_SpotifyTokens", (event, message) => {
  console.log("channel: toMain (sendMessage) :", message);
  sendMessage(message);
});
ipcMain.on("toMain_OpenPlayer", (event, url) => {
  console.log("channel: toMain (sendMessage) :", url);

  const window = new BrowserWindow({
    title: "Spotify Player",
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
    },
    height: 600,
    width: 400,
  });
  window.loadURL(url);
  sendMessage(url);
});

ipcMain.on("toMain_Spotify", (event, action) => {
  console.log("channel: toMain_Play :", action);
  switch (action) {
    case "play":
      spotifyToken.access_token && play(spotifyToken.access_token);
      break;
    case "pause":
      spotifyToken.access_token && pause(spotifyToken.access_token);
      break;
    case "next":
      spotifyToken.access_token && next(spotifyToken.access_token);
      break;

    default:
      console.log("not implemented");
  }
  setTimeout(async () => {
    const currentTrack =
      spotifyToken.access_token &&
      (await currentPlayingTrack(spotifyToken.access_token));
    console.log(currentTrack);

    currentTrack &&
      mainWindow.webContents.send("fromMain_SpotifyTrack", currentTrack);

    const recent =
      spotifyToken.access_token &&
      (await getMyRecentlyPlayedTracks(spotifyToken.access_token));
    console.log(recent);

    recent && mainWindow.webContents.send("fromMain_Spotify", recent);
  }, 1000);
});

ipcMain.on("toMain_SpotifyVolume", (event, volume) => {
  console.log("channel: toMain_SpotifyVolume :", volume);
  spotifyToken.access_token && setVolume(spotifyToken.access_token, volume);
});

ipcMain.on("toMain_Volume", (event, url) => {
  console.log("channel: toMain_Volume :", url);
});

ipcMain.on("toMain_Next", (event, url) => {
  console.log("channel: toMain_Next :", url);
});

const sendMessage = (message) => {
  console.log("sendMessage", message);
  new Notification({
    title: "Attendance Manager",
    body: message,
  }).show();
};

cron.schedule("*/30 * * * *", async () => {
  weather.setZipCode(location["zip_code"]);
  const forecast = await getForecast(location["zip_code"]);
  mainWindow.webContents.send("fromMain_Interval", forecast);
  console.log("running a task 30 minutes");
});

const port = 1118;
