#!/usr/bin/env python3
"""Extract selected character poses from user-provided source sheets without altering artwork."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
OUTPUT = ASSETS / "characters" / "poses"
OUTPUT.mkdir(parents=True, exist_ok=True)

# (source filename, output filename, crop box). Crop boxes preserve the original pixels.
POSES = [
    ("캐릭터일러스트_티콘파이_짹이.png", "jjaeki-reading.png", (1010, 350, 1320, 700)),
    ("캐릭터일러스트_티콘파이_짹이.png", "jjaeki-question.png", (200, 640, 580, 1010)),
    ("캐릭터일러스트_티콘파이_짹이.png", "jjaeki-wave.png", (620, 640, 960, 1010)),
    ("캐릭터일러스트_티콘파이_호랭 (3).png", "horang-reading.png", (30, 0, 335, 345)),
    ("캐릭터일러스트_티콘파이_호랭 (3).png", "horang-question.png", (740, 330, 1055, 710)),
    ("캐릭터일러스트_티콘파이_호랭 (3).png", "horang-cheer.png", (725, 0, 1050, 355)),
]

for source_name, output_name, crop_box in POSES:
    source = ASSETS / source_name
    with Image.open(source) as image:
        image.crop(crop_box).save(OUTPUT / output_name, "PNG", optimize=True)

print(f"Extracted {len(POSES)} character poses to {OUTPUT}")
