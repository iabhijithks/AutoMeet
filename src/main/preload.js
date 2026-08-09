const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("autoMeetAPI", {
    getAppName: () => "AutoMeet",

    getAppVersion: () => {
        return ipcRenderer.invoke("get-app-version");
    }
});