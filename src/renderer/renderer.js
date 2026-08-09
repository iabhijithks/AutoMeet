window.addEventListener("DOMContentLoaded", async () => {
    const appName = window.autoMeetAPI.getAppName();
    const appVersion = await window.autoMeetAPI.getAppVersion();

    console.log("Application:", appName);
    console.log("Version:", appVersion);
});