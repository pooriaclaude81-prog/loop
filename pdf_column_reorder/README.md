# PDF Column Reorder

A Streamlit app (and CLI) that rebuilds a two-column PDF so each page reads as a
single column in **right-column-first, then left-column** order - the reading
order used by right-to-left two-column layouts.

Tables, figures, algorithm/pseudocode boxes, full-width headings, and anything
else that breaks the two-column grid are detected and handled as their own
block instead of being sliced in half by a naive down-the-middle split. You can
choose whether that content is kept (as its own block between the reflowed
text) or dropped entirely. Pages that aren't two-column at all - title pages,
abstracts, single-column articles, reference lists - are always left alone,
regardless of that setting.

The output is also rebuilt to be **much smaller** than the source, without
rasterizing pages (see "How compression works" below).

## Run the app

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

Then open the local URL Streamlit prints, upload a PDF, check the preview,
and click **Process PDF** to download the result.

### What you'll see

- **Preview**: the detected column split (blue line) and any non-conforming
  block - table, figure, algorithm box, etc. (red outline) on the source
  page, next to what the reordered/reflowed page will look like.
- **Pages to process**: an optional 1-indexed range like `1-3,5,8-10` to only
  process part of the document. Leave it blank to process every page. The
  per-page results below the download button still show each page's original
  number, so they line up with the source PDF even though the output is
  shorter.
- **Include tables / figures / algorithm boxes** (sidebar, on by default):
  turn this off to drop that content and keep only the reflowed running text.
- **Split adjustment**: nudge the detected gutter left/right if a specific
  page needs a manual correction.
- **Reconstruction**: leave on "Vector" unless you hit a compatibility
  problem with an unusual source PDF.
- **Scan/raster quality, image quality, image shrinking**: only matter for
  scanned pages or embedded photos - see below.

## Run from the command line

```bash
pip install -r requirements.txt
python run_cli.py input.pdf -o output.pdf
```

Useful flags:

| Flag | What it does |
|---|---|
| `--pages "1-3,5,8-10"` | Only process this 1-indexed page range; default is every page |
| `--exclude-non-conforming` | Drop tables/figures/algorithm boxes instead of keeping them |
| `--offset -1.5` | Shift the detected split by -1.5% of page width |
| `--mode {auto,vector,raster}` | Reconstruction strategy (see below); default `auto` |
| `--dpi 200` | Raster DPI, used only for scanned pages or `--mode raster` |
| `--jpeg-quality 85` | JPEG quality for any rasterized/recompressed image content |
| `--no-optimize-images` | Don't shrink oversized embedded images |
| `--max-image-dim 2000` | Downsample embedded images wider/taller than this |

The CLI prints, per page, whether it was two-column or passed through
untouched, how many non-conforming blocks were found, the detected split
confidence, and the overall size change.

## How the layout detection works

1. Each page is rendered once at a modest DPI purely for analysis (this does
   not affect output quality).
2. A whole-page pass finds the vertical whitespace gutter, the same way the
   original version of this tool did, and also decides whether the page is a
   genuine two-column layout at all (a single-column page is passed through
   unchanged, whatever the include/exclude setting is).
3. On a two-column page, the app scans top to bottom in thin horizontal bands
   and asks, per band: is the gutter still clear, or has something bridged
   across it? Two independent signals feed this: ink actually crossing the
   measured gutter gap, and a near-solid horizontal rule spanning most of the
   two-column width (which catches a table/algorithm-box border even when its
   interior content doesn't happen to reach the exact gutter position).
4. Small gaps inside one structural element (a blank row between a table's
   border and its next gridline, blank lines inside a pseudocode box) are
   bridged so the element reads as one continuous block. A pair of matching
   full-width rules (a box's top and bottom border) can bridge a much larger
   gap - but never through a region that shows genuine independent left- and
   right-column text, so a real paragraph of two-column text sitting between
   two unrelated tables is never swallowed into one block.
5. The page is rebuilt in reading order: for each two-column run, the right
   slice then the left slice; each non-conforming block (if included) as
   itself, at the point where it interrupts the columns.

This is pixel-based, not text-based, so it works the same way on scanned
pages, unusual fonts, and mixed content as it does on born-digital PDFs.

**Known limitation**: a caption sitting immediately next to a table/figure is
only pulled in with it if the caption's own text spans far enough to be
detected as non-conforming; a short caption confined to one column's width is
treated as ordinary column text. This only matters when you turn off
"include non-conforming content" and want captions dropped along with their
table/figure.

## How compression works

The previous version of this tool rasterized every page to a PNG and
re-embedded that image - reliable, but it threw away vector text and
inflated file size a lot. This version instead rebuilds each output page by
**clipping and re-placing the original page content directly** (PyMuPDF's
`show_pdf_page`), the same way a PDF imposition tool works:

- Vector text stays vector text (still selectable/searchable, sharp at any
  zoom) - it is never rasterized just because the app reordered it.
- Embedded images keep whatever compression the source PDF already used
  instead of being re-encoded at a fixed DPI.
- Any oversized embedded image (common in scanned PDFs) is downsampled and
  recompressed as JPEG at the quality you choose, when "Shrink oversized
  embedded images" is on.
- Fonts are subset and streams are deflated on save.

A page only falls back to rasterizing (render → JPEG) if its content can't
be handled the vector way, or if you force raster mode.

## Files

- `column_reorder.py` - detection, segmentation, and page reconstruction.
- `app.py` - Streamlit UI.
- `run_cli.py` - command-line entry point.
