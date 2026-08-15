# Loop — working conventions

Read [`docs/SPEC.md`](docs/SPEC.md) for what the app is, and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how it is built and where the
implementation deliberately departs from the spec. This file is the short version: the
conventions that keep sessions consistent.

## Build order

Milestones M1–M9 are defined in the project brief. **Work one milestone at a time.** After
each: build, run the tests, report what actually ran, and stop for the user to install and
try it on a device. Do not start the next milestone unsolicited.

Current state: **M1 complete** (contract, validator, Room schema, repositories).

## Non-negotiables

These come from the brief. Breaking one makes the app useless, not merely worse.

1. **The timer survives everything.** Foreground service, `specialUse`, elapsed time from
   `SystemClock.elapsedRealtime()` deltas — never tick counting — persisted every 10 s.
   Wall clock is what gets *written*; elapsedRealtime resets on reboot.
2. **Read Gmail Drafts, not the inbox.** Discover the folder via the IMAP `\Drafts`
   special-use attribute. Never hardcode `[Gmail]/Drafts` — it is localised.
3. **The day score is hidden until the review gate.** Per-section and per-task progress is
   visible all day; the composite day score renders only on Review and History. Not in the
   Today header, not in a widget, not in a notification. Visible scores cause late-night
   score-chasing — this is a product decision, not an oversight.
4. **Nothing auto-sends.** The report is composed automatically and sent only on an
   explicit tap.
5. **Offline-first.** Room is the source of truth; email is sync. Every screen works in
   airplane mode.
6. **Never fail silently.** A malformed plan, an IMAP auth failure, a missing permission —
   each produces a visible, actionable state. No swallowed exceptions.
7. **Health Connect is a buffer, not a database.** Read it, persist to Room immediately,
   never query it for history.
8. **No hardcoded personal data.** Sections, targets, weights, colours and email are
   configuration. The app must work for anyone with their own plan JSON.

## Code conventions

- Kotlin official style, four-space indent, trailing commas.
- Modules: `:core:contract` is **pure JVM** — adding an Android dependency to it is a
  design error, not a convenience. Features never depend on each other.
- Wire-crossing classes are `@Serializable` with explicit snake_case `@SerialName`. Never
  rely on property-name defaults for JSON that Claude reads or writes.
- Repositories expose `Flow` for reads and `suspend` for writes. No `LiveData`.
- All time goes through `Clocks`. Never call `Instant.now()` or `System.currentTimeMillis()`
  at a call site — tests must be able to control the clock, and the 04:00 logical-day
  rollover has to be applied in exactly one place.
- Validation returns `ValidationResult`, never a boolean and never an exception. Tests
  assert on `IssueCode`, never on message text.
- `fallbackToDestructiveMigration` is banned. Every schema change gets a migration and a
  committed schema JSON under `core/data/schemas/`.
- Comments explain **why**, and cite the spec section when the code departs from it.

## Testing

| Suite | Runs on | Command |
|---|---|---|
| `:core:contract` | JVM | `./gradlew :core:contract:test` |
| `:core:data` | Robolectric | `./gradlew :core:data:test` |
| instrumentation | **physical device only** | `./scripts/verify-on-device.sh` |

There is no usable emulator in the dev container (no KVM). Instrumentation tests are
compiled on every build (`assembleDebugAndroidTest`) but can only be *executed* on real
hardware. **Never report an instrumentation test as passing unless it actually ran** — say
which suites ran where.

New scoring or validation behaviour gets table-driven tests including boundaries and
division-by-zero cases.

## Design

Dark-first, near-black surfaces, one saturated accent per section driven by the plan's
`color` field, generous whitespace, serif numerals against a clean sans for labels. Motion
only on state change. **No gradients, no glassmorphism, no confetti, no streak
celebrations.** The Focus screen is full-bleed section colour, oversized monospace digits,
task label, nothing else.

## Things that will bite

- `specialUse` foreground services need `PROPERTY_SPECIAL_USE_FGS_SUBTYPE` in the manifest
  on API 34+, or the service throws on start.
- Xiaomi/HyperOS "Autostart" is a **separate** permission from battery-optimisation
  exemption and cannot be requested programmatically. M9 needs a guided manual step.
- `TYPE_SIGNIFICANT_MOTION` is not present on every device — the M2 idle challenge needs a
  documented fallback.
- Mi Fitness frequently does not write `SpeedRecord`. Derive pace from the
  `ExerciseSessionRecord`'s distance and duration; treat `SpeedRecord` as refinement.
- Core library desugaring is on deliberately: `java.time` exists at API 26, but the
  platform tzdb is frozen on older devices and Iran dropped DST in 2022.
