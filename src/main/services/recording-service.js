const OBSWebSocket = require("obs-websocket-js").default;

const { execFile } = require("child_process");

const fs = require("fs");

const path = require("path");

const credentialService = require("./credential-service");

const obs = new OBSWebSocket();

const OBS_HOST = "127.0.0.1";

const OBS_PORT = 4455;

const OBS_PATHS = [
    "C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe",
    "C:\\Program Files (x86)\\obs-studio\\bin\\64bit\\obs64.exe"
];

let connected = false;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getOBSPath() {
    for (const obsPath of OBS_PATHS) {
        if (fs.existsSync(obsPath)) {
            return obsPath;
        }
    }

    return null;
}

function isOBSRunning() {
    return new Promise((resolve) => {
        execFile(
            "tasklist",
            ["/FI", "IMAGENAME eq obs64.exe"],
            { windowsHide: true },
            (error, stdout) => {
                if (error) {
                    resolve(false);
                    return;
                }

                resolve(
                    stdout.toLowerCase().includes("obs64.exe")
                );
            }
        );
    });
}

async function launchOBS() {
    const alreadyRunning = await isOBSRunning();

    if (alreadyRunning) {
        return true;
    }

    const obsPath = getOBSPath();

    if (!obsPath) {
        throw new Error(
            "OBS Studio was not found. Please install OBS Studio first."
        );
    }

    const obsBinDirectory = path.dirname(obsPath);

    return new Promise((resolve, reject) => {
        const process = execFile(
            obsPath,
            [],
            {
                windowsHide: false,
                cwd: obsBinDirectory
            }
        );

        process.on("error", (error) => {
            reject(
                new Error(
                    `Unable to launch OBS Studio: ${error.message}`
                )
            );
        });

        process.unref();

        resolve(true);
    });
}

async function connect() {
    if (connected) {
        return true;
    }

    const obsPassword =
        credentialService.getOBSWebSocketPassword();

    if (!obsPassword) {
        throw new Error(
            "OBS WebSocket password is not configured."
        );
    }

    try {
        await obs.connect(
            `ws://${OBS_HOST}:${OBS_PORT}`,
            obsPassword
        );

        connected = true;

        console.log(
            "[OBS] WebSocket connected."
        );

        return true;
    } catch (error) {
        connected = false;

        console.error(
            "[OBS] WebSocket connection failed:",
            error.message
        );

        if (
            error.message ===
            "Authentication failed."
        ) {
            throw new Error(
                "OBS WebSocket password is incorrect."
            );
        }

        throw new Error(
            "Unable to connect to OBS."
        );
    }
}

async function ensureOBSReady() {
    let running = await isOBSRunning();

    if (!running) {
        console.log(
            "[OBS] OBS is not running. Launching..."
        );

        await launchOBS();
    } else {
        console.log(
            "[OBS] OBS is already running."
        );
    }

    // Wait for the OBS process to appear.
    for (let attempt = 0; attempt < 20; attempt++) {
        running = await isOBSRunning();

        if (running) {
            break;
        }

        await wait(500);
    }

    if (!running) {
        throw new Error(
            "OBS Studio could not be started."
        );
    }

    // Wait for OBS WebSocket to become available.
    for (let attempt = 0; attempt < 20; attempt++) {
        try {
            await connect();

            return true;
        } catch (error) {
            if (
                error.message ===
                "OBS WebSocket password is incorrect."
            ) {
                throw error;
            }

            if (
                error.message ===
                "OBS WebSocket password is not configured."
            ) {
                throw error;
            }

            await wait(500);
        }
    }

    throw new Error(
        "OBS Studio started, but AutoMeet could not connect to OBS."
    );
}

async function isRecording() {
    await ensureOBSReady();

    const response = await obs.call(
        "GetRecordStatus"
    );

    return response.outputActive;
}

async function startRecording() {
    await ensureOBSReady();

    const status = await obs.call(
        "GetRecordStatus"
    );

    console.log(
        "[OBS] Recording before start:",
        status.outputActive
    );

    if (status.outputActive) {
        console.log(
            "[OBS] Recording is already active."
        );

        return true;
    }

    console.log(
        "[OBS] Sending StartRecord command..."
    );

    await obs.call("StartRecord");

    // Give OBS a moment to transition into recording.
    for (let attempt = 0; attempt < 10; attempt++) {
        await wait(500);

        const verifyStatus = await obs.call(
            "GetRecordStatus"
        );

        console.log(
            `[OBS] Recording check ${attempt + 1}:`,
            verifyStatus.outputActive
        );

        if (verifyStatus.outputActive) {
            console.log(
                "[OBS] Recording started successfully."
            );

            return true;
        }
    }

    throw new Error(
        "OBS received the recording command, but recording did not start."
    );
}

async function stopRecording() {
    await ensureOBSReady();

    const status = await obs.call(
        "GetRecordStatus"
    );

    if (!status.outputActive) {
        return true;
    }

    console.log(
        "[OBS] Sending StopRecord command..."
    );

    await obs.call("StopRecord");

    return true;
}

module.exports = {
    connect,
    isRecording,
    startRecording,
    stopRecording
};