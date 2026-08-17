# AutoMeet - Architecture Decisions

This document records important technical and architectural decisions made during development.

---

## ADR-001 — Desktop Application

### Decision

Build AutoMeet as a desktop application instead of a web application.

### Reason

AutoMeet needs to interact with local Windows applications such as Zoom and OBS. A desktop application is better suited for local automation.

---

## ADR-002 — Electron

### Decision

Use Electron for the desktop application.

### Reason

- JavaScript-based
- Provides desktop application capabilities
- Allows separation between UI and privileged operations
- Works well with the Node.js ecosystem
- Familiar development environment

---

## ADR-003 — Renderer / Preload / Main Architecture

### Decision

Separate the application into Renderer, Preload, Main Process and Services.

### Reason

This keeps the UI separate from privileged operations and makes the application easier to maintain.

The basic flow is:

**Renderer → Preload → IPC → Main Process → Services**

The renderer should never directly access Node.js, the filesystem, child processes or operating-system commands.

## ADR-004 — IPC Security

### Decision

Use narrowly scoped IPC channels for privileged operations.

### Reason

The renderer is UI code and should not receive unrestricted access to Electron or Node.js APIs.

Each privileged operation should have:

- A specific IPC channel
- A specific preload API
- Input validation in the main process

Current Electron security settings include:

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`

---

## ADR-005 — Local JSON Configuration

### Decision

Use a local JSON configuration file instead of a database.

### Reason

AutoMeet has relatively simple configuration data.

JSON provides:

- Simplicity
- Easy debugging
- No database dependency
- Offline operation
- Easy maintenance

The configuration contains meeting, schedule and recording settings.

---

## ADR-006 — Store Configuration in User Data

### Decision

Store the user's configuration in Electron's application user-data directory rather than the project directory.

### Reason

This:

- Keeps personal configuration separate from source code
- Prevents accidental Git commits
- Allows different users to have different configurations
- Allows application updates without overwriting user settings

The configuration is generated and managed by the application.

## ADR-007 — Settings UI

### Decision

Users configure meetings through the application's Settings page instead of manually editing `config.json`.

### Reason

A graphical settings page is easier and safer for users than manually editing JSON.

The Settings page allows configuration of:

- Meeting name
- Meeting link
- Meeting ID
- Passcode
- Schedule
- Recording settings

---

## ADR-008 — OBS for Recording

### Decision

Use OBS Studio for recording automation.

### Reason

OBS provides better automation capabilities and flexibility for the planned recording workflow than relying on Windows Game Bar.

---

## ADR-009 — Local-First Design

### Decision

AutoMeet will not use an AutoMeet backend or cloud database.

### Reason

The application is intended to keep configuration and recordings on the user's computer.

User-specific data should remain local.

---

## ADR-010 — Git and Personal Data

### Decision

Personal configuration and recordings must not be committed to Git.

### Reason

The repository should contain the application, not the developer's personal meeting information or recordings.

`.gitignore` therefore excludes:

- `config.json`
- `recordings/`
- `.env`
- `node_modules/`
- Log files

---

## ADR-011 — Modular Services

### Decision

Application features should be implemented as independent services.

### Reason

Each service should have a single responsibility.

For example:

- Configuration → `config-service.js`
- Zoom → future Zoom service
- Recording → future recording service
- Scheduling → future scheduler service

This makes the application easier to test, debug and extend.
