import { app, BrowserWindow, ipcMain, Notification, session } from "electron";
import contextMenu from "electron-context-menu";
import express from "express";
import path from "path";
import "v8-compile-cache";
import { setupSecrets } from "./creds";
import { getForecast } from "./lib/getForecast";
import { getFormattedTime } from "./lib/getFormattedTime";
import { getIPLocation, IPLocation } from "./lib/getIPLocation";
import { getNews } from "./lib/getNews";
import { accessTokenFromAuthCode, authorizationCode, currentPlayingTrack, getFeaturedPlaylists, getMyCurrentPlaybackState, next, pause, play, previous, refreshToken, setVolume, updateDevices } from "./lib/spotify";
import Store from 'electron-store';
import cron from "node-cron";

let location: IPLocation;


contextMenu({});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;
const port = 1118;


function createWindow() {
  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ['https://api.ipbase.com/*', 'https://newsapi.org/*']
  }
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['User-Agent'] = 'MyAgent'
    callback({ requestHeaders: details.requestHeaders })
  })

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

  mainWindow.loadFile("../public/index.html");

  mainWindow.webContents.on("did-finish-load", async () => {
    authorizationCode();
    location = await getIPLocation();
    const news = await getNews();

    let footerInfo = ["chrome", "node", "electron"].reduce((a, v) => {
      a[v] = process.versions[v] || "";
      return a;
    }, {} as { [process: string]: string });

    mainWindow?.webContents.send("fromMain_FinishLoad", {
      footerInfo,
      location,
      news,
    });
    const forecast = await getForecast(
      location.zip_code,
      location.lat,
      location.lon
    );
    mainWindow?.webContents.send("fromMain_Interval", forecast);

    setTimeout(async () => {
      const currentTrack = await currentPlayingTrack();

      currentTrack &&
        mainWindow?.webContents.send(
          "fromMain_SpotifyTrack",
          currentTrack
        );
      const recent = await getFeaturedPlaylists();

      const playbackState = await getMyCurrentPlaybackState();

      mainWindow && await updateDevices(mainWindow);

      recent && mainWindow?.webContents.send("fromMain_Spotify", recent);
      playbackState &&
        mainWindow?.webContents.send("fromMain_playback", playbackState);
    }, 1000);
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  expressApp.get("/callback", async (req, _res) => {
    await accessTokenFromAuthCode(String(req?.query?.code));
    BrowserWindow.getAllWindows().forEach(
      (win) => "spotifyToken" === win.getTitle() && win.close()
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

ipcMain.on("toMain_Settings", async (_event, message) => {
  try {
    console.log(
      getFormattedTime() + " : channel: toMain_Settings (update Secrets & devices) :",
      message
    );
    if (message) {
      setupSecrets(message,new Store());

      // const device = await updateDevices(mainWindow);
      // device && setupSecrets({ "DEVICE_ID": device.id });
    }
  } catch (e) {
    console.log("toMain_Settings", e);
  }
});


ipcMain.on("toMain", (_event, message) => {
  console.log(
    getFormattedTime() + " : channel: toMain (sendMessage) :",
    message
  );
  sendMessage(message);
});

ipcMain.on("toMain_Playback", async (_event, message) => {
  console.log(
    getFormattedTime() + " : channel: toMain_Playback (sendMessage) :",
    message
  );
  const playbackState1 = await getMyCurrentPlaybackState();
  if (playbackState1)
    mainWindow?.webContents.send("fromMain_playback", playbackState1);
});

ipcMain.on("toMain_Spotify", async (_event, action) => {
  console.log(
    getFormattedTime() + " : channel: toMain_Play :", action
  );
  switch (action.action ? action.action : action) {
    case "play":
      const playbackState1 = await play(action.uri);
      playbackState1 &&
        mainWindow?.webContents.send("fromMain_playback", playbackState1);
      break;
    case "pause":
      pause();
      break;
    case "next":
      const playbackState = await next();
      playbackState &&
        mainWindow?.webContents.send("fromMain_playback", playbackState);
      break;

    case "previous":
      const playbackState2 = await previous();
      playbackState2 &&
        mainWindow?.webContents.send("fromMain_playback", playbackState2);
      break;

    default:
      console.log(getFormattedTime() + " : not implemented");
  }
  setTimeout(async () => {
    const currentTrack = await currentPlayingTrack();
    console.log(getFormattedTime() + " : " + currentTrack.track);

    currentTrack &&
      mainWindow?.webContents.send("fromMain_SpotifyTrack", currentTrack);

    const recent = await getFeaturedPlaylists();
    console.log(getFormattedTime() + " : " + recent.length);

    recent && mainWindow?.webContents.send("fromMain_Spotify", recent);
  }, 1000);
});

ipcMain.on("toMain_SpotifyVolume", (_event, volume) => {
  console.log(
    getFormattedTime() + " : channel: toMain_SpotifyVolume :",
    volume
  );
  setVolume(volume);
});

const publish = (channel: string, message: any) => {
  mainWindow?.webContents.send(channel, message);
};
const sendMessage = (message: any) => {
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
  mainWindow?.webContents.send("fromMain_Interval", forecast);
  console.log(getFormattedTime() + " : running a task 10 minutes");
});

cron.schedule("*/59 * * * *", async () => {
  console.log(getFormattedTime() + " : refreshing token");
  await refreshToken();
});

cron.schedule("*/10 * * * *", async () => {
  console.log(getFormattedTime() + " : updating news");
  const news = await getNews();
  mainWindow?.webContents.send("fromMain_Interval_News", news);
});
