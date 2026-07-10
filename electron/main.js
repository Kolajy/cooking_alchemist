const electron = require("electron");

if (typeof electron !== "object" || !electron.app) {
  console.error(
    "[electron] Failed to load Electron APIs. If ELECTRON_RUN_AS_NODE is set, unset it before launching."
  );
  process.exit(1);
}

const { app, BrowserWindow, Menu, shell, ipcMain } = electron;
const path = require("node:path");
const fs = require("node:fs");

let steamClient = null;
try {
  const steamworks = require("steamworks.js");
  steamClient = steamworks.init(480);
  console.log(`[steam] Initialized Steamworks successfully. App ID: 480. User: ${steamClient.localplayer.getName()}`);

  steamworks.electronEnableSteamOverlay();

  setInterval(() => {
    try {
      steamClient.core.runCallbacks();
    } catch (e) {
      console.error("[steam] Error running callbacks:", e);
    }
  }, 100);
} catch (err) {
  console.warn("[steam] Failed to initialize Steamworks (Steam client might not be running). Running in offline mode.");
}

ipcMain.on("steam-unlock-achievement", (event, achievementId) => {
  if (steamClient) {
    try {
      if (!steamClient.achievement.isActivated(achievementId)) {
        steamClient.achievement.activate(achievementId);
        steamClient.core.runCallbacks();
        console.log(`[steam] Unlocked achievement: ${achievementId}`);
      }
    } catch (err) {
      console.error(`[steam] Failed to unlock achievement ${achievementId}:`, err);
    }
  } else {
    console.log(`[steam-mock] Unlock achievement: ${achievementId}`);
  }
});

ipcMain.handle("steam-get-username", async () => {
  if (steamClient) {
    try {
      return steamClient.localplayer.getName();
    } catch (err) {
      console.error("[steam] Failed to get username:", err);
    }
  }
  return "Chef (Offline)";
});

const savesDir = path.join(app.getPath("userData"), "saves");
try {
  fs.mkdirSync(savesDir, { recursive: true });
} catch (err) {
  console.error("[saves] Failed to create saves directory:", err);
}

function getSaveFilePath(key) {
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(savesDir, `${safeKey}.json`);
}

ipcMain.on("save-get-item", (event, key) => {
  try {
    const filePath = getSaveFilePath(key);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      event.returnValue = data;
    } else {
      event.returnValue = null;
    }
  } catch (err) {
    console.error(`[saves] Error reading key ${key}:`, err);
    event.returnValue = null;
  }
});

ipcMain.on("save-set-item", (event, key, value) => {
  try {
    const filePath = getSaveFilePath(key);
    fs.writeFileSync(filePath, value, "utf8");
    console.log(`[saves] Saved key: ${key}`);
    event.returnValue = true;
  } catch (err) {
    console.error(`[saves] Error writing key ${key}:`, err);
    event.returnValue = false;
  }
});

ipcMain.on("save-remove-item", (event, key) => {
  try {
    const filePath = getSaveFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[saves] Removed key: ${key}`);
    }
    event.returnValue = true;
  } catch (err) {
    console.error(`[saves] Error deleting key ${key}:`, err);
    event.returnValue = false;
  }
});

const DEV_SERVER_URL = process.env.ELECTRON_DEV_URL || "https://localhost:5273";
const isDev = process.argv.includes("--dev") || !app.isPackaged;
const openDevTools = process.argv.includes("--devtools");

/** @type {BrowserWindow | null} */
let mainWindow = null;

function resolveIndexPath() {
  const packaged = path.join(process.resourcesPath, "web", "index.html");
  if (fs.existsSync(packaged)) {
    return packaged;
  }
  return path.join(__dirname, "..", "web", "dist", "index.html");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: "Culinary Alchemy",
    backgroundColor: "#1a1410",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL(DEV_SERVER_URL).catch((error) => {
      console.error("[electron] Failed to load dev server:", error);
    });
    if (openDevTools) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  } else {
    const indexPath = resolveIndexPath();
    if (!fs.existsSync(indexPath)) {
      console.error(
        "[electron] Built web assets not found. Run `npm run electron:pack` first."
      );
      app.quit();
      return;
    }
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function buildMenu() {
  const template = [
    ...(process.platform === "darwin"
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" }
            ]
          }
        ]
      : []),
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

if (isDev) {
  app.on("certificate-error", (event, _webContents, url, _error, _certificate, callback) => {
    if (url.startsWith("https://localhost:") || url.startsWith("https://127.0.0.1:")) {
      event.preventDefault();
      callback(true);
      return;
    }
    callback(false);
  });
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
