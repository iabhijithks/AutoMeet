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

### Reason

Each module has one responsibility, making the project easier to maintain and extend.