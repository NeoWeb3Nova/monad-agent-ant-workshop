#!/usr/bin/env python3
"""Create the production colony backdrop from the immutable vendored source."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from PIL import (
    Image,
    ImageChops,
    ImageDraw,
    ImageFilter,
    ImageStat,
    __version__ as pillow_version,
)

WEB_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = WEB_ROOT / "public/colony/antforge-reference-colony-source.webp"
OUTPUT_PATH = WEB_ROOT / "public/colony/antforge-reference-colony.webp"

SOURCE_SHA256 = "394b6bb0e47c40449131fbe29a515c49ba01394a2aa3b7e9b412bbd8c6ec7ab5"
OUTPUT_SHA256 = "693d0bb66aee5c9a39fd3db7491a8417476a074c2c5b9568299a9d793e10819b"
PILLOW_VERSION = "12.1.1"
EXPECTED_SIZE = (512, 356)
LOCAL_BLUR_RADIUS = 10
STRONG_BLUR_RADIUS = 12
CRITICAL_BLUR_RADIUS = 18
MASK_FEATHER_RADIUS = 6
MASK_MIN_ALPHA = 28
BLEND_COLOR = "#080910"
LOCAL_BLEND_AMOUNT = 0.30
STRONG_BLEND_AMOUNT = 0.48
CRITICAL_BLEND_AMOUNT = 0.52
WEBP_QUALITY = 90
WEBP_METHOD = 6
MAX_MASK_NONZERO_PERCENT = 70.0
MAX_MASK_STRONG_PERCENT = 55.0
MIN_LUMINANCE_STDDEV_RATIO = 0.35


@dataclass(frozen=True)
class RedactionRegion:
    name: str
    box: tuple[int, int, int, int]
    radius: int


# Each mask follows a synthetic element rather than a chamber boundary. Organic
# gaps between panels retain their source pixels and keep the cave visually rich.
REDACTION_REGIONS = (
    RedactionRegion("image title/status", (40, 26, 166, 62), 8),
    RedactionRegion("image preview left", (23, 62, 60, 94), 5),
    RedactionRegion("image preview middle", (63, 63, 94, 92), 5),
    RedactionRegion("image preview small", (101, 69, 129, 92), 5),
    RedactionRegion("image preview right", (148, 63, 182, 95), 5),
    RedactionRegion("image footer left", (20, 102, 68, 131), 5),
    RedactionRegion("image footer middle", (70, 102, 142, 131), 5),
    RedactionRegion("image footer right", (144, 102, 196, 131), 5),
    RedactionRegion("image footer control", (198, 102, 226, 131), 5),
    RedactionRegion("queen title/status", (210, 60, 307, 108), 8),
    RedactionRegion("llm title/status", (349, 26, 470, 62), 8),
    RedactionRegion("llm code panel", (328, 57, 398, 113), 7),
    RedactionRegion("llm preview left", (401, 67, 431, 97), 5),
    RedactionRegion("llm preview middle", (440, 67, 469, 97), 5),
    RedactionRegion("llm preview right", (477, 67, 508, 98), 5),
    RedactionRegion("llm footer type", (392, 108, 421, 132), 5),
    RedactionRegion("llm footer chat", (421, 108, 450, 132), 5),
    RedactionRegion("llm footer document", (450, 108, 480, 132), 5),
    RedactionRegion("llm footer control", (480, 108, 508, 132), 5),
    RedactionRegion("guard title/status", (39, 143, 164, 180), 8),
    RedactionRegion("guard left display", (22, 178, 68, 212), 6),
    RedactionRegion("guard worker display", (75, 189, 111, 217), 6),
    RedactionRegion("guard shield panel", (108, 173, 184, 228), 8),
    RedactionRegion("guard footer quality", (18, 220, 78, 249), 6),
    RedactionRegion("guard footer content", (81, 220, 153, 249), 6),
    RedactionRegion("guard footer proof", (156, 220, 241, 249), 6),
    RedactionRegion("treasury title/status", (349, 143, 471, 181), 8),
    RedactionRegion("treasury hex control", (441, 172, 491, 213), 9),
    RedactionRegion("treasury balance/chart", (338, 213, 512, 266), 8),
    RedactionRegion("storage title/status", (38, 261, 172, 298), 8),
    RedactionRegion("storage shelves left", (18, 292, 82, 316), 5),
    RedactionRegion("storage shelves middle-left", (88, 284, 143, 316), 5),
    RedactionRegion("storage shelves middle-right", (151, 284, 202, 316), 5),
    RedactionRegion("storage shelves right", (209, 291, 242, 316), 5),
    RedactionRegion("storage footer artifacts", (20, 322, 80, 356), 5),
    RedactionRegion("storage footer memories", (86, 322, 162, 356), 5),
    RedactionRegion("storage footer size", (168, 322, 244, 356), 5),
    RedactionRegion("scout title/count", (276, 269, 395, 314), 8),
    RedactionRegion("worker title/count", (392, 269, 512, 314), 8),
)

PROTECTED_POINTS = (
    (256, 36),  # queen crystal
    (256, 120),  # upper center spine
    (256, 220),  # lower center spine
    (264, 335),  # bottom spine edge beside the storage footer
    (203, 146),  # image/guard cave boundary
    (308, 146),  # LLM/treasury cave boundary
    (399, 199),  # treasury coins and warm light
    (287, 137),  # upper tunnel edge and purple light
    (335, 330),  # scout ants
    (455, 330),  # worker ants
)
TARGET_POINTS = tuple(
    (region.name, ((region.box[0] + region.box[2]) // 2, (region.box[1] + region.box[3]) // 2))
    for region in REDACTION_REGIONS
)

FORMER_CHAMBER_REGIONS = (
    ("image", (18, 18, 224, 132)),
    ("llm", (322, 18, 506, 133)),
    ("guard", (12, 133, 242, 249)),
    ("treasury", (322, 134, 508, 261)),
    ("storage", (10, 250, 250, 356)),
)

STRONG_REDACTION_NAMES = frozenset(
    region.name
    for region in REDACTION_REGIONS
    if "title/" in region.name
    or "footer" in region.name
    or region.name in {"llm code panel", "treasury balance/chart"}
)

CRITICAL_REDACTION_NAMES = frozenset(
    {
        "guard title/status",
        "treasury title/status",
        "treasury balance/chart",
        "storage title/status",
    }
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def render_mask(regions: tuple[RedactionRegion, ...]) -> Image.Image:
    mask = Image.new("L", EXPECTED_SIZE, 0)
    draw = ImageDraw.Draw(mask)
    for region in regions:
        draw.rounded_rectangle(region.box, radius=region.radius, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=MASK_FEATHER_RADIUS))
    return mask.point([0 if value < MASK_MIN_ALPHA else value for value in range(256)])


def build_redaction_mask() -> Image.Image:
    mask = render_mask(REDACTION_REGIONS)

    assert mask.mode == "L"
    assert mask.size == EXPECTED_SIZE
    for point in PROTECTED_POINTS:
        value = mask.getpixel(point)
        assert isinstance(value, int) and value == 0, f"redaction mask leaked into {point}"
    for name, point in TARGET_POINTS:
        value = mask.getpixel(point)
        assert isinstance(value, int) and value >= 240, f"redaction mask missed {name} at {point}"

    histogram = mask.histogram()
    pixel_count = EXPECTED_SIZE[0] * EXPECTED_SIZE[1]
    nonzero_percent = 100 * (pixel_count - histogram[0]) / pixel_count
    strong_percent = 100 * sum(histogram[128:]) / pixel_count
    assert nonzero_percent < MAX_MASK_NONZERO_PERCENT, "redaction mask is too broad"
    assert strong_percent < MAX_MASK_STRONG_PERCENT, "strong redaction mask is too broad"
    return mask


def luminance_stddev(image: Image.Image, box: tuple[int, int, int, int]) -> float:
    return ImageStat.Stat(image.crop(box).convert("L")).stddev[0]


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

    strong_regions = tuple(
        region for region in REDACTION_REGIONS if region.name in STRONG_REDACTION_NAMES
    )
    strong_mask = render_mask(strong_regions)
    strong_blur = source.filter(ImageFilter.GaussianBlur(radius=STRONG_BLUR_RADIUS))
    strong_redaction = Image.blend(
        strong_blur,
        Image.new("RGB", EXPECTED_SIZE, BLEND_COLOR),
        STRONG_BLEND_AMOUNT,
    )
    backdrop = Image.composite(strong_redaction, backdrop, strong_mask)

    critical_regions = tuple(
        region for region in REDACTION_REGIONS if region.name in CRITICAL_REDACTION_NAMES
    )
    critical_mask = render_mask(critical_regions)
    critical_blur = source.filter(ImageFilter.GaussianBlur(radius=CRITICAL_BLUR_RADIUS))
    critical_redaction = Image.blend(
        critical_blur,
        Image.new("RGB", EXPECTED_SIZE, BLEND_COLOR),
        CRITICAL_BLEND_AMOUNT,
    )
    backdrop = Image.composite(critical_redaction, backdrop, critical_mask)

    assert backdrop.mode == "RGB"
    assert backdrop.size == EXPECTED_SIZE
    outside_selector = mask.point(lambda value: 255 if value == 0 else 0)
    outside_difference = Image.composite(
        ImageChops.difference(backdrop, source),
        Image.new("RGB", EXPECTED_SIZE, 0),
        outside_selector,
    )
    assert outside_difference.getbbox() is None, "pixels outside the mask changed"
    for name, box in FORMER_CHAMBER_REGIONS:
        source_stddev = luminance_stddev(source, box)
        backdrop_stddev = luminance_stddev(backdrop, box)
        assert backdrop_stddev >= source_stddev * MIN_LUMINANCE_STDDEV_RATIO, (
            f"{name} chamber texture collapsed: {source_stddev:.2f} -> {backdrop_stddev:.2f}"
        )
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
        f"strong blur/blend({STRONG_BLUR_RADIUS}, {STRONG_BLEND_AMOUNT:.2f}), "
        f"critical blur/blend({CRITICAL_BLUR_RADIUS}, {CRITICAL_BLEND_AMOUNT:.2f}), "
        f"WebP quality={WEBP_QUALITY} method={WEBP_METHOD}"
    )


if __name__ == "__main__":
    main()
