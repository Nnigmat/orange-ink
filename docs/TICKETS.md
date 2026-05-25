# Tickets

## Milestone A — публичный сайт (MVP)

### A-1 · Добавить исходные фото в `images/`
Главный блокер. `generate.py` завершается досрочно, если папка пустая. Нужно положить PNG/JPEG с фотографиями, которые будут использоваться как исходник для коллажей.

### A-2 · Сгенерировать ретроспективные коллажи
После добавления фото — запустить `python generate.py YYYY-MM-DD` вручную для нескольких прошедших дат, чтобы с первого дня было что смотреть. Закоммитить `collages/` в репо.

### A-3 · Проставить реальные ссылки в футере
В `index.html` все `href="#"` — заглушки. Нужно заменить на реальные URL: Instagram, Telegram, Spotify, Bandcamp, email (`mailto:`).

### A-4 · Написать текст «о проекте»
Текущий текст — placeholder. Нужен настоящий, 2–3 предложения о проекте.

### A-5 · Исправить фон: сетка → точки
`body::before` в `style.css` использует `linear-gradient` (сетка линий). Спек требует `radial-gradient` (точки). Нужно заменить:
```css
/* сейчас — сетка */
background-image:
  linear-gradient(var(--dot-color) 1px, transparent 1px),
  linear-gradient(90deg, var(--dot-color) 1px, transparent 1px);

/* нужно — точки */
background-image: radial-gradient(circle at 1px 1px, var(--dot-color) 1.5px, transparent 0);
```

### A-6 · Настроить GitHub Pages
Проверить, что Pages включён на нужной ветке (`main`, root). Убедиться, что `collages/` раздаётся корректно и HEAD-запрос из `app.js` не блокируется CORS.

### A-7 · Добавить favicon
Нет ни одного `<link rel="icon">`. Минимум — SVG-favicon с оранжевой кляксой или буквой «О».

### A-8 · OG-теги для шаринга
Добавить в `<head>`:
- `og:title`, `og:description`, `og:image` (один из коллажей или статичная картинка)

### A-9 · twitter:card
Добавить `<meta name="twitter:card" content="summary_large_image">` и `twitter:image` (URL картинки). Зависит от A-8 — нужен тот же `og:image` URL.

---

## Milestone B — рабочий лупер

### B-1 · Запись с микрофона
`getUserMedia` → `MediaRecorder`. Кнопка record запускает/останавливает запись. Аудио сохраняется в `AudioBuffer` трека. Запись ограничена длиной петли (BPM × такты).

### B-2 · Петля воспроизведения
`AudioContext` + `AudioBufferSourceNode`. Play запускает все непустые дорожки в цикле; Stop останавливает. Петля синхронизирована по BPM и длине (1/2/4/8 тактов).

### B-3 · Визуализация waveform на canvas
После записи рисовать реальную осциллограмму на `<canvas>` трека вместо заглушки «нет записи». При воспроизведении — анимация позиции (playhead).

### B-4 · Mute и clear работают
Кнопка «М» глушит дорожку при воспроизведении (`GainNode.gain = 0`). Кнопка «очистить» (transport) сбрасывает все дорожки и возвращает canvas в пустое состояние.

### B-5 · Состояние не теряется при навигации
Решить: сбрасывать лупер при переходе на другую дату или сохранять. Если сохранять — хранить `Blob` в `sessionStorage` или `IndexedDB`.
