# orange-ink — project structure redesign
_2026-05-25_

## Goal

Clean up the repository root. Move development tooling and documentation out of the root while keeping GitHub Pages served from `/`.

---

## Constraints

- GitHub Pages is configured to serve from the repo root on `main`. `index.html`, `style.css`, `app.js`, `favicon.svg`, `collages/`, and `images/` must remain in `/`.
- `generate.py` uses CWD-relative paths (`Path("images")`, `Path("collages")`). When called as `python scripts/generate.py` from the repo root, these paths resolve correctly — no changes needed inside the script.

---

## New structure

```
/
├── index.html              ← GitHub Pages
├── style.css               ← GitHub Pages
├── app.js                  ← GitHub Pages
├── favicon.svg             ← GitHub Pages
├── collages/               ← GitHub Pages (static output)
├── images/                 ← generator input
├── scripts/
│   ├── generate.py         ← moved from /generate.py
│   └── screenshot.mjs      ← moved from /screenshot.mjs
├── docs/
│   ├── TICKETS.md          ← moved from /TICKETS.md
│   └── specs/              ← flattened from docs/superpowers/specs/
│       ├── 2026-05-25-orange-ink-redesign-design.md
│       └── 2026-05-25-project-structure-design.md
├── CLAUDE.md
└── README.md
```

---

## Files to update

| File | Change |
|---|---|
| `.github/workflows/collage.yml` | `python generate.py` → `python scripts/generate.py` |
| `CLAUDE.md` | Update Commands section (`python scripts/generate.py`) and Screenshot Workflow paths (`node scripts/screenshot.mjs`) |

---

## Out of scope

- No changes to `generate.py` internals.
- No changes to `index.html`, `style.css`, `app.js`.
- No changes to GitHub Pages configuration.
