# NewsAtlas — Improvement Ideas

Prioritized, actionable ways to improve the site. Pick what fits your goals.

---

## Implemented (site optimization pass)

- **Error toasts** — Config, Firebase, OpenAQ, USGS, OpenSky, ISS, country data, news, GDELT failures now show a short toast so users know when a feature is unavailable.
- **API retry** — `js/core/fetch-helper.js` provides `window.fetchWithRetry(url, options, { retries, timeoutMs })`. Used for news and stock ticker.
- **Lazy-load 3D** — Three.js and globe.gl are no longer in the initial HTML; they load on demand when the user switches to 3D projection (faster first load).
- **prefers-reduced-motion** — Boot sequence is shorter when the user prefers reduced motion; particle network and matrix rain are disabled; CSS reduces animation/transition duration.
- **Tab visibility** — Particle network and matrix rain pause when the tab is hidden (visibilitychange) to save CPU/battery.
- **Accessibility** — `:focus-visible` styles, `role="tablist"` / `role="tab"` with `aria-selected` and `aria-controls` on main tabs; map container has `aria-label`; projection button has `aria-label`.
- **Mobile** — Main nav tabs and tactical buttons get min 44px touch targets on viewports &lt;1024px.
- **Tactical sounds** — Restored (override in app.js removed so `audio.js` procedural sounds are used).

---

## Quick wins (remaining)

### 1. Re-enable tactical sounds
**Status:** Done (see Implemented above).

### 2. Production Tailwind
Tailwind is loaded from the CDN (banner: *"cdn.tailwindcss.com should not be used in production"*). For production (e.g. Vercel):
- Install Tailwind and build a static CSS bundle, or
- Keep the CDN and accept the warning if you prefer simplicity.

### 3. Error feedback for users
Several failures only `console.warn` / `console.error` (e.g. config, Firebase, OpenAQ, USGS, OpenSky). Consider:
- Showing a small toast or inline message when a non-critical feature fails (e.g. “Air quality data unavailable”).
- Keeping critical paths (e.g. news, map load) with visible retry/error states (you already have some).

### 4. `prefers-reduced-motion`
Respect user preference for less motion:
- In CSS: `@media (prefers-reduced-motion: reduce) { ... }` to tone down or disable animations (particle network, matrix rain, boot sequence).
- Optionally gate heavy canvas/animations in JS when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

---

## Performance

### 5. Lazy-load heavy scripts
- Load **globe.gl** and **Three.js** only when the user switches to 3D (or after first paint). Saves initial parse/compile and speeds up first contentful paint.
- Optionally lazy-load **D3** only when the map container is in view or when the user opens the map tab.

### 6. Split `app.js`
`app.js` is large (~2k lines) and mixes boot, map, AI, toggles, and state. Splitting into e.g. `app-boot.js`, `app-map.js`, `app-ai.js` (or feature modules that `app.js` imports) will improve maintainability and allow better caching.

### 7. Reduce work on idle
- Throttle or pause particle network / matrix rain when the tab is hidden (`visibilitychange`).
- Ease or pause globe rotation / heavy overlays when the terminal tab is not visible.

---

## UX and polish

### 8. Loading and empty states
- Skeleton loaders or clear “Loading…” for: AI briefing, economics panel, geography drill-down, markets.
- Empty states when there are no articles or no GDELT events (e.g. “No events for this region” with a short explanation).


### 10. Mobile and small screens
- Review `terminal.html` and panels on narrow viewports: collapsible side panels, stacked tabs, or a bottom nav for main sections.
- Ensure touch targets are at least ~44px and that the map zoom/pan works well with touch.
- Consider a “simplified” or “focus” mode that hides particle effects and optional overlays on low-end or mobile devices.

---

## Accessibility

### 11. Focus and semantics
- Ensure all interactive elements (tabs, buttons, search, map controls) are focusable and have visible focus styles.
- Use `aria-expanded` / `aria-controls` for expandable sections and `aria-current` for the active tab.
- Give the map a short `aria-label` describing it (e.g. “World map with country selection and overlays”).

### 12. Color and contrast
- Check contrast of slate/blue text on dark background (especially `text-slate-400`, `text-slate-500`) against WCAG AA.
- Don’t rely on color alone for status (e.g. up/down for markets); keep icons or text (e.g. ▲/▼) as you already do.

---

## Reliability and security

### 13. API resilience
- Retry with backoff for `/api/news`, `/api/weather`, `/api/markets` (e.g. 1 retry after 2s) so transient failures don’t leave panels empty.
- Optional request timeouts (e.g. 10s) so slow endpoints don’t hang the UI.

### 14. Env and keys
- Keep `GROQ_API_KEY` and Firebase secrets only on the server; never expose them in client bundles or `/api/config` beyond what’s needed for the client (e.g. Firebase client config only).

---

## Features (optional)

### 15. Offline / PWA
- Service worker to cache static assets and optionally cache last successful API responses for the terminal so the shell and last data show when offline.
- Web app manifest and “Add to Home Screen” for mobile.

### 16. Share / bookmark state
- Encode selected country (and maybe tab) in the URL (e.g. `?country=India` or hash). Allows sharing a “deep link” to a specific view and refreshes to restore state.

### 17. AI briefing and chat
- Add a “Copy” button for the briefing (you have `copyBriefingToClipboard`; ensure it’s visible and works on mobile).
- Optional “Regenerate” with a different focus (e.g. economy-only, security-only) via a small prompt selector.

---

## Summary

| Area           | Priority  | Effort  |
|----------------|-----------|---------|
| Re-enable sounds | Done     | —       |
| Error toasts   | High      | Low     |
| Reduced motion | High      | Low     |
| Lazy-load 3D   | High      | Medium  |
| Split app.js   | Medium    | Medium  |
| Mobile layout  | Medium    | High    |
| A11y (focus, aria) | Medium | Low–Med |
| PWA / share URL | Low      | Medium  |

Start with quick wins (sounds, error toasts, reduced motion), then performance (lazy 3D, split `app.js`), then UX and a11y. If you tell me which item you want next, I can outline or implement it step by step.
