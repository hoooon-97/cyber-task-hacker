#!/usr/bin/env python3
"""Generate a pixel-art hacker icon (BACK view) for the Tauri app."""

from PIL import Image, ImageDraw
import os
import random

random.seed(42)

PX = 64
SCALE = 16

# Palette
BG = (10, 10, 18)
BG_LIGHT = (18, 18, 30)
HOOD = (28, 28, 42)
HOOD_HIGHLIGHT = (42, 42, 62)
SHIRT = (22, 22, 38)
SHIRT_HIGHLIGHT = (35, 35, 55)
CHAIR = (38, 38, 58)
CHAIR_HIGHLIGHT = (55, 55, 80)
DESK = (30, 30, 48)
MONITOR_FRAME = (45, 45, 65)
MONITOR_SCREEN = (4, 12, 8)
SCREEN_GLOW = (0, 255, 65)
SCREEN_CYAN = (0, 240, 255)
CABLE = (75, 75, 95)
GLOW_GREEN = (0, 255, 65)
GLOW_CYAN = (0, 240, 255)


def create_icon():
    img = Image.new("RGBA", (PX, PX), BG)
    draw = ImageDraw.Draw(img)

    def rect(x1, y1, x2, y2, color):
        draw.rectangle([x1, y1, x2, y2], fill=color)

    # --- Background: dark room with subtle grid ---
    for x in range(0, PX, 4):
        draw.line([(x, 0), (x, PX)], fill=(15, 15, 25), width=1)
    for y in range(0, PX, 4):
        draw.line([(0, y), (PX, y)], fill=(15, 15, 25), width=1)

    # --- Floor ---
    rect(0, 56, PX, PX, (14, 14, 24))
    # Floor grid lines
    for x in range(0, PX, 8):
        draw.line([(x, 56), (x + 4, PX)], fill=(18, 18, 30), width=1)

    # --- Desk (lower area, behind hacker) ---
    rect(6, 48, 58, 54, DESK)
    rect(6, 54, 58, 56, (22, 22, 38))  # desk edge

    # --- Monitor (in front of hacker, upper half) ---
    # Monitor stand
    rect(28, 38, 36, 48, MONITOR_FRAME)
    rect(26, 48, 38, 50, MONITOR_FRAME)
    # Monitor frame
    rect(12, 10, 52, 38, MONITOR_FRAME)
    # Screen
    rect(14, 12, 50, 36, MONITOR_SCREEN)
    # Screen code lines
    for y in range(14, 34, 3):
        line_len = 6 + (y % 7) * 5
        rect(16, y, 16 + line_len, y + 1, SCREEN_GLOW)
    # Screen center bright spot
    rect(24, 18, 40, 30, (0, 220, 55, 160))
    rect(28, 22, 36, 26, SCREEN_GLOW)
    # Screen glow bloom (behind monitor, on background)
    for i in range(6):
        alpha = 18 - i * 3
        glow = (0, 255, 65, max(0, alpha))
        draw.ellipse([10 - i, 8 - i, 54 + i, 40 + i], fill=glow)

    # --- Chair (behind hacker, lower center) ---
    # Chair back visible behind hacker shoulders
    rect(20, 40, 24, 56, CHAIR)
    rect(40, 40, 44, 56, CHAIR)
    rect(20, 40, 24, 42, CHAIR_HIGHLIGHT)
    rect(40, 40, 44, 42, CHAIR_HIGHLIGHT)
    # Chair seat
    rect(20, 54, 44, 56, CHAIR_HIGHLIGHT)

    # --- Hacker body (BACK view) ---
    # Shoulders (broad, takes lower center)
    rect(16, 42, 48, 56, SHIRT)
    # Shoulder highlight from screen glow
    rect(16, 42, 20, 48, (0, 255, 65, 50))
    rect(44, 42, 48, 48, (0, 255, 65, 50))
    # Shirt folds/detail
    rect(30, 44, 34, 56, SHIRT_HIGHLIGHT)

    # Head / Hood (back view, center top of body)
    # Hood main shape
    rect(22, 24, 42, 44, HOOD)
    # Hood top (rounded feel)
    rect(24, 22, 40, 24, HOOD_HIGHLIGHT)
    # Hood sides
    rect(22, 24, 26, 44, HOOD_HIGHLIGHT)
    rect(38, 24, 42, 44, HOOD_HIGHLIGHT)
    # Hood inner (dark opening, since we see from back it's just dark fabric)
    rect(26, 28, 38, 44, (18, 18, 32))
    # Hood opening top edge
    rect(26, 26, 38, 28, HOOD_HIGHLIGHT)

    # Neck (tiny bit visible at bottom of hood)
    rect(30, 44, 34, 46, (160, 140, 120))

    # Screen glow reflection on hood
    rect(22, 32, 26, 40, (0, 255, 65, 60))
    rect(38, 32, 42, 40, (0, 255, 65, 60))
    rect(24, 36, 26, 42, (0, 240, 255, 40))
    rect(38, 36, 40, 42, (0, 240, 255, 40))

    # --- Arms / hands (on desk or near keyboard) ---
    # Left arm reaching to desk
    rect(12, 46, 18, 54, SHIRT)
    rect(12, 54, 16, 56, (160, 140, 120))  # hand
    # Right arm
    rect(46, 46, 52, 54, SHIRT)
    rect(48, 54, 52, 56, (160, 140, 120))  # hand

    # --- Keyboard on desk ---
    rect(24, 50, 40, 52, (55, 55, 75))
    # Keys
    for x in range(25, 40, 2):
        rect(x, 50, x + 1, 51, (80, 80, 100))
    # Keyboard glow from screen
    rect(24, 50, 40, 52, (0, 255, 65, 30))

    # --- Cables ---
    # Left cable from desk
    rect(8, 48, 10, 60, CABLE)
    rect(8, 60, 12, 62, CABLE)
    # Right cable
    rect(54, 48, 56, 58, CABLE)
    rect(52, 58, 56, 60, CABLE)

    # --- Ambient particles / dust in air ---
    particles = [(9, 15), (55, 12), (50, 28), (8, 32), (58, 44), (14, 8), (48, 6)]
    for x, y in particles:
        draw.point((x, y), fill=(0, 255, 65, 120))
        draw.point((x + 1, y), fill=(0, 240, 255, 80))

    # --- Subtle dither noise ---
    for _ in range(30):
        x = random.randint(0, PX - 1)
        y = random.randint(0, PX - 1)
        r, g, b, a = img.getpixel((x, y))
        factor = random.choice([0.92, 1.0, 1.08])
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
    print("\n✅ Back-view hacker icons generated!")
