const { ipcRenderer, contextBridge } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = [
      "toMain_Play",
      "toMain_Pause",
      "toMain_Volume",
      "toMain_Next",
      "toMain_Spotify",
      "toMain_SpotifyVolume",
      "toMain_Playback",
      "toMain_Settings",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = [
      "fromMain",
      "fromMain_FinishLoad",
      "fromMain_Interval",
      "fromMain_Spotify",
      "fromMain_SpotifyTrack",
      "fromMain_playback",
      "fromMain_Interval_News",
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
      console.log("receive", channel);
    }
  },
});
