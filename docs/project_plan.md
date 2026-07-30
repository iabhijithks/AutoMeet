# AutoMeet - Project Plan

Version: v0.1.0

Status: Planning Phase

Author: Abhijith K S

---

# 1. Project Overview

AutoMeet is a privacy-first Windows desktop application that automatically joins scheduled online meetings and records them for personal study.

The initial version is being developed specifically for automatically joining a daily Zoom class, waiting for the host if necessary, joining with the microphone muted and camera turned off, and automatically recording the meeting locally using OBS Studio.

The application is designed to be fully offline, lightweight, secure, and easy to use.

Future versions may support multiple meetings and other platforms such as Google Meet and Microsoft Teams.

---

# 2. Problem Statement

I attend a Zoom class at 7:00 PM.

Due to heavy traffic while returning home from college, I sometimes:

- Reach home late
- Miss attendance
- Miss important concepts taught at the beginning
- Have to wait several days until the tutor uploads the recording

I wanted an application that could automatically join the meeting and start recording while I am still travelling so that I never miss the beginning of the class.

---

# 3. Goals

The primary goals of AutoMeet are:

- Completely automate joining the meeting
- Automatically wait if the host has not started the meeting
- Join with microphone muted
- Join with camera turned off
- Automatically start recording
- Save recordings locally
- Keep everything completely offline
- Be simple, lightweight and reliable

---

# 4. Project Philosophy

AutoMeet follows the following principles.

## Privacy First

User data belongs only to the user.

Nothing should ever leave the computer.

## Local First

Everything must run locally.

No cloud services.

No backend.

No internet communication except what Zoom itself requires.

## Simplicity

The application should be easy to use.

One click should perform all required actions.

## Modularity

Each feature should exist as an independent module.

This makes the project easier to maintain and extend.

---

# 5. Functional Requirements

## Version 1

The application should be able to:

- Open Zoom automatically
- Join a predefined meeting
- Wait if the host has not started the meeting
- Automatically join once available
- Ensure microphone is muted
- Ensure camera is disabled
- Start OBS recording
- Save recordings locally
- Display current status

---

# 6. Non-Functional Requirements

The application must be:

- Fully local
- Secure
- Lightweight
- Reliable
- Easy to maintain
- Beginner-friendly codebase
- Open source
- Modular
- Well documented

---

# 7. Security Requirements

AutoMeet should never:

- Upload any information
- Send analytics
- Send telemetry
- Store data online
- Require user accounts
- Require cloud storage
- Store passwords remotely

Meeting information must remain on the user's computer.

Configuration should be stored locally.

---

# 8. Technology Stack

Programming Language

- JavaScript

Desktop Framework

- Electron

Runtime

- Node.js

Recording

- OBS Studio

Version Control

- Git

Repository Hosting

- GitHub

Development Environment

- Cursor IDE

---

# 9. Project Architecture

The application will consist of several independent modules.

UI

↓

Settings Manager

↓

Meeting Scheduler

↓

Zoom Controller

↓

Recording Controller

↓

Utility Functions

Each module should have a single responsibility.

---

# 10. Planned Folder Structure

AutoMeet/

docs/

assets/

recordings/

src/

README.md

.gitignore

package.json

---

# 11. Future Features

Possible future improvements include:

- Multiple meetings
- Google Meet support
- Microsoft Teams support
- Daily scheduler
- Calendar integration
- System tray support
- Windows startup
- Notifications
- Meeting history
- Automatic cleanup of old recordings
- Dark mode
- Automatic updates

---

# 12. Development Workflow

Every feature will follow the same process.

Design

↓

Implementation

↓

Testing

↓

Local Git Commit

↓

Documentation Update

↓

Next Feature

---

# 13. Git Strategy

Development will happen locally.

Small commits will be created after every completed feature.

The repository will be pushed to GitHub once the project reaches a stable and polished state.

---

# 14. Version Roadmap

v0.1.0

Project setup

v0.2.0

Electron application

v0.3.0

Settings manager

v0.4.0

Zoom automation

v0.5.0

Meeting detection

v0.6.0

OBS integration

v0.7.0

Scheduler

v0.8.0

UI improvements

v0.9.0

Testing and bug fixes

v1.0.0

First public release

---

# 15. Success Criteria

The project will be considered successful when:

- The application launches successfully.
- Automatically joins the Zoom meeting.
- Waits if the host has not started.
- Joins with microphone muted.
- Joins with camera disabled.
- Starts recording automatically.
- Saves recordings locally.
- Requires only one click (or automatic scheduling) from the user.
- Operates without any cloud services or backend.

---

# 16. License

The project is intended to be released as open source after reaching a stable version.