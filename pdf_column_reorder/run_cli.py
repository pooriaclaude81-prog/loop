from __future__ import annotations

import argparse
import sys
from pathlib import Path

from column_reorder import parse_page_ranges, process_pdf

try:
    import pymupdf as fitz
except ImportError:
    import fitz


parser = argparse.ArgumentParser(
    description=(
        "Reorder two-column PDF pages: right column first, then left column. "
        "Tables, figures, algorithm/pseudocode boxes and other content that breaks "
        "the two-column grid are kept intact as their own block (or dropped with "
        "--exclude-non-conforming), and the output is heavily compressed by "
        "rebuilding pages from the original PDF content instead of rasterizing them."
    )
)
parser.add_argument("input_pdf", type=Path)
parser.add_argument("-o", "--output", type=Path, default=None)
parser.add_argument(
    "--pages", type=str, default=None,
    help='1-indexed page range to process, e.g. "1-3,5,8-10". Default: all pages.',
)
parser.add_argument(
    "--exclude-non-conforming", action="store_true",
    help="Drop tables/figures/algorithm boxes/other full-width blocks instead of keeping them. "
         "Pages that are not two-column at all (title pages, abstracts, ...) are never affected.",
)
parser.add_argument("--offset", type=float, default=0.0, help="Split adjustment in percent of page width.")
parser.add_argument(
    "--mode", choices=["auto", "vector", "raster"], default="auto",
    help="auto (default): lossless vector reconstruction, falls back to raster per-page only if needed. "
         "vector: force lossless reconstruction (errors if a page can't be handled this way). "
         "raster: always rasterize every page (compatibility fallback).",
)
parser.add_argument("--dpi", type=int, default=200, help="Raster DPI, used only for scanned pages or --mode raster.")
parser.add_argument("--jpeg-quality", type=int, default=85, help="JPEG quality (1-95) for any rasterized/recompressed image content.")
parser.add_argument("--no-optimize-images", action="store_true", help="Don't shrink oversized embedded images.")
parser.add_argument("--max-image-dim", type=int, default=2000, help="Max embedded image dimension in pixels before it gets downsampled.")
args = parser.parse_args()

with fitz.open(args.input_pdf) as _doc:
    total_pages = len(_doc)

pages = None
if args.pages:
    try:
        pages = parse_page_ranges(args.pages, total_pages)
    except ValueError as e:
        print(f"--pages error: {e}", file=sys.stderr)
        sys.exit(1)

output = args.output or args.input_pdf.with_name(args.input_pdf.stem + "_reordered.pdf")
stats = process_pdf(
    args.input_pdf,
    output,
    include_non_conforming=not args.exclude_non_conforming,
    split_offset_percent=args.offset,
    mode=args.mode,
    raster_dpi=args.dpi,
    jpeg_quality=args.jpeg_quality,
    optimize_embedded_images=not args.no_optimize_images,
    max_embedded_image_dim=args.max_image_dim,
    pages=pages,
)

print(f"Wrote: {output}")
if pages is not None:
    print(f"Pages: {len(pages)} of {total_pages} selected")
in_mb = stats.input_bytes / 1_000_000
out_mb = stats.output_bytes / 1_000_000
print(f"Size: {in_mb:.2f} MB -> {out_mb:.2f} MB ({stats.compression_ratio:+.0%})")
for r in stats.pages:
    kind = "two-column" if r.is_two_column_page else "single-column (passthrough)"
    nonconforming = sum(1 for s in r.segments if s.kind == "full_width") if r.is_two_column_page else 0
    print(
        f"page {r.page_number}: {kind} split={r.detection.split_x_px}px "
        f"confidence={r.detection.confidence:.2f} recon={r.reconstruction} "
        f"non_conforming_blocks={nonconforming} dropped={r.dropped_segments}"
    )
