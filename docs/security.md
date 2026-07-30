# Security

Version: v0.1.0

---

# Security Goals

AutoMeet is designed with a privacy-first philosophy.

The application should never expose user information or rely on cloud services.

---

# Local First

Everything is stored locally.

Nothing is uploaded.

No external databases.

No cloud synchronization.

---

# Data Stored

The application stores only:

- Meeting link
- Meeting password
- User preferences
- Recording location

These are stored locally.

---

# Data Never Stored

- Analytics
- Telemetry
- User accounts
- Cloud backups
- Usage statistics

---

# Network Usage

AutoMeet itself should not communicate with any remote server.

The only network communication occurs through Zoom itself.

---

# Open Source

The project is intended to be open source.

Sensitive files should never be committed.

Examples

- config.json
- recordings
- logs

---

# Security Practices

- Validate configuration values
- Keep dependencies updated
- Avoid unnecessary packages
- Never execute arbitrary user input
- Keep attack surface minimal

---

# Privacy Principles

Privacy over convenience.

Everything belongs to the user.