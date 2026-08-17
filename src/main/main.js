const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const configService = require("./services/config-service");

const IPC_CHANNELS = {
    GET_APP_VERSION: "get-app-version",
    GET_CONFIG: "get-config",
    SAVE_CONFIG: "save-config"
};

ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => {
    return app.getVersion();
});

ipcMain.handle(IPC_CHANNELS.GET_CONFIG, () => {
    return configService.loadConfig();
});

ipcMain.handle(IPC_CHANNELS.SAVE_CONFIG, (_event, config) => {
    if (!config || typeof config !== "object" || Array.isArray(config)) {
        throw new Error("Configuration must be an object.");
    }

    return configService.saveConfig(config);
});


function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.loadFile(
        path.join(__dirname, "../renderer/index.html")
    );
}

app.whenReady().then(() => {
    createWindow();
});
