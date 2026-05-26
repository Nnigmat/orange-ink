# Weekly Collage Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change collage generation from daily to weekly on Mondays — update the CI cron, site navigation (week-by-week), and nav labels.

**Architecture:** Three independent changes: (1) update CI cron to `* * * 1`, (2) update `app.js` to navigate by ±1 week using Monday dates, (3) update `index.html` nav labels. No changes to `generate.py` — the CI runs on Monday so `date.today()` is already Monday.

**Tech Stack:** Python (generate.py), vanilla JS (app.js), GitHub Actions YAML

---

### Task 1: Update CI workflow to weekly on Mondays

**Files:**
- Modify: `.github/workflows/collage.yml:5,9`

- [ ] **Step 1: Change cron from daily to weekly on Monday**

In `.github/workflows/collage.yml`, change line 5:
```yaml
    - cron: '49 23 * * 1'
```
(`* * * 1` = every Monday at 23:49 UTC)

- [ ] **Step 2: Update workflow_dispatch description**

Change line 9:
```yaml
        description: 'Date to generate (YYYY-MM-DD, should be a Monday). Leave empty for today.'
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/collage.yml
git commit -m "feat: run collage generation weekly on Mondays"
```

---

### Task 2: Update app.js — week-based navigation

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace date helpers with week-based versions**

Replace the entire `// ── Date helpers ──` block (lines 33–53) with:

```js
// ── Date helpers ──
function toDateStr(d) {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function thisWeekMondayStr() {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
  return toDateStr(monday);
}

function offsetWeeks(dateStr, weeks) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return toDateStr(new Date(y, m - 1, d + weeks * 7));
}

function formatWeekRange(mondayStr) {
  const [y, m, d] = mondayStr.split('-').map(Number);
  const mon = new Date(y, m - 1, d);
  const sun = new Date(y, m - 1, d + 6);
  const pad = n => String(n).padStart(2, '0');
  const monPart = `${pad(mon.getDate())}.${pad(mon.getMonth() + 1)}`;
  const sunPart = `${pad(sun.getDate())}.${pad(sun.getMonth() + 1)}`;
  const year = sun.getFullYear();
  return `${monPart} – ${sunPart} · ${year}`;
}
```

- [ ] **Step 2: Change initial `current` to this week's Monday**

Replace line 56:
```js
let current = thisWeekMondayStr();
```

- [ ] **Step 3: Update "next" disabled check and date display inside `showCollage`**

Replace lines 60–61 in `showCollage`:
```js
  navDate.textContent = formatWeekRange(dateStr);
  btnNext.disabled = dateStr >= thisWeekMondayStr();
```

- [ ] **Step 4: Update nav button event listeners to step by ±1 week**

Replace lines 83–84:
```js
btnPrev.addEventListener('click', () => showCollage(offsetWeeks(current, -1)));
btnNext.addEventListener('click', () => showCollage(offsetWeeks(current, 1)));
```

- [ ] **Step 5: Verify in browser**

Start server (if not already running):
```bash
python -m http.server 8000
```

Open `http://localhost:8000` and confirm:
- Page loads showing this week's Monday date (e.g. `26 · 05 · 2026`)
- "Next" button is disabled
- "Previous" button click changes the date back exactly 7 days

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: navigate collages by week using Monday dates"
```

---

### Task 3: Update nav labels in index.html

**Files:**
- Modify: `index.html:65,71,74,75`

- [ ] **Step 1: Update prev button**

Change `aria-label` on the prev button (line 65):
```html
      <button class="arrow-btn" id="btn-prev" aria-label="прошлая неделя">
```

Change the label span text (line 71):
```html
        <span class="arrow-label" data-i18n="nav.prev">← неделя</span>
```

- [ ] **Step 2: Update next button**

Change `aria-label` on the next button (line 74):
```html
      <button class="arrow-btn" id="btn-next" aria-label="следующая неделя">
```

Change the label span text (line 75):
```html
        <span class="arrow-label" data-i18n="nav.next">неделя →</span>
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: update nav labels for weekly navigation"
```
