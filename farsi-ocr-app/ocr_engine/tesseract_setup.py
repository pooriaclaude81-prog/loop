"""Point pytesseract at the Tesseract engine bundled with the packaged app
(so end users never install anything separately), falling back to a system
install for local development."""
import os
import shutil
import sys

import pytesseract


def _bundle_root():
    meipass = getattr(sys, "_MEIPASS", None)
    if meipass:
        return meipass
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def configure_tesseract():
    root = _bundle_root()
    exe_name = "tesseract.exe" if os.name == "nt" else "tesseract"
    bundled = os.path.join(root, "tesseract_bin", exe_name)
    if os.path.isfile(bundled):
        pytesseract.pytesseract.tesseract_cmd = bundled
        return bundled

    found = shutil.which("tesseract")
    if found:
        pytesseract.pytesseract.tesseract_cmd = found
        return found

    return None
