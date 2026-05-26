import sys
import random
from pathlib import Path
from datetime import date

from PIL import Image, ImageChops, ImageFilter, ImageStat

CANVAS_SIZE = 1080
MIN_IMAGES = 4
MAX_IMAGES = 7
MIN_SCALE = 0.25
MAX_SCALE = 0.55
MAX_ROTATION = 15
SHADOW_OFFSET = (4, 6)
SHADOW_BLUR = 5
SHADOW_COLOR_LIGHT = (40, 40, 40, 55)
SHADOW_COLOR_DARK  = (180, 180, 180, 45)
PLACEMENT_TRIES = 150
ALLOWED_OVERLAP = 0.18
DOWNSAMPLE = 4
MASK_SIZE = CANVAS_SIZE // DOWNSAMPLE  # 270x270


def load_images(folder: Path) -> list:
    pngs = sorted(folder.glob("*.png"))
    return [Image.open(p).convert("RGBA") for p in pngs]


def make_shadow(image: Image.Image, shadow_color: tuple) -> Image.Image:
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_layer = Image.new("RGBA", image.size, shadow_color)
    _, _, _, alpha = image.split()
    shadow.paste(shadow_layer, mask=alpha)
    return shadow.filter(ImageFilter.GaussianBlur(radius=SHADOW_BLUR))


def get_alpha_small(rotated: Image.Image) -> Image.Image:
    w, h = rotated.size
    sw = max(1, w // DOWNSAMPLE)
    sh = max(1, h // DOWNSAMPLE)
    small = rotated.resize((sw, sh), Image.LANCZOS)
    return small.split()[3]


def compute_overlap(alpha_small: Image.Image, px: int, py: int, mask: Image.Image) -> float:
    temp = Image.new("L", (MASK_SIZE, MASK_SIZE), 0)
    temp.paste(alpha_small, (px, py))
    return ImageStat.Stat(ImageChops.darker(temp, mask)).sum[0]


def update_mask(mask: Image.Image, alpha_small: Image.Image, px: int, py: int) -> None:
    temp = Image.new("L", (MASK_SIZE, MASK_SIZE), 0)
    temp.paste(alpha_small, (px, py))
    mask.paste(ImageChops.lighter(mask, temp))


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


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].strip():
        date_str = sys.argv[1].strip()
    else:
        date_str = date.today().strftime("%Y-%m-%d")

    generate(date_str)
