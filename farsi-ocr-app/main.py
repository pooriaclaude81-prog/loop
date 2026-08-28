"""Entry point for the packaged Windows application."""
import sys
import traceback


def _fatal_error_dialog(exc_text):
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("Farsi OCR - startup error", exc_text)
    except Exception:
        pass


if __name__ == "__main__":
    try:
        from ocr_engine.tesseract_setup import configure_tesseract
        from gui.app import main
        configure_tesseract()
        main()
    except Exception:
        _fatal_error_dialog(traceback.format_exc())
        sys.exit(1)
