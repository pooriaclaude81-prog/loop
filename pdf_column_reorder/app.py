from __future__ import annotations

import tempfile
from pathlib import Path

import streamlit as st
from PIL import ImageDraw

from column_reorder import preview_page, process_pdf

try:
    import pymupdf as fitz
except ImportError:
    import fitz


st.set_page_config(page_title="PDF Column Reorder", page_icon="↔", layout="wide")

st.title("PDF Column Reorder")
st.caption(
    "Detects the whitespace gutter between two columns and rebuilds each page as: "
    "right column → left column. Tables, figures, algorithm/pseudocode boxes and "
    "anything else that breaks the two-column grid is kept intact (not sliced down "
    "the middle) - handled as its own block, with an option to include or drop it."
)

with st.sidebar:
    st.header("Settings")

    include_non_conforming = st.checkbox(
        "Include tables / figures / algorithm boxes",
        value=True,
        help=(
            "ON: any table, figure, algorithm box, or full-width heading that breaks "
            "the two-column layout is kept, shown as its own block between the "
            "surrounding reflowed text. OFF: that content is dropped entirely, leaving "
            "only the reflowed running text. This never affects pages that are not "
            "two-column to begin with (title pages, abstracts, references, ...) - "
            "those always pass through unchanged."
        ),
    )

    offset = st.slider(
        "Split adjustment", -5.0, 5.0, 0.0, 0.1, format="%.1f%%",
        help="Shift the detected gutter left/right when a page needs a manual correction.",
    )

    st.divider()
    st.subheader("Output / compression")

    recon_mode = st.selectbox(
        "Reconstruction",
        ["Vector (recommended)", "Raster (compatibility fallback)"],
        index=0,
        help=(
            "Vector mode rebuilds pages by clipping and re-placing the original PDF "
            "content directly (no rasterizing), which keeps text sharp/selectable and "
            "produces a much smaller file. It automatically falls back to rasterizing "
            "a page only if that page's PDF content can't be handled this way. Raster "
            "mode always renders every page to an image first - only useful for "
            "compatibility testing or unusual source PDFs."
        ),
    )
    mode = "vector" if recon_mode.startswith("Vector") else "raster"

    raster_dpi = st.select_slider(
        "Scan/raster quality (DPI)", options=[120, 150, 200, 250, 300], value=200,
        help="Used only for scanned pages, or if raster mode is forced above.",
    )
    jpeg_quality = st.slider(
        "Image quality (JPEG)", 40, 95, 85,
        help="Lower = smaller file, higher = closer to the source image quality.",
    )
    optimize_images = st.checkbox(
        "Shrink oversized embedded images", value=True,
        help="Downsamples and recompresses any embedded photo/scan larger than the limit below. Big win for scanned PDFs.",
    )
    max_image_dim = st.select_slider(
        "Max embedded image dimension (px)", options=[1200, 1500, 2000, 2500, 3000], value=2000,
        disabled=not optimize_images,
    )

    st.divider()
    show_preview = st.checkbox("Show before/after preview", True)
    show_bands = st.checkbox("Show detected bands on the preview", True)

uploaded = st.file_uploader("Choose a PDF", type=["pdf"])

if not uploaded:
    st.info(
        "Upload a PDF to start. Detection works on rendered pixels, not extracted "
        "text, so scanned pages, mixed fonts, and unusual layouts are all handled "
        "the same way as born-digital PDFs."
    )
    st.stop()

with tempfile.TemporaryDirectory() as tmp:
    tmpdir = Path(tmp)
    input_path = tmpdir / uploaded.name
    output_path = tmpdir / (Path(uploaded.name).stem + "_reordered.pdf")
    input_path.write_bytes(uploaded.getbuffer())

    src = fitz.open(input_path)
    page_count = len(src)
    st.success(f"Loaded {page_count} page(s).")

    if show_preview:
        st.subheader("Preview")
        page_index = st.number_input("Page", min_value=1, max_value=page_count, value=1, step=1) - 1
        page = src[page_index]
        before, reordered, det, segments, is_two_col = preview_page(
            page,
            dpi=110,
            split_offset_percent=offset,
            include_non_conforming=include_non_conforming,
        )

        marked = before.copy()
        d = ImageDraw.Draw(marked)
        px_per_pt = marked.width / page.rect.width
        if is_two_col:
            for seg in segments:
                y0 = seg.y0 * px_per_pt
                y1 = seg.y1 * px_per_pt
                if seg.kind == "full_width":
                    d.rectangle([0, y0, marked.width, y1], outline=(220, 40, 40), width=3)
                    d.rectangle([0, y0, marked.width, y1], fill=None)
                elif seg.split_x is not None:
                    sx = seg.split_x * px_per_pt
                    d.line((sx, y0, sx, y1), fill=(40, 120, 220), width=2)
            legend = "blue line = column split · red box = table/figure/algorithm/other non-conforming block"
        else:
            d.rectangle([0, 0, marked.width, marked.height], outline=(120, 120, 120), width=3)
            legend = "gray box = not a two-column page - passed through unchanged"

        c1, c2 = st.columns(2)
        with c1:
            caption = f"Detected layout · gutter confidence={det.confidence:.2f}"
            st.image(marked if show_bands else before, caption=caption, width="stretch")
            st.caption(legend)
        with c2:
            st.image(reordered, caption="Right column first, then left column", width="stretch")

    src.close()

    if st.button("Process PDF", type="primary", width="stretch"):
        with st.spinner("Detecting layout and rebuilding the PDF..."):
            stats = process_pdf(
                input_path,
                output_path,
                include_non_conforming=include_non_conforming,
                split_offset_percent=offset,
                mode=mode,
                raster_dpi=raster_dpi,
                jpeg_quality=jpeg_quality,
                optimize_embedded_images=optimize_images,
                max_embedded_image_dim=max_image_dim,
            )

        in_mb = stats.input_bytes / 1_000_000
        out_mb = stats.output_bytes / 1_000_000
        st.success(
            f"Done. Processed {len(stats.pages)} page(s). "
            f"{in_mb:.2f} MB → {out_mb:.2f} MB "
            f"({stats.compression_ratio:.0%} smaller)."
            if stats.compression_ratio >= 0
            else f"Done. Processed {len(stats.pages)} page(s). {in_mb:.2f} MB → {out_mb:.2f} MB."
        )
        st.download_button(
            "Download reordered PDF",
            data=output_path.read_bytes(),
            file_name=output_path.name,
            mime="application/pdf",
            width="stretch",
        )

        with st.expander("Per-page detection details"):
            for r in stats.pages:
                kind = "two-column" if r.is_two_column_page else "single-column (passed through)"
                nonconforming = sum(1 for s in r.segments if s.kind == "full_width") if r.is_two_column_page else 0
                st.write(
                    f"Page {r.page_number}: {kind} · reconstruction={r.reconstruction} · "
                    f"non-conforming blocks found={nonconforming} · dropped={r.dropped_segments} · "
                    f"gutter confidence={r.detection.confidence:.2f}"
                )

st.divider()
st.caption(
    "Vector reconstruction preserves the original text and images losslessly (no DPI "
    "re-rendering), so quality is not degraded by this tool. Scanned pages fall back "
    "to raster + JPEG, controlled by the settings in the sidebar."
)
