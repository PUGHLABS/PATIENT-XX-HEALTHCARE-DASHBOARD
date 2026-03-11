# KP-HEALTHCARE — Context for AI Assistants

## Project Overview
Personal health plan portal for Kirsten (~60, rural patient, Providence Health / MyChart). Single-page HTML app that compiles medical data to support informed decisions and second opinions. **Educational support only — not medical advice.**

## Repo Structure
```
KP-HEALTHCARE/
├── Kirsten.html      # Main health plan page (single file, no build)
├── README.md
├── claude.md         # This file — context for future edits
└── .git/
```

## Kirsten.html — Key Sections
| Section | Purpose |
|---------|---------|
| Hero | Title, badges (Patient, Age, Rural, Updated), QR code (top-right) |
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
- **Model:** `claude-sonnet-4-5`
- **System context:** Large `CTX` string in JS with full health data (diagnoses, meds, labs)
- **API key:** User enters in browser; stored client-side only. Show/Hide toggle for pasting.
- **CORS:** Direct browser calls may be blocked on `file://`; host on a web server for production.

### QR Code
- **Implementation:** Custom canvas-based generator (`QRCODE.draw()`) — no CDN
- **Single container:** `#qrcode` in hero
- **URL fallback:** When opened as `file://` or `blob:`, encodes `"Kirsten's Health Plan"` text

### Styling
- **Theme:** Blue gradient (`#1e3a5f`, `#2d6a9f`, `#4a9fd4`)
- **Breakpoint:** 768px for mobile (grids → 1 col, QR moves below badges)
- **CSS classes:** `.ab-info`, `.ab-warn`, `.ab-ok`, `.ab-err` (info boxes); `.n`, `.h`, `.l`, `.ab` (lab badges); `.mc` (med cards); `.lab-table` (tables)

## Data Update Workflow
Health data is embedded in:
1. HTML (diagnoses, meds, labs, tables)
2. `CTX` system prompt in `<script>` (JS)

Keep both in sync when updating labs, meds, or diagnoses.

## Future Improvements (Ideas)
- [ ] Extract health data to JSON for easier updates
- [ ] Optional API key persistence (localStorage)
- [ ] Print-friendly CSS
- [ ] Accessibility pass (ARIA, contrast)
- [ ] Backend proxy for API (avoid CORS)
