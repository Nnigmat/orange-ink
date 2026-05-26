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

function todayStr() {
  return toDateStr(new Date());
}

function offsetDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return toDateStr(new Date(y, m - 1, d + days));
}

function formatDateDots(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${d} · ${m} · ${dateStr.slice(0, 4)}`;
}

// ── Collage ──
let current = todayStr();

function showCollage(dateStr) {
  current = dateStr;
  navDate.textContent = formatDateDots(dateStr);
  btnNext.disabled = dateStr >= todayStr();

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

btnPrev.addEventListener('click', () => showCollage(offsetDate(current, -1)));
btnNext.addEventListener('click', () => showCollage(offsetDate(current, 1)));

showCollage(current);
