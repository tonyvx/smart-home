const { ipcRenderer, contextBridge } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = [
      "toMain",
      "toMain_Events",
      "toMain_Attendee",
      "toMain_NewAttendee",
      "toMain_ConfirmAttendance",
      "toMain_Upload",
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
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
      console.log("receive", channel);
    }
  },
});
