#!/usr/bin/env python3
"""Create the production colony backdrop from the immutable vendored source."""

from __future__ import annotations

import hashlib
import os
import tempfile
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
    features,
)

WEB_ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = WEB_ROOT / "public/colony/antforge-reference-colony-source.webp"
OUTPUT_PATH = WEB_ROOT / "public/colony/antforge-reference-colony.webp"

SOURCE_SHA256 = "394b6bb0e47c40449131fbe29a515c49ba01394a2aa3b7e9b412bbd8c6ec7ab5"
OUTPUT_SHA256 = "693d0bb66aee5c9a39fd3db7491a8417476a074c2c5b9568299a9d793e10819b"
PILLOW_VERSION = "12.1.1"
LIBWEBP_VERSION = "1.6.0"
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
MIN_MASK_NONZERO_PERCENT = 60.0
MIN_MASK_STRONG_PERCENT = 45.0
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

# These names and evidence points deliberately do not derive from the regions.
# A region deletion must fail validation rather than delete its proof.
REQUIRED_REGION_NAMES = frozenset(
    {
        "image title/status",
        "image preview left",
        "image preview middle",
        "image preview small",
        "image preview right",
        "image footer left",
        "image footer middle",
        "image footer right",
        "image footer control",
        "queen title/status",
        "llm title/status",
        "llm code panel",
        "llm preview left",
        "llm preview middle",
        "llm preview right",
        "llm footer type",
        "llm footer chat",
        "llm footer document",
        "llm footer control",
        "guard title/status",
        "guard left display",
        "guard worker display",
        "guard shield panel",
        "guard footer quality",
        "guard footer content",
        "guard footer proof",
        "treasury title/status",
        "treasury hex control",
        "treasury balance/chart",
        "storage title/status",
        "storage shelves left",
        "storage shelves middle-left",
        "storage shelves middle-right",
        "storage shelves right",
        "storage footer artifacts",
        "storage footer memories",
        "storage footer size",
        "scout title/count",
        "worker title/count",
    }
)

EVIDENCE_TARGET_POINTS = (
    ("image title/status", (103, 44)),
    ("image preview left", (41, 78)),
    ("image preview middle", (78, 77)),
    ("image preview small", (115, 80)),
    ("image preview right", (165, 79)),
    ("image footer left", (44, 116)),
    ("image footer middle", (106, 116)),
    ("image footer right", (170, 116)),
    ("image footer control", (212, 116)),
    ("queen title/status", (258, 84)),
    ("llm title/status", (409, 44)),
    ("llm code panel", (363, 85)),
    ("llm preview left", (416, 82)),
    ("llm preview middle", (454, 82)),
    ("llm preview right", (492, 82)),
    ("llm footer type", (406, 120)),
    ("llm footer chat", (435, 120)),
    ("llm footer document", (465, 120)),
    ("llm footer control", (494, 120)),
    ("guard title/status", (101, 161)),
    ("guard left display", (45, 195)),
    ("guard worker display", (93, 203)),
    ("guard shield panel", (146, 200)),
    ("guard footer quality", (48, 234)),
    ("guard footer content", (117, 234)),
    ("guard footer proof", (198, 234)),
    ("treasury title/status", (410, 162)),
    ("treasury hex control", (466, 192)),
    ("treasury balance/chart", (425, 239)),
    ("storage title/status", (105, 279)),
    ("storage shelves left", (50, 304)),
    ("storage shelves middle-left", (115, 300)),
    ("storage shelves middle-right", (176, 300)),
    ("storage shelves right", (225, 303)),
    ("storage footer artifacts", (50, 339)),
    ("storage footer memories", (124, 339)),
    ("storage footer size", (206, 339)),
    ("scout title/count", (335, 291)),
    ("worker title/count", (452, 291)),
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

EXPECTED_STRONG_REDACTION_NAMES = frozenset(
    {
        "image title/status",
        "image footer left",
        "image footer middle",
        "image footer right",
        "image footer control",
        "queen title/status",
        "llm title/status",
        "llm code panel",
        "llm footer type",
        "llm footer chat",
        "llm footer document",
        "llm footer control",
        "guard title/status",
        "guard footer quality",
        "guard footer content",
        "guard footer proof",
        "treasury title/status",
        "treasury balance/chart",
        "storage title/status",
        "storage footer artifacts",
        "storage footer memories",
        "storage footer size",
        "scout title/count",
        "worker title/count",
    }
)

EXPECTED_CRITICAL_REDACTION_NAMES = frozenset(
    {
        "guard title/status",
        "treasury title/status",
        "treasury balance/chart",
        "storage title/status",
    }
)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def validate_redaction_configuration() -> None:
    width, height = EXPECTED_SIZE
    region_names = tuple(region.name for region in REDACTION_REGIONS)
    actual_names = frozenset(region_names)
    require(
        len(region_names) == len(actual_names),
        "redaction region names must be unique",
    )
    require(
        actual_names == REQUIRED_REGION_NAMES,
        "redaction region names do not match the required fixed set",
    )

    for region in REDACTION_REGIONS:
        require(len(region.box) == 4, f"invalid box for {region.name}")
        require(
            all(isinstance(value, int) for value in region.box),
            f"box coordinates must be integers for {region.name}",
        )
        left, top, right, bottom = region.box
        require(left < right and top < bottom, f"unordered box for {region.name}")
        require(
            0 <= left < right <= width and 0 <= top < bottom <= height,
            f"out-of-bounds box for {region.name}",
        )
        require(isinstance(region.radius, int), f"radius must be an integer for {region.name}")
        require(
            0 <= region.radius <= min(right - left, bottom - top) // 2,
            f"invalid radius for {region.name}",
        )

    evidence_names = tuple(name for name, _point in EVIDENCE_TARGET_POINTS)
    evidence_points = tuple(point for _name, point in EVIDENCE_TARGET_POINTS)
    require(
        len(evidence_names) == len(set(evidence_names)),
        "evidence target names must be unique",
    )
    require(
        frozenset(evidence_names) == REQUIRED_REGION_NAMES,
        "evidence targets do not match the required fixed region set",
    )
    require(
        len(evidence_points) == len(set(evidence_points)),
        "evidence target points must be unique",
    )
    for name, point in EVIDENCE_TARGET_POINTS:
        require(len(point) == 2, f"invalid evidence target for {name}")
        x, y = point
        require(
            isinstance(x, int) and isinstance(y, int) and 0 <= x < width and 0 <= y < height,
            f"out-of-bounds evidence target for {name}: {point}",
        )

    require(
        len(PROTECTED_POINTS) == len(set(PROTECTED_POINTS)),
        "protected points must be unique",
    )
    for point in PROTECTED_POINTS:
        require(len(point) == 2, f"invalid protected point: {point}")
        x, y = point
        require(
            isinstance(x, int) and isinstance(y, int) and 0 <= x < width and 0 <= y < height,
            f"out-of-bounds protected point: {point}",
        )

    for label, names, expected_names in (
        ("strong", STRONG_REDACTION_NAMES, EXPECTED_STRONG_REDACTION_NAMES),
        ("critical", CRITICAL_REDACTION_NAMES, EXPECTED_CRITICAL_REDACTION_NAMES),
    ):
        require(bool(names), f"{label} redaction names must not be empty")
        require(names <= actual_names, f"{label} redaction names must be actual regions")
        require(names == expected_names, f"{label} redaction names do not match the fixed set")


def render_mask(regions: tuple[RedactionRegion, ...]) -> Image.Image:
    mask = Image.new("L", EXPECTED_SIZE, 0)
    draw = ImageDraw.Draw(mask)
    for region in regions:
        draw.rounded_rectangle(region.box, radius=region.radius, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=MASK_FEATHER_RADIUS))
    return mask.point([0 if value < MASK_MIN_ALPHA else value for value in range(256)])


def build_redaction_mask() -> Image.Image:
    validate_redaction_configuration()
    mask = render_mask(REDACTION_REGIONS)

    require(mask.mode == "L", "redaction mask must use L mode")
    require(mask.size == EXPECTED_SIZE, "redaction mask has unexpected dimensions")
    for point in PROTECTED_POINTS:
        value = mask.getpixel(point)
        require(
            isinstance(value, int) and value == 0,
            f"redaction mask leaked into {point}",
        )
    for name, point in EVIDENCE_TARGET_POINTS:
        value = mask.getpixel(point)
        require(
            isinstance(value, int) and value >= 240,
            f"redaction mask missed {name} at {point}",
        )

    histogram = mask.histogram()
    pixel_count = EXPECTED_SIZE[0] * EXPECTED_SIZE[1]
    nonzero_percent = 100 * (pixel_count - histogram[0]) / pixel_count
    strong_percent = 100 * sum(histogram[128:]) / pixel_count
    require(
        nonzero_percent > MIN_MASK_NONZERO_PERCENT,
        f"redaction mask coverage is too low: {nonzero_percent:.2f}%",
    )
    require(
        strong_percent > MIN_MASK_STRONG_PERCENT,
        f"strong redaction mask coverage is too low: {strong_percent:.2f}%",
    )
    require(
        nonzero_percent < MAX_MASK_NONZERO_PERCENT,
        f"redaction mask is too broad: {nonzero_percent:.2f}%",
    )
    require(
        strong_percent < MAX_MASK_STRONG_PERCENT,
        f"strong redaction mask is too broad: {strong_percent:.2f}%",
    )
    return mask


def luminance_stddev(image: Image.Image, box: tuple[int, int, int, int]) -> float:
    return ImageStat.Stat(image.crop(box).convert("L")).stddev[0]


def build_backdrop(source: Image.Image) -> Image.Image:
    require(source.mode == "RGB", "source working image must use RGB mode")
    require(source.size == EXPECTED_SIZE, "source working image has unexpected dimensions")

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

    require(backdrop.mode == "RGB", "derived backdrop must use RGB mode")
    require(backdrop.size == EXPECTED_SIZE, "derived backdrop has unexpected dimensions")
    outside_selector = mask.point(lambda value: 255 if value == 0 else 0)
    outside_difference = Image.composite(
        ImageChops.difference(backdrop, source),
        Image.new("RGB", EXPECTED_SIZE, 0),
        outside_selector,
    )
    require(outside_difference.getbbox() is None, "pixels outside the mask changed")
    for name, box in FORMER_CHAMBER_REGIONS:
        source_stddev = luminance_stddev(source, box)
        backdrop_stddev = luminance_stddev(backdrop, box)
        require(
            backdrop_stddev >= source_stddev * MIN_LUMINANCE_STDDEV_RATIO,
            f"{name} chamber texture collapsed: {source_stddev:.2f} -> {backdrop_stddev:.2f}",
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


def validate_encoded_output(output_bytes: bytes) -> None:
    try:
        with Image.open(BytesIO(output_bytes)) as production_image:
            require(production_image.format == "WEBP", "derived output must be WebP")
            require(production_image.mode == "RGB", "derived output must use RGB mode")
            require(
                production_image.size == EXPECTED_SIZE,
                "derived output has unexpected dimensions",
            )
            production_image.load()
    except (OSError, ValueError) as error:
        raise RuntimeError("derived output is not a valid decodable image") from error


def atomic_replace_bytes(path: Path, data: bytes) -> None:
    temporary_path: Path | None = None
    try:
        destination_mode = path.stat().st_mode & 0o777 if path.exists() else 0o644
        file_descriptor, temporary_name = tempfile.mkstemp(
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
        )
        temporary_path = Path(temporary_name)
        with os.fdopen(file_descriptor, "wb") as temporary_file:
            os.fchmod(temporary_file.fileno(), destination_mode)
            temporary_file.write(data)
            temporary_file.flush()
            os.fsync(temporary_file.fileno())
        os.replace(temporary_path, path)
        temporary_path = None
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


def main() -> None:
    require(pillow_version == PILLOW_VERSION, "Pillow version mismatch")
    libwebp_version = features.version("webp")
    require(libwebp_version == LIBWEBP_VERSION, "libwebp version mismatch")
    source_bytes = SOURCE_PATH.read_bytes()
    source_hash = sha256(source_bytes)
    require(
        source_hash == SOURCE_SHA256,
        f"immutable source hash mismatch: {source_hash}",
    )

    try:
        with Image.open(BytesIO(source_bytes)) as source_image:
            require(source_image.format == "WEBP", "source must be WebP")
            require(source_image.size == EXPECTED_SIZE, "unexpected source dimensions")
            require(source_image.mode == "RGB", "source must use RGB mode")
            source_image.load()
            source = source_image.copy()
    except (OSError, ValueError) as error:
        raise RuntimeError("source is not a valid decodable image") from error

    backdrop = build_backdrop(source)
    output_bytes = encode(backdrop)
    require(output_bytes == encode(backdrop), "WebP encoding is not deterministic")
    output_hash = sha256(output_bytes)
    require(
        output_hash == OUTPUT_SHA256,
        f"derived output hash mismatch: {output_hash}",
    )
    validate_encoded_output(output_bytes)
    atomic_replace_bytes(OUTPUT_PATH, output_bytes)

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
