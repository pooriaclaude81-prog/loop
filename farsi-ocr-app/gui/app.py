"""Desktop GUI for the Farsi medical-book OCR tool. Plain Tkinter (ships
with Python, no extra install needed) so the packaged .exe stays simple."""
import os
import queue
import sys
import threading
import traceback
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

import cv2
from PIL import Image, ImageTk

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ocr_engine.pipeline import OcrConfig, process_pdf
from ocr_engine.pdf_render import render_pdf_pages
from ocr_engine.preprocess import crop_margins


def resource_path(rel):
    base = getattr(sys, "_MEIPASS", None)
    if base:
        return os.path.join(base, rel)
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), rel)


TESSDATA_DIR = resource_path(os.path.join("assets", "tessdata"))
PREVIEW_DPI = 130
APP_TITLE = "استخراج متن فارسی از کتاب اسکن‌شده (OCR)"


class App:
    def __init__(self, root):
        self.root = root
        root.title(APP_TITLE)
        root.geometry("1000x680")
        root.minsize(860, 560)

        self.pdf_paths = []
        default_out = os.path.join(os.path.expanduser("~"), "Desktop")
        if not os.path.isdir(default_out):
            default_out = os.path.expanduser("~")
        self.output_dir = os.path.join(default_out, "OCR-Output")

        self.margin_vars = {
            "top": tk.DoubleVar(value=12.0),
            "bottom": tk.DoubleVar(value=6.0),
            "left": tk.DoubleVar(value=3.0),
            "right": tk.DoubleVar(value=3.0),
        }

        self.preview_img_bgr = None
        self.preview_photo = None
        self.cancel_flag = False
        self.worker_thread = None
        self.progress_queue = queue.Queue()

        self._build_ui()

    # ---------------------------------------------------------------- UI --
    def _build_ui(self):
        pad = {"padx": 10, "pady": 6}

        top_frame = ttk.Frame(self.root)
        top_frame.pack(fill="x", **pad)

        ttk.Label(
            top_frame,
            text="این برنامه کتاب‌های اسکن‌شده پزشکی دوستونه فارسی را به متن ساده تبدیل می‌کند "
                 "(بدون نیاز به اینترنت یا هوش مصنوعی).",
            wraplength=960, justify="right",
        ).pack(anchor="e")

        file_frame = ttk.LabelFrame(self.root, text="۱) انتخاب فایل‌های PDF")
        file_frame.pack(fill="x", **pad)
        btn_row = ttk.Frame(file_frame)
        btn_row.pack(fill="x", padx=8, pady=6)
        ttk.Button(btn_row, text="انتخاب فایل‌ها...", command=self.choose_files).pack(side="right")
        self.files_label = ttk.Label(btn_row, text="فایلی انتخاب نشده")
        self.files_label.pack(side="right", padx=10)

        out_frame = ttk.LabelFrame(self.root, text="۲) پوشه خروجی")
        out_frame.pack(fill="x", **pad)
        out_row = ttk.Frame(out_frame)
        out_row.pack(fill="x", padx=8, pady=6)
        ttk.Button(out_row, text="انتخاب پوشه...", command=self.choose_output).pack(side="right")
        self.output_label = ttk.Label(out_row, text=self.output_dir)
        self.output_label.pack(side="right", padx=10)

        # Packed with side="bottom" BEFORE the expanding margin/preview frame
        # below, so it always reserves its space and stays visible no matter
        # how tall the preview canvas or the window's DPI scaling make the
        # rest of the layout -- the run controls must never be scrollable
        # off-screen, since they're the only way to start the conversion.
        run_frame = ttk.LabelFrame(self.root, text="۴) اجرا")
        run_frame.pack(side="bottom", fill="x", **pad)
        run_row = ttk.Frame(run_frame)
        run_row.pack(fill="x", padx=8, pady=6)
        self.start_btn = ttk.Button(run_row, text="شروع تبدیل", command=self.start)
        self.start_btn.pack(side="right")
        self.cancel_btn = ttk.Button(run_row, text="توقف", command=self.cancel, state="disabled")
        self.cancel_btn.pack(side="right", padx=6)
        self.open_out_btn = ttk.Button(run_row, text="باز کردن پوشه خروجی", command=self.open_output,
                                        state="disabled")
        self.open_out_btn.pack(side="right", padx=6)

        self.progress = ttk.Progressbar(run_frame, orient="horizontal", mode="determinate")
        self.progress.pack(fill="x", padx=8, pady=(0, 6))

        log_frame = ttk.Frame(run_frame)
        log_frame.pack(fill="x", padx=8, pady=(0, 8))
        self.log = tk.Text(log_frame, height=5, wrap="word")
        self.log.pack(side="right", fill="both", expand=True)
        scroll = ttk.Scrollbar(log_frame, command=self.log.yview)
        scroll.pack(side="left", fill="y")
        self.log.configure(yscrollcommand=scroll.set)
        self.log.configure(state="disabled")

        margin_frame = ttk.LabelFrame(
            self.root, text="۳) تنظیم حاشیه‌ها (حذف سربرگ، پاورقی و نوار کناری قبل از تشخیص متن)")
        margin_frame.pack(fill="both", expand=True, **pad)

        body = ttk.Frame(margin_frame)
        body.pack(fill="both", expand=True, padx=8, pady=6)

        self.canvas = tk.Canvas(body, background="#333333", width=460, height=380)
        self.canvas.pack(side="right", fill="both", expand=True, padx=(10, 0))

        sliders = ttk.Frame(body)
        sliders.pack(side="left", fill="y", padx=(0, 10))

        self._add_slider(sliders, "top", "حاشیهٔ بالا (سربرگ)")
        self._add_slider(sliders, "bottom", "حاشیهٔ پایین (پاورقی)")
        self._add_slider(sliders, "left", "حاشیهٔ چپ")
        self._add_slider(sliders, "right", "حاشیهٔ راست")

        ttk.Label(
            sliders,
            text="ناحیهٔ روشن = بخشی که استخراج می‌شود.\nناحیهٔ تیره = حذف می‌شود.",
            wraplength=220, justify="right",
        ).pack(pady=10)

    def _add_slider(self, parent, key, label):
        frame = ttk.Frame(parent)
        frame.pack(fill="x", pady=6)
        ttk.Label(frame, text=label).pack(anchor="e")
        scale = ttk.Scale(frame, from_=0, to=30, orient="horizontal",
                           variable=self.margin_vars[key], command=lambda v: self.update_preview())
        scale.pack(fill="x")

    # ----------------------------------------------------------- actions --
    def choose_files(self):
        paths = filedialog.askopenfilenames(
            title="انتخاب فایل‌های PDF", filetypes=[("PDF files", "*.pdf")])
        if paths:
            self.pdf_paths = list(paths)
            self.files_label.config(text=f"{len(paths)} فایل انتخاب شد")
            self.load_preview()

    def choose_output(self):
        d = filedialog.askdirectory(title="انتخاب پوشه خروجی")
        if d:
            self.output_dir = d
            self.output_label.config(text=d)

    def load_preview(self):
        if not self.pdf_paths:
            return
        try:
            for _, img in render_pdf_pages(self.pdf_paths[0], dpi=PREVIEW_DPI):
                self.preview_img_bgr = img
                break
        except Exception as e:
            messagebox.showerror("خطا", f"امکان نمایش پیش‌نمایش نبود:\n{e}")
            return
        self.update_preview()

    def update_preview(self):
        if self.preview_img_bgr is None:
            return
        img = self.preview_img_bgr
        h, w = img.shape[:2]
        canvas_w = max(200, self.canvas.winfo_width() or 460)
        canvas_h = max(200, self.canvas.winfo_height() or 560)
        scale = min(canvas_w / w, canvas_h / h)
        disp_w, disp_h = int(w * scale), int(h * scale)
        disp = cv2.resize(img, (disp_w, disp_h))
        disp_rgb = cv2.cvtColor(disp, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(disp_rgb)
        self.preview_photo = ImageTk.PhotoImage(pil_img)

        self.canvas.delete("all")
        self.canvas.create_image(canvas_w // 2, canvas_h // 2, image=self.preview_photo)

        ox = (canvas_w - disp_w) // 2
        oy = (canvas_h - disp_h) // 2
        top = self.margin_vars["top"].get() / 100.0 * disp_h
        bottom = disp_h - self.margin_vars["bottom"].get() / 100.0 * disp_h
        left = self.margin_vars["left"].get() / 100.0 * disp_w
        right = disp_w - self.margin_vars["right"].get() / 100.0 * disp_w

        self.canvas.create_rectangle(ox, oy, ox + disp_w, oy + top, fill="black", stipple="gray50", outline="")
        self.canvas.create_rectangle(ox, oy + bottom, ox + disp_w, oy + disp_h, fill="black", stipple="gray50", outline="")
        self.canvas.create_rectangle(ox, oy + top, ox + left, oy + bottom, fill="black", stipple="gray50", outline="")
        self.canvas.create_rectangle(ox + right, oy + top, ox + disp_w, oy + bottom, fill="black", stipple="gray50", outline="")
        self.canvas.create_rectangle(ox + left, oy + top, ox + right, oy + bottom, outline="#00ff66", width=2)

    def _log(self, text):
        self.log.configure(state="normal")
        self.log.insert("end", text + "\n")
        self.log.see("end")
        self.log.configure(state="disabled")

    def start(self):
        if not self.pdf_paths:
            messagebox.showwarning("توجه", "ابتدا حداقل یک فایل PDF انتخاب کنید.")
            return
        if not os.path.isdir(TESSDATA_DIR):
            messagebox.showerror("خطا", f"فایل‌های زبان تشخیص متن پیدا نشد:\n{TESSDATA_DIR}")
            return
        try:
            import pytesseract
            pytesseract.get_tesseract_version()
        except Exception as e:
            messagebox.showerror("خطا", f"موتور تشخیص متن (Tesseract) پیدا نشد یا اجرا نمی‌شود:\n{e}")
            return
        os.makedirs(self.output_dir, exist_ok=True)

        self.cancel_flag = False
        self.start_btn.configure(state="disabled")
        self.cancel_btn.configure(state="normal")
        self.open_out_btn.configure(state="disabled")
        self.progress.configure(value=0, maximum=100)
        self.log.configure(state="normal")
        self.log.delete("1.0", "end")
        self.log.configure(state="disabled")

        cfg = OcrConfig(
            top_pct=self.margin_vars["top"].get(),
            bottom_pct=self.margin_vars["bottom"].get(),
            left_pct=self.margin_vars["left"].get(),
            right_pct=self.margin_vars["right"].get(),
            tessdata_dir=TESSDATA_DIR,
        )

        self.worker_thread = threading.Thread(target=self._run_pipeline, args=(cfg,), daemon=True)
        self.worker_thread.start()
        self.root.after(150, self._poll_queue)

    def cancel(self):
        self.cancel_flag = True
        self.cancel_btn.configure(state="disabled")
        self._log("در حال توقف پس از پایان صفحهٔ جاری...")

    def open_output(self):
        path = self.output_dir
        try:
            if sys.platform.startswith("win"):
                os.startfile(path)  # noqa
            elif sys.platform == "darwin":
                os.system(f'open "{path}"')
            else:
                os.system(f'xdg-open "{path}"')
        except Exception:
            pass

    # ------------------------------------------------------------ worker --
    def _run_pipeline(self, cfg):
        for path in self.pdf_paths:
            if self.cancel_flag:
                break
            fname = os.path.basename(path)

            def cb(page, total, msg, _fname=fname):
                self.progress_queue.put(("progress", _fname, page, total, msg))

            try:
                txt_path, img_dir = process_pdf(
                    path, self.output_dir, cfg,
                    progress_cb=cb, cancel_check=lambda: self.cancel_flag,
                )
                self.progress_queue.put(("file_done", fname, txt_path, None))
            except Exception:
                err = traceback.format_exc()
                self.progress_queue.put(("error", fname, None, err))
        self.progress_queue.put(("all_done", None, None, None))

    def _poll_queue(self):
        try:
            while True:
                kind, fname, a, b = self.progress_queue.get_nowait()
                if kind == "progress":
                    page, total, msg = a, b, None
                    self.progress.configure(maximum=max(total, 1), value=page)
                    self._log(f"[{fname}] {a} / {b}")
                elif kind == "file_done":
                    self._log(f"[{fname}] پایان یافت -> {a}")
                elif kind == "error":
                    self._log(f"[{fname}] خطا:\n{b}")
                elif kind == "all_done":
                    self._log("همهٔ فایل‌ها پردازش شدند." if not self.cancel_flag else "متوقف شد.")
                    self.start_btn.configure(state="normal")
                    self.cancel_btn.configure(state="disabled")
                    self.open_out_btn.configure(state="normal")
                    return
        except queue.Empty:
            pass
        self.root.after(150, self._poll_queue)


def main():
    root = tk.Tk()
    try:
        style = ttk.Style()
        if "vista" in style.theme_names():
            style.theme_use("vista")
        elif "clam" in style.theme_names():
            style.theme_use("clam")
    except Exception:
        pass
    App(root)
    root.mainloop()


if __name__ == "__main__":
    main()
