# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Frontend Code

Before writing ANY frontend code (HTML, CSS, JavaScript) in ANY session, WITHOUT EXCEPTION, you MUST invoke the `frontend-design` skill via the Skill tool. This is mandatory and non-negotiable.

## Commands

```bash
# Generate collage for today
python generate.py

# Generate collage for a specific date
python generate.py 2025-01-15

# Install dependency
pip install Pillow
```

No build step, no test suite, no linter configured.

## Architecture

**Two independent parts that share only the `collages/` directory:**

1. **Generator** (`generate.py`) — pure Python + Pillow. Reads PNGs from `images/`, picks 4–7 at random using the date as a seed, composites them onto a 1080×1080 white canvas with random scale (25–55%), rotation (±15°), and a soft drop shadow. Saves to `collages/YYYY-MM-DD.png`. The date seed makes output deterministic — same date always produces the same collage.

2. **Viewer** (`index.html` + `app.js` + `style.css`) — static page served via GitHub Pages. `app.js` derives the collage URL from the current date (`collages/YYYY-MM-DD.png`), probes whether the file exists, and shows a placeholder if not. Navigation buttons shift the date by ±1 day; "tomorrow" is disabled when `current >= today`.

**Automation** (`.github/workflows/collage.yml`) — runs at 23:49 UTC daily, executes `generate.py`, commits `collages/` if changed. Supports `workflow_dispatch` with an optional `date` input.

**Key constraint:** `images/` holds the source PNGs that feed the generator. Without files there, `generate.py` exits early. `collages/` is git-tracked so GitHub Pages can serve the files statically.

## Frontend Output Defaults

- Separate files: `index.html`, `app.js`, `style.css` — do not merge into one file unless asked.
- Served via GitHub Pages (static). Local preview: `python -m http.server 8000`.
- Mobile-first responsive.
- **No Tailwind.** Use plain CSS only.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`.

## Brand Assets

- Check the `images/` folder before designing — it contains source collage images that reflect the visual style of the project.
- Do not use generic stock placeholders where real project images are available.

## Anti-Generic Guardrails

- **Colors:** Never use generic defaults. Pick a custom brand color and derive the palette from it.
- **Shadows:** Use layered, color-tinted shadows with low opacity — not flat single shadows.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition: all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random arbitrary values.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules

- Do not add sections, features, or content not requested.
- Do not "improve" a reference design — match it.
- Do not use `transition: all`.
- Do not use generic framework default colors as the primary palette.
