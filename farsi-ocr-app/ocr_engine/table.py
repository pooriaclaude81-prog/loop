"""Detect ruled table grids and reconstruct them as text tables."""
import cv2
import numpy as np

from . import ocr as ocr_mod


def _cluster_positions(mask_1d, min_gap=6):
    positions = np.where(mask_1d)[0]
    if len(positions) == 0:
        return []
    clusters = []
    start = positions[0]
    prev = positions[0]
    for p in positions[1:]:
        if p - prev > min_gap:
            clusters.append((start + prev) // 2)
            start = p
        prev = p
    clusters.append((start + prev) // 2)
    return clusters


def _grid_lines(bw_block):
    h, w = bw_block.shape[:2]
    hk = cv2.getStructuringElement(cv2.MORPH_RECT, (max(25, w // 12), 1))
    vk = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(25, h // 12)))
    horiz = cv2.erode(bw_block, hk)
    horiz = cv2.dilate(horiz, hk)
    vert = cv2.erode(bw_block, vk)
    vert = cv2.dilate(vert, vk)

    row_has_line = (horiz.sum(axis=1) / 255.0) > (0.45 * w)
    col_has_line = (vert.sum(axis=0) / 255.0) > (0.45 * h)

    h_lines = _cluster_positions(row_has_line)
    v_lines = _cluster_positions(col_has_line)
    return h_lines, v_lines


def _whitespace_column_gaps(bw_block, min_gap_width=14, density_thresh=0.025, edge_margin=20):
    """Find vertical whitespace gaps common across (almost) the whole
    block height -- column separators for tables that rely on aligned
    whitespace rather than a drawn vertical rule between every column
    (very common in these books: horizontal rules mark rows, columns are
    just aligned text)."""
    h, w = bw_block.shape[:2]
    col_row_frac = (bw_block > 0).mean(axis=0)
    below = col_row_frac < density_thresh
    runs = []
    start = None
    for i, v in enumerate(below):
        if v and start is None:
            start = i
        elif not v and start is not None:
            runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, len(below)))
    centers = []
    for s, e in runs:
        if e - s >= min_gap_width and s > edge_margin and e < w - edge_margin:
            centers.append((s + e) // 2)
    return centers


def _whitespace_row_gaps(bw_block, min_gap_height=10, density_thresh=0.985, edge_margin=8):
    """Find horizontal whitespace bands common across the block's full
    width -- row separators for tables whose rows are only implied by
    spacing, not a drawn rule under every row (common once past the
    header in these books)."""
    h, w = bw_block.shape[:2]
    row_ink_frac = (bw_block > 0).mean(axis=1)
    is_blank = row_ink_frac < 0.01
    runs = []
    start = None
    for i, v in enumerate(is_blank):
        if v and start is None:
            start = i
        elif not v and start is not None:
            runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, len(is_blank)))
    centers = []
    for s, e in runs:
        if e - s >= min_gap_height and s > edge_margin and e < h - edge_margin:
            centers.append((s + e) // 2)
    return centers


def detect_table(bw_block, min_rows=2, min_cols=2):
    """Return (h_lines, v_lines) if the block looks like a real table --
    row boundaries either drawn or implied by whitespace, and column
    boundaries either drawn or implied by consistent whitespace gaps --
    else None."""
    h_lines_drawn, v_lines_drawn = _grid_lines(bw_block)
    h_gaps = _whitespace_row_gaps(bw_block)
    h_combined = sorted(set(int(v) for v in h_lines_drawn) | set(h_gaps))
    h_merged = []
    for y in h_combined:
        if h_merged and y - h_merged[-1] < 14:
            continue
        h_merged.append(y)
    height = bw_block.shape[0]
    full_h_lines = sorted(set([0] + h_merged + [height]))
    if len(full_h_lines) < min_rows + 1:
        return None

    gaps = _whitespace_column_gaps(bw_block, edge_margin=60)
    combined = sorted(set(int(v) for v in v_lines_drawn) | set(gaps))
    merged = []
    for x in combined:
        if merged and x - merged[-1] < 45:
            continue
        merged.append(x)

    w = bw_block.shape[1]
    full_v_lines = sorted(set([0] + merged + [w]))
    if len(full_v_lines) < min_cols + 1:
        return None
    return full_h_lines, full_v_lines


def extract_table_text(gray_block, bw_block, lang, tessdata_dir):
    grid = detect_table(bw_block)
    if grid is None:
        return None
    h_lines, v_lines = grid
    pad = 5
    rows = []
    for i in range(len(h_lines) - 1):
        y0, y1 = h_lines[i] + pad, h_lines[i + 1] - pad
        if y1 <= y0:
            y0, y1 = h_lines[i], h_lines[i + 1]
        row_cells = []
        for j in range(len(v_lines) - 1):
            x0, x1 = v_lines[j] + pad, v_lines[j + 1] - pad
            if x1 <= x0:
                x0, x1 = v_lines[j], v_lines[j + 1]
            cell = gray_block[max(0, y0):y1, max(0, x0):x1]
            text = ocr_mod.ocr_cell_text(cell, lang, tessdata_dir)
            row_cells.append(text)
        rows.append(row_cells)

    if not rows or not rows[0]:
        return None

    ncols = max(len(r) for r in rows)
    for r in rows:
        while len(r) < ncols:
            r.append("")

    lines = []
    header = rows[0]
    lines.append("| " + " | ".join(c if c else " " for c in header) + " |")
    lines.append("|" + "|".join(["---"] * ncols) + "|")
    for r in rows[1:]:
        lines.append("| " + " | ".join(c if c else " " for c in r) + " |")
    return "\n".join(lines)
