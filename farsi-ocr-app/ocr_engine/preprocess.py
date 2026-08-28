"""Page-level preprocessing: margin cropping and noise/icon cleanup."""
import cv2
import numpy as np


def crop_margins(img, top_pct, bottom_pct, left_pct, right_pct):
    """Crop a percentage of the page off each edge to drop running headers,
    footers, page numbers and the sideways publisher watermark strip."""
    h, w = img.shape[:2]
    top = int(h * top_pct / 100.0)
    bottom = h - int(h * bottom_pct / 100.0)
    left = int(w * left_pct / 100.0)
    right = w - int(w * right_pct / 100.0)
    top = max(0, min(top, h - 1))
    bottom = max(top + 1, min(bottom, h))
    left = max(0, min(left, w - 1))
    right = max(left + 1, min(right, w))
    return img[top:bottom, left:right]


def mask_small_color_icons(img_bgr, min_size=12, max_size=48, saturation_thresh=60):
    """Paint over small, saturated, roughly-square blobs (the book's colored
    bullet/icon glyphs) with white so they don't get fed to OCR as garbage
    text tokens. Leaves black/gray text and large graphics untouched."""
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    colorful = ((sat > saturation_thresh) & (val > 60)).astype(np.uint8) * 255

    out = img_bgr.copy()
    contours, _ = cv2.findContours(colorful, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if min_size <= w <= max_size and min_size <= h <= max_size:
            ar = w / float(h)
            if 0.55 <= ar <= 1.8:
                pad = 2
                y0, y1 = max(0, y - pad), min(out.shape[0], y + h + pad)
                x0, x1 = max(0, x - pad), min(out.shape[1], x + w + pad)
                out[y0:y1, x0:x1] = (255, 255, 255)
    return out


def clean_for_ocr(img_bgr, upscale=1.5):
    """Upscale, denoise and binarize a crop right before handing it to Tesseract."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    if upscale and upscale != 1.0:
        gray = cv2.resize(gray, None, fx=upscale, fy=upscale, interpolation=cv2.INTER_CUBIC)
    blur = cv2.GaussianBlur(gray, (3, 3), 0)
    _, bw = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return bw
