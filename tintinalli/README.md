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
- `data/cc.txt`: chief complaints with `group:` (the band on the home page), can't-miss lists and red flags
- `data/drugs.txt`: automatic safety flags (high-alert, renal) matched on order text
- `data/conditions/<id>.txt`: one condition per file (format below). Files starting with `_` are ignored.

## Shift board (`js/shift.js`)

`#/shift` is an on-shift working board, not study content. A patient is a bed label, an age and a sex —
**never a name** — and the whole board lives in `localStorage` under `sh.*` on one device; there is no
server and no sync. It is a personal scratchpad, not a medical record.

**Add to a patient** on any condition page composes that order set and writes: the order checklist with
its safety flags, a pending tracker for every lab (comma lists split into individual tests) and image
with an expected-back time, timers parsed out of the order text (`0 – 30 – 60`, "repeat at 3 h",
"reassess"), the chief complaint's can't-miss list as an exclusion checklist, and the local clock
targets for that condition. Marking a high-alert order given needs two taps; marking an analgesic,
nebuliser, fluid bolus or transfusion given schedules its reassessment; a recorded allergy is matched
against both the order text and its `{ci:}` note.

The board sorts patients by what is most urgent, sweeps results that are back but unseen into one inbox,
lists everything due now, and generates an SBAR handover (copy or print). "End shift" shows the shift's
numbers, offers a JSON export and then erases the board.

The turnaround times in `TAT` and the targets in `CLOCKS` are **local service and quality figures, not
statements from the book** — they are editable in `#/shift/settings`.

## Case simulator (`js/case.js`)

`#/case` builds a practice case from the data: the variant's Farsi scenario, the condition's clinical
features (management text, differential dumps and table transcriptions are filtered out) and the
complaint's red flags. The learner names the impression, sets Cond / Act / Diet / ECG / CXR and writes
the order set by searching a palette built from **every order in the database** (~2500 entries).

Matching is by *signature*, not exact text: dose, route and timing wording is stripped, so
"Aspirin 325 mg PO chewed" and "Aspirin 81 mg PO" are the same order. Lab lines are split on commas and
the five fixed labs are dropped, so each test is scored on its own. Scoring reports coverage (how much
of the book's set was ordered), precision (how much of what was ordered belongs), half credit for a
right order in the wrong slot, and a separate "critical misses" list for high-alert items. Results feed
the same spaced-repetition store as the self-test.

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
