require("v8-compile-cache");
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  Notification,
} = require("electron");
const path = require("path");
const contextMenu = require("electron-context-menu");
const ipLocation = require("geoip-lite");

var weather = require("openweather-apis");
var cron = require("node-cron");
let location = {};

const { getIPLocation } = require("./lib/getIPLocation");
const { get } = require("http");
const { getFormattedTime } = require("./lib/getFormattedTime");

weather.setLang("en");
// English - en, Russian - ru, Italian - it, Spanish - es (or sp),
// Ukrainian - uk (or ua), German - de, Portuguese - pt,Romanian - ro,
// Polish - pl, Finnish - fi, Dutch - nl, French - fr, Bulgarian - bg,
// Swedish - sv (or se), Chinese Tra - zh_tw, Chinese Sim - zh (or zh_cn),
// Turkish - tr, Croatian - hr, Catalan - ca

// set city by name
// weather.setCity("Fairplay");
// or set the coordinates (latitude,longitude)

// or set city by ID (recommended by OpenWeatherMap)
// weather.setCityId(4367872);

// or set zip code
// weather.setZipCode(33615);

// 'metric'  'internal'  'imperial'
weather.setUnits("imperial");

// check http://openweathermap.org/appid#get for get the APPID
weather.setAPPID("c5f5e17c931ac0a299b73985af539dc4");

contextMenu({});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    // titleBarStyle: "hidden",
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

  // const ip = await ;
  mainWindow.webContents.on("did-finish-load", async () => {
    location = await getIPLocation();

    console.log(location);

    let footerInfo = ["chrome", "node", "electron"].reduce((a, v) => {
      a[v] = process.versions[v];
      return a;
    }, {});

    // get the Temperature

    mainWindow.webContents.send("fromMain_FinishLoad", {
      footerInfo,
      location,
    });

    const forecast = await getForecast();
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
function getForecast() {
  weather.setZipCode(location["zip_code"]);
  return new Promise((resolve, reject) =>
    weather.getAllWeather(function (err, JSONObj) {
      console.log(JSONObj);
      resolve({
        weather: {
          ...JSONObj.main,
          description:
            JSONObj.weather[0].main + ", " + JSONObj.weather[0].description,
          icon: JSONObj.weather[0].icon,
        },
        wind: JSONObj.wind,
        sunrise: getTimeStamp(JSONObj.sys.sunrise),
        sunset: getTimeStamp(JSONObj.sys.sunset),
      });
    })
  );
}

function submenu(mainWindow2) {
  return [
    {
      label: "View Registered Parishioners",
      async click() {
        sendMessage("hi");
      },
    },
  ];
}

const getTimeStamp = (unixTime) => {
  let unix_timestamp = unixTime;
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(unix_timestamp * 1000);

  return getFormattedTime(date);
  // // Hours part from the timestamp
  // var hours = date.getHours();
  // // Minutes part from the timestamp
  // var minutes = "0" + date.getMinutes();
  // // Seconds part from the timestamp
  // var seconds = "0" + date.getSeconds();

  // // Will display time in 10:30:23 format
  // var formattedTime =
  //   hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);

  // console.log(formattedTime);
  // return formattedTime;
};

cron.schedule("*/1 * * * *", async () => {
  weather.setZipCode(location["zip_code"]);
  const forecast = await getForecast();
  mainWindow.webContents.send("fromMain_Interval", forecast);
  console.log("running a task 1 minutes");
});
