# Extraction progress and conventions

Source: Tintinalli's Emergency Medicine Manual, 8th ed. (189 chapters). The PDF is NOT in this branch (copyright). Work files live outside the repo.
Everything here is `status: draft` (pending physician review). Drug names and doses are written as the book gives them.

## Conventions (keep these fixed for every chapter)
- One file per chapter or per group of chapters: `conditions/chNNN-slug.txt`, several `@cond` blocks allowed. `ch: N` is required; section and source are derived from `chapters.txt`.
- Orders in English, exactly as the book (drug, dose, route, timing). Farsi (with English terms inline) for features, ddx, redflags, guide, pearls, scenario, why, escalate.
- If the book gives no dose for a drug that is needed: write the drug without a dose and add `{note: dose not given in the book}`.
- Never invent doses or tests the book does not mention. Fixed block (IV line, Cardiac monitoring and pulse oximetry, O2, ECG, CXR, CBC/BUN/Cr/Na/K) is generated; only choose `ecg:` and `cxr:` per variant.
- `cond:` Emergent for unstable / time-critical variants, else Urgent. `act:` CBR by default; RBR only for stable minor problems. `diet:` NPO if a procedure, surgery, bleeding, ACS, stroke or imaging-dependent surgery is likely; else PO.
- `ecg:` once for most adults with cardiopulmonary, metabolic, neurologic, toxic or syncopal presentations; stat when MI / arrhythmia / chest pain suspected; none for young patients with minor or non-cardiac problems and for most children.
- `cxr:` PA when stable and the chest matters; portable when unstable; none otherwise.
- Pediatric variants: use `o2:` override (age/weight-based) and the book's weight-based doses.
- `@fluid` only for volume-depleted tachycardic patients; never for CKD, AKI, anuria, heart failure or pulmonary edema.
- Stratify variants the way the book stratifies (stable vs unstable, severity, age group, cause). Level I = resuscitation room, II = urgent, III = minor.
- Each condition: features 4-7, ddx 3-6 (use `!` for can't-miss), redflags 2-4, short Farsi guide, pearls 1-3, 1-3 variants with scenario/why.
- Chief complaints (`cc:`) use ids from `cc.txt`.

## Chapters done
Section 1: ch 1-6 done
Section 2: ch 7-8 done
Section 3: ch 9-16 done
Section 4: ch 17-28 done
Section 5: ch 29-34 done
Section 6: ch 35-49 done
Section 7: ch 50-57 done
Section 8: ch 58-65 done
Section 9 (peds): ch 66-86 done
Section 10: ch 87-99 done
Section 11: ch 100-117 done
Section 12: ch 118-128 done
Section 13: ch 129-132 done
Section 14: ch 133-139 done
Section 15: ch 140-148 done
Section 16: ch 149-153 done
Section 17: ch 154-155 done
Section 18: ch 156-168 done
Section 19: ch 169-176 done
Section 20: ch 177-183 done
Section 21: ch 184-186 done
Section 22: ch 187-188 done
Section 23: ch 189 done
(chapter numbers appended as they are committed)
