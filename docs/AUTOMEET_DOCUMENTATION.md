# AutoMeet — Technical Documentation

> Complete technical and developer documentation for AutoMeet v1.

---

## 1. Overview

**AutoMeet** is a privacy-first Windows desktop application built with Electron to automate a recurring Zoom class workflow locally.

The project was created from a real problem: regular online classes usually start around 7 PM, but sometimes the developer reaches home late. Previously, a family member had to turn on the computer, join the class so attendance could be maintained, and start recording the session using OBS Studio.

After returning home, the developer could follow the ongoing lecture and later use the recording to catch up on anything missed. AutoMeet was created to reduce the dependence on another person being available for this process.

### Current v1 scope

AutoMeet v1 requires the user to open the application and click **Start Now**.

After that trigger, AutoMeet:

1. Opens the configured Zoom meeting.
2. Waits for the actual Zoom meeting process to become active.
3. Starts or connects to OBS Studio.
4. Starts and verifies local recording.
5. Monitors the meeting.
6. Stops recording when the meeting ends.

Scheduled automatic startup is intentionally deferred to **v1.1**.

---

## 2. Current Status

### AutoMeet v1

- Electron desktop application
- Windows support
- Dashboard and Settings UI
- Zoom meeting configuration
- Zoom Desktop Client integration
- Zoom meeting process detection
- OBS Studio integration
- OBS WebSocket control
- Local recording
- Recording-state verification
- Meeting monitoring
- Automatic recording stop
- Friendly error handling
- Secure OBS WebSocket password storage
- No AutoMeet cloud backend
- No AutoMeet telemetry or analytics

### Longer-term

- Scheduled automatic startup
- Recurring meetings
- Multiple scheduled meetings
- Windows startup support
- Notifications
- Recording-folder access
- Additional configuration validation
- Automatic OBS setup
- Diagnostics/onboarding
- More robust Zoom compatibility
- Installer/update improvements
- Additional automation capabilities

---

# 3. Architecture

AutoMeet is a local Electron application.

At a high level:

```text
                    ┌──────────────────────┐
                    │       AutoMeet       │
                    │     Electron App     │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
          ┌──────▼──────┐             ┌──────▼──────┐
          │     Zoom    │             │     OBS     │
          │   Desktop   │             │   Studio    │
          └─────────────┘             └─────────────┘
                 │                           │
          Meeting process             OBS WebSocket
          detection                    recording control
                                             │
                                      Local recording
```

AutoMeet acts as the local orchestration layer between Zoom and OBS.

There is no AutoMeet server involved in the v1 workflow.

---

# 4. Technology Stack


| Component             | Technology                                           |
| --------------------- | ---------------------------------------------------- |
| Desktop framework     | Electron                                             |
| Runtime               | Node.js                                              |
| Frontend              | HTML, CSS, JavaScript                                |
| IPC                   | Electron `contextBridge` / `ipcRenderer` / `ipcMain` |
| Meeting platform      | Zoom Desktop Client                                  |
| Recording software    | OBS Studio                                           |
| OBS control           | `obs-websocket-js`                                   |
| Credential protection | Electron `safeStorage`                               |
| Operating system      | Windows                                              |


Known development environment:

- OBS Studio 32.2.2
- `obs-websocket-js` 5.0.8
- OBS WebSocket port 4455
- Node.js 24.14.1
- npm 11.11.0
- Electron 43.2.0

---

# 5. Project Structure

The important project structure is:

```text
AutoMeet/
│
├── src/
│   ├── main/
│   │   ├── main.js
│   │   ├── preload.js
│   │   │
│   │   └── services/
│   │       ├── config-service.js
│   │       ├── credential-service.js
│   │       ├── meeting-controller.js
│   │       ├── recording-service.js
│   │       └── zoom-service.js
│   │
│   └── renderer/
│       ├── index.html
│       ├── renderer.js
│       └── style.css
│
├── docs/
│   ├── AUTOMEET_DOCUMENTATION.md
│   └── screenshots/
│
├── .gitignore
├── package.json
└── README.md
```

The exact repository may contain additional development files as the project evolves.

---

# 6. Electron Architecture

AutoMeet follows Electron's separation between the renderer and main process.

## Main process

`src/main/main.js`

The main process:

- Creates the Electron window.
- Registers IPC handlers.
- Loads and saves configuration.
- Coordinates Zoom operations.
- Starts the meeting controller.
- Exposes recording-state operations.
- Handles OBS credential storage through the credential service.

The renderer does not directly access Node.js system APIs.

## Preload

`src/main/preload.js`

The preload script exposes a controlled API to the renderer through:

```text
contextBridge.exposeInMainWorld()
```

The renderer interacts with this API rather than directly using Electron or Node.js APIs.

## Renderer

`src/renderer/`

The renderer contains the application interface:

- Dashboard
- Settings
- Meeting information
- Automation status
- Recording status
- Start Now workflow
- Error messages
- Schedule UI marked as coming soon

---

# 7. Electron Security

The BrowserWindow is configured with:

```js
webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
}
```

These settings provide the main renderer boundary used by AutoMeet.

### `contextIsolation`

Keeps the renderer's JavaScript environment isolated from Electron's privileged context.

### `nodeIntegration: false`

Prevents renderer code from directly importing Node.js APIs.

### `sandbox: true`

Enables Electron renderer sandboxing.

### IPC allowlisting

Only explicitly exposed operations are made available through the preload API.

Examples include:

```text
get-config
save-config
start-meeting
zoom-is-running
zoom-launch
zoom-open-meeting
zoom-is-meeting-active
is-recording
save-obs-password
has-obs-password
```

---

# 8. Configuration

Configuration is handled by:

```text
src/main/services/config-service.js
```

The renderer can request configuration through the preload API, but configuration file operations are handled in the main process.

Meeting-related settings include information such as:

- Meeting name
- Zoom meeting link
- Meeting ID
- Passcode
- Schedule fields reserved for future versions

The schedule fields currently exist in the configuration/UI structure but are disabled in v1.

---

# 9. Zoom Integration

Zoom integration is implemented locally through the Windows Zoom Desktop Client.

## Launching Zoom

AutoMeet checks whether Zoom is already running.

If it is not running, AutoMeet launches the configured Zoom executable.

The current expected Zoom executable location is:

```text
%APPDATA%\Zoom\bin\Zoom.exe
```

## Opening a meeting

AutoMeet opens a meeting using a Zoom meeting URL/protocol:

```text
zoommtg://zoom.us/join/...
```

This allows the Zoom Desktop Client to handle the actual meeting join process.

---

# 10. Zoom Meeting Detection

AutoMeet does not currently use an official Zoom meeting-state API.

Instead, it uses local Windows process information.

The Zoom service checks running Zoom processes and their window information using Windows process commands.

The application looks for the meeting process associated with a Zoom meeting window.

The controller first waits for a meeting process to appear.

Conceptually:

```text
Start Now
   ↓
Open Zoom meeting
   ↓
Wait for Zoom meeting process
   ↓
Meeting detected
   ↓
Start recording
```

## Meeting process tracking

Once the meeting process is detected, AutoMeet stores its process ID.

This is important because the window title can change when the Zoom meeting is minimized.

The application therefore uses the detected meeting process ID to determine whether the meeting process is still running.

This allows the meeting to remain detectable even when the meeting window is minimized.

## Detection limitations

Because this is based on local Windows process behavior rather than an official Zoom API:

- Zoom updates may affect detection.
- Different Zoom versions/configurations may behave differently.
- The implementation is currently Windows-specific.
- This should not be described as universal Zoom compatibility.

---

# 11. Meeting Controller

File:

```text
src/main/services/meeting-controller.js
```

The meeting controller orchestrates the complete v1 workflow.

The main flow is:

```text
Validate configuration
        ↓
Open Zoom meeting
        ↓
Wait for meeting process
        ↓
Start OBS recording
        ↓
Monitor meeting
        ↓
Detect meeting end
        ↓
Stop OBS recording
```

## Configuration validation

Before starting, AutoMeet checks that:

- Meeting ID is configured.
- Meeting passcode is configured.

If required information is missing, the workflow stops before attempting to continue.

## Monitoring

Once recording starts, the controller checks whether the meeting is active at regular intervals.

The current monitoring interval is approximately:

```text
3 seconds
```

To avoid stopping a recording because of one temporary detection failure, AutoMeet requires multiple consecutive inactive checks before treating the meeting as ended.

The current implementation uses:

```text
3 missed checks
```

before stopping the recording.

This provides a small amount of tolerance for temporary process-state changes.

---

# 12. OBS Integration

File:

```text
src/main/services/recording-service.js
```

AutoMeet controls OBS using:

```text
obs-websocket-js
```

The default OBS WebSocket endpoint is:

```text
127.0.0.1:4455
```

OBS WebSocket authentication is enabled in the intended v1 setup.

---

# 13. OBS Startup

AutoMeet checks whether OBS Studio is already running.

If OBS is not running:

1. AutoMeet searches known OBS installation paths.
2. It launches OBS.
3. It waits for the OBS process to become available.
4. It attempts to establish the WebSocket connection.

Known OBS paths include:

```text
C:\Program Files\obs-studio\bin\64bit\obs64.exe
C:\Program Files (x86)\obs-studio\bin\64bit\obs64.exe
```

## OBS working directory

OBS must be launched with its binary directory as the working directory.

This is important because OBS may fail to load required resources/themes correctly when launched from an incorrect working directory.

AutoMeet therefore launches OBS with:

```text
cwd = OBS binary directory
```

---

# 14. OBS WebSocket Authentication

AutoMeet uses the OBS WebSocket password configured by the user.

The connection is established with:

```text
ws://127.0.0.1:4455
```

The password is never printed to the console.

If authentication fails, AutoMeet reports:

```text
OBS WebSocket password is incorrect.
```

Temporary connection failures are retried.

Credential-related failures are not endlessly retried.

---

# 15. Secure Credential Storage

File:

```text
src/main/services/credential-service.js
```

The OBS WebSocket password is not stored as plaintext.

AutoMeet uses Electron's:

```text
safeStorage
```

API.

The general flow is:

```text
User enters password
        ↓
Main process receives password
        ↓
Electron safeStorage encrypts it
        ↓
Encrypted value stored locally
```

When AutoMeet needs to connect to OBS:

```text
Encrypted credential
        ↓
safeStorage decrypts
        ↓
Password supplied to OBS WebSocket connection
```

The renderer does not receive the stored password.

The credential file is stored in Electron's application user-data directory.

The stored encrypted value is represented as Base64 text containing the encrypted bytes.

---

# 16. Recording Workflow

When the meeting becomes active:

```text
AutoMeet
   ↓
ensure OBS is ready
   ↓
connect to OBS WebSocket
   ↓
GetRecordStatus
   ↓
StartRecord
   ↓
verify GetRecordStatus
```

AutoMeet verifies that recording actually became active rather than assuming the OBS command succeeded.

The recording service checks the recording state multiple times after sending the start command.

If recording does not become active, the workflow reports a recording-start failure.

---

# 17. Stopping Recording

When the meeting controller determines that the meeting has ended:

```text
Meeting inactive
      ↓
Consecutive inactive checks
      ↓
StopRecord
```

If OBS is already not recording, AutoMeet does not send an unnecessary stop command.

The recording remains under OBS's own local recording configuration.

Automatic recording-folder access is planned for v1.1.

---

# 18. End-to-End State Flow

The user-facing workflow can be represented as:

```text
Idle
 │
 ▼
Opening Zoom
 │
 ▼
Joining / waiting for meeting
 │
 ▼
Meeting detected
 │
 ▼
Starting recording
 │
 ▼
Recording
 │
 ▼
Meeting ended
 │
 ▼
Recording stopped
```

If something fails:

```text
Any stage
   ↓
Error
   ↓
Friendly error shown to user
```

The renderer presents human-readable status information rather than exposing raw internal implementation errors whenever possible.

---

# 19. Error Handling

AutoMeet includes error mapping for common failure cases.

Examples include:

### Missing meeting information

Possible causes:

- Meeting ID not configured.
- Passcode not configured.

### Zoom detection failure

Possible cause:

- Zoom meeting process did not become detectable within the expected period.

### OBS not found

Possible cause:

- OBS Studio is not installed in a supported installation path.

### OBS startup failure

Possible cause:

- OBS executable could not be launched.

### OBS credential missing

Possible cause:

- No OBS WebSocket password has been configured in AutoMeet.

### OBS credential incorrect

Possible cause:

- AutoMeet's stored password does not match the OBS WebSocket password.

### OBS connection failure

Possible causes:

- OBS is not ready.
- WebSocket server is not available.
- Temporary connection issue.

### Recording failure

Possible cause:

- OBS accepted the connection but recording did not become active after the start command.

---

# 20. Dashboard

The Dashboard is designed to provide a quick overview of the current meeting configuration and automation state.

It displays information such as:

- Meeting name
- Scheduled time
- Platform
- Masked meeting ID
- Recording software
- Recording location information
- Current automation state
- Start Now control

The schedule-related information is present in the UI structure but automatic scheduling is not active in v1.

---

# 21. Settings

The Settings view provides configuration for the v1 workflow.

Users can configure meeting information and the OBS WebSocket credential.

The OBS password field is used to save/update the credential through the secure main-process API.

The stored password is not sent back to the renderer for display.

The scheduling controls are intentionally disabled and marked as:

```text
Coming Soon
```

because scheduling is part of v1.1.

---

# 22. Manual OBS Setup

AutoMeet v1 intentionally does not configure OBS automatically.

A one-time manual setup is required.

## Step 1 — Install OBS Studio

Install OBS Studio on Windows.

## Step 2 — Create a scene

Create a scene intended for AutoMeet recording.

For example:

```text
AutoMeet Recording
```

## Step 3 — Add a recording source

Configure the desired recording source, such as Display Capture.

## Step 4 — Configure recording output

In OBS:

```text
Settings → Output → Recording
```

Choose the desired recording location and format.

## Step 5 — Enable OBS WebSocket

In OBS:

```text
Tools → WebSocket Server Settings
```

Use:

```text
Port: 4455
Authentication: Enabled
```

Set a password.

## Step 6 — Configure AutoMeet

Enter the same OBS WebSocket password in AutoMeet Settings.

AutoMeet stores the credential using Electron `safeStorage`.

---

# 23. Normal User Workflow

For a packaged release:

1. Install AutoMeet.
2. Install/configure Zoom Desktop Client.
3. Install/configure OBS Studio.
4. Complete the one-time OBS WebSocket setup.
5. Open AutoMeet.
6. Enter meeting information.
7. Save the configuration.
8. Click **Start Now** when the workflow should begin.

AutoMeet then handles the Zoom/OBS workflow locally.

---

# 24. Developer Setup

## Requirements

- Windows 10 or Windows 11
- Node.js
- npm
- Git
- Zoom Desktop Client
- OBS Studio

## Clone

```bash
git clone <https://github.com/iabhijithks/AutoMeet>
cd AutoMeet
```

## Install dependencies

```bash
npm install
```

## Run

```bash
npm start
```

---

# 25. Development Principles

The project prioritizes:

### Local-first operation

The core workflow does not require an AutoMeet cloud backend.

### Privacy

Meeting credentials, OBS credentials, and recordings are not uploaded to an AutoMeet server.

### Least privilege in Electron

Renderer code does not directly receive unrestricted Node.js access.

### Explicit automation

The v1 workflow starts only after the user clicks **Start Now**.

### Incremental development

The project intentionally separates:

- Core workflow
- Reliability/error handling
- Security
- UI polish
- Scheduling
- Future automation

This avoids introducing scheduling complexity before the core Zoom → OBS workflow is stable.

---

# 26. Testing Performed

The v1 implementation has been tested against the core local workflow.

## Zoom testing

Tested states included:

- Zoom closed
- Zoom running at the home screen
- Active Zoom meeting
- Meeting window minimized
- Meeting window restored
- Meeting left while main Zoom process remained open

The meeting process ID was used to continue tracking the meeting when the window was minimized.

## OBS testing

Tested states included:

- OBS closed
- OBS already running
- OBS launch
- OBS WebSocket connection
- Recording start
- Recording-state verification
- Recording stop
- Correct WebSocket password
- Incorrect WebSocket password
- Missing WebSocket password

The incorrect-password case was specifically verified to produce an authentication failure and stop unnecessary retry attempts.

## UI testing

Tested areas include:

- Dashboard
- Settings
- Start Now workflow
- Loading/spinner state
- Recording state
- Ended state
- Error state
- Schedule Coming Soon state
- Friendly error messages

---

# 27. Known Limitations

AutoMeet v1 is intentionally not a fully universal meeting automation system.

### Windows only

The current implementation relies on Windows process behavior and Windows-specific executable paths/commands.

### Zoom Desktop Client required

The workflow depends on the locally installed Zoom Desktop Client.

### OBS Studio required

Recording is performed by OBS Studio.

### Manual OBS setup

Users must configure the OBS scene, recording output, and WebSocket server themselves in v1.

### Manual Start Now

Automatic scheduling is not implemented in v1.

### Zoom detection is implementation-dependent

Meeting detection relies on local Zoom process/window behavior rather than an official Zoom meeting-state API.

### No automatic recording-folder access

v1 does not provide an "Open Recording Folder" workflow.

### Compatibility

Future Zoom, OBS, Windows, or Electron changes may require compatibility updates.

---

# 28. Privacy Model

AutoMeet's intended v1 data flow is local:

```text
                    Local Windows PC
┌─────────────────────────────────────────────────────┐
│                                                     │
│  AutoMeet ──────► Zoom                              │
│      │                                              │
│      └──────────► OBS ──────► Local recording       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

There is no AutoMeet cloud service in the v1 architecture.

This does not mean Zoom or OBS themselves never communicate with their own services. AutoMeet's design simply does not add an AutoMeet backend for storing or processing the meeting recordings.

---

# 29. Responsible Use

AutoMeet is intended for legitimate personal and educational automation.

Users are responsible for:

- Following Zoom's terms and policies.
- Following their institution's or organization's policies.
- Obtaining required consent before recording meetings.
- Handling recordings appropriately.
- Protecting meeting credentials.

Recording laws and organizational policies vary by location.

---

# 30. Design Decisions

## Why Electron?

The project requires:

- Desktop UI
- Windows integration
- Node.js process management
- Local file access
- IPC between UI and privileged operations

Electron provides these capabilities in one desktop application.

## Why local automation?

The original problem is fundamentally a local desktop workflow. A cloud service is unnecessary for the core operation and would introduce additional privacy and infrastructure concerns.

## Why OBS WebSocket?

OBS already provides the recording functionality. AutoMeet acts as an automation layer instead of implementing its own recording engine.

## Why process-based Zoom detection?

The v1 implementation needed a local way to determine when the actual meeting process became active. The current approach uses Windows process behavior and can track the meeting process even when its window is minimized.

## Why defer scheduling?

Scheduling adds background startup, recurring-event handling, persistence, notifications, and failure/retry scenarios. The project therefore stabilizes the core manual-trigger workflow first and plans scheduling for v1.1.

---

# 31. Troubleshooting

## AutoMeet says OBS was not found

Check that OBS Studio is installed in one of the supported locations.

If OBS is installed elsewhere, the current v1 implementation may not detect it automatically.

## AutoMeet says the OBS password is incorrect

Verify that the password saved in AutoMeet exactly matches the password configured in:

```text
OBS → Tools → WebSocket Server Settings
```

Check that:

```text
Port = 4455
Authentication = Enabled
```

## OBS opens but recording does not start

Check:

- OBS is running correctly.
- WebSocket server is enabled.
- AutoMeet has the correct password.
- An OBS scene exists.
- A recording source has been configured.
- OBS can manually start a recording.

## Zoom meeting is not detected

Check:

- Zoom Desktop Client is installed.
- The configured Meeting ID/passcode are correct.
- The Zoom meeting actually started.
- Zoom has not changed its process/window behavior.

## Recording stops unexpectedly

The meeting controller uses multiple consecutive inactive checks before treating the meeting as ended. If unexpected behavior occurs, verify Zoom's process state and review the application console logs during development.

---

# 32. Future Architecture Direction

The architecture is intentionally designed so scheduling can be added without replacing the core meeting/recording services.

A future scheduled workflow can conceptually become:

```text
Scheduler
    ↓
Meeting Controller
    ↓
Zoom Service
    ↓
Meeting Detection
    ↓
Recording Service
    ↓
OBS
```

This allows the existing v1 workflow to remain the foundation for v1.1 scheduling.

---

# 33. Documentation Maintenance

When changing AutoMeet, update this documentation when a change affects:

- Architecture
- IPC channels
- Security behavior
- Credential storage
- Zoom detection
- OBS integration
- Configuration
- User workflow
- Error handling
- Roadmap
- Known limitations

The README should remain concise and user-facing.

This document is intended to contain the deeper technical information.

---

# 34. Related Files

- `README.md` — project landing page and concise user-facing documentation
- `src/main/main.js` — Electron main process and IPC handlers
- `src/main/preload.js` — renderer-safe API bridge
- `src/main/services/config-service.js` — configuration management
- `src/main/services/credential-service.js` — secure OBS credential storage
- `src/main/services/meeting-controller.js` — end-to-end meeting workflow
- `src/main/services/recording-service.js` — OBS startup, WebSocket connection, recording control
- `src/main/services/zoom-service.js` — Zoom launching, meeting opening, and meeting detection
- `src/renderer/index.html` — UI structure
- `src/renderer/renderer.js` — UI behavior and workflow state
- `src/renderer/style.css` — application styling

---

## Final Note

AutoMeet v1 is a working local automation prototype focused on one specific workflow:

```text
User clicks Start Now
        ↓
Open Zoom
        ↓
Detect actual meeting
        ↓
Prepare OBS
        ↓
Start local recording
        ↓
Monitor meeting
        ↓
Stop recording
```

The next major milestone is scheduled automation in v1.1.