# Future Considerations

## API Key Security

**Current state:** Anthropic API key stored in `localStorage` as plain text.
**Risk level:** Low for a local LAN tool, but not truly secure.

### Why it's not secure
- `localStorage` is unencrypted — readable in DevTools (F12 → Application → Local Storage) in seconds
- HTTP (not HTTPS) on LAN means traffic is unencrypted in transit
- Anyone with physical or remote access to the machine can read the key

### Threat model for this setup
| Threat | Risk |
|--------|------|
| Someone at the machine while you're away | Exposed |
| Someone on WiFi intercepting traffic | Exposed (HTTP) |
| Malicious website stealing it | No — localStorage is origin-scoped |
| Malware on the machine | Exposed |

### Do this now (5 min, free protection)
Set a **monthly spending cap** in the Anthropic console → Billing → Usage limits.
Even if the key leaks, damage is capped at $X/month.

### Options when ready to improve

**Option A — Require key entry each session** *(no code change)*
Don't click Save. Key lives in memory only, gone on tab close. More friction, zero exposure.

**Option B — Password-encrypt key in localStorage** *(medium effort)*
Encrypt the key with a short password before storing. User enters password each session to decrypt.
Stops casual DevTools snooping. Still client-side.

**Option C — Backend proxy** *(most secure, recommended if ever hosted)*
Small Node.js/Python server holds the key in a `.env` file server-side.
Browser calls the proxy → proxy calls Anthropic. Key never touches the browser.

```
Browser → http://localhost:3001/ask → server.js (.env API key) → Anthropic API
```

Benefits:
- Key never in browser, DevTools, or network traffic
- Removes need for `anthropic-dangerous-direct-browser-access` header
- Fixes CORS permanently (works on `file://` too)
- Proper production pattern

Files needed: `server.js`, `.env` (gitignored), update fetch URL in `index.html`

---

## Other Future Ideas

- Extract health data to JSON for easier updates without editing raw HTML
- Print-friendly CSS for provider visit summaries
- Accessibility pass (ARIA labels, contrast ratios)
- HTTPS on LAN (self-signed cert via `npx serve --ssl`)
