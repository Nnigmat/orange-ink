# orange-ink redesign — design spec
_2026-05-25_

## Overview

Full redesign of the daily-collage viewer at `index.html` / `style.css` / `app.js`.  
Stack: static HTML + plain CSS + vanilla JS, served via GitHub Pages. No framework, no build step.

**Visual reference:** [`.brainstorm/fullpage-black-dots.html`](../../.brainstorm/fullpage-black-dots.html) — финальный мокап, согласованный с автором. Содержит точные SVG-пути стикеров, позиции, размеры и стрелки. При реализации сверяться с ним напрямую.

---

## Visual language

| Token | Value |
|---|---|
| Accent | `#E8631A` |
| Background light | `#ffffff` |
| Background dark | `#141414` |
| Dot pattern light | `rgba(0,0,0,0.16)` |
| Dot pattern dark | `rgba(232,99,26,0.22)` |
| Panel light | `rgba(255,255,255,0.6)` |
| Panel dark | `rgba(0,0,0,0.55)` |
| Divider | `rgba(232,99,26,0.28)` |
| Heading font | Caveat 700 (Google Fonts) |
| Body font | Space Grotesk 400/500 (Google Fonts) |

**Dot background** — applied to the entire `<html>` element via pure CSS:
```css
background-image: radial-gradient(circle at 1px 1px, var(--dot-color) 1.5px, transparent 0);
background-size: 24px 24px;
```

**Panels** — every section sits on a `rgba(white, 0.6)` / `rgba(black, 0.55)` frosted layer so the dots bleed through subtly.

**Dividers** — `1.5px solid rgba(232,99,26,0.28)` `<hr>` between every section.

**Shadows** — `filter: drop-shadow(2px 4px 0px rgba(232,99,26,0.22))` on SVG stickers.

---

## Layout — single column, mobile-first

```
┌──────────────────────┐
│  HEADER              │  panel, centered title + theme toggle
├──────────────────────┤  divider
│  COLLAGE STAGE       │  stickers or real PNG
├──────────────────────┤  divider
│  NAV                 │  ← вчера · date · завтра →
├──────────────────────┤  divider
│  LOOPER              │  4 tracks + transport
├──────────────────────┤  divider
│  ABOUT / FOOTER      │  bio + social links
└──────────────────────┘
```

Max-width `640px`, centered. Below 640px: full-bleed.

---

## Sections

### Header
- "оранжевые кляксы" in Caveat, `clamp(2.4rem, 8vw, 3.6rem)`, centered, orange.
- **Theme toggle** — top-right corner. Hand-drawn sun SVG (light mode) / moon SVG (dark mode). Switches `data-theme` on `<html>`.
- No date, no tagline in header.

### Collage stage
- **When collage PNG exists:** display the image centered, `max-height: 70vh`, object-fit contain, no border/frame.
- **When no PNG for the date:** show 9 SVG sticker shapes (blob-face, cat, star, lightning, speech bubble, circle-X, hand, heart, eye). Each sticker is `position: absolute`, rotated ±10°, overlapping slightly. All orange fill + white stroke. Stage has `position: relative; overflow: hidden`.
- Stickers are decorative — they disappear once a real collage loads.

### Nav
- Three-column flex: `[← вчера]  [25 · 05 · 2026]  [завтра →]`
- Arrows: hand-drawn SVG paths (wobbly single-stroke, no arrowhead filled shape).
- Labels "вчера" / "завтра": Caveat font, `1.4rem`, orange, inline with arrow (row, not column).
- "завтра" button is `disabled` + `opacity: 0.35` when current date ≥ today.
- Date in center: Caveat, `1.2rem`, muted orange.

### Looper (future feature — build shell now)
- Title "лупер" in Caveat.
- 4 identical track rows: `[record btn] [waveform area] [mute btn]`
  - **Record button:** hand-drawn wobbly circle SVG. Orange fill when active.
  - **Waveform area:** `<canvas>` or SVG placeholder. Filled with bar waveform when audio exists; dashed centerline + Caveat hint text when empty.
  - **Mute button:** outlined rectangle, Caveat font. Filled orange when muted.
- Transport bar below tracks: play / stop / clear buttons (hand-drawn circle + icon SVG) + BPM input + loop-length selector (1 / 2 / 4 / 8 bars).
- Audio logic is **out of scope for this implementation**. Build the full UI shell; wire up interactivity later.

### About / Footer
- Title "о проекте" in Caveat.
- 2–3 lines of bio text, Space Grotesk, small, muted.
- Social links in a flex row: each link = hand-drawn icon SVG + Caveat label. Links: Instagram, Telegram, Spotify, Bandcamp, email. Actual URLs filled in by user.
- No download button. No address/map.

---

## Theme switching

CSS custom properties on `:root` and `[data-theme="dark"]`. JS toggles `document.documentElement.dataset.theme`. Preference persisted in `localStorage`.

Light mode defaults; dark mode swaps bg, dot color, panel color.  
Orange accent `#E8631A` stays the same in both modes.

---

## Interactivity & JS (existing logic to preserve)

`app.js` currently handles:
- Deriving collage URL from current date (`collages/YYYY-MM-DD.png`)
- Probing whether file exists (HEAD request)
- Date navigation (±1 day)
- Disabling "завтра" when at today

Preserve all of this. Rename nav buttons to match new markup. Add theme toggle handler. Looper audio logic deferred.

---

## Files to change

| File | Action |
|---|---|
| `index.html` | Full rewrite |
| `style.css` | Full rewrite |
| `app.js` | Update selectors; add theme toggle + localStorage |

---

## Out of scope

- Looper audio engine
- Archive / calendar view
- User accounts / login
- Any backend
