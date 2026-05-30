#!/usr/bin/env python3
"""Generate a clean white Anonymous mask pixel-art icon."""

from PIL import Image, ImageDraw
import os

PX = 64
SCALE = 16

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (220, 20, 60)
BG = (255, 255, 255)


def create_icon():
    img = Image.new("RGBA", (PX, PX), BG)
    draw = ImageDraw.Draw(img)

    def rect(x1, y1, x2, y2, color):
        draw.rectangle([x1, y1, x2, y2], fill=color)

    def ellipse(x1, y1, x2, y2, color):
        draw.ellipse([x1, y1, x2, y2], fill=color)

    # Face oval
    ellipse(14, 10, 50, 56, WHITE)

    # Eyes (black, intense)
    ellipse(20, 20, 30, 30, BLACK)
    ellipse(34, 20, 44, 30, BLACK)

    # Eyebrows (thick)
    rect(18, 16, 32, 20, BLACK)
    rect(32, 16, 46, 20, BLACK)

    # Mustache
    rect(20, 34, 44, 38, BLACK)
    rect(18, 32, 24, 36, BLACK)
    rect(40, 32, 46, 36, BLACK)

    # Smile
    rect(26, 40, 38, 42, BLACK)
    rect(28, 42, 36, 44, BLACK)

    # Goatee
    rect(28, 44, 36, 54, BLACK)
    rect(30, 54, 34, 56, BLACK)

    # Cheeks (red)
    ellipse(18, 28, 28, 38, RED)
    ellipse(36, 28, 46, 38, RED)

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
    print("\n✅ Clean Anonymous mask icons generated!")
