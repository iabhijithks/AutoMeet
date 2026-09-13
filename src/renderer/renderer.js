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
let meetingStatusMonitor = null;

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
            const extractedMeetingId = extractMeetingId(
                meetingLinkInput.value
            );

            if (extractedMeetingId) {
                meetingIdInput.value = extractedMeetingId;
            }
        });
    }

    const saveButton = document.getElementById("save-settings-button");

    if (saveButton) {
        saveButton.addEventListener(
            "click",
            handleSaveSettingsClick
        );
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
            getFriendlyErrorMessage(
                error,
                "Unable to load your AutoMeet configuration."
            )
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
            getFriendlyErrorMessage(
                error,
                "Unable to load your AutoMeet settings."
            )
        );
    }
}

function applyDashboardConfig(config) {
    setTextContent(
        "dashboard-meeting-name",
        config.meeting.name || "—"
    );

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
        config.recording.location || "Configured in OBS"
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

    const automaticStart =
        document.getElementById("automatic-start");

    if (automaticStart) {
        automaticStart.checked = Boolean(
            config.schedule.enabled
        );
    }

    setInputValue("meeting-time", config.schedule.time);
    setDayCheckboxes(config.schedule.days);

    setInputValue(
        "recording-software",
        config.recording.software
    );

    setInputValue(
        "recording-location",
        config.recording.location
    );
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
                document.getElementById(
                    "automatic-start"
                )?.checked
            ),

            time: getInputValue("meeting-time"),
            days: getSelectedDays()
        },

        recording: {
            software: getInputValue(
                "recording-software"
            ),

            location: getInputValue(
                "recording-location"
            )
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
    const selectedDays = new Set(
        Array.isArray(days) ? days : []
    );

    for (const checkboxName of DAY_CHECKBOX_NAMES) {
        const checkbox = document.querySelector(
            `input[name="${checkboxName}"]`
        );

        if (checkbox) {
            checkbox.checked = selectedDays.has(
                checkbox.value
            );
        }
    }
}

async function handleStartNowClick() {
    const startButton =
        document.getElementById("start-now-button");

    stopMeetingStatusMonitor();

    setAutomationStatus(
        "opening",
        "Opening Zoom",
        "Opening your configured Zoom meeting..."
    );

    setStartButtonState(true, "Opening Zoom...");

    setRecordingState("idle");

    try {
        const meetingPromise =
            window.autoMeetAPI.startMeeting();

        /*
         * startMeeting() performs the complete backend workflow:
         * Zoom -> meeting detection -> OBS -> recording.
         *
         * While that is happening, we independently check Zoom
         * so the UI can move from "Opening Zoom" to "Joining"
         * without changing the working backend.
         */
        await monitorStartupProgress(meetingPromise);

        const result = await meetingPromise;

        console.log(
            "Meeting automation started:",
            result
        );

        if (result?.status === "recording") {
            setAutomationStatus(
                "recording",
                "Recording",
                "Your meeting is active and AutoMeet is recording locally."
            );

            await syncRecordingState();

            setStartButtonState(
                true,
                "Recording..."
            );

            startMeetingStatusMonitor();
        }
    } catch (error) {
        console.error(
            "Meeting automation failed:",
            error
        );

        stopMeetingStatusMonitor();

        setAutomationStatus(
            "error",
            "Couldn't start",
            getFriendlyErrorMessage(
                error,
                "AutoMeet couldn't start the meeting."
            )
        );

        setRecordingState("idle");

        setStartButtonState(
            false,
            "Try Again"
        );
    }
}

async function monitorStartupProgress(meetingPromise) {
    let finished = false;

    meetingPromise.finally(() => {
        finished = true;
    });

    /*
     * Give Zoom a moment to open before checking its state.
     */
    await wait(1000);

    while (!finished) {
        try {
            const active =
                await window.autoMeetAPI.isZoomMeetingActive();

            if (active) {
                setAutomationStatus(
                    "recording-starting",
                    "Starting recording",
                    "Zoom meeting detected. Preparing OBS recording..."
                );

                setStartButtonState(
                    true,
                    "Starting recording..."
                );

                return;
            }

            setAutomationStatus(
                "joining",
                "Joining",
                "Waiting for the Zoom meeting to become active..."
            );

            setStartButtonState(
                true,
                "Joining..."
            );
        } catch (error) {
            console.warn(
                "Unable to check Zoom meeting status:",
                error
            );
        }

        await wait(1000);
    }
}

function startMeetingStatusMonitor() {
    stopMeetingStatusMonitor();

    let missedChecks = 0;

    meetingStatusMonitor = setInterval(
        async () => {
            try {
                const active =
                    await window.autoMeetAPI.isZoomMeetingActive();

                if (active) {
                    missedChecks = 0;
                    return;
                }

                missedChecks += 1;

                /*
                 * Require multiple missed checks so a temporary
                 * process/title transition doesn't immediately
                 * mark the meeting as ended.
                 */
                if (missedChecks < 3) {
                    return;
                }

                stopMeetingStatusMonitor();

                setAutomationStatus(
                    "ended",
                    "Meeting ended",
                    "The meeting has ended. Your recording has been stopped."
                );

                setRecordingState("idle");

                setStartButtonState(
                    false,
                    "Start Again"
                );
            } catch (error) {
                console.warn(
                    "Meeting status monitor error:",
                    error
                );
            }
        },
        3000
    );
}

function stopMeetingStatusMonitor() {
    if (meetingStatusMonitor) {
        clearInterval(meetingStatusMonitor);
        meetingStatusMonitor = null;
    }
}

function setAutomationStatus(
    status,
    label,
    message
) {
    const statusCard =
        document.getElementById("status-card");

    const statusLabel =
        document.getElementById("status-label");

    const statusMessage =
        document.getElementById("status-message");

    if (statusCard) {
        statusCard.dataset.status = status;
    }

    if (statusLabel) {
        statusLabel.textContent = label;
    }

    if (statusMessage) {
        statusMessage.textContent = message;
    }
}

function setRecordingState(state) {
    const recordingState =
        document.getElementById("recording-state");

    const recordingLabel =
        document.getElementById(
            "recording-state-label"
        );

    if (!recordingState || !recordingLabel) {
        return;
    }

    recordingState.className =
        "recording-state";

    if (state === "recording") {
        recordingState.classList.add(
            "recording-state--active"
        );

        recordingLabel.textContent =
            "Recording";
        return;
    }

    recordingState.classList.add(
        "recording-state--idle"
    );

    recordingLabel.textContent =
        "Not recording";
}

async function syncRecordingState() {
    try {
        const recording = await window.autoMeetAPI.isRecording();

        if (recording) {
            setRecordingState("recording");
        } else {
            setRecordingState("idle");
        }

        return recording;
    } catch (error) {
        console.error(
            "Unable to check OBS recording status:",
            error
        );

        setRecordingState("idle");

        return false;
    }
}

function setStartButtonState(disabled, label) {
    const startButton =
        document.getElementById(
            "start-now-button"
        );

    const startButtonLabel =
        document.getElementById(
            "start-button-label"
        );

    const spinner =
        document.getElementById(
            "start-button-spinner"
        );

    if (startButton) {
        startButton.disabled = disabled;
    }

    if (startButtonLabel) {
        startButtonLabel.textContent = label;
    }

    if (spinner) {
        spinner.hidden = !disabled;
    }
}

async function handleSaveSettingsClick() {
    const saveButton =
        document.getElementById(
            "save-settings-button"
        );

    const config = collectSettingsForm();

    if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
    }

    try {
        await window.autoMeetAPI.saveConfig(config);

        showSaveFeedback(
            "Settings saved successfully.",
            "success"
        );

        await loadDashboardConfig();
    } catch (error) {
        showSaveFeedback(
            getFriendlyErrorMessage(
                error,
                "Unable to save your settings."
            ),
            "error"
        );
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = "Save Settings";
        }
    }
}

function showSaveFeedback(message, type) {
    const saveFeedback =
        document.getElementById("save-feedback");

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
        saveFeedback.classList.add(
            "save-feedback--success"
        );
    } else {
        saveFeedback.classList.add(
            "save-feedback--error"
        );
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
    const errorElement =
        document.getElementById(elementId);

    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.hidden = false;
}

function hideConfigError(elementId) {
    const errorElement =
        document.getElementById(elementId);

    if (!errorElement) {
        return;
    }

    errorElement.textContent = "";
    errorElement.hidden = true;
}

function getFriendlyErrorMessage(
    error,
    fallbackMessage
) {
    const message =
        error instanceof Error
            ? error.message
            : String(error || "");

    if (!message) {
        return fallbackMessage;
    }

    const normalized = message.toLowerCase();

    if (
        normalized.includes(
            "meeting passcode is not configured"
        )
    ) {
        return "Add your Zoom meeting passcode in Settings first.";
    }

    if (
        normalized.includes(
            "meeting id is not configured"
        )
    ) {
        return "Add your Zoom meeting ID in Settings first.";
    }

    if (
        normalized.includes(
            "zoom meeting could not be detected"
        )
    ) {
        return "AutoMeet couldn't detect the Zoom meeting. Make sure the meeting opened correctly and try again.";
    }

    if (
        normalized.includes(
            "unable to connect to obs"
        )
    ) {
        return "AutoMeet couldn't connect to OBS. Check that OBS WebSocket is enabled on port 4455.";
    }

    if (
        normalized.includes(
            "obs received the recording command, but recording did not start"
        )
    ) {
        return "AutoMeet couldn't start recording in OBS. Check your OBS recording settings and try again.";
    }

    if (
        normalized.includes(
            "obs studio was not found"
        )
    ) {
        return "OBS Studio wasn't found. Install OBS Studio and try again.";
    }

    if (
        normalized.includes(
            "obs studio could not be started"
        )
    ) {
        return "AutoMeet couldn't start OBS Studio. Open OBS manually and try again.";
    }

    if (
        normalized.includes(
            "could not be started"
        )
    ) {
        return "AutoMeet couldn't start the required application. Please check your configuration and try again.";
    }

    if (
        normalized.includes(
            "already being handled"
        )
    ) {
        return "AutoMeet is already handling a meeting.";
    }

    /*
     * Hide low-level Electron IPC wrappers from the UI.
     */
    if (
        normalized.includes(
            "error invoking remote method"
        )
    ) {
        return fallbackMessage;
    }

    return message;
}

function setTextContent(elementId, value) {
    const element =
        document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

function setInputValue(elementId, value) {
    const element =
        document.getElementById(elementId);

    if (element) {
        element.value = value ?? "";
    }
}

function getInputValue(elementId) {
    const element =
        document.getElementById(elementId);

    return element
        ? element.value.trim()
        : "";
}

function maskMeetingId(meetingId) {
    const digits =
        String(meetingId || "")
            .replace(/\D/g, "");

    if (!digits) {
        return "—";
    }

    if (digits.length <= 3) {
        return "•••• •••• ••••";
    }

    return `${digits.slice(0, 3)} •••• ••••`;
}

function detectPlatform(link) {
    const normalizedLink =
        String(link || "").toLowerCase();

    if (normalizedLink.includes("zoom.us")) {
        return "Zoom";
    }

    if (
        normalizedLink.includes(
            "teams.microsoft.com"
        )
    ) {
        return "Microsoft Teams";
    }

    if (
        normalizedLink.includes(
            "meet.google.com"
        )
    ) {
        return "Google Meet";
    }

    return "Meeting";
}

function formatRecordingSoftware(software) {
    if (software === "obs") {
        return "OBS Studio";
    }

    return software || "—";
}

function formatScheduleDisplay(schedule) {
    if (!schedule) {
        return "—";
    }

    const timeLabel =
        formatTimeDisplay(schedule.time);

    if (!schedule.enabled) {
        return `Manual · ${timeLabel}`;
    }

    const days =
        Array.isArray(schedule.days)
            ? schedule.days
            : [];

    if (days.length === 0) {
        return timeLabel;
    }

    if (days.length === 7) {
        return `Daily · ${timeLabel}`;
    }

    const dayLabels =
        days.map(
            (day) =>
                DAY_LABELS[day] || day
        );

    return `${dayLabels.join(", ")} · ${timeLabel}`;
}

function formatTimeDisplay(timeValue) {
    const match =
        /^([01]\d|2[0-3]):([0-5]\d)$/
            .exec(timeValue || "");

    if (!match) {
        return "—";
    }

    const hours = Number(match[1]);
    const minutes = match[2];

    const period =
        hours >= 12
            ? "PM"
            : "AM";

    const hour12 =
        hours % 12 || 12;

    return `${hour12}:${minutes} ${period}`;
}

function extractMeetingId(meetingLink) {
    try {
        const url =
            new URL(meetingLink);

        const match =
            url.pathname.match(
                /^\/j\/(\d+)/
            );

        return match
            ? match[1]
            : "";
    } catch {
        return "";
    }
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}