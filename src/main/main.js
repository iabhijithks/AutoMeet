const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const configService = require("./services/config-service");
const zoomService = require("./services/zoom-service");
const meetingController = require("./services/meeting-controller");
const recordingService = require("./services/recording-service");

const IPC_CHANNELS = {
    GET_APP_VERSION: "get-app-version",
    GET_CONFIG: "get-config",
    SAVE_CONFIG: "save-config",
    START_MEETING: "start-meeting",
    ZOOM_IS_RUNNING: "zoom-is-running",
    ZOOM_LAUNCH: "zoom-launch",
    ZOOM_OPEN_MEETING: "zoom-open-meeting"
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

ipcMain.handle(IPC_CHANNELS.ZOOM_IS_RUNNING, async () => {
    return zoomService.isZoomRunning();
});

ipcMain.handle(IPC_CHANNELS.ZOOM_LAUNCH, async () => {
    return zoomService.launchZoom();
});

ipcMain.handle("zoom-open-meeting", (_event, meetingId, passcode) => {
    return zoomService.openMeeting(meetingId, passcode);
});

ipcMain.handle(IPC_CHANNELS.START_MEETING, () => {
    return meetingController.startMeeting();
});

ipcMain.handle("test-obs", () => {
    return recordingService.connect();
});

ipcMain.handle("is-recording", () => {
    return recordingService.isRecording();
});

ipcMain.handle("start-recording", () => {
    return recordingService.startRecording();
});

ipcMain.handle("stop-recording", () => {
    return recordingService.stopRecording();
});

ipcMain.handle("zoom-is-meeting-active", () => {
    return zoomService.isMeetingActive();
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
