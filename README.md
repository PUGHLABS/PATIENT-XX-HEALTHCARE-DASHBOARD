# Patient-XX Healthcare

Personal health plan portal for **Patient-XX** — a single-file HTML app that compiles medical records, labs, medications, and provider notes to support informed decisions and second opinions.

> **Educational support only — not medical advice.**

---

## Quick Start

```bash
cd "c:/!PROJECTS/HOME PROJECTS/KIRSTENS HEALTH PLAN/KP-HEALTHCARE"
npx serve .
```

| URL | Who |
|-----|-----|
| http://localhost:3000 | This machine |
| http://192.168.0.6:3000 | Phone / tablet on WiFi |

Scan the QR code in the app hero to open on another device.

---

## Features

- **AI Assistant** — Ask health questions via Anthropic Claude (API key stored in localStorage)
- **QR Code** — Scan to open on phone when served over LAN
- **Quick Access cheatsheet** — One-click links + copy current URL button
- **Labs & Imaging** — Tables for CBC, CMP, Lipids, Hormones, Thyroid, Vitamin D, Autoimmune
- **Diagnoses** — Active and resolved with dates
- **Medications** — Rx (Walgreens / Koru Pharmacy) + OTC supplements
- **Preventive Care** — Vaccination status + cancer screening schedule
- **Priority Questions** — High priority + also important lists for provider visits

---

## File Structure

```
KP-HEALTHCARE/
├── patient-xx.html   # Main app (HTML + embedded health data)
├── patient-xx.css    # Stylesheet
├── patient-xx.js     # JavaScript (QR code, AI assistant, API key storage)
├── CLAUDE.md         # AI assistant context and technical notes
└── README.md         # This file
```

---

## Tech Stack

| Concern | Implementation |
|---------|---------------|
| Framework | Vanilla HTML/CSS/JS — no build step |
| AI | Anthropic Messages API (`claude-sonnet-4-6`) |
| QR Code | `api.qrserver.com` external API |
| API key storage | `localStorage` (falls back to `sessionStorage`) |
| Hosting | `npx serve .` for LAN sharing |

---

## Changelog

| Date | Summary |
|------|---------|
| 2026-04-14 | Anonymize patient name → Patient-XX; extract CSS/JS to separate files |
| 2026-03-10 | Fix JS SyntaxError (regex literals), update model to claude-sonnet-4-6, fix QR code (external API, LAN URL), add Quick Access cheatsheet, update WiFi IP to 192.168.0.6 |
| 2026-03-10 | Initial structure — hero, diagnoses, labs, meds, AI assistant, QR code |
