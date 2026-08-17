# AutoMeet - Project Plan

**Version:** v0.1.0  
**Status:** Active Development

---

## 1. Project Overview

AutoMeet is a privacy-first Windows desktop application that automates joining scheduled online meetings and recording them locally.

The initial goal is to automate a daily Zoom meeting:

- Open/join the configured meeting
- Wait for the host if necessary
- Join with microphone muted
- Join with camera disabled
- Start recording using OBS
- Save recordings locally
- Display the current application status

AutoMeet is designed to run locally without an AutoMeet backend or cloud service.

## 2. Technology Stack

- **Language:** JavaScript
- **Desktop Framework:** Electron
- **Runtime:** Node.js
- **Recording:** OBS Studio
- **Version Control:** Git
- **Repository:** GitHub
- **IDE:** Cursor

## 3. Architecture

AutoMeet uses a secure Electron architecture:

**Renderer → Preload → IPC → Main Process → Services**

### Renderer

Handles:

- Dashboard UI
- Settings UI
- User interaction
- Displaying application state

The renderer does not directly access Node.js or the filesystem.

### Preload

Provides a controlled API between the renderer and main process using Electron's `contextBridge`.

### Main Process

Handles:

- Application lifecycle
- IPC
- Privileged operations
- Communication with services

### Services

Independent modules handle specific responsibilities.

Current service:

- `config-service.js`

Planned services:

- Zoom controller
- Recording controller
- Scheduler

---

## 4. Current Project Structure

The project currently follows this structure:

AutoMeet/
- docs/
  - decisions.md
  - project_plan.md
- src/
  - main/
    - main.js
    - preload.js
    - services/
      - config-service.js
  - renderer/
    - index.html
    - renderer.js
    - style.css
- .gitignore
- package.json
- package-lock.json

User-specific configuration and recordings are excluded from Git.

---

## 5. Development Phases

### Phase 0 — Foundation

- [x] Project planning
- [x] Git initialization
- [x] Folder structure
- [x] Architecture design
- [x] Security design

### Phase 1 — Application Foundation & Settings

- [x] Initialize Electron
- [x] First application window
- [x] Secure BrowserWindow configuration
- [x] Preload bridge
- [x] Context isolation
- [x] Disabled Node integration
- [x] IPC security pattern
- [x] Dashboard UI
- [x] Settings UI
- [x] Dashboard ↔ Settings navigation
- [x] Configuration service
- [x] Configuration validation
- [x] Save settings
- [x] Load settings
- [x] Local configuration storage

### Phase 2 — Zoom Automation

- [ ] Launch Zoom
- [ ] Detect Zoom
- [ ] Open configured meeting
- [ ] Wait for host
- [ ] Join meeting
- [ ] Mute microphone
- [ ] Disable camera
- [ ] Detect meeting state

### Phase 3 — Recording

- [ ] Launch OBS
- [ ] Start recording
- [ ] Detect recording state
- [ ] Stop recording
- [ ] Verify local recording

### Phase 4 — Scheduler

- [ ] Meeting scheduler
- [ ] Automatic start
- [ ] Scheduled recording
- [ ] Notifications

### Phase 5 — Reliability & Polish

- [ ] Error handling
- [ ] Better status display
- [ ] Logging
- [ ] UI improvements
- [ ] Testing
- [ ] Edge-case handling

### Phase 6 — Release

- [ ] Final testing
- [ ] README
- [ ] Screenshots
- [ ] Build Windows executable
- [ ] GitHub release

## 6. Development Workflow

For each major feature:

**Design → Implement → Test → Review → Document → Commit**

Git commits should represent meaningful completed checkpoints.

---

## 7. Final Goal

The finished application should allow the user to configure a meeting once and then use **Start Now** or the scheduler to:

**Start recording → Open/join meeting → Handle waiting → Join with correct audio/video settings → Continue recording locally**

The application should remain local, secure, maintainable, and easy to understand.