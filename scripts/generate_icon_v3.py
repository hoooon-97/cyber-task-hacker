#!/usr/bin/env python3
"""Generate Anonymous (Guy Fawkes) mask pixel-art icon."""

from PIL import Image, ImageDraw
import os

PX = 64
SCALE = 16

# Palette
BG = (10, 10, 18)
HOOD = (18, 18, 32)
HOOD_HIGHLIGHT = (28, 28, 48)
MASK_WHITE = (230, 230, 230)
MASK_SHADOW = (200, 200, 200)
CHEEK_RED = (220, 30, 60)
BLACK = (15, 15, 15)
GOATEE = (20, 20, 20)
MUSTACHE = (18, 18, 18)
EYEBROW = (22, 22, 22)
EYE = (10, 10, 10)


def create_icon():
    img = Image.new("RGBA", (PX, PX), BG)
    draw = ImageDraw.Draw(img)

    def rect(x1, y1, x2, y2, color):
        draw.rectangle([x1, y1, x2, y2], fill=color)

    def ellipse(x1, y1, x2, y2, color):
        draw.ellipse([x1, y1, x2, y2], fill=color)

    # --- Hood / background silhouette ---
    ellipse(8, 6, 56, 58, HOOD)
    ellipse(12, 10, 52, 54, HOOD_HIGHLIGHT)

    # --- Face base (white mask) ---
    ellipse(16, 12, 48, 52, MASK_WHITE)
    # Face shadow (left side)
    ellipse(16, 12, 32, 52, MASK_SHADOW)
    ellipse(18, 14, 48, 50, MASK_WHITE)

    # --- Cheeks (red) ---
    # Left cheek
    ellipse(18, 28, 28, 38, CHEEK_RED)
    # Right cheek
    ellipse(36, 28, 46, 38, CHEEK_RED)
    # Blush highlight
    ellipse(20, 30, 26, 36, (255, 80, 100))
    ellipse(38, 30, 44, 36, (255, 80, 100))

    # --- Eyes (black, intense) ---
    # Left eye
    ellipse(22, 20, 30, 28, EYE)
    ellipse(24, 22, 28, 26, (60, 60, 60))  # eye glint
    # Right eye
    ellipse(34, 20, 42, 28, EYE)
    ellipse(36, 22, 40, 26, (60, 60, 60))  # eye glint

    # --- Eyebrows (thick, curved down) ---
    # Left eyebrow
    rect(20, 16, 32, 20, EYEBROW)
    rect(22, 14, 30, 16, EYEBROW)
    rect(18, 18, 22, 20, EYEBROW)
    # Right eyebrow
    rect(32, 16, 44, 20, EYEBROW)
    rect(34, 14, 42, 16, EYEBROW)
    rect(42, 18, 46, 20, EYEBROW)

    # --- Mustache (thin curved line) ---
    rect(22, 36, 42, 38, MUSTACHE)
    rect(20, 34, 26, 36, MUSTACHE)
    rect(38, 34, 44, 36, MUSTACHE)
    rect(24, 38, 28, 40, MUSTACHE)
    rect(36, 38, 40, 40, MUSTACHE)

    # --- Smile (subtle smirk) ---
    rect(26, 40, 38, 42, BLACK)
    rect(28, 42, 36, 44, BLACK)
    rect(30, 44, 34, 46, BLACK)

    # --- Goatee / chin beard ---
    rect(28, 46, 36, 50, GOATEE)
    rect(30, 50, 34, 54, GOATEE)
    rect(32, 54, 33, 56, GOATEE)  # pointy tip
    # Goatee sides
    rect(26, 48, 28, 52, GOATEE)
    rect(36, 48, 38, 52, GOATEE)

    # --- Hood shadow over forehead ---
    rect(16, 12, 48, 16, HOOD_HIGHLIGHT)
    rect(18, 14, 46, 16, (10, 10, 18, 80))

    # --- Pixel noise / dither for retro feel ---
    import random
    random.seed(42)
    for _ in range(25):
        x = random.randint(0, PX - 1)
        y = random.randint(0, PX - 1)
        r, g, b, a = img.getpixel((x, y))
        factor = random.choice([0.94, 1.0, 1.06])
        new_r = min(255, int(r * factor))
        new_g = min(255, int(g * factor))
        new_b = min(255, int(b * factor))
        draw.point((x, y), fill=(new_r, new_g, new_b, a))

    # Upscale
    img_large = img.resize((PX * SCALE, PX * SCALE), Image.NEAREST)
    return img_large


def save_icons(base_img, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    sizes = {
        "icon.png": 1024,
        "icon_512x512.png": 512,
        "icon_256x256.png": 256,
        "icon_128x128.png": 128,
        "icon_32x32.png": 32,
    }
    for filename, size in sizes.items():
        resized = base_img.resize((size, size), Image.NEAREST)
        path = os.path.join(out_dir, filename)
        resized.save(path, "PNG")
        print(f"Saved: {path} ({size}x{size})")


if __name__ == "__main__":
    out_dir = "src-tauri/icons"
    icon = create_icon()
    save_icons(icon, out_dir)
    print("\n✅ Anonymous mask icons generated!")
