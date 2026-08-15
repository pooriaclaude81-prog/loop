# Loop — architecture

Companion to [`SPEC.md`](SPEC.md). The spec says *what*; this says *how*, and records every
place the implementation deliberately departs from it.

---

## 1. Shape

```
        ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 email  │  :transport  │   │   :health    │   │  share/paste │
 ──────►│ IMAP ▸ SMTP  │   │ HealthConnect│   │  ACTION_SEND │
        └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
               │                  │                  │
               └────────► PlanRepository.import ◄─────┘
                                  │
                          ┌───────▼────────┐
                          │   :core:data   │   Room — the source of truth
                          │  repositories  │   Flows out, transactions in
                          └───────┬────────┘
                                  │
                          ┌───────▼────────┐
                          │ :core:contract │   pure JVM: schema, validator,
                          │                │   merge, scoring (M4)
                          └───────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
        :feature:today      :feature:focus      :feature:review …
```

Three rules hold the layering together:

1. **Room is the source of truth.** Email is sync. Every screen works in airplane mode.
2. **`:core:contract` has no Android dependency.** It is a `kotlin("jvm")` module, so this
   is enforced by the compiler rather than by discipline. The validator and the M4 scoring
   engine are pure functions with millisecond tests.
3. **One write path per kind of data.** Every plan — IMAP, share sheet, clipboard, sample,
   generated skeleton — enters through `PlanRepository.import`. Validation, the revision
   merge and the bookkeeping around them can only be got wrong in one place.

## 2. The parse pipeline

```
raw text ──► JsonElement ──► PlanValidator ──► Plan (sealed, total)
             syntax only     accumulates       illegal states
                             every issue       unrepresentable
```

`Json.decodeFromString<PlanDto>()` is **not** used for ingest. kotlinx.serialization fails
fast: the first type mismatch aborts the parse, so SPEC §2.2's "plan couldn't be read"
screen could only ever show one defect and the user would round-trip through Gmail once
per mistake. Instead the payload is parsed to a `JsonObject` — the only genuinely
fail-fast step, since below well-formed JSON there is nothing to walk — and then walked
with `JsonCursor`, whose accessors *record* an `Issue` and return `null` rather than
throwing.

The result is `ValidationResult<Plan>`: `Valid(value, warnings)` or `Invalid(issues)`.
Never a boolean, never a thrown exception, never a partial list.

`IssueCode` is a stable enum and is what tests assert on. Messages are for humans and may
be reworded freely.

### Errors versus warnings

An **error** means the plan cannot be used. A **warning** means Loop assumed, repaired or
ignored something and carried on. The distinction is not cosmetic: rejecting a whole day's
plan because Claude's weights summed to 0.99 is a far worse outcome than rescaling them.
Warnings are stored on the plan row, shown in the UI, and echoed back to Claude in the
report's `plan_feedback` block so the drift is corrected at the source.

Unknown fields are warnings, always. Claude will extend the schema faster than the app
ships support for it, and a new field must never cost someone their morning.

## 3. Departures from SPEC.md

Each of these is a place the spec is wrong, silent, or self-contradictory. They are listed
so a future session can re-litigate them with the reasoning intact.

### 3.1 A planned rest day is unwinnable under §6 — **fixed**

§6 computes the day score as `Σ wᵢ · sᵢ`. If Claude writes a rest day with no exercise
tasks and `exercise` has weight 0.20, the maximum achievable day score is 0.80. That
directly contradicts §7's binding tone rule that "rest days are planned, not failures".

**Loop:** a section with no tasks scores `null`, not `0.0`, and day-score weights are
renormalised across scorable sections only. `section_scores` is nullable on the wire so
Claude can tell "empty" from "failed" — which §3.2's schema cannot currently express.

### 3.2 No logical day boundary is defined — **04:00**

Everything keys on `date`, but nothing says when a day ends. Midnight is the wrong answer
here: §3.2's own example has `bedtime: "01:40"`. Under a midnight boundary a session
started at 01:30 lands on the following day, splits the wall-clock span that §6's
fragmentation factor divides by, and breaks the streak it should have extended.

**Loop:** the logical day rolls at **04:00 local**, configurable, applied in exactly one
place (`LogicalDay`) and baked into the primary keys of `sessions` and `task_state`. A
session spanning the boundary is split proportionally rather than attributed to whichever
day it started in.

### 3.3 `priority` → section weight is undefined — **1/priority, normalised**

§6 says section score is the mean of its task scores "weighted by task priority if
present", but `1/p` and `(max+1−p)` give materially different answers, and §3.1 puts
priority on some tasks and not others.

**Loop:** weight = `1/priority`, normalised within the section; a missing priority
defaults to 1. A section with no priorities therefore collapses to the plain mean §6
describes, which is why this reading was chosen over the alternatives.

### 3.4 The revision merge's hard cases are unstated — **tombstones**

"Merges by key and never discards logged actuals" does not cover a task present in rev 1,
absent in rev 2, **with work logged against it**.

| Case | Behaviour |
|---|---|
| Added in the revision | inserted |
| Dropped, nothing logged | removed |
| Dropped, work logged | **tombstoned** — kept, flagged, still scored |
| Target changed | new target adopted, actual untouched, rescored |
| **Mode changed** with work logged | old definition tombstoned under `<key>~pre-rev`, new task added, surfaced loudly |
| Section dropped but its work survived | section retained, back in the weight pool |
| Revision not newer | rejected — a late rev 1 cannot undo rev 2 |
| Different `plan_id`, same date | merged as a replacement, actuals preserved |

Tombstoned tasks still count toward the section score. You did the work.

### 3.5 `plans` keyed on `plan_id` alone loses the audit trail — **`(plan_id, rev)`**

§4's single-column key makes `rev: 2` overwrite `rev: 1` in place. Loop keys on
`(plan_id, rev)` with exactly one row flagged `is_active` per date, so revisions
accumulate and "Claude revised your plan at 14:20" remains answerable.

### 3.6 Division by zero and silent zeros

- `band_score` with `hi == lo` — the §6 decay margin is zero. Reversed bands are rejected;
  zero-width bands warn and degrade to exact-match-or-zero.
- `calibration` = actual ÷ planned with nothing planned must serialise as `null`. A `0`
  would make §7 step 3 cut targets for a section that was deliberately never planned.
- `frag` = focused ÷ span with a zero span (an instant retroactive entry) clamps rather
  than crashing.

### 3.7 `run_type` and muscle groups are exact-match strings

§6 gives run type a flat 20% of the run score via `run_type == target.run_type`. `"Easy"`
versus `"easy"` is a silent 20% loss with nothing in the UI to explain it.

**Loop:** both sides are case-folded and normalised; values outside the known vocabulary
warn but still parse, so a deliberate `"fartlek"` works while a typo surfaces. The
canonical lists live in `Vocabulary` and must be given to the Claude skill at setup.

### 3.8 Plan versus settings precedence — undefined in the spec

`report_gate` and `sleep_target_min` appear in **both** the plan JSON (§3.1) and in
settings (M9). Loop's rule:

- **User wins** on `report_gate` and `sleep_target_min`. A coach should not be able to
  move someone's evening or redefine their sleep goal from an email.
- **Plan wins** on section structure, weights and colours — that *is* the coaching. The
  settings values are the fallback used when no plan has arrived.

### 3.9 §4's `settings` table versus DataStore — **split by transactionality**

The brief specifies DataStore; §4 specifies a Room table. Both are right for different
data. `last_seen_uid` must commit in the same transaction as the plan it came from, or a
crash re-imports or skips a draft — DataStore cannot do that. So: user preferences in
DataStore, sync bookkeeping in Room's `app_state`.

### 3.10 Schema gaps

- `sessions` had nowhere to record Pomodoro breaks (§5.2), the `unverified` tail (§5.2),
  or the optional 1–5 quality rating (§9). All are columns now.
- `health_daily` omitted five of the derived metrics §1.4 mandates — midpoint, midpoint
  deviation, sleep debt, RHR delta, wake-to-start. Added, because Health Connect is a
  short-retention buffer (§1.1) and cannot be re-queried for history.
- `reports` had `sent_at` but no way to express §2.4's `unsent` and `carried` states.
- Nothing carried validation feedback back to Claude, so a plan Loop had to repair failed
  identically every morning. `plan_feedback` was added to the report.

### 3.11 The §2.1 secret is a routing tag, not authentication

Four characters in a **subject line** — visible in Gmail search and notification previews.
Against a network attacker it is meaningless; the real threat model is "someone who can
write to your Drafts", and they already own the mailbox. Its job is to stop Loop importing
an unrelated message.

**Loop:** six characters of Crockford base32 with `0/O/1/I` removed, since it is
transcribed by hand into the Claude skill exactly once. It is excluded from logs and from
every report payload.

## 4. Timer persistence (schema decided in M1, service lands in M2)

The hard constraint is that killing the app, rebooting, or Doze must not lose more than
ten seconds. The failure mode that makes this hard is not obvious:

> `SystemClock.elapsedRealtime()` resets to zero on reboot.

A session persisted in elapsed-realtime terms is therefore unrecoverable across exactly
the restart it needs to survive. So:

- **Persisted:** wall-clock milliseconds (`startTs`, `endTs`).
- **In-process:** `elapsedRealtime` deltas, which are immune to the user or NTP moving the
  clock.
- **`bootId`** = `currentTimeMillis − elapsedRealtime`, near-constant within a boot, so
  recovery can distinguish "we rebooted" from "the clock moved".

A session is one continuous run. Pausing closes it; resuming opens a new one — so focused
minutes are just the sum of durations, and no separate pause ledger can drift out of sync.
Recovery closes any still-open session at its last heartbeat and flags it `unverified`,
because nothing can attest to what happened after that write.

## 5. Scoring (M4)

Pure functions in `:core:contract`, no Android types. Beyond the §6 formulas:

- Overflow above target is reported separately and never offsets another task.
- Fragmentation applies to timed tasks only.
- Band scores penalise **both** directions — running an easy run fast is a miss.
- Section scores renormalise over scorable sections (§3.1 above).
- The day score is computed continuously and **rendered only on Review and History**.
  It must not appear in the Today header, a widget, or a notification.

## 6. Conventions

- Kotlin official style, four-space indent, trailing commas.
- `@Serializable` domain classes carry explicit `@SerialName` in snake_case matching the
  wire format. Never rely on property-name defaults for anything that crosses the wire.
- Repositories expose `Flow`; suspend functions for writes; no `LiveData`.
- Time is read through `Clocks`, never `Instant.now()` directly, so tests control it and
  the day-rollover rule is applied in one place.
- `fallbackToDestructiveMigration` is banned. Room schemas are committed under
  `core/data/schemas/`.
- Comments explain *why*, especially where the code departs from `SPEC.md`.
