window.addEventListener("DOMContentLoaded", async () => {
    const appName = window.autoMeetAPI.getAppName();
    const appVersion = await window.autoMeetAPI.getAppVersion();

    console.log("Application:", appName);
    console.log("Version:", appVersion);

    initDashboard();
});

function initDashboard() {
    const startButton = document.getElementById("start-now-button");

    if (startButton) {
        startButton.addEventListener("click", handleStartNowClick);
    }
}

function handleStartNowClick() {
    console.log("Start Now clicked — automation not yet implemented.");
}
