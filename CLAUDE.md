# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
