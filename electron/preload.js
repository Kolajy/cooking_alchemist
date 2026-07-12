const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("culinaryDesktop", {
  platform: process.platform,
  isElectron: true,
  unlockAchievement: (achievementId) => ipcRenderer.send("steam-unlock-achievement", achievementId),
  getSteamUsername: () => ipcRenderer.invoke("steam-get-username"),
  saveGetItem: (key) => ipcRenderer.sendSync("save-get-item", key),
  saveSetItem: (key, value) => ipcRenderer.sendSync("save-set-item", key, value),
  saveRemoveItem: (key) => ipcRenderer.sendSync("save-remove-item", key)
});
