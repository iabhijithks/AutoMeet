const { app, safeStorage } = require("electron");
const fs = require("fs");
const path = require("path");

const CREDENTIAL_FILE_NAME = "credentials.json";

function getCredentialsPath() {
    return path.join(
        app.getPath("userData"),
        CREDENTIAL_FILE_NAME
    );
}

function ensureUserDataDirectory() {
    const userDataPath = app.getPath("userData");

    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, {
            recursive: true
        });
    }
}

function readCredentials() {
    ensureUserDataDirectory();

    const credentialsPath = getCredentialsPath();

    if (!fs.existsSync(credentialsPath)) {
        return {};
    }

    try {
        const raw = fs.readFileSync(
            credentialsPath,
            "utf8"
        );

        const parsed = JSON.parse(raw);

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            return {};
        }

        return parsed;
    } catch (error) {
        throw new Error(
            "Unable to read secure credentials."
        );
    }
}

function writeCredentials(credentials) {
    ensureUserDataDirectory();

    const credentialsPath = getCredentialsPath();
    const tempPath = `${credentialsPath}.tmp`;

    const content = JSON.stringify(
        credentials,
        null,
        2
    );

    fs.writeFileSync(
        tempPath,
        content,
        "utf8"
    );

    fs.renameSync(
        tempPath,
        credentialsPath
    );
}

function ensureEncryptionAvailable() {
    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error(
            "Secure credential storage is unavailable on this system."
        );
    }
}

function saveOBSWebSocketPassword(password) {
    if (typeof password !== "string") {
        throw new Error(
            "OBS WebSocket password must be a string."
        );
    }

    ensureEncryptionAvailable();

    const credentials = readCredentials();

    if (password.length === 0) {
        delete credentials.obsWebSocketPassword;
    } else {
        const encryptedPassword =
            safeStorage.encryptString(password);

        credentials.obsWebSocketPassword =
            encryptedPassword.toString("base64");
    }

    writeCredentials(credentials);

    return true;
}

function getOBSWebSocketPassword() {
    ensureEncryptionAvailable();

    const credentials = readCredentials();

    const encryptedPassword =
        credentials.obsWebSocketPassword;

    if (
        typeof encryptedPassword !== "string" ||
        encryptedPassword.length === 0
    ) {
        return "";
    }

    try {
        return safeStorage.decryptString(
            Buffer.from(
                encryptedPassword,
                "base64"
            )
        );
    } catch (error) {
        throw new Error(
            "Unable to decrypt the OBS WebSocket password."
        );
    }
}

function hasOBSWebSocketPassword() {
    const credentials = readCredentials();

    return (
        typeof credentials.obsWebSocketPassword ===
            "string" &&
        credentials.obsWebSocketPassword.length > 0
    );
}

module.exports = {
    saveOBSWebSocketPassword,
    getOBSWebSocketPassword,
    hasOBSWebSocketPassword
};