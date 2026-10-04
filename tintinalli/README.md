# Tintinalli-based orders (separate from the legacy site)

**Coverage:** all 189 chapters of *Tintinalli's Emergency Medicine Manual, 8th ed.* (578 conditions, 1013 variants, 47 chief complaints).
Everything is **draft, pending physician review**. Orders restate what the book says in the ED order format; doses and drug names are the book's own.
Where the printed text has an apparent typo (e.g. albumin "mg/L", rifabutin "mg/kg", hydrocortisone "g", fibrinogen "mL/kg", "propylene glycol" for the laxative) the order carries the book's wording and the discrepancy is flagged for the reviewer.
The chief-complaint can't-miss lists in `data/cc.txt` are a provisional clinical curation, not text from the book.

Open `tintinalli/` on the site. Everything here is independent of `legacy.html` and `content/`.

## Build and check
```
node tools/tn-build.js          # validate + write tintinalli/dist/
node tools/tn-build.js --check  # validate only (errors fail, warnings do not)
```
`dist/` is committed so GitHub Pages can serve it without a build step.

## Files
- `data/sections.txt`: `id | English | Farsi` (23 sections following the Manual's table of contents)
- `data/cc.txt`: chief complaints with can't-miss lists and red flags
- `data/drugs.txt`: automatic safety flags (high-alert, renal) matched on order text
- `data/conditions/<id>.txt`: one condition per file (format below). Files starting with `_` are ignored.

## Condition file
```
@cond acs
section: cardiovascular            (id from sections.txt)
name: Acute coronary syndrome (ACS)
name_fa: سندرم حاد کرونری
cc: chest-pain, dyspnea            (ids from cc.txt)
keywords: MI, STEMI, سکته قلبی
source: Tintinalli's Emergency Medicine Manual, 8th ed., Ch. 51
status: draft                      (demo | draft | reviewed; reviewed needs reviewer: and reviewed: date)

@features / @ddx / @redflags / @pearls     "- " bullets (Farsi, English terms inline)
                                           @ddx:  - !Can't-miss name @cond-id | note     (! = can't miss, @id optional link)
@guide                                     Farsi study guide: "# heading", "- bullet", blank line = paragraph, **bold**

@variant acs-nste                  (one per stratum: stable vs unstable, level I/II/III, ...)
name: NSTE-ACS, stable
level: II                          (I | II | III)
imp: ACS (NSTE-ACS)
cond: Urgent                       (Urgent | Emergent)
act: CBR                           (RBR | CBR)
diet: NPO                          (PO | NPO)
ecg: stat                          (none | once | stat)   stat = ECG STAT 0 – 30 – 60 min
cxr: portable                      (none | PA | portable)
@scenario    Farsi case
@why         Farsi: why this variant
@escalate    "- " bullets: when to move to a higher-level variant
@I @L @S @A @T @Co @N              extra orders per slot; each line:
- [if condition] Order text {hi} {ci: avoid if ...} {renal: ...} | why this order
```
The fixed block is generated automatically, in this order: IV line fix, Cardiac monitoring and pulse oximetry,
O2 therapy, ECG (from `ecg:`), CXR (from `cxr:`), then **one** lab item "CBC, BUN, Cr, Na, K" plus every `@L` line,
then `@S`, `@A`, `@T`, `@Co`.

- `@fluid` in `@S` expands to the fluid rule (N/S 500 cc – 1 L, then maintenance; NPO: Serum 1/3 – 2/3, 1 L TDS).
  Leave it out (or write an explicit "No IV fluid" line) for CKD, AKI, anuria, heart failure and pulmonary edema.
- "HM" and "COM" are rejected by the build.
- Write drug names and doses exactly as the book says.
