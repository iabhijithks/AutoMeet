const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

ipcMain.handle("get-app-version", () => {
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