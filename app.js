const collageImg = document.getElementById('collage');
const placeholder = document.getElementById('placeholder');
const dateLabel = document.getElementById('date-label');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnDownload = document.getElementById('btn-download');

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
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

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

let current = todayStr();

function showCollage(dateStr) {
  current = dateStr;
  dateLabel.textContent = formatDate(dateStr);
  btnNext.disabled = dateStr >= todayStr();

  collageImg.style.display = 'none';
  btnDownload.style.display = 'none';
  placeholder.style.display = 'block';
  placeholder.textContent = '';

  const src = `collages/${dateStr}.png`;
  const probe = new Image();

  probe.onload = () => {
    collageImg.src = src;
    collageImg.style.display = 'block';
    placeholder.style.display = 'none';
    btnDownload.style.display = 'inline-block';
    btnDownload.onclick = () => {
      const a = document.createElement('a');
      a.href = src;
      a.download = `orange-ink-${dateStr}.png`;
      a.click();
    };
  };

  probe.onerror = () => {
    placeholder.textContent =
      dateStr === todayStr()
        ? 'коллаж появится сегодня ночью'
        : 'коллаж за эту дату недоступен';
  };

  probe.src = src;
}

btnPrev.addEventListener('click', () => showCollage(offsetDate(current, -1)));
btnNext.addEventListener('click', () => showCollage(offsetDate(current, 1)));

showCollage(current);
