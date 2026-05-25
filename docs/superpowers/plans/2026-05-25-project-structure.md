# Project Structure Reorganisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move dev tooling and docs out of the repo root while keeping GitHub Pages served from `/`.

**Architecture:** All GitHub-Pages-required files (`index.html`, `style.css`, `app.js`, `favicon.svg`, `collages/`, `images/`) stay in root. Everything else is reorganised into `scripts/` and `docs/`. `generate.py` uses CWD-relative paths so it works correctly when called as `python scripts/generate.py` from the repo root.

**Tech Stack:** git mv (preserves history), plain file edits.

---

### Task 1: Create `scripts/` and move tooling

**Files:**
- Move: `generate.py` → `scripts/generate.py`
- Move: `screenshot.mjs` → `scripts/screenshot.mjs`

- [ ] **Step 1: Move files with git**

```bash
git mv generate.py scripts/generate.py
git mv screenshot.mjs scripts/screenshot.mjs
```

- [ ] **Step 2: Verify moves**

```bash
ls scripts/
```

Expected output:
```
generate.py
screenshot.mjs
```

- [ ] **Step 3: Verify generate.py still works from root**

```bash
python scripts/generate.py --help 2>&1 || python scripts/generate.py 2>&1 | head -5
```

Expected: script runs (may print "No PNG images found in images/" if `images/` is empty — that's fine, it means paths resolved correctly).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: move generate.py and screenshot.mjs to scripts/"
```

---

### Task 2: Move `TICKETS.md` to `docs/`

**Files:**
- Move: `TICKETS.md` → `docs/TICKETS.md`

- [ ] **Step 1: Move file**

```bash
git mv TICKETS.md docs/TICKETS.md
```

- [ ] **Step 2: Verify**

```bash
ls docs/
```

Expected: `TICKETS.md` appears, root no longer contains it.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: move TICKETS.md to docs/"
```

---

### Task 3: Flatten `docs/superpowers/` into `docs/`

`docs/specs/` already exists (created when the structure spec was saved). Move the redesign spec and this plan file out of `docs/superpowers/`, then remove the now-empty subtree.

**Files:**
- Move: `docs/superpowers/specs/2026-05-25-orange-ink-redesign-design.md` → `docs/specs/2026-05-25-orange-ink-redesign-design.md`
- Move: `docs/superpowers/plans/2026-05-25-project-structure.md` → `docs/plans/2026-05-25-project-structure.md`
- Delete: `docs/superpowers/` (empty after both moves)

- [ ] **Step 1: Move the redesign spec**

```bash
git mv docs/superpowers/specs/2026-05-25-orange-ink-redesign-design.md docs/specs/2026-05-25-orange-ink-redesign-design.md
```

- [ ] **Step 2: Move this plan file**

```bash
mkdir -p docs/plans
git mv docs/superpowers/plans/2026-05-25-project-structure.md docs/plans/2026-05-25-project-structure.md
```

- [ ] **Step 3: Remove now-empty superpowers/ directory**

```bash
rm -rf docs/superpowers
```

- [ ] **Step 4: Verify**

```bash
ls docs/specs/ && ls docs/plans/
```

Expected:
```
2026-05-25-orange-ink-redesign-design.md
2026-05-25-project-structure-design.md
2026-05-25-project-structure.md
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: flatten docs/superpowers/ into docs/specs/ and docs/plans/"
```

---

### Task 4: Update `.github/workflows/collage.yml`

Change the `python generate.py` call to `python scripts/generate.py`.

**Files:**
- Modify: `.github/workflows/collage.yml` (line ~25: `run: python generate.py ...`)

- [ ] **Step 1: Edit the workflow**

In `.github/workflows/collage.yml`, find:
```yaml
      - name: Generate collage
        run: python generate.py ${{ github.event.inputs.date || '' }}
```

Replace with:
```yaml
      - name: Generate collage
        run: python scripts/generate.py ${{ github.event.inputs.date || '' }}
```

- [ ] **Step 2: Verify the diff**

```bash
git diff .github/workflows/collage.yml
```

Expected: only the one line changes (`generate.py` → `scripts/generate.py`).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/collage.yml
git commit -m "chore: update workflow to call scripts/generate.py"
```

---

### Task 5: Update `CLAUDE.md`

Four references need updating:

1. **Commands section** — `python generate.py` → `python scripts/generate.py`
2. **Architecture section** — mention of `generate.py` → `scripts/generate.py`
3. **Design Spec section** — path `docs/superpowers/specs/…` → `docs/specs/…`
4. **Screenshot Workflow section** — `node screenshot.mjs` → `node scripts/screenshot.mjs`, and the "Create `screenshot.mjs` in the project root" instruction

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update Commands section**

Find:
```markdown
```bash
# Generate collage for today
python generate.py

# Generate collage for a specific date
python generate.py 2025-01-15
```
```

Replace with:
```markdown
```bash
# Generate collage for today
python scripts/generate.py

# Generate collage for a specific date
python scripts/generate.py 2025-01-15
```
```

- [ ] **Step 2: Update Design Spec path**

Find:
```markdown
The approved redesign spec is at [`docs/superpowers/specs/2026-05-25-orange-ink-redesign-design.md`](docs/superpowers/specs/2026-05-25-orange-ink-redesign-design.md).
```

Replace with:
```markdown
The approved redesign spec is at [`docs/specs/2026-05-25-orange-ink-redesign-design.md`](docs/specs/2026-05-25-orange-ink-redesign-design.md).
```

- [ ] **Step 3: Update Architecture section**

Find:
```markdown
1. **Generator** (`generate.py`) —
```

Replace with:
```markdown
1. **Generator** (`scripts/generate.py`) —
```

- [ ] **Step 4: Update Screenshot Workflow section**

Find:
```markdown
Create `screenshot.mjs` in the project root if it doesn't exist:
```

Replace with:
```markdown
Create `scripts/screenshot.mjs` if it doesn't exist:
```

Find (two occurrences):
```
node screenshot.mjs http://localhost:8000
node screenshot.mjs http://localhost:8000 label   # saves as screenshot-N-label.png
```

Replace with:
```
node scripts/screenshot.mjs http://localhost:8000
node scripts/screenshot.mjs http://localhost:8000 label   # saves as screenshot-N-label.png
```

- [ ] **Step 5: Verify no remaining old paths**

```bash
grep -n "generate\.py\|screenshot\.mjs\|superpowers/specs" CLAUDE.md
```

Expected: zero matches (all references now use `scripts/` prefix and `docs/specs/`).

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md paths after restructure"
```

---

### Task 6: Final verification

- [ ] **Step 1: Check root is clean**

```bash
ls -1
```

Expected root contents:
```
CLAUDE.md
README.md
app.js
collages/
docs/
favicon.svg
images/
index.html
scripts/
screenshots/
style.css
```
No `generate.py`, `screenshot.mjs`, or `TICKETS.md` in root.

- [ ] **Step 2: Check git log**

```bash
git log --oneline -6
```

Expected: 5 new commits from this plan on top of the previous history.

- [ ] **Step 3: Smoke-test generate.py**

```bash
python scripts/generate.py 2026-01-01 2>&1
```

Expected: either generates a collage or prints `"No PNG images found in images/"` — both mean the script found and resolved its paths correctly. An `ImportError` or `FileNotFoundError` on `images/` would indicate a problem.
