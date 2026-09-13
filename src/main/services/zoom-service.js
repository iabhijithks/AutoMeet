const { execFile } = require("child_process");
const { shell } = require("electron");
const path = require("path");

const ZOOM_PROCESS_NAME = "Zoom.exe";

const ZOOM_EXECUTABLE_PATH = path.join(
    process.env.APPDATA,
    "Zoom",
    "bin",
    "Zoom.exe"
);

function isZoomRunning() {
    return new Promise((resolve, reject) => {
        execFile(
            "tasklist",
            ["/FI", `IMAGENAME eq ${ZOOM_PROCESS_NAME}`],
            { windowsHide: true },
            (error, stdout) => {
                if (error) {
                    reject(
                        new Error("Unable to check whether Zoom is running.")
                    );
                    return;
                }

                resolve(stdout.includes(ZOOM_PROCESS_NAME));
            }
        );
    });
}

function launchZoom() {
    return new Promise((resolve, reject) => {
        execFile(
            ZOOM_EXECUTABLE_PATH,
            [],
            { windowsHide: true },
            (error) => {
                if (error) {
                    reject(new Error("Unable to launch Zoom."));
                    return;
                }

                resolve(true);
            }
        );
    });
}

function openMeeting(meetingId, passcode) {
    return new Promise((resolve, reject) => {
        if (
            typeof meetingId !== "string" ||
            meetingId.trim() === ""
        ) {
            reject(new Error("Meeting ID is required."));
            return;
        }

        if (
            typeof passcode !== "string"
        ) {
            reject(new Error("Meeting passcode is invalid."));
            return;
        }

        const cleanMeetingId = meetingId.replace(/\s/g, "");

        if (!/^\d+$/.test(cleanMeetingId)) {
            reject(new Error("Invalid Zoom meeting ID."));
            return;
        }

        const zoomUri =
            `zoommtg://zoom.us/join?confno=${encodeURIComponent(cleanMeetingId)}` +
            `&pwd=${encodeURIComponent(passcode)}`;

            shell.openExternal(zoomUri)
            .then(() => {
                resolve(true);
            })
            .catch(() => {
                reject(
                    new Error("Unable to open the Zoom meeting.")
                );
            });
    });
}

function getMeetingProcessId() {
    return new Promise((resolve, reject) => {
        execFile(
            "powershell.exe",
            [
                "-NoProfile",
                "-Command",
                "$process = Get-Process Zoom -ErrorAction SilentlyContinue | " +
                "Where-Object { $_.MainWindowTitle -like 'Zoom Meeting*' } | " +
                "Select-Object -First 1; " +
                "if ($process) { $process.Id }"
            ],
            { windowsHide: true },
            (error, stdout) => {
                if (error) {
                    resolve(null);
                    return;
                }

                const pid = parseInt(stdout.trim(), 10);

                if (Number.isNaN(pid)) {
                    resolve(null);
                    return;
                }

                resolve(pid);
            }
        );
    });
}

function isProcessRunning(pid) {
    return new Promise((resolve) => {
        if (!Number.isInteger(pid)) {
            resolve(false);
            return;
        }

        execFile(
            "powershell.exe",
            [
                "-NoProfile",
                "-Command",
                `Get-Process -Id ${pid} -ErrorAction SilentlyContinue`
            ],
            { windowsHide: true },
            (error, stdout) => {
                resolve(!error && stdout.trim() !== "");
            }
        );
    });
}

let meetingProcessId = null;

async function isMeetingActive() {
    // If we already know the meeting process,
    // track that exact process.
    if (meetingProcessId !== null) {
        const running = await isProcessRunning(meetingProcessId);

        if (!running) {
            meetingProcessId = null;
            return false;
        }

        return true;
    }

    // No meeting process tracked yet.
    const pid = await getMeetingProcessId();

    if (pid === null) {
        return false;
    }

    meetingProcessId = pid;
    return true;
}

module.exports = {
    isZoomRunning,
    launchZoom,
    openMeeting,
    getMeetingProcessId,
    isMeetingActive
};