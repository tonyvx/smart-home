require("v8-compile-cache");
const { app, BrowserWindow, Menu, ipcMain, Notification } = require("electron");
const path = require("path");
const contextMenu = require("electron-context-menu");

var weather = require("openweather-apis");
var cron = require("node-cron");
let location = {};

const { getIPLocation } = require("./lib/getIPLocation");
const { getNews } = require("./lib/getNews");
const { getForecast } = require("./lib/getForecast");

const electronOauth2 = require("electron-oauth2");
const oauthConfig = require("./security/spotify/config").oauth;
const windowParams = {
  alwaysOnTop: true,
  autoHideMenuBar: true,
  webPreferences: {
    nodeIntegration: false,
  },
};
const spotifyOAuth = electronOauth2(oauthConfig, windowParams);

contextMenu({});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function createWindow() {
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
      submenu: submenu(mainWindow),
    },
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.loadFile("public/index.html");

  mainWindow.webContents.on("did-finish-load", async () => {
    location = await getIPLocation();
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
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
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
const sendMessage = (message) => {
  console.log("sendMessage", message);
  new Notification({
    title: "Attendance Manager",
    body: message,
  }).show();
};
function submenu(mainWindow2) {
  return [
    {
      label: "Connect Spotify",
      async click() {
        console.log("toMain_spotify_oauth");
        spotifyOAuth.getAccessToken({}).then(
          (token) => {
            // event.sender.send('github-oauth-reply', token);
            console.log(token);
          },
          (err) => {
            console.log("Error while getting token", err);
          }
        );
      },
    },
  ];
}

cron.schedule("*/1 * * * *", async () => {
  weather.setZipCode(location["zip_code"]);
  const forecast = await getForecast(location["zip_code"]);
  mainWindow.webContents.send("fromMain_Interval", forecast);
  console.log("running a task 1 minutes");
});
