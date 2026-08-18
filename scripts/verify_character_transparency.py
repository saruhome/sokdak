#!/usr/bin/env python3
"""Fail when any transparent character asset still has an opaque white frame."""

from pathlib import Path

from PIL import Image


ASSET_DIR = Path(__file__).resolve().parents[1] / "assets/characters/transparent"
failures: list[str] = []

for asset in sorted(ASSET_DIR.glob("*.png")):
    image = Image.open(asset).convert("RGBA")
    width, height = image.size
    border_alpha = [image.getpixel((x, y))[3] for x in range(width) for y in (0, height - 1)]
    border_alpha.extend(image.getpixel((x, y))[3] for y in range(height) for x in (0, width - 1))
    transparent_edge_ratio = sum(alpha == 0 for alpha in border_alpha) / len(border_alpha)
    print(f"{asset.name}: transparent_edge_ratio={transparent_edge_ratio:.3f}")
    # 일부 포즈는 발·꼬리·귀가 캔버스 가장자리까지 닿으므로, 테두리의 75% 이상이
    # 투명하면 배경 프레임이 제거된 컷아웃으로 인정한다.
    if transparent_edge_ratio < 0.75:
        failures.append(asset.name)

if failures:
    raise SystemExit(f"opaque white edge remains: {', '.join(failures)}")
