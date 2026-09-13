const configService = require("./config-service");
const zoomService = require("./zoom-service");
const recordingService = require("./recording-service");

let meetingMonitor = null;
let meetingProcessId = null;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMeeting(timeoutMs = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        const processId = await zoomService.getMeetingProcessId();

        if (processId !== null) {
            meetingProcessId = processId;
            return true;
        }

        await wait(1000);
    }

    return false;
}

function monitorMeeting() {
    if (meetingMonitor) {
        clearInterval(meetingMonitor);
    }

    let missedChecks = 0;

    meetingMonitor = setInterval(async () => {
        try {
            const active = await zoomService.isMeetingActive();

            if (active) {
                missedChecks = 0;
                return;
            }

            missedChecks += 1;

            // Require multiple failed checks before deciding
            // that the meeting has actually ended.
            if (missedChecks < 3) {
                return;
            }

            clearInterval(meetingMonitor);
            meetingMonitor = null;

            await recordingService.stopRecording();

            meetingProcessId = null;

            console.log("Meeting ended. Recording stopped.");
        } catch (error) {
            console.error("Meeting monitoring error:", error);
        }
    }, 3000);
}

async function startMeeting() {
    if (meetingMonitor) {
        throw new Error("A meeting is already being handled.");
    }

    const config = configService.loadConfig();

    if (!config.meeting.meetingId) {
        throw new Error("Meeting ID is not configured.");
    }

    if (!config.meeting.passcode) {
        throw new Error("Meeting passcode is not configured.");
    }

    // Open the Zoom meeting.
    await zoomService.openMeeting(
        config.meeting.meetingId,
        config.meeting.passcode
    );

    // Wait until Zoom actually enters the meeting.
    const meetingStarted = await waitForMeeting();

    if (!meetingStarted) {
        throw new Error("Zoom meeting could not be detected.");
    }

    // Start OBS immediately after the meeting is detected.
    await recordingService.startRecording();

    // Start monitoring the meeting.
    monitorMeeting();

    return {
        success: true,
        status: "recording"
    };
}

module.exports = {
    startMeeting
};