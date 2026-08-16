const VIEWS = {
    dashboard: "dashboard",
    settings: "settings"
};

let saveFeedbackTimeout = null;

window.addEventListener("DOMContentLoaded", async () => {
    const appName = window.autoMeetAPI.getAppName();
    const appVersion = await window.autoMeetAPI.getAppVersion();

    console.log("Application:", appName);
    console.log("Version:", appVersion);

    initNavigation();
    initDashboard();
    initSettings();
});

function initNavigation() {
    const settingsButton = document.getElementById("settings-button");
    const backButton = document.getElementById("back-button");

    if (settingsButton) {
        settingsButton.addEventListener("click", () => {
            showView(VIEWS.settings);
        });
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            showView(VIEWS.dashboard);
        });
    }
}

function showView(viewName) {
    const dashboardView = document.getElementById("dashboard-view");
    const settingsView = document.getElementById("settings-view");
    const settingsButton = document.getElementById("settings-button");
    const backButton = document.getElementById("back-button");

    const isDashboard = viewName === VIEWS.dashboard;

    if (dashboardView) {
        dashboardView.hidden = !isDashboard;
    }

    if (settingsView) {
        settingsView.hidden = isDashboard;
    }

    if (settingsButton) {
        settingsButton.hidden = !isDashboard;
    }

    if (backButton) {
        backButton.hidden = isDashboard;
    }
}

function initDashboard() {
    const startButton = document.getElementById("start-now-button");

    if (startButton) {
        startButton.addEventListener("click", handleStartNowClick);
    }
}

function initSettings() {
    const saveButton = document.getElementById("save-settings-button");

    if (saveButton) {
        saveButton.addEventListener("click", handleSaveSettingsClick);
    }
}

function handleStartNowClick() {
    console.log("Start Now clicked — automation not yet implemented.");
}

function handleSaveSettingsClick() {
    const message = "Settings save not implemented yet.";

    console.log(message);
    showSaveFeedback(message);
}

function showSaveFeedback(message) {
    const saveFeedback = document.getElementById("save-feedback");

    if (!saveFeedback) {
        return;
    }

    saveFeedback.textContent = message;
    saveFeedback.hidden = false;

    if (saveFeedbackTimeout) {
        clearTimeout(saveFeedbackTimeout);
    }

    saveFeedbackTimeout = setTimeout(() => {
        saveFeedback.hidden = true;
        saveFeedback.textContent = "";
    }, 4000);
}
