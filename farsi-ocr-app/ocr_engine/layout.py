"""Page layout analysis: find the column gutter, segment the page into
content blocks, and split those blocks into full-width 'bands' (tables,
algorithms, figures that break the two-column rule) and two-column text
bands, matching how these books are actually typeset."""
import cv2
import numpy as np

MIN_GUTTER_WIDTH = 18
LINE_PITCH_MIN = 16
LINE_PITCH_MAX = 75


def binarize_ink(img_bgr):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    return bw


def detect_gutter(bw, search_frac=(0.28, 0.72), row_frac_thresh=0.03):
    """Find the vertical whitespace band that separates the two columns.
    Uses the *fraction of rows* that have any ink at each column (not the
    summed ink density), so a table or figure that only occupies part of
    the page's height can't drag the whole-page gutter estimate off to one
    side. Returns (center_x, gutter_lo, gutter_hi)."""
    h, w = bw.shape[:2]
    col_row_frac = (bw > 0).mean(axis=0)
    lo = int(w * search_frac[0])
    hi = int(w * search_frac[1])
    window = col_row_frac[lo:hi]
    below = window < row_frac_thresh

    best_start, best_len = None, 0
    cur_start, cur_len = None, 0
    for i, v in enumerate(below):
        if v:
            if cur_start is None:
                cur_start = i
            cur_len += 1
        else:
            if cur_len > best_len:
                best_start, best_len = cur_start, cur_len
            cur_start, cur_len = None, 0
    if cur_len > best_len:
        best_start, best_len = cur_start, cur_len

    if best_start is not None and best_len >= MIN_GUTTER_WIDTH:
        gutter_lo = lo + best_start
        gutter_hi = gutter_lo + best_len
        return (gutter_lo + gutter_hi) // 2, gutter_lo, gutter_hi

    center = w // 2
    return center, center - 5, center + 5


def find_blocks(bw, dilate_x=20, dilate_y=11, min_area=350):
    """Merge ink into paragraph-level blobs and return their bounding boxes."""
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (dilate_x, dilate_y))
    dil = cv2.dilate(bw, kernel, iterations=1)
    contours, _ = cv2.findContours(dil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    blocks = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w * h < min_area or w < 6 or h < 6:
            continue
        blocks.append((x, y, w, h))
    blocks.sort(key=lambda b: (b[1], b[0]))
    return blocks


def is_spanning(block, gutter_lo, gutter_hi, margin=6):
    x, y, w, h = block
    return x < gutter_lo - margin and (x + w) > gutter_hi + margin


def find_spanning_y_ranges(bw, gutter_lo, gutter_hi, min_ink_width=4, gap_tol=110,
                            min_height=80, min_density=0.15):
    """Find Y-ranges of content that genuinely breaks the two-column rule
    (a table, a flowchart, a full-width figure). Real spanning content
    leaves actual ink inside the gutter's whitespace zone -- a table
    border, a flowchart box or connector, image content; ordinary column
    text essentially never does, since that zone is exactly the whitespace
    that made it a gutter. A single stray antialiasing/scan-noise pixel can
    still land in that zone by chance over thousands of rows, so a hit row
    must have a real ink run (>= min_ink_width) to count, and a merged
    range must be reasonably tall and reasonably dense with hits (not a
    handful of scattered pixels the gap tolerance happened to bridge)
    before it's trusted as a genuine full-width block. This favours
    precision over recall: content this test misses still gets OCR'd as
    ordinary column text, and a large embedded graphic missed here is
    still caught separately by the per-column graphic check."""
    if gutter_hi <= gutter_lo:
        return []
    zone = bw[:, gutter_lo:gutter_hi]
    widths = zone.sum(axis=1) / 255.0
    has_ink = widths >= min_ink_width

    runs = []
    start = None
    for i, v in enumerate(has_ink):
        if v and start is None:
            start = i
        elif not v and start is not None:
            runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, len(has_ink)))
    if not runs:
        return []

    merged = [[runs[0][0], runs[0][1], runs[0][1] - runs[0][0]]]
    for s, e in runs[1:]:
        if s - merged[-1][1] <= gap_tol:
            merged[-1][1] = e
            merged[-1][2] += e - s
        else:
            merged.append([s, e, e - s])

    out = []
    for s, e, hitlen in merged:
        if e - s < min_height:
            continue
        if hitlen / (e - s) >= min_density:
            out.append((s, e))
    return out


def merge_bands(y_ranges, page_height, pad=10, gap_tol=18):
    """Merge a list of (y0, y1) intervals into full-width bands, with padding."""
    if not y_ranges:
        return []
    intervals = sorted([(max(0, y0 - pad), min(page_height, y1 + pad)) for y0, y1 in y_ranges])
    merged = [list(intervals[0])]
    for s, e in intervals[1:]:
        if s <= merged[-1][1] + gap_tol:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return [tuple(m) for m in merged]


def _find_line_runs(row_density, thresh_frac=0.12):
    if row_density.size == 0:
        return []
    mx = row_density.max()
    if mx <= 0:
        return []
    thresh = max(1.0, mx * thresh_frac)
    above = row_density > thresh
    runs = []
    start = None
    for i, v in enumerate(above):
        if v and start is None:
            start = i
        elif not v and start is not None:
            runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, len(above)))
    return runs


def midtone_fraction(gray_block):
    """Fraction of pixels that are neither near-white background nor solid
    dark ink. Photos, gradients and shaded diagrams have a lot of these;
    plain printed text on white paper has very little."""
    if gray_block.size == 0:
        return 0.0
    return float(((gray_block > 50) & (gray_block < 215)).mean())


def is_graphic_region(color_block, bw_block, min_h=170, min_w=170,
                       midtone_hi=0.20, midtone_lo=0.075):
    """Decide whether a sub-region embedded in the page (or in a single
    column) is a photo/chart/diagram rather than running text."""
    h, w = bw_block.shape[:2]
    if h < min_h or w < min_w:
        return False
    gray = cv2.cvtColor(color_block, cv2.COLOR_BGR2GRAY)
    mt = midtone_fraction(gray)
    if mt > midtone_hi:
        return True
    if mt > midtone_lo and not looks_like_text(bw_block):
        return True
    return False


def looks_like_text(bw_block):
    """Classify a block as flowing text (regular line pitch) vs a graphic
    (table/figure/algorithm/photo/chart) by checking whether horizontal ink
    bands repeat at a fairly regular pitch, the way text lines do."""
    h, w = bw_block.shape[:2]
    if h == 0 or w == 0:
        return True
    row_density = bw_block.sum(axis=1) / 255.0
    runs = _find_line_runs(row_density)
    if len(runs) < 3:
        return True
    centers = [ (a + b) / 2.0 for a, b in runs ]
    pitches = [c2 - c1 for c1, c2 in zip(centers, centers[1:])]
    pitches = [p for p in pitches if p > 3]
    if len(pitches) < 2:
        return True
    mean_p = float(np.mean(pitches))
    std_p = float(np.std(pitches))
    if mean_p <= 0:
        return True
    cv = std_p / mean_p
    in_range = LINE_PITCH_MIN <= mean_p <= LINE_PITCH_MAX
    return in_range and cv < 0.45
