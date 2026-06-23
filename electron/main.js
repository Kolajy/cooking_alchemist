const electron = require("electron");

if (typeof electron !== "object" || !electron.app) {
  console.error(
    "[electron] Failed to load Electron APIs. If ELECTRON_RUN_AS_NODE is set, unset it before launching."
  );
  process.exit(1);
}

const { app, BrowserWindow, Menu, shell } = electron;
const path = require("node:path");
const fs = require("node:fs");

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
