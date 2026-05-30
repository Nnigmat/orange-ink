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
    'about.text':    '<b>Привет! Я nikita nigma, и это «Оранжевые кляксы» — мой личный эксперимент на стыке арта и музыки.</b><br><br>У меня есть 74 свои картинки. Раз в неделю алгоритм перемешивает их и собирает в случайный коллаж. Для меня это вызов: я сам смотрю на то, что получилось, ловлю вайб и пишу под этот визуал новый трек.<br><br>Каждую неделю здесь будет появляться свежий коллаж и моя музыкальная история к нему. Без спешки и суеты — чистый поток творчества.<br><br>Заглядывай, слушай, смотри и пиши в комменты, как этот хаос линий звучит для тебя. А если сам пишешь музыку или стихи — подхватывай волну и делись своим звуком!',
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
    'about.text':    '<b>Hey! I\'m nikita nigma, and this is «Orange Blots» — my personal experiment at the intersection of art and music.</b><br><br>I have 74 original drawings. Once a week the algorithm shuffles them and assembles a random collage. For me it\'s a challenge: I look at what came out, catch the vibe, and write a new track to that visual.<br><br>Every week a fresh collage and my musical story to it will appear here. No rush, no fuss — pure creative flow.<br><br>Drop by, listen, look, and leave a comment about how this chaos of lines sounds to you. And if you write music or poetry yourself — catch the wave and share your sound!',
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
    'about.text':    '<b>Hey! Ich bin nikita nigma, und das sind «Orange Kleckse» — mein persönliches Experiment an der Schnittstelle von Kunst und Musik.</b><br><br>Ich habe 74 eigene Bilder. Einmal pro Woche durchmischt der Algorithmus sie und baut eine zufällige Collage. Für mich ist das eine Herausforderung: Ich schaue selbst auf das, was entstanden ist, fange den Vibe ein und schreibe einen neuen Track zu diesem Visual.<br><br>Jede Woche erscheint hier eine frische Collage und meine musikalische Geschichte dazu. Ohne Hast und Hektik — reiner kreativer Fluss.<br><br>Schau vorbei, hör zu, sieh hin und schreib in die Kommentare, wie dieses Linienchaos für dich klingt. Und wenn du selbst Musik oder Gedichte schreibst — fang die Welle ein und teile deinen Sound!',
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

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t[el.dataset.i18nHtml];
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

let tracks = {};
let scWidget = null;

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
  showCollage(current, true);
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

// ── SoundCloud ──
function loadTrackForWeek(mondayStr) {
  const trackUrl = tracks[mondayStr];
  const soundSection = document.getElementById('sound-section');
  const soundDivider = document.getElementById('sound-divider');
  const iframe = document.getElementById('sc-player');

  if (!trackUrl) {
    soundSection.hidden = true;
    soundDivider.hidden = true;
    return;
  }

  soundSection.hidden = false;
  soundDivider.hidden = false;

  const params = 'color=%23E8631A&auto_play=false&buying=false&sharing=false&download=false&show_artwork=true&show_playcount=false&show_user=true';

  if (!scWidget) {
    iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&${params}`;
    scWidget = SC.Widget(iframe);
  } else {
    scWidget.load(trackUrl, {
      color: '#E8631A',
      auto_play: false,
      buying: false,
      sharing: false,
      download: false,
      show_artwork: true,
      show_playcount: false,
      show_user: true,
    });
  }
}

async function initTracks() {
  try {
    const res = await fetch('tracks.json');
    tracks = await res.json();
  } catch (_) {
    tracks = {};
  }
  loadTrackForWeek(current);
}

// ── Collage ──
let current = thisWeekMondayStr();

function showCollage(dateStr, skipTrack = false) {
  current = dateStr;
  navDate.textContent = formatWeekRange(dateStr);
  btnNext.disabled = dateStr >= thisWeekMondayStr();

  collageImg.style.display = 'none';
  stickers.style.display = 'none';
  btnPrev.disabled = false;

  const isDark = document.documentElement.dataset.theme === 'dark';
  const src = isDark ? `collages/${dateStr}-dark.png` : `collages/${dateStr}.png`;
  const lightSrc = `collages/${dateStr}.png`;
  const probe = new Image();

  probe.onload = () => {
    collageImg.src = src;
    collageImg.style.display = 'flex';
    stickers.style.display = 'none';
  };

  probe.onerror = () => {
    if (isDark && src !== lightSrc) {
      const fallback = new Image();
      fallback.onload = () => {
        collageImg.src = lightSrc;
        collageImg.style.display = 'flex';
        stickers.style.display = 'none';
      };
      fallback.onerror = () => {
        collageImg.style.display = 'none';
        stickers.style.display = 'flex';
        btnPrev.disabled = true;
      };
      fallback.src = lightSrc;
    } else {
      collageImg.style.display = 'none';
      stickers.style.display = 'flex';
      btnPrev.disabled = true;
    }
  };

  probe.src = src;

  if (!skipTrack) loadTrackForWeek(dateStr);
}

btnPrev.addEventListener('click', () => showCollage(offsetWeeks(current, -1)));
btnNext.addEventListener('click', () => showCollage(offsetWeeks(current, 1)));

showCollage(current, true);
initTracks();
