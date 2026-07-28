#!/usr/bin/env python3
"""Create the production colony backdrop from the immutable vendored source."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, __version__ as pillow_version

WEB_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = WEB_ROOT / "public/colony/antforge-reference-colony-source.webp"
OUTPUT_PATH = WEB_ROOT / "public/colony/antforge-reference-colony.webp"

SOURCE_SHA256 = "394b6bb0e47c40449131fbe29a515c49ba01394a2aa3b7e9b412bbd8c6ec7ab5"
OUTPUT_SHA256 = "0e5900205d7fb1889dcdde53795670a53766bdfadd4107a72f50aa7a324aabdf"
PILLOW_VERSION = "12.1.1"
EXPECTED_SIZE = (512, 356)
LOCAL_BLUR_RADIUS = 8
MASK_FEATHER_RADIUS = 4
BLEND_COLOR = "#080910"
LOCAL_BLEND_AMOUNT = 0.76
WEBP_QUALITY = 90
WEBP_METHOD = 6


@dataclass(frozen=True)
class RedactionRegion:
    box: tuple[int, int, int, int]
    radius: int


# The queen label bounds extend beyond the initial (216, 66, 302, 99) region
# because its feathered edge left the title readable during visual inspection.
REDACTION_REGIONS = (
    RedactionRegion((18, 18, 224, 132), 18),  # image chamber
    RedactionRegion((216, 60, 302, 105), 10),  # queen label
    RedactionRegion((322, 18, 506, 133), 18),  # LLM chamber
    RedactionRegion((12, 133, 242, 249), 18),  # guard chamber
    RedactionRegion((322, 134, 508, 261), 18),  # treasury chamber
    RedactionRegion((10, 250, 250, 356), 18),  # storage chamber
    RedactionRegion((278, 272, 392, 311), 12),  # scout label
    RedactionRegion((393, 272, 511, 311), 12),  # worker label
)

PROTECTED_POINTS = (
    (256, 36),  # crystal
    (256, 120),  # upper center tunnel
    (256, 220),  # lower center tunnel
    (335, 330),  # scout ants
    (455, 330),  # worker ants
)
TARGET_POINTS = (
    (70, 42),  # image title
    (370, 42),  # LLM title
    (382, 218),  # treasury UI
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def build_redaction_mask() -> Image.Image:
    mask = Image.new("L", EXPECTED_SIZE, 0)
    draw = ImageDraw.Draw(mask)
    for region in REDACTION_REGIONS:
        draw.rounded_rectangle(region.box, radius=region.radius, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=MASK_FEATHER_RADIUS))

    assert mask.mode == "L"
    assert mask.size == EXPECTED_SIZE
    for point in PROTECTED_POINTS:
        value = mask.getpixel(point)
        assert isinstance(value, int) and value == 0, f"redaction mask leaked into {point}"
    for point in TARGET_POINTS:
        value = mask.getpixel(point)
        assert isinstance(value, int) and value > 0, f"redaction mask missed {point}"
    return mask


def build_backdrop(source: Image.Image) -> Image.Image:
    assert source.mode == "RGB"
    assert source.size == EXPECTED_SIZE

    mask = build_redaction_mask()
    local_blur = source.filter(ImageFilter.GaussianBlur(radius=LOCAL_BLUR_RADIUS))
    local_redaction = Image.blend(
        local_blur,
        Image.new("RGB", EXPECTED_SIZE, BLEND_COLOR),
        LOCAL_BLEND_AMOUNT,
    )
    backdrop = Image.composite(local_redaction, source, mask)

    assert backdrop.mode == "RGB"
    assert backdrop.size == EXPECTED_SIZE
    outside_selector = mask.point(lambda value: 255 if value == 0 else 0)
    outside_difference = Image.composite(
        ImageChops.difference(backdrop, source),
        Image.new("RGB", EXPECTED_SIZE, 0),
        outside_selector,
    )
    assert outside_difference.getbbox() is None, "pixels outside the mask changed"
    return backdrop


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

    backdrop = build_backdrop(source)
    output_bytes = encode(backdrop)
    assert output_bytes == encode(backdrop), "WebP encoding is not deterministic"
    output_hash = sha256(output_bytes)
    assert output_hash == OUTPUT_SHA256, f"derived output hash mismatch: {output_hash}"
    OUTPUT_PATH.write_bytes(output_bytes)

    with Image.open(BytesIO(output_bytes)) as production_image:
        assert production_image.format == "WEBP"
        assert production_image.mode == "RGB"
        assert production_image.size == EXPECTED_SIZE

    print(f"source sha256: {SOURCE_SHA256}")
    print(f"output sha256: {OUTPUT_SHA256}")
    print(
        f"transform: RGB, local GaussianBlur({LOCAL_BLUR_RADIUS}), "
        f"mask feather GaussianBlur({MASK_FEATHER_RADIUS}), "
        f"local blend({BLEND_COLOR}, {LOCAL_BLEND_AMOUNT:.2f}), "
        f"WebP quality={WEBP_QUALITY} method={WEBP_METHOD}"
    )


if __name__ == "__main__":
    main()
