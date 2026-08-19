# Loop

An offline-first Android day planner driven by an AI coach over email.

Claude writes tomorrow's plan as JSON inside a Gmail **draft**. Loop reads that draft over
IMAP, runs the day — timers, run and gym logging, task status — pulls sleep and workout
data from Health Connect, scores everything, and at the review gate shows a pre-filled
report to review, annotate and send back by SMTP. Claude reads it on the next run and
adapts.

The authoritative design document is [`docs/SPEC.md`](docs/SPEC.md).
Architecture and the decisions that depart from the spec are in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Status — complete

All nine milestones are implemented.

| Milestone | Scope | State |
|---|---|---|
| M1 | Contract, validator, Room schema, repositories | done |
| M2 | Timer service and Today screen | done |
| M3 | Log modes (`timer` `run` `lift` `status` `check`) | done |
| M4 | Scoring engine | done |
| M5 | Health Connect | done |
| M6 | IMAP/SMTP transport | done |
| M7 | Review gate | done |
| M8 | Notifications, History, widget | done |
| M9 | Settings and onboarding | done |

**186 unit and Robolectric tests pass.** The instrumentation suites — timer persistence
across process death and reboot, the Room migration harness, and the plan-revision merge
against on-device SQLite — compile on every build but have not been *executed*, because
the build container has no KVM and therefore no usable emulator. Run them on a phone with
`./scripts/verify-on-device.sh`.

## Build

Requires JDK 17+ and the Android SDK (platform 35, build-tools 35.0.0).

```bash
echo "sdk.dir=/path/to/Android/Sdk" > local.properties

./gradlew assembleDebug          # app/build/outputs/apk/debug/app-debug.apk
./gradlew test                   # JVM + Robolectric suites
./gradlew assembleDebugAndroidTest   # compiles the instrumentation suites
```

Install:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

The debug build installs as `dev.loop.debug` and can sit alongside a release build.

## Testing

| Suite | Where it runs | Command |
|---|---|---|
| Contract — validator, merge, envelope, day boundary, report schema | JVM, no Android | `./gradlew :core:contract:test` |
| Data — repositories against real SQLite | Robolectric | `./gradlew :core:data:test` |
| Migration + revision merge on-device | **physical device** | `./scripts/verify-on-device.sh` |

The instrumentation suites need real hardware — a container without KVM has no usable
emulator, so they are compiled on every build and executed against a phone.

```bash
./scripts/verify-on-device.sh
```

## Trying it without email

Nothing about the loop requires IMAP to be configured:

- **Load sample** (debug builds) imports `SPEC.md` §3.1's plan, re-dated to today.
- **Paste plan** reads a payload from the clipboard.
- **Share** a plan email or `.json` attachment into Loop from Gmail — the app registers
  for `ACTION_SEND` on `text/plain` and `application/json`.
- **Repeat yesterday** rebuilds the previous day's structure with actuals cleared.

A payload that fails validation is kept, not discarded: it appears under *Rejected
payloads* with its raw text and the full list of problems.

## Module layout

```
:core:contract      pure Kotlin/JVM — schema, validator, merge, envelope, day boundary
:core:data          Room, repositories, the single plan-import write path
:core:designsystem  theme, section accents, typography
:transport          IMAP ingest and SMTP egress            (M6)
:health             Health Connect readers                 (M5)
:feature:today|focus|review|history|settings                (M2–M9)
:app                application shell, navigation, harness
```

`:core:contract` is a plain JVM module with no Android dependency, so the validator and
the scoring engine cannot reach for a platform API and their tests run in milliseconds.

## Configuration

Nothing personal is compiled in. Sections, targets, weights, colours, the report gate and
the sleep target all come from the plan JSON or from settings at runtime, so the app works
for anyone who supplies their own plan.
