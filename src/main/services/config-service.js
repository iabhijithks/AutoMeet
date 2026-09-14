const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const ALLOWED_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const CONFIG_FILE_NAME = "config.json";

function getDefaultConfig() {
    return {
        meeting: {
            name: "",
            link: "",
            meetingId: "",
            passcode: ""
        },
        schedule: {
            enabled: false,
            time: "19:00",
            days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
        },
        recording: {
            software: "obs",
            location: "Local AutoMeet recordings folder"
        }
    };
}

function getConfigPath() {
    return path.join(app.getPath("userData"), CONFIG_FILE_NAME);
}

function ensureUserDataDirectory() {
    const userDataPath = app.getPath("userData");

    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
    }
}

function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateString(value, fieldName) {
    if (typeof value !== "string") {
        return `${fieldName} must be a string.`;
    }

    return null;
}

function validateConfig(config) {
    if (!isPlainObject(config)) {
        return { valid: false, error: "Configuration must be an object." };
    }

    const allowedTopLevelKeys = ["meeting", "schedule", "recording"];

    for (const key of Object.keys(config)) {
        if (!allowedTopLevelKeys.includes(key)) {
            return {
                valid: false,
                error: `Unexpected configuration property: ${key}`
            };
        }
    }

    if (!isPlainObject(config.meeting)) {
        return { valid: false, error: "Meeting configuration is required." };
    }

    if (!isPlainObject(config.schedule)) {
        return { valid: false, error: "Schedule configuration is required." };
    }

    if (!isPlainObject(config.recording)) {
        return { valid: false, error: "Recording configuration is required." };
    }

    const meetingErrors = [
        validateString(config.meeting.name, "Meeting name"),
        validateString(config.meeting.link, "Meeting link"),
        validateString(config.meeting.meetingId, "Meeting ID"),
        validateString(config.meeting.passcode, "Passcode")
    ].filter(Boolean);

    if (meetingErrors.length > 0) {
        return { valid: false, error: meetingErrors[0] };
    }

    if (typeof config.schedule.enabled !== "boolean") {
        return { valid: false, error: "Schedule enabled must be a boolean." };
    }

    if (!TIME_PATTERN.test(config.schedule.time)) {
        return { valid: false, error: "Schedule time must be a valid HH:MM string." };
    }

    if (!Array.isArray(config.schedule.days)) {
        return { valid: false, error: "Schedule days must be an array." };
    }

    for (const day of config.schedule.days) {
        if (typeof day !== "string" || !ALLOWED_DAYS.includes(day)) {
            return {
                valid: false,
                error: "Schedule days must contain valid weekday strings."
            };
        }
    }

    const recordingErrors = [
        validateString(config.recording.software, "Recording software"),
        validateString(config.recording.location, "Recording location")
    ].filter(Boolean);

    if (recordingErrors.length > 0) {
        return { valid: false, error: recordingErrors[0] };
    }

    return {
        valid: true,
        config: {
            meeting: {
                name: config.meeting.name,
                link: config.meeting.link,
                meetingId: config.meeting.meetingId,
                passcode: config.meeting.passcode
            },
            schedule: {
                enabled: config.schedule.enabled,
                time: config.schedule.time,
                days: [...config.schedule.days]
            },
            recording: {
                software: config.recording.software,
                location: config.recording.location
            }
        }
    };
}

function writeConfigFile(config) {
    ensureUserDataDirectory();

    const configPath = getConfigPath();
    const tempPath = `${configPath}.tmp`;
    const content = JSON.stringify(config, null, 2);

    fs.writeFileSync(tempPath, content, "utf8");
    fs.renameSync(tempPath, configPath);
}

function loadConfig() {
    ensureUserDataDirectory();

    const configPath = getConfigPath();

    if (!fs.existsSync(configPath)) {
        const defaultConfig = getDefaultConfig();
        writeConfigFile(defaultConfig);
        return defaultConfig;
    }

    let parsed;

    try {
        const raw = fs.readFileSync(configPath, "utf8");
        parsed = JSON.parse(raw);
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error("Configuration file is corrupted.");
        }

        throw new Error("Unable to read configuration file.");
    }

    const validation = validateConfig(parsed);

    if (!validation.valid) {
        throw new Error(validation.error);
    }

    return validation.config;
}

function saveConfig(config) {
    const validation = validateConfig(config);

    if (!validation.valid) {
        throw new Error(validation.error);
    }

    writeConfigFile(validation.config);
    return validation.config;
}

module.exports = {
    loadConfig,
    saveConfig,
    validateConfig
};
