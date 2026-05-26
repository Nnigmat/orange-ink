# i18n Language Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add RU / EN / DE language switching with a segmented text toggle in the header, next to the theme toggle.

**Architecture:** Three files change — `index.html` gets the new header structure and `data-i18n` attributes; `style.css` gets `.header-controls` (replaces theme-toggle absolute positioning) and lang-switcher styles; `app.js` gets a `TRANSLATIONS` object, an `applyLang()` function, and localStorage persistence. No build step, no external library.

**Tech Stack:** Vanilla JS, plain CSS, static HTML. No test runner — verification is manual browser + screenshot.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Wrap theme toggle in `.header-controls` div; add `.lang-switcher` with 3 buttons; add `data-i18n` / `data-i18n-alt` attributes on all translatable nodes |
| `style.css` | Add `.header-controls` (takes over absolute positioning from `.theme-toggle`); strip absolute positioning from `.theme-toggle`; fix `.theme-toggle:hover` transform; add `.lang-switcher`, `.lang-btn`, `.lang-sep` styles |
| `app.js` | Add `TRANSLATIONS` constant; add `applyLang(lang)` function; add lang-btn click listeners; call `applyLang(savedLang)` on load |

---

## Task 1: HTML — header restructure + data-i18n attributes

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `<header>` block**

Replace the entire `<header>` element (lines 15–35) with:

```html
    <!-- HEADER -->
    <header class="section header-section">
      <div class="header-controls">
        <div class="lang-switcher" id="lang-switcher">
          <button class="lang-btn active" data-lang="ru">RU</button>
          <span class="lang-sep">·</span>
          <button class="lang-btn" data-lang="en">EN</button>
          <span class="lang-sep">·</span>
          <button class="lang-btn" data-lang="de">DE</button>
        </div>
        <button class="theme-toggle" id="theme-toggle" aria-label="переключить тему">
          <!-- Sun (light mode) -->
          <svg class="icon-sun" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="5.5" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M14 3.5V5.5" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M14 22.5V24.5" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M3.5 14H5.5" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M22.5 14H24.5" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M7.05 7.05L8.46 8.46" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M19.54 19.54L20.95 20.95" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M20.95 7.05L19.54 8.46" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M8.46 19.54L7.05 20.95" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          <!-- Moon (dark mode) -->
          <svg class="icon-moon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 15.5C20.5 19.5 16.5 22.5 12 22C7 21.5 3.5 17.5 4 12.5C4.5 8.5 7 5.5 11 4.5C9 7.5 9 12 12.5 15C16 18 20.5 17.5 22 15.5Z" stroke="#E8631A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <h1 class="site-title">оранжевые кляксы</h1>
    </header>
```

- [ ] **Step 2: Add data-i18n to the collage img alt**

Find (line ~43):
```html
        <img id="collage" alt="коллаж дня" style="display:none">
```
Replace with:
```html
        <img id="collage" alt="коллаж дня" data-i18n-alt="collage.alt" style="display:none">
```

- [ ] **Step 3: Add data-i18n to the empty-state text**

Find (line ~47):
```html
          <span class="no-collage-text">коллажа нет</span>
```
Replace with:
```html
          <span class="no-collage-text" data-i18n="collage.empty">коллажа нет</span>
```

- [ ] **Step 4: Add data-i18n to nav arrow labels**

Find the prev button arrow label:
```html
        <span class="arrow-label">вчера</span>
```
Replace with:
```html
        <span class="arrow-label" data-i18n="nav.prev">вчера</span>
```

Find the next button arrow label:
```html
        <span class="arrow-label">завтра</span>
```
Replace with:
```html
        <span class="arrow-label" data-i18n="nav.next">завтра</span>
```

- [ ] **Step 5: Add data-i18n to looper section**

Find the looper heading:
```html
      <h2 class="section-title">лупер</h2>
```
Replace with:
```html
      <h2 class="section-title" data-i18n="looper.title">лупер</h2>
```

Find all four waveform hints (appears 4 times):
```html
            <span class="waveform-hint">нет записи</span>
```
Replace all four occurrences with:
```html
            <span class="waveform-hint" data-i18n="looper.noRec">нет записи</span>
```

Find the bars label:
```html
            <span class="transport-label-text">такты</span>
```
Replace with:
```html
            <span class="transport-label-text" data-i18n="looper.bars">такты</span>
```

- [ ] **Step 6: Add data-i18n to about/footer section**

Find:
```html
      <h2 class="section-title">о проекте</h2>
      <p class="about-text">ежедневные коллажи из фотографий. каждую ночь — новый. собирается само.</p>
```
Replace with:
```html
      <h2 class="section-title" data-i18n="about.title">о проекте</h2>
      <p class="about-text" data-i18n="about.text">ежедневные коллажи из фотографий. каждую ночь — новый. собирается само.</p>
```

Find the email social label:
```html
          <span class="social-label">почта</span>
```
Replace with:
```html
          <span class="social-label" data-i18n="social.email">почта</span>
```

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: add data-i18n attributes and lang-switcher markup"
```

---

## Task 2: CSS — header-controls group + lang-switcher styles

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Replace `.theme-toggle` block to remove its absolute positioning**

Find and replace the entire `.theme-toggle` rule (and its hover/focus variants):

```css
/* old — remove these three rules: */
.theme-toggle {
  position: absolute;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  ...
}
.theme-toggle:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.12);
}
.theme-toggle:focus-visible { ... }
```

Replace with:

```css
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
  transition: opacity 0.15s ease, transform 0.2s cubic-bezier(.34,1.56,.64,1);
}

.theme-toggle:hover {
  opacity: 1;
  transform: scale(1.12);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}
```

- [ ] **Step 2: Add `.header-controls` and lang-switcher styles**

Insert the following block immediately after the `.theme-toggle:focus-visible` rule:

```css
.header-controls {
  position: absolute;
  top: 50%;
  right: 1.25rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.lang-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Pangolin', cursive;
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 0.2rem 0.15rem;
  line-height: 1;
  letter-spacing: 0.05em;
  transition: color 0.15s ease;
}

.lang-btn:hover {
  color: var(--text);
}

.lang-btn.active {
  color: var(--accent);
}

.lang-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

.lang-sep {
  color: var(--text-muted);
  font-size: 0.7rem;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}
```

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add header-controls group and lang-switcher styles"
```

---

## Task 3: JS — TRANSLATIONS, applyLang(), init

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add the TRANSLATIONS constant**

Insert at the top of `app.js`, before the existing `const collageImg = ...` line:

```js
const TRANSLATIONS = {
  ru: {
    'nav.prev':      'вчера',
    'nav.next':      'завтра',
    'collage.alt':   'коллаж дня',
    'collage.empty': 'коллажа нет',
    'looper.title':  'лупер',
    'looper.noRec':  'нет записи',
    'looper.bars':   'такты',
    'about.title':   'о проекте',
    'about.text':    'ежедневные коллажи из фотографий. каждую ночь — новый. собирается само.',
    'social.email':  'почта',
    'aria.prev':         'вчера',
    'aria.next':         'завтра',
    'aria.trackRecord':  'запись дорожки',
    'aria.trackMute':    'заглушить дорожку',
    'aria.play':         'воспроизведение',
    'aria.stop':         'стоп',
    'aria.clear':        'очистить',
  },
  en: {
    'nav.prev':      'yesterday',
    'nav.next':      'tomorrow',
    'collage.alt':   'collage of the day',
    'collage.empty': 'no collage',
    'looper.title':  'looper',
    'looper.noRec':  'no recording',
    'looper.bars':   'bars',
    'about.title':   'about',
    'about.text':    'daily collages from photos. every night — a new one. self-assembled.',
    'social.email':  'email',
    'aria.prev':         'yesterday',
    'aria.next':         'tomorrow',
    'aria.trackRecord':  'record track',
    'aria.trackMute':    'mute track',
    'aria.play':         'play',
    'aria.stop':         'stop',
    'aria.clear':        'clear',
  },
  de: {
    'nav.prev':      'gestern',
    'nav.next':      'morgen',
    'collage.alt':   'Collage des Tages',
    'collage.empty': 'keine Collage',
    'looper.title':  'Looper',
    'looper.noRec':  'keine Aufnahme',
    'looper.bars':   'Takte',
    'about.title':   'über',
    'about.text':    'tägliche Collagen aus Fotos. jede Nacht — eine neue. wird selbst zusammengestellt.',
    'social.email':  'E-Mail',
    'aria.prev':         'gestern',
    'aria.next':         'morgen',
    'aria.trackRecord':  'Spur aufnehmen',
    'aria.trackMute':    'Spur stummschalten',
    'aria.play':         'Abspielen',
    'aria.stop':         'Stopp',
    'aria.clear':        'Löschen',
  },
};
```

- [ ] **Step 2: Add applyLang() function**

Insert after the `TRANSLATIONS` constant and before the existing `const collageImg = ...` line:

```js
function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t[el.dataset.i18n];
  });

  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    el.alt = t[el.dataset.i18nAlt];
  });

  btnPrev.setAttribute('aria-label', t['aria.prev']);
  btnNext.setAttribute('aria-label', t['aria.next']);

  document.querySelectorAll('.record-btn').forEach((btn, i) => {
    btn.setAttribute('aria-label', `${t['aria.trackRecord']} ${i + 1}`);
  });
  document.querySelectorAll('.mute-btn').forEach((btn, i) => {
    btn.setAttribute('aria-label', `${t['aria.trackMute']} ${i + 1}`);
  });

  const transportBtns = document.querySelectorAll('.transport-btn');
  transportBtns[0].setAttribute('aria-label', t['aria.play']);
  transportBtns[1].setAttribute('aria-label', t['aria.stop']);
  transportBtns[2].setAttribute('aria-label', t['aria.clear']);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('lang', lang);
}
```

Note: `applyLang` references `btnPrev` and `btnNext`, which are declared later in `app.js`. This is fine because `applyLang` is only *called* after those constants are initialised — never hoisted or called at parse time.

- [ ] **Step 3: Add lang button event listeners and init call**

Find the existing theme init block at the bottom of `app.js`:
```js
const savedTheme = localStorage.getItem('theme');
if (savedTheme) applyTheme(savedTheme);
```

Insert the lang init immediately after it:
```js
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

const savedLang = localStorage.getItem('lang') || 'ru';
applyLang(savedLang);
```

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: add TRANSLATIONS, applyLang(), and lang persistence"
```

---

## Task 4: Verify in browser

**Files:** none changed

- [ ] **Step 1: Start local server (if not already running)**

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in a browser.

- [ ] **Step 2: Verify default state (RU)**

- `RU` label is orange, `EN` and `DE` are muted
- Nav shows "вчера" / "завтра"
- About section shows "о проекте" and Russian body text
- Theme toggle still works

- [ ] **Step 3: Switch to EN**

Click `EN`. Verify:
- `EN` label turns orange, others muted
- Nav shows "yesterday" / "tomorrow"
- About shows "about" and English body text
- Looper title shows "looper", track hints show "no recording"

- [ ] **Step 4: Switch to DE**

Click `DE`. Verify:
- `DE` label turns orange
- Nav shows "gestern" / "morgen"
- About shows "über" and German body text
- Looper title shows "Looper", track hints show "keine Aufnahme"

- [ ] **Step 5: Verify persistence**

With DE active, reload the page. Verify DE is still active (orange) and all text is German.

- [ ] **Step 6: Take screenshots**

```bash
node scripts/screenshot.mjs http://localhost:8000 lang-ru
```

Switch to EN, take another screenshot:
```bash
node scripts/screenshot.mjs http://localhost:8000 lang-en
```

Read both screenshots with the Read tool to confirm visuals.

- [ ] **Step 7: Final commit**

```bash
git add -p   # stage any last fixes if needed
git commit -m "feat: i18n RU/EN/DE language switcher"
```
