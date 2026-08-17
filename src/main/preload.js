const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("autoMeetAPI", {
    getAppName: () => "AutoMeet",

    getAppVersion: () => {
        return ipcRenderer.invoke("get-app-version");
    },

    getConfig: () => {
        return ipcRenderer.invoke("get-config");
    },

    saveConfig: (config) => {
        return ipcRenderer.invoke("save-config", config);
    }
});
