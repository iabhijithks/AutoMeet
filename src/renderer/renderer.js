const VIEWS = {
    dashboard: "dashboard",
    settings: "settings"
};

const DAY_CHECKBOX_NAMES = [
    "day-monday",
    "day-tuesday",
    "day-wednesday",
    "day-thursday",
    "day-friday",
    "day-saturday",
    "day-sunday"
];

const DAY_LABELS = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun"
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

    await loadDashboardConfig();
});

function initNavigation() {
    const settingsButton = document.getElementById("settings-button");
    const backButton = document.getElementById("back-button");

    if (settingsButton) {
        settingsButton.addEventListener("click", async () => {
            showView(VIEWS.settings);
            await loadSettingsForm();
        });
    }

    if (backButton) {
        backButton.addEventListener("click", async () => {
            showView(VIEWS.dashboard);
            await loadDashboardConfig();
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
    const meetingLinkInput = document.getElementById("meeting-link");
    const meetingIdInput = document.getElementById("meeting-id");

    if (meetingLinkInput && meetingIdInput) {
        meetingLinkInput.addEventListener("input", () => {
            const extractedMeetingId = extractMeetingId(meetingLinkInput.value);

            if (extractedMeetingId) {
                meetingIdInput.value = extractedMeetingId;
            }
        });
    }

    const saveButton = document.getElementById("save-settings-button");

    if (saveButton) {
        saveButton.addEventListener("click", handleSaveSettingsClick);
    }
}

async function loadDashboardConfig() {
    hideConfigError("dashboard-config-error");

    try {
        const config = await window.autoMeetAPI.getConfig();
        applyDashboardConfig(config);
    } catch (error) {
        showConfigError(
            "dashboard-config-error",
            getErrorMessage(error, "Unable to load configuration.")
        );
        clearDashboardConfig();
    }
}

async function loadSettingsForm() {
    hideConfigError("settings-load-error");

    try {
        const config = await window.autoMeetAPI.getConfig();
        applySettingsForm(config);
    } catch (error) {
        showConfigError(
            "settings-load-error",
            getErrorMessage(error, "Unable to load configuration.")
        );
    }
}

function applyDashboardConfig(config) {
    setTextContent("dashboard-meeting-name", config.meeting.name || "—");
    setTextContent(
        "dashboard-meeting-time",
        formatScheduleDisplay(config.schedule)
    );
    setTextContent(
        "dashboard-platform",
        detectPlatform(config.meeting.link)
    );
    setTextContent(
        "dashboard-meeting-id",
        maskMeetingId(config.meeting.meetingId)
    );
    setTextContent(
        "dashboard-recording-software",
        formatRecordingSoftware(config.recording.software)
    );
    setTextContent(
        "dashboard-recording-location",
        config.recording.location || "—"
    );
}

function clearDashboardConfig() {
    setTextContent("dashboard-meeting-name", "—");
    setTextContent("dashboard-meeting-time", "—");
    setTextContent("dashboard-platform", "—");
    setTextContent("dashboard-meeting-id", "—");
    setTextContent("dashboard-recording-software", "—");
    setTextContent("dashboard-recording-location", "—");
}

function applySettingsForm(config) {
    setInputValue("meeting-name", config.meeting.name);
    setInputValue("meeting-link", config.meeting.link);
    setInputValue("meeting-id", config.meeting.meetingId);
    setInputValue("meeting-passcode", config.meeting.passcode);

    const automaticStart = document.getElementById("automatic-start");

    if (automaticStart) {
        automaticStart.checked = Boolean(config.schedule.enabled);
    }

    setInputValue("meeting-time", config.schedule.time);
    setDayCheckboxes(config.schedule.days);
    setInputValue("recording-software", config.recording.software);
    setInputValue("recording-location", config.recording.location);
}

function collectSettingsForm() {
    return {
        meeting: {
            name: getInputValue("meeting-name"),
            link: getInputValue("meeting-link"),
            meetingId: getInputValue("meeting-id"),
            passcode: getInputValue("meeting-passcode")
        },
        schedule: {
            enabled: Boolean(
                document.getElementById("automatic-start")?.checked
            ),
            time: getInputValue("meeting-time"),
            days: getSelectedDays()
        },
        recording: {
            software: getInputValue("recording-software"),
            location: getInputValue("recording-location")
        }
    };
}

function getSelectedDays() {
    const selectedDays = [];

    for (const checkboxName of DAY_CHECKBOX_NAMES) {
        const checkbox = document.querySelector(
            `input[name="${checkboxName}"]`
        );

        if (checkbox?.checked) {
            selectedDays.push(checkbox.value);
        }
    }

    return selectedDays;
}

function setDayCheckboxes(days) {
    const selectedDays = new Set(Array.isArray(days) ? days : []);

    for (const checkboxName of DAY_CHECKBOX_NAMES) {
        const checkbox = document.querySelector(
            `input[name="${checkboxName}"]`
        );

        if (checkbox) {
            checkbox.checked = selectedDays.has(checkbox.value);
        }
    }
}

async function handleStartNowClick() {
    const startButton = document.getElementById("start-now-button");

    if (startButton) {
        startButton.disabled = true;
        startButton.textContent = "Starting...";
    }

    console.log("Start Now clicked.");

    try {
        const result = await window.autoMeetAPI.startMeeting();

        console.log("Meeting automation started:", result);

        if (result?.status === "recording") {
            console.log("AutoMeet is now recording.");
        }
    } catch (error) {
        console.error("Meeting automation failed:", error);

        alert(getErrorMessage(error, "Unable to start the meeting."));
    } finally {
        if (startButton) {
            startButton.disabled = false;
            startButton.textContent = "Start Now";
        }
    }
}

async function handleSaveSettingsClick() {
    const saveButton = document.getElementById("save-settings-button");
    const config = collectSettingsForm();

    if (saveButton) {
        saveButton.disabled = true;
    }

    try {
        await window.autoMeetAPI.saveConfig(config);
        showSaveFeedback("Settings saved successfully.", "success");
    } catch (error) {
        showSaveFeedback(
            getErrorMessage(error, "Unable to save settings."),
            "error"
        );
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}

function showSaveFeedback(message, type) {
    const saveFeedback = document.getElementById("save-feedback");

    if (!saveFeedback) {
        return;
    }

    saveFeedback.textContent = message;
    saveFeedback.hidden = false;

    saveFeedback.classList.remove(
        "save-feedback--success",
        "save-feedback--error"
    );

    if (type === "success") {
        saveFeedback.classList.add("save-feedback--success");
    } else {
        saveFeedback.classList.add("save-feedback--error");
    }

    if (saveFeedbackTimeout) {
        clearTimeout(saveFeedbackTimeout);
    }

    saveFeedbackTimeout = setTimeout(() => {
        saveFeedback.hidden = true;
        saveFeedback.textContent = "";

        saveFeedback.classList.remove(
            "save-feedback--success",
            "save-feedback--error"
        );
    }, 4000);
}

function showConfigError(elementId, message) {
    const errorElement = document.getElementById(elementId);

    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.hidden = false;
}

function hideConfigError(elementId) {
    const errorElement = document.getElementById(elementId);

    if (!errorElement) {
        return;
    }

    errorElement.textContent = "";
    errorElement.hidden = true;
}

function getErrorMessage(error, fallbackMessage) {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

function setTextContent(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

function setInputValue(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.value = value ?? "";
    }
}

function getInputValue(elementId) {
    const element = document.getElementById(elementId);

    return element ? element.value.trim() : "";
}

function maskMeetingId(meetingId) {
    const digits = String(meetingId || "").replace(/\D/g, "");

    if (!digits) {
        return "—";
    }

    if (digits.length <= 3) {
        return "•••• •••• ••••";
    }

    return `${digits.slice(0, 3)} •••• ••••`;
}

function detectPlatform(link) {
    const normalizedLink = String(link || "").toLowerCase();

    if (normalizedLink.includes("zoom.us")) {
        return "Zoom";
    }

    if (normalizedLink.includes("teams.microsoft.com")) {
        return "Microsoft Teams";
    }

    if (normalizedLink.includes("meet.google.com")) {
        return "Google Meet";
    }

    return "Meeting";
}

function formatRecordingSoftware(software) {
    if (software === "obs") {
        return "OBS";
    }

    return software || "—";
}

function formatScheduleDisplay(schedule) {
    if (!schedule) {
        return "—";
    }

    const timeLabel = formatTimeDisplay(schedule.time);

    if (!schedule.enabled) {
        return `Manual · ${timeLabel}`;
    }

    const days = Array.isArray(schedule.days) ? schedule.days : [];

    if (days.length === 0) {
        return timeLabel;
    }

    if (days.length === 7) {
        return `Daily · ${timeLabel}`;
    }

    const dayLabels = days.map((day) => DAY_LABELS[day] || day);

    return `${dayLabels.join(", ")} · ${timeLabel}`;
}

function formatTimeDisplay(timeValue) {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue || "");

    if (!match) {
        return "—";
    }

    const hours = Number(match[1]);
    const minutes = match[2];
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;

    return `${hour12}:${minutes} ${period}`;
}

function extractMeetingId(meetingLink) {
    try {
        const url = new URL(meetingLink);
        const match = url.pathname.match(/^\/j\/(\d+)/);

        return match ? match[1] : "";
    } catch {
        return "";
    }
}