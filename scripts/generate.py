import sys
import random
from pathlib import Path
from datetime import date

from PIL import Image, ImageFilter

CANVAS_SIZE = 1080
MIN_IMAGES = 4
MAX_IMAGES = 7
MIN_SCALE = 0.25
MAX_SCALE = 0.55
MAX_ROTATION = 15
SHADOW_OFFSET = (8, 12)
SHADOW_BLUR = 10
SHADOW_COLOR = (40, 40, 40, 100)


def load_images(folder: Path) -> list:
    pngs = sorted(folder.glob("*.png"))
    return [Image.open(p).convert("RGBA") for p in pngs]


def make_shadow(image: Image.Image) -> Image.Image:
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_layer = Image.new("RGBA", image.size, SHADOW_COLOR)
    _, _, _, alpha = image.split()
    shadow.paste(shadow_layer, mask=alpha)
    return shadow.filter(ImageFilter.GaussianBlur(radius=SHADOW_BLUR))


def place_image(canvas: Image.Image, img: Image.Image, rng: random.Random) -> None:
    scale = rng.uniform(MIN_SCALE, MAX_SCALE)
    new_width = int(CANVAS_SIZE * scale)
    new_height = int(img.height * new_width / img.width)
    resized = img.resize((new_width, new_height), Image.LANCZOS)

    angle = rng.uniform(-MAX_ROTATION, MAX_ROTATION)
    rotated = resized.rotate(angle, expand=True, fillcolor=(0, 0, 0, 0))

    max_x = max(0, CANVAS_SIZE - rotated.width)
    max_y = max(0, CANVAS_SIZE - rotated.height)
    x = rng.randint(0, max_x)
    y = rng.randint(0, max_y)

    shadow = make_shadow(rotated)
    canvas.paste(shadow, (x + SHADOW_OFFSET[0], y + SHADOW_OFFSET[1]), shadow)
    canvas.paste(rotated, (x, y), rotated)


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
    for img in selected:
        place_image(canvas, img, rng)

    output_path = collages_dir / f"{date_str}.png"
    canvas.convert("RGB").save(output_path, "PNG")
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].strip():
        date_str = sys.argv[1].strip()
    else:
        date_str = date.today().strftime("%Y-%m-%d")

    generate(date_str)
