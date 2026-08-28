"""Best-effort reconstruction of flowchart/algorithm boxes: detect the
pastel-filled rounded-rectangle boxes these books use for decision trees,
OCR each box's interior text, and order them top-to-bottom / right-to-left
so the flow can be read even though arrows and branches can't be represented
in plain text. The original block is always saved as an image too, so the
reader can check the real shape of the diagram."""
import cv2
import numpy as np

from . import ocr as ocr_mod
from .preprocess import clean_for_ocr


def _is_neutral(bgr_pixel_mean):
    b, g, r = bgr_pixel_mean
    mx, mn = max(b, g, r), min(b, g, r)
    return (mx - mn) < 18  # low saturation -> white/black/gray, not a color fill


def detect_color_boxes(img_bgr, min_w=45, min_h=22, max_area_frac=0.9):
    h, w = img_bgr.shape[:2]
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    # pastel fills: some color saturation, bright value, not near-white
    colorful = ((sat > 18) & (sat < 200) & (val > 120) & (val < 253)).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
    colorful = cv2.morphologyEx(colorful, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(colorful, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    boxes = []
    page_area = h * w
    for c in contours:
        x, y, bw_, bh_ = cv2.boundingRect(c)
        area = bw_ * bh_
        if bw_ < min_w or bh_ < min_h:
            continue
        if area > page_area * max_area_frac:
            continue
        fill_ratio = cv2.contourArea(c) / float(area) if area else 0
        if fill_ratio < 0.35:
            continue
        boxes.append((x, y, bw_, bh_))

    # merge boxes that overlap heavily (nested contours from close()/border)
    boxes.sort(key=lambda b: b[2] * b[3], reverse=True)
    kept = []
    for b in boxes:
        x, y, bw_, bh_ = b
        overlaps = False
        for kx, ky, kbw, kbh in kept:
            ix0, iy0 = max(x, kx), max(y, ky)
            ix1, iy1 = min(x + bw_, kx + kbw), min(y + bh_, ky + kbh)
            if ix1 > ix0 and iy1 > iy0:
                inter = (ix1 - ix0) * (iy1 - iy0)
                if inter > 0.6 * bw_ * bh_:
                    overlaps = True
                    break
        if not overlaps:
            kept.append(b)
    return kept


def order_boxes(boxes, row_tolerance=45):
    def row_bucket(b):
        return round(b[1] / row_tolerance)
    return sorted(boxes, key=lambda b: (row_bucket(b), -b[0]))


def extract_algorithm_text(img_bgr, lang, tessdata_dir):
    """Return (ordered_texts, boxes) or (None, []) if no boxes were found."""
    boxes = detect_color_boxes(img_bgr)
    if len(boxes) < 2:
        return None, []
    ordered = order_boxes(boxes)
    texts = []
    for (x, y, w, h) in ordered:
        pad = 6
        y0, y1 = max(0, y + pad), min(img_bgr.shape[0], y + h - pad)
        x0, x1 = max(0, x + pad), min(img_bgr.shape[1], x + w - pad)
        crop = img_bgr[y0:y1, x0:x1]
        if crop.size == 0:
            continue
        clean = clean_for_ocr(crop, upscale=1.8)
        text = ocr_mod.ocr_cell_text(clean, lang, tessdata_dir)
        if text:
            texts.append(text)
    if not texts:
        return None, ordered
    return texts, ordered
