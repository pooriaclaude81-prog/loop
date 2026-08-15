# Daily Planner + Claude Coach — Implementation Spec v1

Working name: **Loop**. Offline-first Android app. Claude plans by email at night, the app runs the day, the user reviews and sends a report back. No Claude API, no backend server.

**Locked decisions**
- Report is **gated** — auto-composed, user reviews and taps Send.
- Day score is **hidden until the review gate**; per-section progress is visible all day.
- Health data comes from **Health Connect**, sourced from Mi Fitness (Redmi Watch 5 Active). Confirmed working.
- **One Gmail account, both directions.** Claude's Gmail connector cannot send, only draft — so Claude writes a tagged *draft*, and the app reads `[Gmail]/Drafts` over IMAP. The app sends its report by SMTP to the same address, where Claude's connector reads it.
- Email transport is a **plugin**, not the architecture. Paste/share always works.
- Claude is **stateless between runs**; the report carries rolling state.
- No throwaway MVP phase — the first build is the real app.

---

## 1. Health & sleep layer

### 1.1 Primary path — Health Connect

**Dependency**

```kotlin
implementation("androidx.health.connect:connect-client:1.1.0")
```

**Manifest**

```xml
<uses-permission android:name="android.permission.health.READ_SLEEP"/>
<uses-permission android:name="android.permission.health.READ_STEPS"/>
<uses-permission android:name="android.permission.health.READ_HEART_RATE"/>
<uses-permission android:name="android.permission.health.READ_RESTING_HEART_RATE"/>
<uses-permission android:name="android.permission.health.READ_EXERCISE"/>
<uses-permission android:name="android.permission.health.READ_DISTANCE"/>
<uses-permission android:name="android.permission.health.READ_TOTAL_CALORIES_BURNED"/>

<queries>
  <package android:name="com.google.android.apps.healthdata"/>
</queries>
```

Plus a permissions-rationale activity with intent filter
`androidx.health.connect.action.SHOW_PERMISSIONS_RATIONALE` — required, even sideloaded.

**Records to read**

| Record | Feeds |
|---|---|
| `SleepSessionRecord` (+ stages) | bedtime, wake time, asleep minutes, deep/REM split |
| `RestingHeartRateRecord` | recovery signal for training load |
| `ExerciseSessionRecord` | auto-fill run/gym cards |
| `DistanceRecord`, `SpeedRecord` | run distance and pace |
| `StepsRecord`, `TotalCaloriesBurnedRecord` | day context |
| `HeartRateRecord` | avg/max HR per session |

**Sync rules**

- `HealthConnectClient.getSdkStatus()` on launch; degrade silently to manual entry if unavailable.
- **Persist everything locally on first read.** Treat Health Connect as a short-retention buffer, not a database — pull daily and never rely on it for history.
- Pull window: last night's sleep = sessions overlapping `[yesterday 18:00, today 12:00]`, take the longest.
- Sync triggers: on app open, on the wake-detected event, at the report gate, and a `WorkManager` job every 3h.
- Deduplicate against manual entries by time overlap; Health Connect wins, manual entry is kept as `superseded`.
- Every derived field carries `source: health_connect | gadgetbridge | manual`, and the report passes that through so Claude can discount hand-entered data.

### 1.2 Fallback A — Gadgetbridge

Only if the Health Connect test shows no sleep data. Gadgetbridge supports the Redmi Watch 5 Active over the Xiaomi protobuf protocol but needs the auth token pulled from Mi Fitness first, and it takes exclusive control of the BLE link — you lose Mi Fitness while it's connected.

Integration: enable Gadgetbridge auto-export (SQLite) to a folder, have the user grant that folder via the Storage Access Framework, read the sleep and activity tables on a schedule. Read-only, never write.

### 1.3 Fallback B — manual

Two-tap sleep entry on the Today screen, prefilled from the 7-day median bedtime and wake time. Costs 5 seconds and guarantees the coach is never blind.

### 1.4 Derived hygiene metrics

Computed nightly, stored in `health_daily`, sent in the report:

- `asleep_min`, `in_bed_min`, `bedtime`, `wake_time`
- `efficiency` = asleep ÷ in-bed
- `midpoint` = the clock midpoint of the sleep session — the single best circadian marker
- `midpoint_deviation_min` = |midpoint − 14-day median midpoint|
- `sleep_debt_min` = Σ over 7 days of max(0, target − actual)
- `rhr_delta` = today's resting HR − 14-day baseline
- `wake_to_start_min` = wake time → first timer start (a strong procrastination signal, and free)

Optional one-tap micro-logs, off by default: caffeine cutoff time, screen-off time, morning energy 1–5.

### 1.5 Hygiene score

```
duration   = band_score(asleep_min, target ± 45min)   // over-sleeping also decays
timing     = clamp(1 − midpoint_deviation_min / 90, 0, 1)
efficiency = clamp((eff − 0.75) / 0.20, 0, 1)

hygiene = 0.50·duration + 0.30·timing + 0.20·efficiency
```

**Display rule:** hygiene is shown as *context* on the Today screen, never as a pass/fail ring, and it is excluded from the day score. Scoring your sleep the way you score your study hours creates anxiety that makes sleep worse. Its job is to explain the day and shape tomorrow's plan, not to be another thing to fail at. The skill (§6) enforces the same rule in language.

---

## 2. Transport layer

### 2.1 Addressing

| | |
|---|---|
| Subject in | `[LOOP1\|PLAN] 2026-08-16 · <secret>` |
| Subject out | `[LOOP1\|REPORT] 2026-08-15 · <secret>` |
| Body | Human-readable markdown, then a fenced ` ```loop ` block with the JSON |
| Secret | 4-char per-user token generated at setup, shown once, pasted into the Claude skill |

Both directions readable in Gmail by a human. Anything without a matching prefix *and* secret is ignored.

### 2.2 Ingest — IMAP (automatic)

- Jakarta Mail Android port: `com.sun.mail:android-mail` + `android-activation`.
- `imaps://imap.gmail.com:993`, login with a **Google App Password** (requires 2FA on the account). IMAP must be enabled in Gmail settings.
- **Read the Drafts folder, not the inbox** — Claude can only draft. Discover it via the IMAP `\Drafts` special-use attribute rather than hardcoding `[Gmail]/Drafts`, which is localized.
- `SubjectTerm("[LOOP1|PLAN]")`, UID-based, persist `last_seen_uid`. Mark imported drafts `\Seen`; never delete them.
- Credentials in `EncryptedSharedPreferences` backed by a Keystore `MasterKey`. Never logged, never in the report.
- Schedule: `PeriodicWorkRequest` every 30 min with `NetworkType.CONNECTED`, plus one-shot on `BOOT_COMPLETED` and on network regained.
- Parse → validate against the schema → on failure, store raw and notify "plan couldn't be read", showing the raw text with a manual-import button. Never fail silently.

### 2.3 Ingest — manual (always available, zero setup)

- Intent filter for `ACTION_SEND` on `text/plain` and `application/json`: share the email or attachment from Gmail into Loop.
- "Paste plan" button reading the clipboard.

### 2.4 Egress — gated

1. At `report_gate_time` (default 21:30) a notification fires: *"Review today — 4 of 6 done."*
2. Review screen opens **pre-filled**: every actual, every score, sleep block, and a list of anything ambiguous flagged for confirmation.
3. User edits anything, writes one freeform note (text or voice-to-text — this field carries more signal than any metric).
4. **Send** → SMTP `smtp.gmail.com:587`, STARTTLS, same app password. Fallback: `ACTION_SENDTO` with a prefilled `mailto:` for the user to send from Gmail.
5. If not sent by 23:30, a single silent reminder. If still unsent at 02:00, mark `unsent` and roll today's data into tomorrow's report as `carried`. Never auto-send.

---

## 3. Data contract v1

### 3.1 Plan

```json
{
  "schema": 1, "type": "plan", "date": "2026-08-16",
  "plan_id": "a4f9-0816", "rev": 1, "tz": "Asia/Tehran",
  "coach_note": "You slept 5h10m and RHR is +6. Tempo run is now an easy 5k.",
  "sleep_target_min": 450,
  "report_gate": "21:30",
  "sections": [
    { "key": "study", "label": "Study", "weight": 0.40, "color": "indigo",
      "tasks": [
        { "key": "study.cardio", "label": "Cardiology", "mode": "timer",
          "target_min": 90, "window": "10:00-12:00", "priority": 1 },
        { "key": "study.pharm", "label": "Pharmacology", "mode": "timer",
          "target_min": 45, "priority": 2 }
      ]},
    { "key": "exercise", "label": "Exercise", "weight": 0.20, "color": "amber",
      "tasks": [
        { "key": "ex.run", "label": "Easy 5k", "mode": "run",
          "target": { "distance_km": 5, "pace_band": ["5:40","6:10"],
                      "run_type": "easy" }},
        { "key": "ex.gym", "label": "Push day", "mode": "lift",
          "target": { "groups": ["chest","triceps"], "exercises": 5,
                      "volume_kg": 8000, "duration_min": 60 }}
      ]},
    { "key": "research", "label": "Research", "weight": 0.25, "color": "teal",
      "tasks": [
        { "key": "res.mirna", "label": "miRNA review — intro", "mode": "timer",
          "target_min": 60 }
      ]},
    { "key": "thesis", "label": "Theses", "weight": 0.15, "color": "coral",
      "tasks": [
        { "key": "th.gholami", "label": "Gholami — results chapter",
          "mode": "status", "note": "4 days untouched" }
      ]}
  ]
}
```

**`key` is stable across days.** `th.gholami` is the same task on Monday and Friday. This is what makes streaks, staleness and history survive nightly regeneration.

**`mode` drives the UI:** `timer` → stopwatch card · `run` → run logger (auto-fills from Health Connect) · `lift` → set logger · `status` → three-state chip · `check` → checkbox.

**`rev`** lets Claude push a mid-day revision. The app merges by key and never discards logged actuals.

### 3.2 Report

Same shape with `actual` added per task, plus:

```json
{
  "type": "report", "date": "2026-08-15", "plan_id": "a4f9-0815",
  "day_score": 0.72,
  "section_scores": { "study": 0.81, "exercise": 0.60,
                      "research": 1.00, "thesis": 0.50 },
  "health": { "asleep_min": 310, "bedtime": "01:40", "wake_time": "07:05",
              "efficiency": 0.89, "midpoint_deviation_min": 52,
              "sleep_debt_min": 240, "rhr_delta": 6,
              "wake_to_start_min": 145, "hygiene": 0.44,
              "source": "health_connect" },
  "state": {
    "scores_14d": [0.81, 0.66, 0.90, 0.72, ...],
    "section_adherence_7d": { "study": 0.78, "exercise": 0.55,
                              "research": 0.92, "thesis": 0.40 },
    "streaks": { "study": 6, "exercise": 0 },
    "stale_tasks": [ { "key": "th.gholami", "days": 5 } ],
    "calibration": { "study": 0.71, "research": 1.05 },
    "sleep_7d_avg_min": 352,
    "data_quality": { "manual_entries": 2, "timer_gaps": 1 }
  },
  "user_note": "Slept badly, migraine until noon. Cardiology felt useless."
}
```

`calibration` is the ratio actual ÷ planned. Below 0.8 for a week means Claude is overplanning and must cut targets, not repeat them.

---

## 4. App architecture

**Stack:** Kotlin · Jetpack Compose · Material 3 · Room · WorkManager · Hilt · kotlinx.serialization · Jakarta Mail · Health Connect client. minSdk 26, target 35.

**Modules:** `:core:data` (Room, repos) · `:core:contract` (schema + validator, shared with tests) · `:feature:today` · `:feature:focus` · `:feature:review` · `:feature:history` · `:transport` (ingest/egress plugins) · `:health` (Health Connect + fallbacks).

**Room schema**

```
plans        (plan_id PK, date, rev, raw_json, imported_at, source)
tasks        (task_key, plan_id, section_key, label, mode,
              target_json, window_start, window_end, sort_order)
sessions     (id PK, task_key, start_ts, end_ts, source, note)
task_state   (task_key, date, status, actual_json, score)  PK(task_key,date)
health_daily (date PK, sleep_start, sleep_end, asleep_min, in_bed_min,
              deep_min, rem_min, efficiency, rhr, steps, source, synced_at)
reports      (date PK, json, composed_at, sent_at, transport)
settings     (key PK, value)
```

Everything writes locally first. Email is sync, never source of truth.

---

## 5. App behaviour

### 5.1 Screens

**Today** — vertical timeline, section colour on the left rail, current block expanded with a live ring. Sleep strip at the top: bedtime → wake, duration, one plain-language line ("2h under target, third short night"). Day ring in the header. Long-press any task → log retroactively.

**Focus** — full screen, section colour as background, oversized monospace digits, task label, everything else gone. Swipe down to exit, tap to pause. Keeps the screen on optionally.

**Log sheets** — mode-specific. `run`: distance, duration, type, pace band indicator, RPE 1–10, all prefilled from Health Connect with a "detected" badge. `lift`: exercise rows with sets × reps × weight, running volume total, group chips. `status`: three chips plus a required one-line next-action when marking in-progress.

**Review** — the gate. Everything pre-filled, everything editable, one note field, one Send button.

**History** — 7×N heatmap per section, day-score trend with 7-day rolling average dominant, calibration chart (planned vs actual minutes), sleep duration and midpoint chart, streaks.

### 5.2 Timer service

Non-negotiable details, because these are what break in practice:

- **Foreground service** with `FOREGROUND_SERVICE_SPECIAL_USE`, ongoing notification with Pause/Stop actions and `CATEGORY_STOPWATCH`. Anything less and Android kills it.
- Compute elapsed time from `SystemClock.elapsedRealtime()` deltas, never from tick counting.
- **Persist to Room every 10 s.** A crash costs at most 10 seconds.
- **One global active timer.** Starting a second auto-pauses the first and records the switch.
- **Retroactive entry is mandatory**, flagged `source: manual` so the report is honest about data quality.
- **Idle challenge:** timer running 45 min with the screen dark and no significant-motion sensor events → notification "still on Cardiology?" → no answer in 10 min → auto-pause and mark the tail `unverified`.
- Optional Pomodoro per task with break tracking excluded from focused minutes.

### 5.3 Notifications

Block start (5 min prior) · block end · idle challenge · stale `status` task nudge at 18:00 · report gate at 21:30 · **plan-missing alarm at 07:00** with a one-tap "repeat yesterday's skeleton". All on separate channels so each can be silenced independently.

**Wear:** no watch app needed. The ongoing timer notification bridges to the Redmi automatically and gives you glanceable elapsed time. Timer controls from the wrist need a real Wear OS app, which this watch doesn't run — accept it.

### 5.4 Visual direction

Dark-first, near-black surfaces, one saturated accent per section, generous whitespace, a single serif face for numerals against a clean sans for labels. Motion only on state change: rings fill, cards settle, the focus screen fades. No gradients, no glass, no confetti. Restraint reads as premium.

---

## 6. Scoring engine

```
band_score(x, lo, hi):
    1.0 inside [lo, hi]
    otherwise decay linearly to 0 across a margin of (hi − lo)
```

**Timer tasks (study, research)**

```
raw    = min(actual_min / target_min, 1.0)
frag   = clamp(focused_min / wall_clock_span, 0.5, 1.0)
score  = raw × frag
```

90 minutes spread across 5 hours is not 90 minutes. Surplus above target is reported separately as `overflow_min`, never used to mask a skipped task.

**Run**

```
score = 0.40 · band_score(distance, 0.9·target, 1.1·target)
      + 0.40 · band_score(pace, pace_band.lo, pace_band.hi)
      + 0.20 · (run_type == target.run_type ? 1 : 0)
```

Pace is a **band**. Running an easy run fast is a miss, not a bonus — that's the whole point of an easy run.

**Lift**

```
score = 0.50 · (exercises_done / exercises_planned)
      + 0.30 · min(volume_kg / target_volume, 1.0)
      + 0.20 · band_score(duration, 0.8·target, 1.3·target)
```

**Status** — `not_started` 0 · `in_progress` 0.5 · `done` 1.0. No partial credit, staleness tracked automatically.

**Section** — mean of its task scores, weighted by task priority if present.

**Day** — `Σ wᵢ · sᵢ`, each `sᵢ` capped at 1.0. Hygiene is excluded.

The 7-day rolling average is the headline number in the UI. Daily scores are noisy and punishing.

---

## 7. Claude skill

**Inputs it must be given at setup:** the section list and weights, the email secret, the recipient address, sleep target, training pattern, report gate time.

**Nightly procedure:**

1. Read the incoming report. If none arrived, assume a zero-data day and say so plainly rather than guessing.
2. Read `state` before writing anything. React to the 7–14 day trend, not to yesterday.
3. Apply calibration: if `calibration[section] < 0.8` over 7 days, cut that section's targets by the shortfall. Never re-issue a target that has failed three days running.
4. Apply health gating, in this order:
   - `asleep_min` < 80% of target **or** `rhr_delta` ≥ +5 → downgrade the hardest training session one tier (tempo → easy, heavy → technique), move the highest-cognitive block later.
   - `sleep_debt_min` > 300 → insert an explicit earlier bedtime as a task and reduce total planned minutes by ~20%.
   - Two consecutive nights below 70% of target → the plan's headline is recovery, not output.
5. Escalate stale `status` tasks: day 3 → move to priority 1; day 5 → say directly that the commitment needs to be renegotiated or dropped.
6. Periodize training: no two hard sessions back to back, deload every fourth week.
7. Emit the plan, **validate it against the schema before sending**, then send.

**Tone rules, binding:**

- Rest days are planned, not failures. A zero day is data.
- Illness, travel and grief trigger a reduced template, never a scold.
- One line of adjustment per miss. No lectures, no accumulating guilt.
- Never compare the person to an idealized version of themselves, and never treat sleep as a personal failing — it is an input to be worked around.
- The `user_note` outranks every metric. If it says "migraine," the numbers are noise.

---

## 8. Build order

**Phase 0 — prove the contract (one weekend).** Schema + validator with unit tests. Paste-plan ingest. Timer service with the foreground notification and 10s persistence. Checkbox and status modes. Report composed to clipboard. No email, no health. If this feels good for five days, continue.

**Phase 1 — close the loop (1–2 weeks).** IMAP ingest with WorkManager, encrypted credentials, SMTP egress behind the review gate, full scoring engine, rolling state, notifications, Today and Review screens.

**Phase 2 — health (1 week).** Health Connect permissions and reads, `health_daily`, derived hygiene metrics, run auto-fill, sleep strip on Today, health block in the report, health gating in the skill.

**Phase 3 — polish.** History and charts, Focus screen, home-screen widget, mid-day revisions, multi-profile so it's usable by someone other than you, Gadgetbridge fallback only if Phase 2's test failed.

---

## 9. Risk register

| Risk | Mitigation |
|---|---|
| Mi Fitness doesn't write sleep to Health Connect | Test before Phase 2. Gadgetbridge fallback, manual entry always present |
| Google App Password unavailable or revoked | Share-sheet ingest + `ACTION_SENDTO` egress cover the whole loop manually |
| Claude emits malformed JSON | Validate on both sides; app shows raw text with manual import; skill self-checks before sending |
| Plan email delayed or filtered | 07:00 missing-plan alarm with "repeat yesterday's skeleton" |
| OEM battery killer stops WorkManager | Onboarding step requesting battery-optimization exemption; ingest also runs on app open |
| Timer left running overnight | Idle challenge + auto-pause + `unverified` flag |
| Scores become punitive | Rolling average as headline, hygiene excluded from scoring, binding tone rules in the skill |
| Optimizing for minutes instead of learning | Optional 1–5 self-rated output quality per timer session, sent to Claude alongside minutes |

---

## 10. Open questions

1. Does Mi Fitness on your build actually write `SleepSessionRecord`? Run the §1.1 test tonight.
2. Publishing intent — personal sideload only, or Play Store? Store distribution means a privacy policy, Health Connect data-type declarations, and no Gmail API path.
3. Should the day score be visible at all before the report gate, or hidden until review to avoid mid-day score-chasing?
