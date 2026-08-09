# Architecture Decisions

This document records important design decisions made during development.

---

## ADR-001

### Decision

Build a desktop application instead of a web application.

### Reason

Desktop automation requires access to local Windows applications such as Zoom and OBS.

---

## ADR-002

### Decision

Use Electron.

### Reason

- JavaScript based
- Cross platform
- Large community
- Good documentation

---

## ADR-003

### Decision

Use local JSON instead of a database.

### Reason

- Simpler
- Faster
- Offline
- More secure
- No server required

---

## ADR-004

### Decision

Use OBS Studio.

### Reason

OBS provides better automation support than Xbox Game Bar.

---

## ADR-005

### Decision

Push to GitHub after the project reaches a stable state.

### Reason

Allows development locally while presenting a polished public repository.

---

## ADR-006

### Decision

Follow modular architecture.

## ADR-007

### Decision

Application settings will eventually be stored in the user's AppData directory instead of inside the project folder.

### Reason

- Follows Windows application standards.
- Keeps source code separate from user data.
- Prevents accidental commits of personal configuration.
- Allows updates without overwriting user settings.

### Current Status

During development, `config.json` may temporarily remain inside the project folder for simplicity.

Before the first public release (v1.0), configuration storage will be migrated to the AppData directory.

## ADR-008

### Decision

The application will generate `config.json` automatically through a Settings page instead of requiring users to edit JSON files manually.

### Reason

- Better user experience.
- Easier for non-technical users.
- Eliminates manual configuration errors.
- Keeps all configuration local while remaining beginner-friendly.

### Reason

Each module has one responsibility, making the project easier to maintain and extend.

## IPC Security Pattern

All privileged application operations must be performed in the Electron main process.

The renderer process must access privileged functionality only through narrowly scoped APIs exposed by the preload script using `contextBridge`.

IPC channels must represent specific application operations rather than generic command execution. Inputs received through IPC must be validated in the main process before being used.

The renderer must not receive direct access to Node.js APIs, Electron's `ipcRenderer`, the filesystem, child processes, or arbitrary operating-system commands.

All privileged operations must occur in the Electron main process. Renderer processes may access privileged functionality only through narrowly scoped APIs exposed by the preload script. IPC inputs must be validated by the main process before execution.