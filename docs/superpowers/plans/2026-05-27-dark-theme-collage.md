# Dark-Theme Collage Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a dark-background (`#141414`) variant of each collage alongside the existing light one, and swap the displayed image when the user toggles the site theme.

**Architecture:** `generate.py` will produce two PNG files per date — `collages/YYYY-MM-DD.png` (white bg, existing) and `collages/YYYY-MM-DD-dark.png` (#141414 bg, new) — in a single run without any new CLI flags. `app.js` will read the current theme when building the `src` URL and re-probe on every `applyTheme()` call. The GitHub Actions workflow requires no changes because it already does `git add collages/`.

**Tech Stack:** Python 3 + Pillow (generator), vanilla JS (frontend), GitHub Actions (CI)

---

### Task 1: Generate dark-variant collage in `generate.py`

**Files:**
- Modify: `scripts/generate.py`

**Context:**  
Currently `generate()` creates one canvas with a white background and saves to `collages/{date_str}.png`. We need a second canvas with `(20, 20, 20, 255)` background (= `#141414`) and save it to `collages/{date_str}-dark.png`. The shadow on a dark background should be slightly lighter so it remains visible — use `(180, 180, 180, 45)` instead of the default `(40, 40, 40, 55)`.

The cleanest approach: extract canvas creation into a helper that accepts `bg_color` and `shadow_color`, then call it twice inside `generate()`.

- [ ] **Step 1: Add `generate_canvas` helper that accepts background and shadow color**

Replace the monolithic `generate()` function body with a helper and two calls. Open `scripts/generate.py` and replace:

```python
def generate(date_str: str) -> None:
    images_dir = Path("images")
    collages_dir = Path("collages")
    collages_dir.mkdir(exist_ok=True)

    all_images = load_images(images_dir)
    if not all_images:
        print("No PNG images found in images/")
        return

    seed = int(date_str.replace("-", ""))
    rng = random.Random(seed)

    count = rng.randint(MIN_IMAGES, min(MAX_IMAGES, len(all_images)))
    selected = rng.sample(all_images, count)

    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (255, 255, 255, 255))
    mask = Image.new("L", (MASK_SIZE, MASK_SIZE), 0)
    for img in selected:
        place_image(canvas, img, rng, mask)

    output_path = collages_dir / f"{date_str}.png"
    canvas.convert("RGB").save(output_path, "PNG")
    print(f"Saved: {output_path}")
```

With:

```python
SHADOW_COLOR_DARK = (180, 180, 180, 45)


def generate_canvas(selected: list, rng: random.Random, bg_color: tuple, shadow_color: tuple) -> Image.Image:
    global SHADOW_COLOR
    original_shadow = SHADOW_COLOR
    SHADOW_COLOR = shadow_color
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), bg_color)
    mask = Image.new("L", (MASK_SIZE, MASK_SIZE), 0)
    for img in selected:
        place_image(canvas, img, rng, mask)
    SHADOW_COLOR = original_shadow
    return canvas


def generate(date_str: str) -> None:
    images_dir = Path("images")
    collages_dir = Path("collages")
    collages_dir.mkdir(exist_ok=True)

    all_images = load_images(images_dir)
    if not all_images:
        print("No PNG images found in images/")
        return

    seed = int(date_str.replace("-", ""))
    rng = random.Random(seed)

    count = rng.randint(MIN_IMAGES, min(MAX_IMAGES, len(all_images)))
    selected = rng.sample(all_images, count)

    # Light variant
    rng_light = random.Random(seed)
    rng_light.randint(MIN_IMAGES, min(MAX_IMAGES, len(all_images)))
    rng_light.sample(all_images, count)
    light = generate_canvas(selected, random.Random(seed + 1), (255, 255, 255, 255), SHADOW_COLOR)
    light_path = collages_dir / f"{date_str}.png"
    light.convert("RGB").save(light_path, "PNG")
    print(f"Saved: {light_path}")

    # Dark variant
    dark = generate_canvas(selected, random.Random(seed + 2), (20, 20, 20, 255), SHADOW_COLOR_DARK)
    dark_path = collages_dir / f"{date_str}-dark.png"
    dark.convert("RGB").save(dark_path, "PNG")
    print(f"Saved: {dark_path}")
```

**Wait** — the above approach uses a different rng seed for the second canvas, which would change image placement between light and dark variants. That's intentional: both variants use the same `selected` list (same images, same count) but different placement seeds so shadows look natural on each background. If you want identical layout, use the same seed for both `generate_canvas` calls.

Actually, re-reading: the user wants the same collage content on both themes, just different background. Use the same `rng` state for placement. The cleanest way is to NOT use a mutable global for `SHADOW_COLOR` at all. Here is the corrected implementation:

Replace the `SHADOW_COLOR` constant and `make_shadow`, `place_image`, `generate` with:

```python
SHADOW_COLOR_LIGHT = (40, 40, 40, 55)
SHADOW_COLOR_DARK  = (180, 180, 180, 45)


def make_shadow(image: Image.Image, shadow_color: tuple) -> Image.Image:
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_layer = Image.new("RGBA", image.size, shadow_color)
    _, _, _, alpha = image.split()
    shadow.paste(shadow_layer, mask=alpha)
    return shadow.filter(ImageFilter.GaussianBlur(radius=SHADOW_BLUR))


def place_image(canvas: Image.Image, img: Image.Image, rng: random.Random, mask: Image.Image, shadow_color: tuple) -> None:
    scale = rng.uniform(MIN_SCALE, MAX_SCALE)
    new_width = int(CANVAS_SIZE * scale)
    new_height = int(img.height * new_width / img.width)
    resized = img.resize((new_width, new_height), Image.LANCZOS)

    angle = rng.uniform(-MAX_ROTATION, MAX_ROTATION)
    rotated = resized.rotate(angle, expand=True, fillcolor=(0, 0, 0, 0))

    w, h = rotated.size
    max_x = max(0, CANVAS_SIZE - w)
    max_y = max(0, CANVAS_SIZE - h)

    alpha_small = get_alpha_small(rotated)
    allowance = ImageStat.Stat(alpha_small).sum[0] * ALLOWED_OVERLAP

    best_x = rng.randint(0, max_x)
    best_y = rng.randint(0, max_y)
    best_score = max(0.0, compute_overlap(alpha_small, best_x // DOWNSAMPLE, best_y // DOWNSAMPLE, mask) - allowance)

    for _ in range(PLACEMENT_TRIES):
        x = rng.randint(0, max_x)
        y = rng.randint(0, max_y)
        s = max(0.0, compute_overlap(alpha_small, x // DOWNSAMPLE, y // DOWNSAMPLE, mask) - allowance)
        if s < best_score:
            best_score = s
            best_x, best_y = x, y

    update_mask(mask, alpha_small, best_x // DOWNSAMPLE, best_y // DOWNSAMPLE)

    shadow = make_shadow(rotated, shadow_color)
    canvas.paste(shadow, (best_x + SHADOW_OFFSET[0], best_y + SHADOW_OFFSET[1]), shadow)
    canvas.paste(rotated, (best_x, best_y), rotated)


def generate_canvas(selected: list, seed: int, bg_color: tuple, shadow_color: tuple) -> Image.Image:
    rng = random.Random(seed)
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), bg_color)
    mask = Image.new("L", (MASK_SIZE, MASK_SIZE), 0)
    for img in selected:
        place_image(canvas, img, rng, mask, shadow_color)
    return canvas


def generate(date_str: str) -> None:
    images_dir = Path("images")
    collages_dir = Path("collages")
    collages_dir.mkdir(exist_ok=True)

    all_images = load_images(images_dir)
    if not all_images:
        print("No PNG images found in images/")
        return

    seed = int(date_str.replace("-", ""))
    rng = random.Random(seed)
    count = rng.randint(MIN_IMAGES, min(MAX_IMAGES, len(all_images)))
    selected = rng.sample(all_images, count)

    light = generate_canvas(selected, seed, (255, 255, 255, 255), SHADOW_COLOR_LIGHT)
    light_path = collages_dir / f"{date_str}.png"
    light.convert("RGB").save(light_path, "PNG")
    print(f"Saved: {light_path}")

    dark = generate_canvas(selected, seed, (20, 20, 20, 255), SHADOW_COLOR_DARK)
    dark_path = collages_dir / f"{date_str}-dark.png"
    dark.convert("RGB").save(dark_path, "PNG")
    print(f"Saved: {dark_path}")
```

Also remove the old `SHADOW_COLOR = (40, 40, 40, 55)` constant at the top of the file (it is replaced by `SHADOW_COLOR_LIGHT` and `SHADOW_COLOR_DARK`).

- [ ] **Step 2: Run generator locally and verify both files are created**

```bash
python scripts/generate.py 2026-05-26
```

Expected output:
```
Saved: collages/2026-05-26.png
Saved: collages/2026-05-26-dark.png
```

Then visually confirm `collages/2026-05-26-dark.png` has a `#141414` background:

```bash
python - <<'EOF'
from PIL import Image
img = Image.open("collages/2026-05-26-dark.png").convert("RGB")
print("corner pixel:", img.getpixel((0, 0)))  # expect (20, 20, 20)
EOF
```

Expected output: `corner pixel: (20, 20, 20)`

- [ ] **Step 3: Commit**

```bash
git add scripts/generate.py collages/
git commit -m "feat: generate dark-bg collage variant alongside light"
```

---

### Task 2: Swap collage image on theme change in `app.js`

**Files:**
- Modify: `app.js`

**Context:**  
`showCollage(dateStr)` currently always probes `collages/{dateStr}.png`. We need it to pick `collages/{dateStr}-dark.png` when the current theme is `dark`. Additionally, `applyTheme()` must call `showCollage(current)` after changing the theme so the swap happens immediately.

- [ ] **Step 1: Add `collageUrl(dateStr)` helper and update `showCollage`**

In `app.js`, find `showCollage`:

```js
function showCollage(dateStr) {
  current = dateStr;
  navDate.textContent = formatWeekRange(dateStr);
  btnNext.disabled = dateStr >= thisWeekMondayStr();

  collageImg.style.display = 'none';
  stickers.style.display = 'none';

  const src   = `collages/${dateStr}.png`;
  const probe = new Image();
  ...
  probe.src = src;
}
```

Replace the `const src = ...` line with:

```js
  const isDark = document.documentElement.dataset.theme === 'dark';
  const src = isDark ? `collages/${dateStr}-dark.png` : `collages/${dateStr}.png`;
```

- [ ] **Step 2: Re-render collage when theme changes**

In `app.js`, find `applyTheme`:

```js
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}
```

Replace with:

```js
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  if (typeof current !== 'undefined') showCollage(current);
}
```

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: swap collage src between light/dark variant on theme toggle"
```

---

### Task 3: End-to-end verification

**Files:** none modified

- [ ] **Step 1: Start local server (if not already running)**

```bash
python -m http.server 8000 &
```

- [ ] **Step 2: Take screenshot in light theme**

```bash
node scripts/screenshot.mjs http://localhost:8000 light
```

Read the saved screenshot with the Read tool and confirm the collage has a white background.

- [ ] **Step 3: Toggle to dark theme and take screenshot**

Open `http://localhost:8000` in the browser, click the theme toggle, then:

```bash
node scripts/screenshot.mjs http://localhost:8000 dark
```

Read the screenshot and confirm:
- Page background is `#141414`
- Collage image background is also dark (no white rectangle visible)

- [ ] **Step 4: Verify no regression — collage navigation still works**

Click "← неделя" and "неделя →" while in dark theme and confirm the collage updates and stays dark-themed.

- [ ] **Step 5: Commit if any adjustments were made, then push**

```bash
git push
```

---

### Task 4: Update GitHub Actions workflow

**Files:**
- Modify: `.github/workflows/collage.yml`

**Context:** The existing workflow already does `git add collages/` which will pick up the new `-dark.png` files. No structural changes needed. The only possible improvement: make the commit message include both file variants. This is optional — skip if the current output already looks clean.

- [ ] **Step 1: Verify workflow commit step handles both files**

Open `.github/workflows/collage.yml` and confirm line:

```yaml
git add collages/
```

This is a directory add — it covers both `YYYY-MM-DD.png` and `YYYY-MM-DD-dark.png`. No change needed.

- [ ] **Step 2: (Optional) Update workflow commit message**

If you want a more descriptive commit message, change:

```yaml
git commit -m "collage: ${DATE}"
```

to:

```yaml
git commit -m "collage: ${DATE} (light + dark)"
```

- [ ] **Step 3: Commit if changed**

```bash
git add .github/workflows/collage.yml
git commit -m "chore: update workflow commit message for dual-variant collages"
```
