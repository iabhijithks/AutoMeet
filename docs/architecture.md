# AutoMeet Architecture

Version: v0.1.0

---

# Overview

AutoMeet is a modular Electron-based Windows desktop application designed to automate joining and recording online meetings while remaining completely local and privacy-first.

The application follows a modular architecture where each component has only one responsibility.

---

# High Level Architecture

                Electron Desktop App
                        │
        ┌───────────────┼───────────────┐
        │               │               │
     Renderer       Main Process     Utilities
        │               │
        │               │
        ├───────────────┼───────────────┐
        │               │               │
 Settings      Zoom Controller    Recorder
 Manager                          Controller
        │               │               │
        └───────────────┼───────────────┘
                        │
                  Windows Operating System
                  │                    │
               Zoom               OBS Studio

---

# Modules

## UI (Renderer)

Responsibilities

- Display status
- Show buttons
- Display settings
- Display recording status

The UI should never directly control Zoom.

---

## Main Process

Responsibilities

- Coordinate modules
- Receive UI events
- Start automation
- Manage application lifecycle

---

## Settings Manager

Responsibilities

- Read config.json
- Write config.json
- Validate settings

---

## Zoom Controller

Responsibilities

- Launch Zoom
- Wait for host
- Join meeting
- Mute microphone
- Disable camera

---

## Recorder Controller

Responsibilities

- Launch OBS
- Start recording
- Stop recording
- Save recordings

---

## Scheduler

Responsibilities

- Monitor meeting time
- Trigger automation

---

## Utility Module

Contains reusable helper functions.

Examples

- Logging
- Date formatting
- File utilities

---

# Design Principles

- Single Responsibility Principle
- Separation of Concerns
- Local First
- Privacy First
- Modular Design