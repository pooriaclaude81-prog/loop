"""Tesseract wrapper with correct right-to-left line reconstruction.

Tesseract's own plain-text output does not apply the Unicode bidi algorithm,
so a line mixing Farsi and embedded English/numbers can come out with words
in the wrong order. We instead pull word-level boxes (image_to_data) and
rebuild each line ourselves: words are grouped by their detected line, then
sorted right-to-left by x position, which is the correct order for RTL body
text and keeps embedded Latin words internally correct (Tesseract already
reads each word's characters in the right order; only the arrangement of
words along the line needs fixing).
"""
import os

import cv2
import numpy as np
import pytesseract
from PIL import Image


def to_pil(img):
    if img is None or img.size == 0:
        return None
    if img.ndim == 2:
        return Image.fromarray(img)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


def _apply_tessdata_dir(tessdata_dir):
    # Passing --tessdata-dir through pytesseract's `config` string is unsafe
    # on Windows: pytesseract splits that string with shlex.split(...,
    # posix=False), which does not strip surrounding quotes, so a quoted
    # path (needed to survive spaces, e.g. "C:\Program Files\...") reaches
    # tesseract with the literal quote characters still attached and fails
    # to open. TESSDATA_PREFIX has no such parsing step.
    if tessdata_dir:
        os.environ["TESSDATA_PREFIX"] = tessdata_dir


def ocr_block_lines(img, lang, tessdata_dir, psm=6, min_conf=0):
    pil = to_pil(img)
    if pil is None:
        return []
    _apply_tessdata_dir(tessdata_dir)
    config = f"--psm {psm}"
    data = pytesseract.image_to_data(pil, lang=lang, config=config, output_type=pytesseract.Output.DICT)
    n = len(data["text"])
    lines = {}
    line_top = {}
    for i in range(n):
        txt = data["text"][i].strip()
        if not txt:
            continue
        try:
            conf = float(data["conf"][i])
        except (ValueError, TypeError):
            conf = 0.0
        if conf < min_conf:
            continue
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        lines.setdefault(key, []).append((data["left"][i], txt))
        top = data["top"][i]
        if key not in line_top or top < line_top[key]:
            line_top[key] = top

    ordered_keys = sorted(lines.keys(), key=lambda k: line_top[k])
    out = []
    for k in ordered_keys:
        words = sorted(lines[k], key=lambda t: -t[0])
        out.append(" ".join(w[1] for w in words))
    return out


def ocr_block_text(img, lang, tessdata_dir, psm=6):
    return "\n".join(ocr_block_lines(img, lang, tessdata_dir, psm=psm))


def ocr_cell_text(img, lang, tessdata_dir):
    if img is None or img.size == 0 or img.shape[0] < 4 or img.shape[1] < 4:
        return ""
    lines = ocr_block_lines(img, lang, tessdata_dir, psm=6)
    return " ".join(l.strip() for l in lines if l.strip())
