#!/usr/bin/env python3
"""Create the production colony backdrop from the immutable vendored source."""

from __future__ import annotations

import hashlib
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageFilter, __version__ as pillow_version

WEB_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = WEB_ROOT / "public/colony/antforge-reference-colony-source.webp"
OUTPUT_PATH = WEB_ROOT / "public/colony/antforge-reference-colony.webp"

SOURCE_SHA256 = "394b6bb0e47c40449131fbe29a515c49ba01394a2aa3b7e9b412bbd8c6ec7ab5"
OUTPUT_SHA256 = "7505f01f42226160e20ebf214b03dc468a43ae79fb9b85567c199ba984134566"
PILLOW_VERSION = "12.1.1"
EXPECTED_SIZE = (512, 356)
BLUR_RADIUS = 8
BLEND_COLOR = "#080910"
BLEND_AMOUNT = 0.50
WEBP_QUALITY = 90
WEBP_METHOD = 6


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encode(image: Image.Image) -> bytes:
    buffer = BytesIO()
    image.save(
        buffer,
        format="WEBP",
        quality=WEBP_QUALITY,
        method=WEBP_METHOD,
    )
    return buffer.getvalue()


def main() -> None:
    assert pillow_version == PILLOW_VERSION, "Pillow version mismatch"
    source_bytes = SOURCE_PATH.read_bytes()
    assert sha256(source_bytes) == SOURCE_SHA256, "immutable source hash mismatch"

    with Image.open(BytesIO(source_bytes)) as source_image:
        assert source_image.format == "WEBP", "source must be WebP"
        assert source_image.size == EXPECTED_SIZE, "unexpected source dimensions"
        source = source_image.convert("RGB")

    blurred = source.filter(ImageFilter.GaussianBlur(radius=BLUR_RADIUS))
    backdrop = Image.blend(
        blurred,
        Image.new("RGB", EXPECTED_SIZE, BLEND_COLOR),
        BLEND_AMOUNT,
    )
    assert backdrop.mode == "RGB"
    assert backdrop.size == EXPECTED_SIZE

    output_bytes = encode(backdrop)
    assert output_bytes == encode(backdrop), "WebP encoding is not deterministic"
    assert sha256(output_bytes) == OUTPUT_SHA256, "derived output hash mismatch"
    OUTPUT_PATH.write_bytes(output_bytes)

    with Image.open(BytesIO(output_bytes)) as production_image:
        assert production_image.format == "WEBP"
        assert production_image.mode == "RGB"
        assert production_image.size == EXPECTED_SIZE

    print(f"source sha256: {SOURCE_SHA256}")
    print(f"output sha256: {OUTPUT_SHA256}")
    print(
        f"transform: RGB, GaussianBlur({BLUR_RADIUS}), "
        f"blend({BLEND_COLOR}, {BLEND_AMOUNT:.2f}), "
        f"WebP quality={WEBP_QUALITY} method={WEBP_METHOD}"
    )


if __name__ == "__main__":
    main()
