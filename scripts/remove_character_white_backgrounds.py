#!/usr/bin/env python3
"""Create transparent character copies while retaining original source artwork."""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "horang-full.png": ROOT / "assets/characters/horang-full.png",
    "horang.png": ROOT / "assets/characters/horang.png",
    "jjaeki-full.png": ROOT / "assets/characters/jjaeki-full.png",
    "jjaeki.png": ROOT / "assets/characters/jjaeki.png",
    "horang-cheer.png": ROOT / "assets/characters/poses/horang-cheer.png",
    "horang-question.png": ROOT / "assets/characters/poses/horang-question.png",
    "horang-reading.png": ROOT / "assets/characters/poses/horang-reading.png",
    "jjaeki-question.png": ROOT / "assets/characters/poses/jjaeki-question.png",
    "jjaeki-reading.png": ROOT / "assets/characters/poses/jjaeki-reading.png",
    "jjaeki-wave.png": ROOT / "assets/characters/poses/jjaeki-wave.png",
}


def is_neutral_white(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha > 0 and min(red, green, blue) >= 224 and max(red, green, blue) - min(red, green, blue) <= 18


def remove_connected_background(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    queue: deque[tuple[int, int]] = deque()
    cleared: set[tuple[int, int]] = set()

    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))

    while queue:
        x, y = queue.popleft()
        if (x, y) in cleared or not is_neutral_white(pixels[x, y]):
            continue
        cleared.add((x, y))
        for neighbor_x, neighbor_y in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= neighbor_x < width and 0 <= neighbor_y < height:
                queue.append((neighbor_x, neighbor_y))

    for x, y in cleared:
        red, green, blue, _ = pixels[x, y]
        pixels[x, y] = (red, green, blue, 0)

    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "PNG")


OUTPUT = ROOT / "assets/characters/transparent"
for filename, source in SOURCES.items():
    remove_connected_background(source, OUTPUT / filename)
    print(f"created: {OUTPUT / filename}")
