# Patient-XX Healthcare — Context for AI Assistants

## Project Overview
Personal health plan portal for Patient-XX (~60, rural patient, Providence Health / MyChart). Single-page HTML app that compiles medical data to support informed decisions and second opinions. **Educational support only — not medical advice.**

## Repo Structure
```
XX-HEALTHCARE/
├── index.html        # Main health plan page (health data sections)
├── styles.css        # Stylesheet
├── app.js            # App logic (QR code, AI assistant, API key) — generic
├── patient-data.js   # Patient config: PATIENT_ID, metadata, CTX prompt ← edit this per patient
├── README.md
├── CLAUDE.md         # This file — context for future edits
└── .git/
```

## Adding a New Patient
1. Copy this repo (or use GitHub template feature)
2. Edit `patient-data.js`: set `PATIENT_ID`, `PATIENT_AGE`, `PATIENT_INSURANCE`, `PATIENT_UPDATED`, and the `CTX` system prompt
3. Edit the health data sections in `index.html` (everything below the `PATIENT DATA SECTIONS` comment)
4. Do NOT edit `app.js` or `styles.css` — they are generic

## index.html — Key Sections
| Section | Purpose |
|---------|---------|
| Hero | Title, badges (Patient, Age, Rural, Updated), QR code (top-right), directory path |
| Active Items | 9 urgent items needing attention (`.kf`) |
| Health Overview | Stats (119 results, 9 concerns, 2003–2026 span, etc.) |
| AI Assistant | Anthropic API, API key input, quick-question buttons, textarea, response area |
| Official Diagnoses | Active (Essential Hypertension, Leukopenia, Vit D, Chronic Knee Pain, TMJ, etc.) and Resolved |
| Preventive Care | Vaccinations (overdue: Tdap, Shingles, Pneumococcal, Flu) + cancer screenings |
| Medications & Supplements | Rx from Walgreens/Koru Pharmacy, OTC supplements |
| Labs | Hormones, Thyroid, CMP, CBC, Lipids, Vitamin D, Autoimmune |
| Imaging & Procedures | Timeline (Oct 2025 breast biopsy, mammogram, colonoscopy, etc.) |
| Provider Notes | Dr. Witham, Joy Vaughan, etc. |
| Priority Questions | High priority + Also Important lists |

## Technical Notes

### AI Assistant (Claude)
- **API:** Anthropic Messages API (`https://api.anthropic.com/v1/messages`)
- **Model:** `claude-sonnet-4-6`
- **System context:** Large `CTX` string in `patient-data.js` with full health data (diagnoses, meds, labs)
- **API key:** User enters in browser; persisted in `localStorage` (falls back to `sessionStorage`). Show/Hide toggle. Survives browser restarts.
- **CORS:** Requires `anthropic-dangerous-direct-browser-access: true` header. Works over LAN server; blocked on `file://` protocol.
- **Required header:** `anthropic-beta: prompt-caching-2024-07-31` (or omit beta; the dangerous-access header is the critical one)

### QR Code
- **Implementation:** External API — `api.qrserver.com/v1/create-qr-code/` (no CDN/canvas)
- **Single container:** `#qrcode` in hero
- **URL encoding:** Encodes live `window.location.href` when served over LAN; falls back to text `"Patient-XX Health Plan"` on `file://` or `blob:`
- **Size:** Requested at `150x150`, rendered at `100×100` in the UI

### Styling
- **Theme:** Blue gradient (`#1e3a5f`, `#2d6a9f`, `#4a9fd4`)
- **Breakpoint:** 768px for mobile (grids → 1 col, QR moves below badges)
- **CSS classes:** `.ab-info`, `.ab-warn`, `.ab-ok`, `.ab-err` (info boxes); `.n`, `.h`, `.l`, `.ab` (lab badges); `.mc` (med cards); `.lab-table` (tables)

## Data Update Workflow
Health data is embedded in:
1. `index.html` (diagnoses, meds, labs, tables — display)
2. `CTX` system prompt in `patient-data.js` (AI context)

Keep both in sync when updating labs, meds, or diagnoses.

## Local Server — Quick Start
```bash
cd "path/to/XX-HEALTHCARE"
npx serve .
# localhost:3000        — browser on this machine
# <your-lan-ip>:3000   — WiFi LAN (phone / tablet)
```
Windows Firewall (run once as Admin if phone can't reach):
```powershell
netsh advfirewall firewall add rule name="serve-3000" protocol=TCP dir=in localport=3000 action=allow
```

## Git Commit Convention
Include a timestamp in every commit message for reference:
```
Short description (YYYY-MM-DD HH:MM)

Body...

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Future Improvements
See [future.md](future.md) for detailed notes on:
- API key security options (localStorage risks, backend proxy design)
- Other ideas: JSON data extraction, print CSS, accessibility, HTTPS on LAN
