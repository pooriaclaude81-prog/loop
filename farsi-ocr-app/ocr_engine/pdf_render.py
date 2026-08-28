"""Render PDF pages to images, and load plain image files, as numpy BGR arrays."""
import numpy as np

try:
    import pymupdf as fitz
except ImportError:
    import fitz


def render_pdf_pages(pdf_path, dpi=300):
    """Yield (page_index, bgr_image) for every page in the PDF."""
    doc = fitz.open(pdf_path)
    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)
    try:
        for i in range(doc.page_count):
            page = doc.load_page(i)
            pix = page.get_pixmap(matrix=matrix, colorspace=fitz.csRGB, alpha=False)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
            bgr = img[:, :, ::-1].copy()
            yield i, bgr
    finally:
        doc.close()


def pdf_page_count(pdf_path):
    doc = fitz.open(pdf_path)
    try:
        return doc.page_count
    finally:
        doc.close()
