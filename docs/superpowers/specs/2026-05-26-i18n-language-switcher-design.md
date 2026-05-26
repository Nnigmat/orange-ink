# i18n Language Switcher — Design Spec
**Date:** 2026-05-26

## Overview

Add Russian / English / German language support to the static site with a segmented text switcher placed in the header next to the existing theme toggle.

---

## Header Layout

The theme toggle is currently `position: absolute; right: 1.25rem; top: 50%`. Both controls are wrapped into a new `<div class="header-controls">` that takes over that absolute positioning. Inside: a flex row with `gap: 0.75rem` — lang switcher first, theme toggle second. The theme toggle loses its own absolute positioning and becomes a normal flex child inside `.header-controls`.

```html
<div class="header-controls">
  <div class="lang-switcher" id="lang-switcher">
    <button class="lang-btn active" data-lang="ru">RU</button>
    <span class="lang-sep">·</span>
    <button class="lang-btn" data-lang="en">EN</button>
    <span class="lang-sep">·</span>
    <button class="lang-btn" data-lang="de">DE</button>
  </div>
  <button class="theme-toggle" id="theme-toggle" aria-label="...">...</button>
</div>
```

---

## Language Switcher Visual Design

- Font: Pangolin, `0.85rem`, `letter-spacing: 0.05em`
- Active language: `var(--accent)` (#E8631A)
- Inactive languages: `var(--text-muted)`
- Hover (inactive): `var(--text)`
- Separators `·`: `var(--text-muted)`, not interactive
- No borders, backgrounds, pill containers — plain text only
- Transition: `color 0.15s ease` on `.lang-btn`

---

## CSS Classes

| Class | Purpose |
|---|---|
| `.header-controls` | Absolute-positioned flex group, replaces theme-toggle absolute positioning |
| `.lang-switcher` | Flex row containing lang buttons and separators |
| `.lang-btn` | Individual language button (RU / EN / DE) |
| `.lang-btn.active` | Active language — orange accent color |
| `.lang-sep` | Non-interactive `·` separator |

`.header-controls` CSS:
```css
position: absolute;
top: 50%;
right: 1.25rem;
transform: translateY(-50%);
display: flex;
align-items: center;
gap: 0.75rem;
```

---

## Translation Scope

The site title `оранжевые кляксы` is a brand name — stays in Russian in all languages.

All other visible text uses `data-i18n="key"` attributes and is swapped by JS on language change.

### Translation Table

| Key | RU | EN | DE |
|---|---|---|---|
| `nav.prev` | вчера | yesterday | gestern |
| `nav.next` | завтра | tomorrow | morgen |
| `collage.alt` | коллаж дня | collage of the day | Collage des Tages |
| `collage.empty` | коллажа нет | no collage | keine Collage |
| `looper.title` | лупер | looper | Looper |
| `looper.noRec` | нет записи | no recording | keine Aufnahme |
| `looper.bars` | такты | bars | Takte |
| `about.title` | о проекте | about | über |
| `about.text` | ежедневные коллажи из фотографий. каждую ночь — новый. собирается само. | daily collages from photos. every night — a new one. self-assembled. | tägliche Collagen aus Fotos. jede Nacht — eine neue. wird selbst zusammengestellt. |
| `social.email` | почта | email | E-Mail |
| `aria.prev` | вчера | yesterday | gestern |
| `aria.next` | завтра | tomorrow | morgen |
| `aria.trackRecord` | запись дорожки | record track | Spur aufnehmen |
| `aria.trackMute` | заглушить дорожку | mute track | Spur stummschalten |
| `aria.play` | воспроизведение | play | Abspielen |
| `aria.stop` | стоп | stop | Stopp |
| `aria.clear` | очистить | clear | Löschen |

`aria-label` attributes on nav buttons and transport buttons use the `aria.*` keys directly. Track buttons use `aria.trackRecord` / `aria.trackMute` with the track number appended (e.g. `"record track 1"`).

---

## JS Architecture

All i18n logic lives in `app.js` alongside the existing theme and collage logic.

### Data structure

```js
const TRANSLATIONS = {
  ru: { 'nav.prev': 'вчера', 'nav.next': 'завтра', ... },
  en: { 'nav.prev': 'yesterday', 'nav.next': 'tomorrow', ... },
  de: { 'nav.prev': 'gestern',   'nav.next': 'morgen',   ... },
};
```

### `applyLang(lang)`

1. Sets `document.documentElement.lang = lang`
2. Iterates `document.querySelectorAll('[data-i18n]')` → sets `textContent` from `TRANSLATIONS[lang][key]`
3. Updates aria-labels on nav/track/transport buttons
4. Marks the matching `.lang-btn` as `.active`, removes from others
5. Saves `lang` to `localStorage`

### Initialisation

```js
const savedLang = localStorage.getItem('lang') || 'ru';
applyLang(savedLang);
```

Called after DOM is ready (at bottom of `app.js`, after existing init calls).

### Event binding

```js
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});
```

---

## Files Changed

| File | Change |
|---|---|
| `index.html` | Wrap theme toggle in `.header-controls`; add `.lang-switcher` with three buttons; add `data-i18n` attributes to all translatable text nodes |
| `style.css` | Add `.header-controls`, `.lang-switcher`, `.lang-btn`, `.lang-sep` styles; remove absolute positioning from `.theme-toggle` (now inherits from parent) |
| `app.js` | Add `TRANSLATIONS` object, `applyLang()` function, lang button event listeners, localStorage restore on load |

---

## Constraints

- No build step, no external i18n library — plain JS object
- Static site (GitHub Pages), no server-side rendering
- Pangolin font used for lang buttons to match site aesthetic
- `transition: all` is forbidden — use specific property transitions only
