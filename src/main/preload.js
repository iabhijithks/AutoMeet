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
    },

    isZoomRunning: () => {
        return ipcRenderer.invoke("zoom-is-running");
    },

    launchZoom: () => {
        return ipcRenderer.invoke("zoom-launch");
    },

    openZoomMeeting: (meetingId, passcode) => {
        return ipcRenderer.invoke(
            "zoom-open-meeting",
            meetingId,
            passcode
        );
    },

    startMeeting: () => {
        return ipcRenderer.invoke("start-meeting");
    },

    isRecording: () => {
        return ipcRenderer.invoke("is-recording");
    },
    
    testOBS: () => {
        return ipcRenderer.invoke("test-obs");
    },

    startRecording: () => {
        return ipcRenderer.invoke("start-recording");
    },

    stopRecording: () => {
        return ipcRenderer.invoke("stop-recording");
    },

    isZoomMeetingActive: () => {
        return ipcRenderer.invoke("zoom-is-meeting-active");
    }
});
