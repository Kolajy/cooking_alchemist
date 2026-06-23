const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("culinaryDesktop", {
  platform: process.platform,
  isElectron: true
});
