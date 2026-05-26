const TRANSLATIONS = {
  ru: {
    'nav.prev':      '← неделя',
    'nav.next':      'неделя →',
    'collage.alt':   'коллаж дня',
    'collage.empty': 'коллажа нет',
    'looper.title':  'лупер',
    'looper.noRec':  'нет записи',
    'looper.bars':   'такты',
    'about.title':   'о проекте',
    'about.text':    'ежедневные коллажи из фотографий. каждую ночь — новый. собирается само.',
    'site.title':    'оранжевые кляксы',
    'social.email':  'почта',
    'aria.prev':         'прошлая неделя',
    'aria.next':         'следующая неделя',
    'aria.trackRecord':  'запись дорожки',
    'aria.trackMute':    'заглушить дорожку',
    'aria.play':         'воспроизведение',
    'aria.stop':         'стоп',
    'aria.clear':        'очистить',
  },
  en: {
    'nav.prev':      '← week',
    'nav.next':      'week →',
    'collage.alt':   'collage of the day',
    'collage.empty': 'no collage',
    'looper.title':  'looper',
    'looper.noRec':  'no recording',
    'looper.bars':   'bars',
    'about.title':   'about',
    'about.text':    'daily collages from photos. every night — a new one. self-assembled.',
    'site.title':    'orange blots',
    'social.email':  'email',
    'aria.prev':         'previous week',
    'aria.next':         'next week',
    'aria.trackRecord':  'record track',
    'aria.trackMute':    'mute track',
    'aria.play':         'play',
    'aria.stop':         'stop',
    'aria.clear':        'clear',
  },
  de: {
    'nav.prev':      '← Woche',
    'nav.next':      'Woche →',
    'collage.alt':   'Collage des Tages',
    'collage.empty': 'keine Collage',
    'looper.title':  'Looper',
    'looper.noRec':  'keine Aufnahme',
    'looper.bars':   'Takte',
    'about.title':   'über',
    'about.text':    'tägliche Collagen aus Fotos. jede Nacht — eine neue. wird selbst zusammengestellt.',
    'site.title':    'orange Kleckse',
    'social.email':  'E-Mail',
    'aria.prev':         'letzte Woche',
    'aria.next':         'nächste Woche',
    'aria.trackRecord':  'Spur aufnehmen',
    'aria.trackMute':    'Spur stummschalten',
    'aria.play':         'Abspielen',
    'aria.stop':         'Stopp',
    'aria.clear':        'Löschen',
  },
};

function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;
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
  if (transportBtns.length >= 3) {
    transportBtns[0].setAttribute('aria-label', t['aria.play']);
    transportBtns[1].setAttribute('aria-label', t['aria.stop']);
    transportBtns[2].setAttribute('aria-label', t['aria.clear']);
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('lang', lang);
}

const collageImg = document.getElementById('collage');
const stickers   = document.getElementById('stickers');
const navDate    = document.getElementById('nav-date');
const btnPrev    = document.getElementById('btn-prev');
const btnNext    = document.getElementById('btn-next');
const themeToggle = document.getElementById('theme-toggle');

// ── Theme ──
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) applyTheme(savedTheme);

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

const savedLang = localStorage.getItem('lang') || 'ru';
applyLang(savedLang);

// ── Looper UI ──
document.querySelectorAll('.loop-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.loop-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.querySelectorAll('.mute-btn').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('muted'));
});

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

// ── Collage ──
let current = thisWeekMondayStr();

function showCollage(dateStr) {
  current = dateStr;
  navDate.textContent = formatWeekRange(dateStr);
  btnNext.disabled = dateStr >= thisWeekMondayStr();

  collageImg.style.display = 'none';
  stickers.style.display = 'none';

  const src   = `collages/${dateStr}.png`;
  const probe = new Image();

  probe.onload = () => {
    collageImg.src = src;
    collageImg.style.display = 'block';
    stickers.style.display = 'none';
  };

  probe.onerror = () => {
    collageImg.style.display = 'none';
    stickers.style.display = 'block';
  };

  probe.src = src;
}

btnPrev.addEventListener('click', () => showCollage(offsetWeeks(current, -1)));
btnNext.addEventListener('click', () => showCollage(offsetWeeks(current, 1)));

showCollage(current);
