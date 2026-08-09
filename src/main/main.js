const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const IPC_CHANNELS = {
    GET_APP_VERSION: "get-app-version"
};

ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => {
    return app.getVersion();
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