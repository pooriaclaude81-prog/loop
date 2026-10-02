# Emergency Orders: Quick Access

A single-file, offline web page (`index.html`) that groups emergency physician orders by clinical cluster, so the right order set can be found fast. Open `index.html` in any browser, or serve it with GitHub Pages.

- **146 order pages** in **53 topics** in **9 clusters**
- Each page: **scenario** → **orders** (tap to tick off) → **IF / OTHERWISE branches** → where the two sources **differ** → Persian notes (collapsible) → references for flagged items
- Search box, hash links (`#/v/<id>`), dark mode, phone-friendly, print-friendly

## Sources
- **A**: Physician Orders Sheet handout, Beesat Educational-Therapeutic Center, Hamadan University of Medical Sciences (28 scanned pages, transcribed).
- **B**: "Common Emergency Orders" booklet, Emergency Medicine Dept., Isfahan University of Medical Sciences, Winter 1398 (based on Rosen's 2018).
- When a topic is in both, the page shows the consensus and a "Where the two sources differ" box.

## Flags (verify before clinical use)
- **⚠ dose from reference**: the handwritten value was unreadable or implausible, so the standard reference dose is shown.
- **⚑ added from reference**: the sources do not give it. Examples: non-shockable cardiac arrest, tetanus table, acute limb ischemia anticoagulation, alteplase dosing.
- Scenarios are illustrative teaching cases written for this page.

**This is a study and reference aid. It does not replace clinical judgement, local protocols or senior review.**

## Rebuild
Content lives in `src/data/*.js`; the app shell is `src/template.html`.

```
python3 build.py     # validates ids / links, writes index.html
```
