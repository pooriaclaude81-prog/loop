"""Top-level orchestration: PDF -> per-page layout analysis -> OCR ->
plain text + cropped images, in the correct right-to-left column order."""
import os
import re
from dataclasses import dataclass

import cv2

from . import layout, table, algorithm_blocks, ocr as ocr_mod
from .pdf_render import render_pdf_pages, pdf_page_count
from .preprocess import crop_margins, mask_small_color_icons, clean_for_ocr


@dataclass
class OcrConfig:
    dpi: int = 300
    top_pct: float = 12.0
    bottom_pct: float = 6.0
    left_pct: float = 3.0
    right_pct: float = 3.0
    lang: str = "fas+eng"
    tessdata_dir: str = None
    rtl_columns: bool = True
    include_page_markers: bool = True
    save_block_images: bool = True


def _safe_stem(path):
    stem = os.path.splitext(os.path.basename(path))[0]
    stem = re.sub(r"[^\w\-]+", "_", stem, flags=re.UNICODE)
    return stem or "document"


MIN_FULLWIDTH_BAND_HEIGHT = 30  # ignore thin decorative rule lines


def _band_segments(spanning_y_ranges, page_height):
    bands = layout.merge_bands(spanning_y_ranges, page_height)
    bands = [(y0, y1) for (y0, y1) in bands if (y1 - y0) >= MIN_FULLWIDTH_BAND_HEIGHT]
    segments = []
    prev_end = 0
    for (y0, y1) in bands:
        if y0 > prev_end + 4:
            segments.append(("twocol", prev_end, y0))
        segments.append(("fullwidth", y0, y1))
        prev_end = y1
    if prev_end < page_height - 4:
        segments.append(("twocol", prev_end, page_height))
    if not segments:
        segments = [("twocol", 0, page_height)]
    return segments


def _ocr_column_span(page, bw, x0, x1, y0, y1, cfg, out):
    """OCR one column's vertical span as few large chunks as possible,
    carving out any embedded photo/chart sub-regions along the way so a
    single figure in the middle of a column doesn't break OCR context for
    the surrounding paragraphs."""
    if y1 - y0 < 4 or x1 - x0 < 4:
        return
    col_bw = bw[y0:y1, x0:x1]
    col_color = page[y0:y1, x0:x1]

    blocks = layout.find_blocks(col_bw, dilate_x=25, dilate_y=14, min_area=200)
    graphic_ranges = []
    for (bx, by, bw_, bh_) in blocks:
        sub_color = col_color[by:by + bh_, bx:bx + bw_]
        sub_bw = col_bw[by:by + bh_, bx:bx + bw_]
        if layout.is_graphic_region(sub_color, sub_bw):
            graphic_ranges.append((by, by + bh_))

    carve_ranges = layout.merge_bands(graphic_ranges, col_bw.shape[0], pad=4, gap_tol=10)

    cursor = 0
    for (gy0, gy1) in sorted(carve_ranges):
        if gy0 > cursor + 4:
            text_img = col_color[cursor:gy0, :]
            clean = clean_for_ocr(text_img, upscale=1.5)
            text = ocr_mod.ocr_block_text(clean, cfg.lang, cfg.tessdata_dir, psm=6).strip()
            if text:
                out.append(("text", text))
        out.append(("embedded_image", col_color[gy0:gy1, :].copy()))
        cursor = gy1
    if cursor < col_bw.shape[0] - 4:
        text_img = col_color[cursor:, :]
        clean = clean_for_ocr(text_img, upscale=1.5)
        text = ocr_mod.ocr_block_text(clean, cfg.lang, cfg.tessdata_dir, psm=6).strip()
        if text:
            out.append(("text", text))


def _process_twocol_segment(page, bw, y0, y1, gutter_center, cfg, out):
    w = page.shape[1]
    right = (gutter_center, w)
    left = (0, gutter_center)
    order = [right, left] if cfg.rtl_columns else [left, right]
    for (x0, x1) in order:
        _ocr_column_span(page, bw, x0, x1, y0, y1, cfg, out)


def _process_fullwidth_segment(page, bw, y0, y1, cfg, out):
    if y1 - y0 < 12:
        return
    crop_color = page[y0:y1, :]
    crop_bw = bw[y0:y1, :]

    md = table.extract_table_text(crop_color, crop_bw, cfg.lang, cfg.tessdata_dir)
    if md:
        out.append(("table", md, crop_color.copy()))
        return

    texts, boxes = algorithm_blocks.extract_algorithm_text(crop_color, cfg.lang, cfg.tessdata_dir)
    if texts:
        out.append(("algorithm", texts, crop_color.copy()))
        return

    clean = clean_for_ocr(crop_color, upscale=1.3)
    label_text = ocr_mod.ocr_block_text(clean, cfg.lang, cfg.tessdata_dir, psm=11).strip()
    out.append(("figure", label_text, crop_color.copy()))


def process_page(img_bgr_full, cfg, page_no, img_out_dir, img_prefix):
    page = crop_margins(img_bgr_full, cfg.top_pct, cfg.bottom_pct, cfg.left_pct, cfg.right_pct)
    page = mask_small_color_icons(page)
    bw = layout.binarize_ink(page)
    gutter_center, gutter_lo, gutter_hi = layout.detect_gutter(bw)
    spanning_ranges = layout.find_spanning_y_ranges(bw, gutter_lo, gutter_hi)

    segments = _band_segments(spanning_ranges, page.shape[0])

    raw = []
    for kind, y0, y1 in segments:
        if kind == "twocol":
            _process_twocol_segment(page, bw, y0, y1, gutter_center, cfg, raw)
        else:
            _process_fullwidth_segment(page, bw, y0, y1, cfg, raw)

    lines = []
    if cfg.include_page_markers:
        lines.append(f"\n\n===== صفحه {page_no} =====\n")

    img_counter = 0

    def save_image(arr):
        nonlocal img_counter
        img_counter += 1
        fname = f"{img_prefix}_p{page_no:04d}_{img_counter:02d}.png"
        fpath = os.path.join(img_out_dir, fname)
        cv2.imwrite(fpath, arr)
        return fname

    for item in raw:
        tag = item[0]
        if tag == "text":
            lines.append(item[1])
            lines.append("")
        elif tag == "embedded_image":
            if cfg.save_block_images:
                fname = save_image(item[1])
                lines.append(f"[تصویر — ذخیره شد: {fname}]")
            else:
                lines.append("[تصویر]")
            lines.append("")
        elif tag == "table":
            fname = save_image(item[2]) if cfg.save_block_images else None
            if fname:
                lines.append(f"[جدول — تصویر مرجع: {fname}]")
            lines.append(item[1])
            lines.append("")
        elif tag == "algorithm":
            fname = save_image(item[2]) if cfg.save_block_images else None
            if fname:
                lines.append(f"[نمودار/الگوریتم — تصویر مرجع: {fname}]")
            lines.append("متن جعبه‌های نمودار به ترتیب تقریبی از بالا به پایین (پیکان‌ها و شاخه‌ها را در تصویر ببینید):")
            for i, t in enumerate(item[1], 1):
                lines.append(f"  {i}. {t}")
            lines.append("")
        elif tag == "figure":
            fname = save_image(item[2]) if cfg.save_block_images else None
            if fname:
                lines.append(f"[شکل/تصویر — ذخیره شد: {fname}]")
            if item[1]:
                lines.append(f"(متن یافت‌شده در تصویر، ممکن است ناقص باشد: {item[1]})")
            lines.append("")

    return "\n".join(lines)


def process_pdf(pdf_path, output_dir, cfg: OcrConfig, progress_cb=None, cancel_check=None):
    os.makedirs(output_dir, exist_ok=True)
    stem = _safe_stem(pdf_path)
    img_out_dir = os.path.join(output_dir, f"{stem}_images")
    os.makedirs(img_out_dir, exist_ok=True)

    total = pdf_page_count(pdf_path)
    out_text_path = os.path.join(output_dir, f"{stem}.txt")

    with open(out_text_path, "w", encoding="utf-8") as f:
        f.write(f"# متن استخراج‌شده از: {os.path.basename(pdf_path)}\n")
        for page_no0, img in render_pdf_pages(pdf_path, dpi=cfg.dpi):
            if cancel_check and cancel_check():
                break
            page_no = page_no0 + 1
            if progress_cb:
                progress_cb(page_no, total, f"در حال پردازش صفحه {page_no} از {total}")
            page_text = process_page(img, cfg, page_no, img_out_dir, stem)
            f.write(page_text)
            f.write("\n")

    return out_text_path, img_out_dir
