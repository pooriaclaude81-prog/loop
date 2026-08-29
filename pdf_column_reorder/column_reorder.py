from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path
from typing import Literal, Optional

import numpy as np
from PIL import Image

try:
    import pymupdf as fitz  # modern import name
except ImportError:  # pragma: no cover
    import fitz  # type: ignore


SegmentKind = Literal["two_column", "full_width"]

DETECT_DPI = 150
# A chunk is a thin horizontal strip analyzed independently while scanning
# a page top-to-bottom for whether the gutter is clear (two columns) or
# bridged by ink (a table, figure, algorithm box, heading, etc).
CHUNK_FRAC = 0.006          # chunk height as a fraction of page height
GUTTER_MARGIN_FRAC = 0.0045  # half-width of the gutter probe window - deliberately narrow
GUTTER_MARGIN_MIN_PX = 2
GUTTER_INK_THRESHOLD = 0.30  # ink density inside the probe window that counts as "bridged"
RULE_CHECK_FRAC = (0.12, 0.88)  # x-range (as a fraction of width) checked for a page-wide rule/border
RULE_ROW_THRESHOLD = 0.85   # ink coverage across that whole range that counts as a solid rule
CLOSE_GAP_PT = 45.0         # bridge full-width gaps (e.g. a blank row inside a table) up to this tall
RULE_PAIR_CLOSE_GAP_PT = 260.0  # a much larger bridge, but only between two solid rules (a box's top/bottom border)
MIN_COLUMN_INK = 0.02       # minimum ink density that counts as "this side has real text"
MIN_SEGMENT_PT = 4.0        # drop/merge segments shorter than this once converted to points
PAGE_TWO_COLUMN_CONFIDENCE = 0.45   # below this, treat the whole page as single-column passthrough
PAGE_TWO_COLUMN_MIN_COVERAGE = 0.30  # and require at least this much of the page to look two-column


@dataclass
class Detection:
    split_x_px: int
    confidence: float
    left_ink: float
    right_ink: float
    gutter_score: float
    width_px: int
    height_px: int
    gutter_left_px: int = 0
    gutter_right_px: int = 0


@dataclass
class Segment:
    """One horizontal band of a page, in PDF point space (origin top-left, y down)."""
    y0: float
    y1: float
    kind: SegmentKind
    split_x: Optional[float]  # only set for "two_column"


@dataclass
class PageResult:
    page_number: int
    detection: Detection
    segments: list[Segment]
    is_two_column_page: bool
    reconstruction: str  # "vector" or "raster"
    dropped_segments: int
    out_width_pt: float
    out_height_pt: float


@dataclass
class ProcessStats:
    pages: list[PageResult]
    input_bytes: int
    output_bytes: int

    @property
    def compression_ratio(self) -> float:
        if self.input_bytes <= 0:
            return 0.0
        return 1.0 - (self.output_bytes / self.input_bytes)


# --------------------------------------------------------------------------
# Rendering helpers
# --------------------------------------------------------------------------

def _render_page(page: "fitz.Page", dpi: int) -> Image.Image:
    scale = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False, annots=True)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def _smooth_1d(values: np.ndarray, radius: int) -> np.ndarray:
    radius = max(1, int(radius))
    kernel = np.ones(2 * radius + 1, dtype=np.float32)
    kernel /= kernel.sum()
    return np.convolve(values, kernel, mode="same")


def _adaptive_threshold(work: np.ndarray) -> float:
    bg = np.percentile(work, 92)
    return float(np.clip(bg - 28.0, 150.0, 235.0))


# --------------------------------------------------------------------------
# Gutter (whole-page) detection - used as the primary split candidate and
# as a page-level "is this even a two-column page" signal.
# --------------------------------------------------------------------------

def detect_gutter(image: Image.Image, center_min=0.28, center_max=0.72) -> Detection:
    """Find the vertical whitespace gutter between two columns.

    Works on rendered pixels rather than PDF text objects, so it survives
    scanned pages, tables, photos, mixed fonts, and other page content.
    """
    gray = np.asarray(image.convert("L"), dtype=np.uint8)
    h, w = gray.shape

    y0 = int(h * 0.04)
    y1 = int(h * 0.96)
    work = gray[y0:y1]

    target_w = min(1100, w)
    if w > target_w:
        scale = target_w / w
        det_w = target_w
        det_h = max(1, int(round(h * scale)))
        det_img = image.convert("L").resize((det_w, det_h), Image.Resampling.BILINEAR)
        gray_d = np.asarray(det_img, dtype=np.uint8)
        y0d = int(det_h * 0.04)
        y1d = int(det_h * 0.96)
        work = gray_d[y0d:y1d]
        scale_back = w / det_w
    else:
        scale_back = 1.0

    threshold = _adaptive_threshold(work)
    ink = work < threshold

    col_score = ink.mean(axis=0).astype(np.float32)
    smooth = _smooth_1d(col_score, max(4, int(len(col_score) * 0.004)))

    lo = int(len(smooth) * center_min)
    hi = int(len(smooth) * center_max)
    center = smooth[lo:hi]
    if center.size == 0:
        raise ValueError("Page is too small for gutter detection")

    candidate = int(np.argmin(center)) + lo

    band = max(10, int(len(smooth) * 0.08))
    left_a = max(0, candidate - 4 * band)
    left_b = max(0, candidate - band)
    right_a = min(len(smooth), candidate + band)
    right_b = min(len(smooth), candidate + 4 * band)
    left_ink = float(np.mean(smooth[left_a:left_b])) if left_b > left_a else 0.0
    right_ink = float(np.mean(smooth[right_a:right_b])) if right_b > right_a else 0.0

    side_ref = max(1e-6, min(left_ink, right_ink))
    gutter_score = float(max(0.0, 1.0 - smooth[candidate] / side_ref))
    confidence = float(np.clip(gutter_score * 1.15, 0.0, 1.0))

    split_x = int(round(candidate * scale_back))
    split_x = int(np.clip(split_x, int(w * 0.2), int(w * 0.8)))

    # Walk outward from the candidate to find the actual edges of the
    # low-ink valley, i.e. how wide the visual gutter gap really is. This
    # lets downstream band segmentation probe the whole gap rather than a
    # single point, without ever reaching into genuine column text.
    valley_thresh = max(0.015, side_ref * 0.20)
    li = candidate
    max_reach = max(4, int(len(smooth) * 0.06))
    while li > 0 and (candidate - li) < max_reach and smooth[li] < valley_thresh:
        li -= 1
    ri = candidate
    while ri < len(smooth) - 1 and (ri - candidate) < max_reach and smooth[ri] < valley_thresh:
        ri += 1
    gutter_left_px = int(np.clip(round(li * scale_back), 0, w))
    gutter_right_px = int(np.clip(round(ri * scale_back), 0, w))
    if gutter_right_px <= gutter_left_px:
        gutter_left_px, gutter_right_px = max(0, split_x - 2), min(w, split_x + 2)

    return Detection(
        split_x_px=split_x,
        confidence=confidence,
        left_ink=left_ink,
        right_ink=right_ink,
        gutter_score=gutter_score,
        width_px=w,
        height_px=h,
        gutter_left_px=gutter_left_px,
        gutter_right_px=gutter_right_px,
    )


# --------------------------------------------------------------------------
# Band segmentation: for each thin horizontal strip, decide whether the
# gutter around split_x is clear (two independent columns) or bridged by
# ink (a table, figure, algorithm box, full-width heading, ...).
# --------------------------------------------------------------------------

def _runs(labels: list[str]) -> list[list]:
    runs: list[list] = []
    start = 0
    for i in range(1, len(labels) + 1):
        if i == len(labels) or labels[i] != labels[start]:
            runs.append([start, i, labels[start]])
            start = i
    return runs


def _close_gaps(labels: list[str], target: str, max_gap: int, blocked: Optional[list[bool]] = None) -> list[str]:
    """Morphological "closing": a run of the *other* label sandwiched between
    two `target` runs and no longer than max_gap is converted to `target`.
    This bridges e.g. a blank row between a table's border and its next
    gridline, so a table/algorithm box reads as one continuous block instead
    of a scatter of thin slivers.

    If `blocked` is given, a gap is never closed through a chunk marked True
    there - used to stop a large bridge from swallowing a gap that actually
    contains genuine independent left+right column text (evidence a bare
    gap length can't tell apart from the sparse interior of a one-sided box).
    """
    if not labels:
        return labels
    labels = labels[:]
    changed = True
    guard = 0
    while changed and guard < len(labels) + 10:
        changed = False
        guard += 1
        runs = _runs(labels)
        if len(runs) <= 2:
            break
        for idx in range(1, len(runs) - 1):
            s, e, lab = runs[idx]
            if lab == target:
                continue
            if (e - s) > max_gap:
                continue
            if blocked is not None and any(blocked[s:e]):
                continue
            if runs[idx - 1][2] == target and runs[idx + 1][2] == target:
                for i in range(s, e):
                    labels[i] = target
                changed = True
                break
    return labels


def _segment_bands(
    gray: np.ndarray,
    split_x_px: int,
    gutter_left_px: Optional[int] = None,
    gutter_right_px: Optional[int] = None,
    detect_dpi: int = DETECT_DPI,
) -> list[tuple[int, int, str]]:
    """Scan a page (grayscale pixel array) top-to-bottom in thin chunks and
    label each chunk "two_column" (gutter clear) or "full_width" (gutter
    bridged by ink). Returns merged (y0, y1, kind) runs in pixel space.

    The probe window is the actual measured gutter gap (gutter_left_px..
    gutter_right_px) when available, inset slightly so it never reaches
    into genuine column text; otherwise it falls back to a narrow fixed
    window around split_x_px.
    """
    h, w = gray.shape
    threshold = _adaptive_threshold(gray)
    ink = gray < threshold

    if gutter_left_px is not None and gutter_right_px is not None and gutter_right_px - gutter_left_px >= 4:
        span = gutter_right_px - gutter_left_px
        inset = max(1, int(round(span * 0.25)))
        x0 = gutter_left_px + inset
        x1 = gutter_right_px - inset
        if x1 <= x0:
            x0, x1 = gutter_left_px, gutter_right_px
    else:
        margin = max(GUTTER_MARGIN_MIN_PX, int(round(w * GUTTER_MARGIN_FRAC)))
        x0 = max(0, split_x_px - margin)
        x1 = min(w, split_x_px + margin)
        if x1 <= x0:
            x0, x1 = max(0, split_x_px - 1), min(w, split_x_px + 1)
    # Per-row coverage of the probe window. A genuine border/rule/dense text
    # crossing the gutter covers most of the window's width on its row(s); a
    # stray glyph edge from ordinary column text only ever grazes a sliver of
    # it. Thresholding per row (rather than averaging density over a whole
    # multi-row chunk) is what lets a single-pixel-thin table border register
    # at full strength instead of being diluted by the blank rows around it.
    row_density = ink[:, x0:x1].mean(axis=1)
    row_is_bridge = row_density > GUTTER_INK_THRESHOLD

    # Independent second signal: a near-solid horizontal rule spanning most
    # of the two-column text block (a table/algorithm-box border, a section
    # divider, ...). Real two-column body text essentially never has ~85%+
    # ink coverage across that whole span on one row, so this is a strong,
    # low-false-positive way to catch a box border whose interior content
    # happens not to reach the exact original gutter position.
    rule_x0 = int(round(w * RULE_CHECK_FRAC[0]))
    rule_x1 = int(round(w * RULE_CHECK_FRAC[1]))
    if rule_x1 > rule_x0:
        row_is_rule = ink[:, rule_x0:rule_x1].mean(axis=1) > RULE_ROW_THRESHOLD
    else:
        row_is_rule = np.zeros(h, dtype=bool)
    row_is_bridge = row_is_bridge | row_is_rule

    chunk = max(3, int(round(h * CHUNK_FRAC)))
    n_chunks = int(np.ceil(h / chunk))
    if n_chunks <= 0:
        return [(0, h, "two_column")]

    # Evidence of genuine, independent left+right column text: both sides of
    # the gutter carry meaningful ink. A one-sided box interior (e.g. short,
    # left-aligned pseudocode with nothing on the right) never satisfies
    # this, which is what tells it apart from a real two-column paragraph
    # sitting between two full-width elements.
    left_gx = gutter_left_px if gutter_left_px is not None else split_x_px
    right_gx = gutter_right_px if gutter_right_px is not None else split_x_px
    left_zone = (rule_x0, max(rule_x0, left_gx))
    right_zone = (min(rule_x1, right_gx), rule_x1)
    if left_zone[1] > left_zone[0]:
        left_col_density = ink[:, left_zone[0]:left_zone[1]].mean(axis=1)
    else:
        left_col_density = np.zeros(h, dtype=np.float32)
    if right_zone[1] > right_zone[0]:
        right_col_density = ink[:, right_zone[0]:right_zone[1]].mean(axis=1)
    else:
        right_col_density = np.zeros(h, dtype=np.float32)
    row_looks_two_col = (left_col_density > MIN_COLUMN_INK) & (right_col_density > MIN_COLUMN_INK)

    labels: list[str] = []
    rule_labels: list[str] = []
    blocked: list[bool] = []
    for c in range(n_chunks):
        r0 = c * chunk
        r1 = min(h, r0 + chunk)
        bridging = bool(row_is_bridge[r0:r1].any()) if r1 > r0 else False
        labels.append("full_width" if bridging else "two_column")
        is_rule = bool(row_is_rule[r0:r1].any()) if r1 > r0 else False
        rule_labels.append("full_width" if is_rule else "two_column")
        looks_two_col = bool(row_looks_two_col[r0:r1].mean() > 0.5) if r1 > r0 else False
        blocked.append(looks_two_col)

    # Bridge short gaps *within* a full-width element (a blank row between a
    # table's border and its next gridline, a line of whitespace inside an
    # algorithm box, ...) so it reads as one continuous block. A thin border
    # or rule is trusted immediately - it is never eroded for being short,
    # only used to close nearby gaps.
    chunk_pt = chunk * 72.0 / detect_dpi
    close_gap_chunks = max(1, int(round(CLOSE_GAP_PT / chunk_pt)))
    labels = _close_gaps(labels, "full_width", close_gap_chunks)

    # A pair of solid full-width rules (e.g. the top and bottom border of a
    # boxed table or algorithm) is strong enough evidence of "one framed
    # element" to bridge a much larger gap than ordinary content, even if
    # nothing in between happens to touch the original gutter (a sparse,
    # left-aligned pseudocode box, for instance).
    rule_close_chunks = max(1, int(round(RULE_PAIR_CLOSE_GAP_PT / chunk_pt)))
    rule_labels = _close_gaps(rule_labels, "full_width", rule_close_chunks, blocked=blocked)
    labels = ["full_width" if (a == "full_width" or b == "full_width") else "two_column"
              for a, b in zip(labels, rule_labels)]

    segments: list[tuple[int, int, str]] = []
    cur_kind = labels[0]
    seg_start = 0
    for c in range(1, n_chunks):
        if labels[c] != cur_kind:
            segments.append((seg_start * chunk, min(h, c * chunk), cur_kind))
            cur_kind = labels[c]
            seg_start = c
    segments.append((seg_start * chunk, h, cur_kind))
    return segments


def analyze_page(
    page: "fitz.Page",
    *,
    detect_dpi: int = DETECT_DPI,
    split_offset_percent: float = 0.0,
) -> tuple[Detection, list[Segment], bool]:
    """Detect the gutter and segment a page into two_column / full_width bands.

    Returns (detection, segments_in_pdf_points, is_two_column_page).
    """
    det_image = _render_page(page, dpi=detect_dpi)
    det = detect_gutter(det_image)

    offset_px = int(round(det_image.width * split_offset_percent / 100.0))
    split_x_px = int(np.clip(
        det.split_x_px + offset_px,
        int(det_image.width * 0.15),
        int(det_image.width * 0.85),
    ))
    det.split_x_px = split_x_px
    gutter_left_px = det.gutter_left_px + offset_px
    gutter_right_px = det.gutter_right_px + offset_px

    gray = np.asarray(det_image.convert("L"), dtype=np.uint8)
    raw_segments = _segment_bands(gray, split_x_px, gutter_left_px, gutter_right_px, detect_dpi=detect_dpi)

    two_col_px = sum(y1 - y0 for y0, y1, kind in raw_segments if kind == "two_column")
    coverage = two_col_px / max(1, det_image.height)
    is_two_column_page = (
        det.confidence >= PAGE_TWO_COLUMN_CONFIDENCE
        and coverage >= PAGE_TWO_COLUMN_MIN_COVERAGE
    )

    factor = 72.0 / detect_dpi
    page_h_pt = page.rect.height

    segments: list[Segment] = []
    if not is_two_column_page:
        # Not a two-column page at all (title page, single-column article,
        # references, ...). Pass it through untouched - the include/exclude
        # toggle for "non-conforming" content does not apply here, since
        # nothing here is interrupting a two-column layout.
        segments.append(Segment(y0=0.0, y1=page_h_pt, kind="full_width", split_x=None))
        return det, segments, False

    split_x_pt = split_x_px * factor
    for y0, y1, kind in raw_segments:
        y0_pt = min(page_h_pt, y0 * factor)
        y1_pt = min(page_h_pt, y1 * factor)
        if y1_pt - y0_pt < 0.5:
            continue
        segments.append(Segment(
            y0=y0_pt,
            y1=y1_pt,
            kind=kind,
            split_x=split_x_pt if kind == "two_column" else None,
        ))

    # Merge any degenerate short segments (can appear at page edges after
    # point-space rounding) into a neighbor so downstream code never has to
    # deal with near-zero-height blocks.
    merged: list[Segment] = []
    for seg in segments:
        if merged and (seg.y1 - seg.y0) < MIN_SEGMENT_PT:
            merged[-1] = Segment(y0=merged[-1].y0, y1=seg.y1, kind=merged[-1].kind, split_x=merged[-1].split_x)
        else:
            merged.append(seg)
    if not merged:
        merged.append(Segment(y0=0.0, y1=page_h_pt, kind="full_width", split_x=None))

    return det, merged, True


# --------------------------------------------------------------------------
# Reading-order block extraction
# --------------------------------------------------------------------------

def _segments_to_blocks(
    page_rect: "fitz.Rect",
    segments: list[Segment],
    include_non_conforming: bool,
) -> tuple[list[tuple[str, "fitz.Rect"]], int]:
    """Turn segments into an ordered list of (kind, rect) blocks in source
    page coordinates, following the desired reading order: within each
    two-column run, right column first then left column; full-width blocks
    (tables, figures, algorithm boxes, headings, ...) kept intact in place.
    """
    blocks: list[tuple[str, "fitz.Rect"]] = []
    dropped = 0
    for seg in segments:
        if seg.y1 - seg.y0 < 0.5:
            continue
        if seg.kind == "full_width":
            if include_non_conforming:
                blocks.append(("full", fitz.Rect(page_rect.x0, seg.y0, page_rect.x1, seg.y1)))
            else:
                dropped += 1
            continue
        sx = seg.split_x if seg.split_x is not None else (page_rect.x0 + page_rect.x1) / 2.0
        sx = max(page_rect.x0 + 1, min(page_rect.x1 - 1, sx))
        blocks.append(("right", fitz.Rect(sx, seg.y0, page_rect.x1, seg.y1)))
        blocks.append(("left", fitz.Rect(page_rect.x0, seg.y0, sx, seg.y1)))
    return blocks, dropped


def _layout_blocks(
    blocks: list[tuple[str, "fitz.Rect"]],
    target_width: float,
    max_height: float = 14000.0,
) -> tuple[list[tuple["fitz.Rect", "fitz.Rect"]], float, float]:
    """Stack blocks vertically into a single output page, scaling each block
    so it fills target_width. Returns (placements, out_width, out_height)
    where placements is a list of (src_rect, dst_rect).
    """
    placements: list[tuple["fitz.Rect", "fitz.Rect"]] = []
    cursor_y = 0.0
    for _kind, rect in blocks:
        src_w, src_h = rect.width, rect.height
        if src_w <= 0.01 or src_h <= 0.01:
            continue
        scale = target_width / src_w
        dst_h = src_h * scale
        placements.append((rect, fitz.Rect(0, cursor_y, target_width, cursor_y + dst_h)))
        cursor_y += dst_h

    total_h = cursor_y
    out_w = target_width
    if total_h > max_height and total_h > 0:
        shrink = max_height / total_h
        out_w = target_width * shrink
        rescaled = []
        for src_rect, dst_rect in placements:
            rescaled.append((src_rect, fitz.Rect(
                dst_rect.x0 * shrink, dst_rect.y0 * shrink,
                dst_rect.x1 * shrink, dst_rect.y1 * shrink,
            )))
        placements = rescaled
        total_h = max_height

    if total_h <= 0:
        total_h = 1.0
    return placements, out_w, total_h


# --------------------------------------------------------------------------
# Page reconstruction
# --------------------------------------------------------------------------

def _vector_reconstruct_page(
    out_doc: "fitz.Document",
    src_doc: "fitz.Document",
    page: "fitz.Page",
    blocks: list[tuple[str, "fitz.Rect"]],
) -> tuple[float, float]:
    target_width = page.rect.width / 2.0
    placements, out_w, out_h = _layout_blocks(blocks, target_width)
    out_page = out_doc.new_page(width=out_w, height=out_h)
    for src_rect, dst_rect in placements:
        out_page.show_pdf_page(dst_rect, src_doc, page.number, clip=src_rect)
    return out_w, out_h


def _raster_reconstruct_page(
    out_doc: "fitz.Document",
    page: "fitz.Page",
    blocks: list[tuple[str, "fitz.Rect"]],
    *,
    dpi: int,
    jpeg_quality: int,
) -> tuple[float, float]:
    full_image = _render_page(page, dpi=dpi)
    px_per_pt = dpi / 72.0

    def to_px(rect: "fitz.Rect") -> tuple[int, int, int, int]:
        x0 = max(0, int(round(rect.x0 * px_per_pt)))
        y0 = max(0, int(round(rect.y0 * px_per_pt)))
        x1 = min(full_image.width, int(round(rect.x1 * px_per_pt)))
        y1 = min(full_image.height, int(round(rect.y1 * px_per_pt)))
        return x0, y0, max(x0 + 1, x1), max(y0 + 1, y1)

    crops = []
    for _kind, rect in blocks:
        box = to_px(rect)
        crop = full_image.crop(box)
        if crop.width > 0 and crop.height > 0:
            crops.append(crop)

    if not crops:
        crops = [full_image]

    target_w_px = min(c.width for c in crops)
    resized = []
    total_h_px = 0
    for c in crops:
        if c.width != target_w_px:
            new_h = max(1, int(round(c.height * (target_w_px / c.width))))
            c = c.resize((target_w_px, new_h), Image.Resampling.LANCZOS)
        resized.append(c)
        total_h_px += c.height

    out_img = Image.new("RGB", (target_w_px, total_h_px), "white")
    y = 0
    for c in resized:
        out_img.paste(c, (0, y))
        y += c.height

    width_pt = out_img.width * 72.0 / dpi
    height_pt = out_img.height * 72.0 / dpi
    out_page = out_doc.new_page(width=width_pt, height=height_pt)
    buf = io.BytesIO()
    out_img.save(buf, format="JPEG", quality=jpeg_quality, optimize=True)
    out_page.insert_image(out_page.rect, stream=buf.getvalue())
    return width_pt, height_pt


# --------------------------------------------------------------------------
# Image recompression pass (shrinks oversized embedded raster images that
# ride along inside vector-preserved pages, e.g. photos in a scanned figure)
# --------------------------------------------------------------------------

def optimize_images(doc: "fitz.Document", *, max_dim: int = 2000, jpeg_quality: int = 82) -> int:
    changed = 0
    seen: set[int] = set()
    for page in doc:
        for img in page.get_images(full=True):
            xref = img[0]
            if xref in seen:
                continue
            seen.add(xref)
            try:
                pix = fitz.Pixmap(doc, xref)
                if pix.colorspace is None:
                    continue
                if pix.colorspace.n not in (1, 3):
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                if pix.alpha:
                    pix = fitz.Pixmap(pix, 0)  # drop alpha
                if max(pix.width, pix.height) <= max_dim:
                    continue
                mode = "L" if pix.colorspace.n == 1 else "RGB"
                pil_img = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
                scale = max_dim / max(pix.width, pix.height)
                new_w = max(1, int(pix.width * scale))
                new_h = max(1, int(pix.height * scale))
                pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                buf = io.BytesIO()
                pil_img.save(buf, format="JPEG", quality=jpeg_quality, optimize=True)
                page.replace_image(xref, stream=buf.getvalue())
                changed += 1
            except Exception:
                continue
    return changed


# --------------------------------------------------------------------------
# Page range parsing (shared by the CLI and the UI)
# --------------------------------------------------------------------------

def parse_page_ranges(spec: str, page_count: int) -> list[int]:
    """Parse a 1-indexed, comma-separated page range spec (e.g. "1-3,5,8-10")
    into a sorted, de-duplicated list of 0-indexed page numbers, clamped to
    [0, page_count). Blank/whitespace-only spec means "all pages". Raises
    ValueError with a human-readable message on malformed input.
    """
    spec = (spec or "").strip()
    if not spec:
        return list(range(page_count))

    pages: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            bounds = part.split("-")
            if len(bounds) != 2:
                raise ValueError(f"Bad range '{part}' - use e.g. 1-3")
            a_str, b_str = bounds[0].strip(), bounds[1].strip()
            if not a_str.isdigit() or not b_str.isdigit():
                raise ValueError(f"Bad range '{part}' - use e.g. 1-3")
            a, b = int(a_str), int(b_str)
            if a > b:
                a, b = b, a
            for p in range(a, b + 1):
                if 1 <= p <= page_count:
                    pages.add(p - 1)
        else:
            if not part.isdigit():
                raise ValueError(f"Bad page number '{part}'")
            p = int(part)
            if 1 <= p <= page_count:
                pages.add(p - 1)

    if not pages:
        raise ValueError("No valid pages in range (check it's within 1.." + str(page_count) + ")")
    return sorted(pages)


# --------------------------------------------------------------------------
# Top-level pipeline
# --------------------------------------------------------------------------

def process_pdf(
    input_pdf: str | Path,
    output_pdf: str | Path,
    *,
    include_non_conforming: bool = True,
    split_offset_percent: float = 0.0,
    mode: Literal["auto", "vector", "raster"] = "auto",
    detect_dpi: int = DETECT_DPI,
    raster_dpi: int = 200,
    jpeg_quality: int = 85,
    optimize_embedded_images: bool = True,
    max_embedded_image_dim: int = 2000,
    pages: Optional[list[int]] = None,
) -> ProcessStats:
    """Rebuild every page: right column first, then left column, keeping
    tables/algorithms/figures/headings that break the two-column grid
    intact (optionally dropped via include_non_conforming=False).

    mode="auto" reconstructs each page with vector page-content clipping
    (lossless, tiny output) and only falls back to rasterization for a page
    if that fails (e.g. a malformed source page).

    `pages`, if given, is a list of 0-indexed page numbers (any order,
    duplicates fine) naming the only pages to include in the output; the
    rest of the source document is skipped entirely. Each PageResult still
    carries the page's original 1-indexed page_number, so results line up
    with the source PDF even though the output is a shorter document.
    """
    input_pdf = str(input_pdf)
    output_pdf = str(output_pdf)
    input_bytes = Path(input_pdf).stat().st_size

    src = fitz.open(input_pdf)
    out = fitz.open()
    results: list[PageResult] = []
    try:
        page_indices = list(dict.fromkeys(pages)) if pages is not None else range(len(src))
        for idx in page_indices:
            page = src[idx]
            det, segments, is_two_col = analyze_page(
                page, detect_dpi=detect_dpi, split_offset_percent=split_offset_percent
            )
            # The include/exclude toggle only ever applies to content that
            # interrupts a genuinely two-column page. A page that is not
            # two-column at all (title page, single-column article, ...) is
            # always passed through untouched.
            effective_include = include_non_conforming or not is_two_col
            blocks, dropped = _segments_to_blocks(page.rect, segments, effective_include)

            recon = "vector"
            try:
                if mode == "raster":
                    raise RuntimeError("raster mode forced")
                if not blocks:
                    out_w, out_h = page.rect.width / 2.0, 1.0
                    out.new_page(width=out_w, height=out_h)
                else:
                    out_w, out_h = _vector_reconstruct_page(out, src, page, blocks)
            except Exception:
                if mode == "vector":
                    raise
                recon = "raster"
                if not blocks:
                    out_w, out_h = page.rect.width / 2.0, 1.0
                    out.new_page(width=out_w, height=out_h)
                else:
                    out_w, out_h = _raster_reconstruct_page(
                        out, page, blocks, dpi=raster_dpi, jpeg_quality=jpeg_quality
                    )

            results.append(PageResult(
                page_number=idx + 1,
                detection=det,
                segments=segments,
                is_two_column_page=is_two_col,
                reconstruction=recon,
                dropped_segments=dropped,
                out_width_pt=out_w,
                out_height_pt=out_h,
            ))

        if optimize_embedded_images:
            optimize_images(out, max_dim=max_embedded_image_dim, jpeg_quality=jpeg_quality)

        try:
            out.subset_fonts()
        except Exception:
            pass

        out.save(
            output_pdf,
            garbage=4,
            deflate=True,
            deflate_images=True,
            deflate_fonts=True,
            clean=True,
        )
    finally:
        out.close()
        src.close()

    output_bytes = Path(output_pdf).stat().st_size
    return ProcessStats(pages=results, input_bytes=input_bytes, output_bytes=output_bytes)


# --------------------------------------------------------------------------
# Preview helpers for the UI (raster only - just for on-screen display)
# --------------------------------------------------------------------------

def preview_page(
    page: "fitz.Page",
    *,
    dpi: int = 110,
    split_offset_percent: float = 0.0,
    include_non_conforming: bool = True,
) -> tuple[Image.Image, Image.Image, Detection, list[Segment], bool]:
    """Return (annotated_before, reordered_preview, detection, segments, is_two_column_page)."""
    det, segments, is_two_col = analyze_page(
        page, detect_dpi=DETECT_DPI, split_offset_percent=split_offset_percent
    )
    before = _render_page(page, dpi=dpi)
    effective_include = include_non_conforming or not is_two_col
    blocks, _dropped = _segments_to_blocks(page.rect, segments, effective_include)
    if not blocks:
        blocks = [("full", page.rect)]

    px_per_pt = dpi / 72.0
    crops = []
    for _kind, rect in blocks:
        x0 = max(0, int(round(rect.x0 * px_per_pt)))
        y0 = max(0, int(round(rect.y0 * px_per_pt)))
        x1 = min(before.width, int(round(rect.x1 * px_per_pt)))
        y1 = min(before.height, int(round(rect.y1 * px_per_pt)))
        x1, y1 = max(x0 + 1, x1), max(y0 + 1, y1)
        crops.append(before.crop((x0, y0, x1, y1)))

    target_w = min(c.width for c in crops)
    resized = []
    total_h = 0
    for c in crops:
        if c.width != target_w:
            new_h = max(1, int(round(c.height * (target_w / c.width))))
            c = c.resize((target_w, new_h), Image.Resampling.LANCZOS)
        resized.append(c)
        total_h += c.height

    reordered = Image.new("RGB", (target_w, total_h), "white")
    y = 0
    for c in resized:
        reordered.paste(c, (0, y))
        y += c.height

    return before, reordered, det, segments, is_two_col
