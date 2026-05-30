#!/usr/bin/env python3
"""Generate a pixel-art hacker icon (back view) for the Tauri app."""

from PIL import Image, ImageDraw
import os

# Pixel grid size (low-res pixel art)
PX = 64
SCALE = 16  # 64 * 16 = 1024

# Palette (dark cyberpunk theme)
BG = (12, 12, 20)          # deep dark bg
BG_LIGHT = (20, 20, 35)    # slightly lighter bg
HOOD = (30, 30, 45)        # dark hood
HOOD_HIGHLIGHT = (45, 45, 65)  # hood highlight
SKIN = (200, 180, 160)     # skin tone (neck only)
SHIRT = (25, 25, 40)       # shirt/hoodie body
SCREEN_GLOW = (0, 255, 65)  # matrix green glow
SCREEN_CYAN = (0, 240, 255)  # cyan accent
MONITOR_FRAME = (50, 50, 70)  # monitor bezel
MONITOR_SCREEN = (5, 15, 10)  # dark screen
CHAIR = (40, 40, 60)       # chair back
CHAIR_HIGHLIGHT = (60, 60, 85)
DESK = (35, 35, 50)        # desk
CABLE = (80, 80, 100)      # cables


def create_icon():
    img = Image.new("RGBA", (PX, PX), BG)
    draw = ImageDraw.Draw(img)

    # Helper: draw filled rect in pixels
    def rect(x1, y1, x2, y2, color):
        draw.rectangle([x1, y1, x2, y2], fill=color)

    # --- Background glow from monitor ---
    # Soft green glow behind/around monitor area
    for i in range(8):
        alpha = 20 - i * 2
        glow_color = (0, 255, 65, max(0, alpha))
        draw.ellipse([18 - i, 18 - i, 46 + i, 42 + i], fill=glow_color)

    # --- Desk ---
    rect(4, 48, 60, 54, DESK)
    rect(4, 54, 60, 56, (25, 25, 40))  # desk edge shadow

    # --- Monitor ---
    # Monitor stand
    rect(28, 42, 36, 48, MONITOR_FRAME)
    rect(26, 48, 38, 50, MONITOR_FRAME)
    # Monitor frame
    rect(14, 16, 50, 40, MONITOR_FRAME)
    # Screen (dark with gradient feel)
    rect(16, 18, 48, 38, MONITOR_SCREEN)
    # Screen content lines (matrix-like code lines)
    for y in range(20, 37, 3):
        line_len = 8 + (y % 5) * 4
        rect(18, y, 18 + line_len, y + 1, SCREEN_GLOW)
    # Screen center glow
    rect(26, 24, 38, 32, (0, 200, 50, 180))
    rect(28, 26, 36, 30, SCREEN_GLOW)

    # --- Hacker body (back view) ---
    # Shoulders (broad)
    rect(22, 46, 42, 62, SHIRT)
    # Hood / head base
    rect(24, 26, 40, 46, HOOD)
    # Hood highlight
    rect(24, 26, 28, 44, HOOD_HIGHLIGHT)
    rect(36, 26, 40, 44, HOOD_HIGHLIGHT)
    # Top of hood
    rect(26, 24, 38, 26, HOOD_HIGHLIGHT)
    # Hood opening (dark inside)
    rect(28, 30, 36, 44, (15, 15, 25))
    # Neck (tiny visible skin)
    rect(30, 44, 34, 46, SKIN)

    # --- Chair back ---
    rect(12, 44, 22, 62, CHAIR)
    rect(42, 44, 52, 62, CHAIR)
    rect(12, 44, 22, 46, CHAIR_HIGHLIGHT)
    rect(42, 44, 52, 46, CHAIR_HIGHLIGHT)

    # --- Cables / details ---
    # Cable hanging from desk
    rect(50, 48, 52, 58, CABLE)
    rect(50, 58, 54, 60, CABLE)
    # Another cable
    rect(10, 48, 12, 56, CABLE)

    # --- Ambient glow on hacker ---
    # Green screen light hitting shoulders
    rect(22, 46, 26, 50, (0, 255, 65, 40))
    rect(38, 46, 42, 50, (0, 255, 65, 40))
    # Cyan accent on hood edge
    rect(24, 44, 26, 46, (0, 240, 255, 100))
    rect(38, 44, 40, 46, (0, 240, 255, 100))

    # --- Floor reflection / ambient ---
    rect(20, 60, 44, 62, (0, 255, 65, 15))

    # --- Pixel dither / noise for retro feel ---
    import random
    random.seed(42)
    for _ in range(40):
        x = random.randint(0, PX - 1)
        y = random.randint(0, PX - 1)
        r, g, b, a = img.getpixel((x, y))
        # Slightly vary brightness
        factor = random.choice([0.9, 1.0, 1.1])
        new_r = min(255, int(r * factor))
        new_g = min(255, int(g * factor))
        new_b = min(255, int(b * factor))
        draw.point((x, y), fill=(new_r, new_g, new_b, a))

    # Upscale to 1024x1024 with nearest-neighbor (pixel art look)
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
    print("\n✅ All icons generated!")
