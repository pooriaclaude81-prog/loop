package dev.loop.core.data.db

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import java.time.Instant
import java.time.LocalDate

/**
 * Where a plan came from. `GENERATED` covers the 07:00 "repeat yesterday's skeleton"
 * fallback of SPEC.md §5.3, which produces a real, scoreable plan with no email involved.
 */
enum class PlanSource { IMAP, SHARE, CLIPBOARD, GENERATED, SAMPLE }

/**
 * SPEC.md §4 keys `plans` on `plan_id` alone, which makes a `rev: 2` overwrite `rev: 1`
 * in place and destroys the audit trail that the revision merge depends on. Loop keys on
 * `(plan_id, rev)` and marks exactly one row active per logical date.
 */
@Entity(
    tableName = "plans",
    primaryKeys = ["plan_id", "rev"],
    indices = [
        Index(value = ["date"]),
        Index(value = ["date", "is_active"]),
    ],
)
data class PlanEntity(
    @ColumnInfo(name = "plan_id") val planId: String,
    @ColumnInfo(name = "rev") val rev: Int,
    @ColumnInfo(name = "date") val date: LocalDate,
    @ColumnInfo(name = "tz") val tz: String,
    @ColumnInfo(name = "raw_json") val rawJson: String,
    @ColumnInfo(name = "coach_note") val coachNote: String?,
    @ColumnInfo(name = "sleep_target_min") val sleepTargetMin: Int?,
    @ColumnInfo(name = "report_gate") val reportGate: String?,
    @ColumnInfo(name = "imported_at") val importedAt: Instant,
    @ColumnInfo(name = "source") val source: String,
    /** Exactly one active plan per date; revisions supersede rather than replace. */
    @ColumnInfo(name = "is_active") val isActive: Boolean,
    /** Serialised validation issues, so the UI can still explain a repaired plan later. */
    @ColumnInfo(name = "issues_json") val issuesJson: String?,
)

@Entity(
    tableName = "sections",
    primaryKeys = ["plan_id", "rev", "section_key"],
    indices = [Index(value = ["plan_id", "rev"])],
    foreignKeys = [
        ForeignKey(
            entity = PlanEntity::class,
            parentColumns = ["plan_id", "rev"],
            childColumns = ["plan_id", "rev"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
)
data class SectionEntity(
    @ColumnInfo(name = "plan_id") val planId: String,
    @ColumnInfo(name = "rev") val rev: Int,
    @ColumnInfo(name = "section_key") val sectionKey: String,
    @ColumnInfo(name = "label") val label: String,
    @ColumnInfo(name = "weight") val weight: Double,
    @ColumnInfo(name = "declared_weight") val declaredWeight: Double,
    @ColumnInfo(name = "color") val color: String,
    @ColumnInfo(name = "sort_order") val sortOrder: Int,
)

@Entity(
    tableName = "tasks",
    primaryKeys = ["plan_id", "rev", "task_key"],
    indices = [
        Index(value = ["plan_id", "rev"]),
        Index(value = ["task_key"]),
    ],
    foreignKeys = [
        ForeignKey(
            entity = PlanEntity::class,
            parentColumns = ["plan_id", "rev"],
            childColumns = ["plan_id", "rev"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
)
data class TaskEntity(
    @ColumnInfo(name = "plan_id") val planId: String,
    @ColumnInfo(name = "rev") val rev: Int,
    @ColumnInfo(name = "task_key") val taskKey: String,
    @ColumnInfo(name = "section_key") val sectionKey: String,
    @ColumnInfo(name = "label") val label: String,
    @ColumnInfo(name = "mode") val mode: String,
    @ColumnInfo(name = "target_json") val targetJson: String,
    @ColumnInfo(name = "window_start") val windowStart: String?,
    @ColumnInfo(name = "window_end") val windowEnd: String?,
    @ColumnInfo(name = "priority") val priority: Int,
    @ColumnInfo(name = "note") val note: String?,
    @ColumnInfo(name = "sort_order") val sortOrder: Int,
    @ColumnInfo(name = "removed_in_rev") val removedInRev: Int?,
)

enum class SessionKind {
    /** Counts toward focused minutes. */
    WORK,

    /** Pomodoro break — tracked but excluded from focused minutes (SPEC.md §5.2). */
    BREAK,
}

/**
 * One continuous run of the timer. Pausing closes a session; resuming opens a new one, so
 * focused minutes are simply the sum of session durations and no separate pause ledger
 * can drift out of sync with them.
 *
 * [startTs] and [endTs] are **wall-clock** milliseconds, not `SystemClock.elapsedRealtime`.
 * elapsedRealtime resets to zero on reboot, so a session persisted in those terms is
 * unrecoverable across the exact restart the brief requires it to survive. The service
 * uses elapsedRealtime deltas in-process (immune to clock changes) and writes wall clock;
 * [bootId] — `currentTimeMillis − elapsedRealtime`, roughly constant within a boot — lets
 * recovery tell "we rebooted" from "the clock moved".
 */
@Entity(
    tableName = "sessions",
    indices = [
        Index(value = ["task_key"]),
        Index(value = ["logical_date"]),
        Index(value = ["is_open"]),
    ],
)
data class SessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "task_key") val taskKey: String,
    /** Attribution day under the 04:00 rollover, denormalised so day queries stay cheap. */
    @ColumnInfo(name = "logical_date") val logicalDate: LocalDate,
    @ColumnInfo(name = "start_ts") val startTs: Long,
    /** Provisional while [isOpen]; rewritten every 10 s so a kill costs at most 10 s. */
    @ColumnInfo(name = "end_ts") val endTs: Long,
    @ColumnInfo(name = "is_open") val isOpen: Boolean,
    @ColumnInfo(name = "kind") val kind: String = SessionKind.WORK.name,
    @ColumnInfo(name = "source") val source: String,
    /** False once the idle challenge auto-paused an unanswered tail (SPEC.md §5.2). */
    @ColumnInfo(name = "verified") val verified: Boolean = true,
    /** Optional 1–5 self-rated output quality (SPEC.md §9 risk register). */
    @ColumnInfo(name = "quality") val quality: Int? = null,
    @ColumnInfo(name = "boot_id") val bootId: Long,
    @ColumnInfo(name = "note") val note: String? = null,
) {
    val durationMs: Long get() = (endTs - startTs).coerceAtLeast(0)
}

/**
 * Per-task state for one logical day.
 *
 * Keyed on `(task_key, logical_date)` and deliberately *not* on `plan_id`: SPEC.md §3.1
 * makes `task_key` stable across days precisely so history survives nightly regeneration,
 * and binding state to a plan revision would break that on every revision.
 */
@Entity(
    tableName = "task_state",
    primaryKeys = ["task_key", "logical_date"],
    indices = [
        Index(value = ["logical_date"]),
        Index(value = ["task_key"]),
    ],
)
data class TaskStateEntity(
    @ColumnInfo(name = "task_key") val taskKey: String,
    @ColumnInfo(name = "logical_date") val logicalDate: LocalDate,
    @ColumnInfo(name = "section_key") val sectionKey: String,
    @ColumnInfo(name = "status") val status: String,
    @ColumnInfo(name = "actual_json") val actualJson: String?,
    @ColumnInfo(name = "score") val score: Double?,
    /** Kept separate so it can never be used to offset another task (SPEC.md §6). */
    @ColumnInfo(name = "overflow_min") val overflowMin: Int = 0,
    @ColumnInfo(name = "score_components_json") val scoreComponentsJson: String? = null,
    @ColumnInfo(name = "plan_id") val planId: String?,
    @ColumnInfo(name = "updated_at") val updatedAt: Instant,
)

/**
 * SPEC.md §4's `health_daily` omits five of the derived metrics §1.4 mandates
 * (midpoint, midpoint deviation, sleep debt, RHR delta, wake-to-start). They are columns
 * here because §3.2 has to send them and Health Connect is a short-retention buffer that
 * cannot be re-queried for history (§1.1).
 */
@Entity(tableName = "health_daily")
data class HealthDailyEntity(
    @PrimaryKey @ColumnInfo(name = "date") val date: LocalDate,
    @ColumnInfo(name = "sleep_start") val sleepStart: Long?,
    @ColumnInfo(name = "sleep_end") val sleepEnd: Long?,
    @ColumnInfo(name = "asleep_min") val asleepMin: Int?,
    @ColumnInfo(name = "in_bed_min") val inBedMin: Int?,
    @ColumnInfo(name = "deep_min") val deepMin: Int?,
    @ColumnInfo(name = "rem_min") val remMin: Int?,
    @ColumnInfo(name = "efficiency") val efficiency: Double?,
    @ColumnInfo(name = "midpoint") val midpoint: String?,
    @ColumnInfo(name = "midpoint_deviation_min") val midpointDeviationMin: Int?,
    @ColumnInfo(name = "sleep_debt_min") val sleepDebtMin: Int?,
    @ColumnInfo(name = "rhr") val restingHeartRate: Int?,
    @ColumnInfo(name = "rhr_delta") val rhrDelta: Int?,
    @ColumnInfo(name = "steps") val steps: Int?,
    @ColumnInfo(name = "wake_to_start_min") val wakeToStartMin: Int?,
    @ColumnInfo(name = "hygiene") val hygiene: Double?,
    @ColumnInfo(name = "source") val source: String?,
    @ColumnInfo(name = "synced_at") val syncedAt: Instant?,
)

/**
 * SPEC.md §4 has `sent_at` but no way to express §2.4's `unsent` and `carried` states, so
 * [status] and [carriedFromDate] are added here.
 */
@Entity(tableName = "reports")
data class ReportEntity(
    @PrimaryKey @ColumnInfo(name = "date") val date: LocalDate,
    @ColumnInfo(name = "json") val json: String,
    @ColumnInfo(name = "status") val status: String,
    @ColumnInfo(name = "composed_at") val composedAt: Instant,
    @ColumnInfo(name = "sent_at") val sentAt: Instant?,
    @ColumnInfo(name = "transport") val transport: String?,
    @ColumnInfo(name = "carried_from_date") val carriedFromDate: LocalDate?,
    @ColumnInfo(name = "last_error") val lastError: String?,
)

/**
 * Transactional key/value bookkeeping — IMAP `last_seen_uid`, last sync timestamps,
 * onboarding flags.
 *
 * The brief puts user settings in DataStore while SPEC.md §4 has a Room `settings` table.
 * Both are right for different data: `last_seen_uid` must commit in the same transaction
 * as the plan it came from or a crash re-imports or skips a draft, which DataStore cannot
 * do. User-facing preferences live in DataStore; this table is sync state only.
 */
@Entity(tableName = "app_state")
data class AppStateEntity(
    @PrimaryKey @ColumnInfo(name = "key") val key: String,
    @ColumnInfo(name = "value") val value: String,
    @ColumnInfo(name = "updated_at") val updatedAt: Instant,
)

/**
 * A payload that arrived but could not be used. SPEC.md §2.2: on failure, store the raw
 * text and notify — never fail silently, and always leave a manual-import path open.
 */
@Entity(tableName = "ingest_failures")
data class IngestFailureEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "received_at") val receivedAt: Instant,
    @ColumnInfo(name = "source") val source: String,
    @ColumnInfo(name = "subject") val subject: String?,
    @ColumnInfo(name = "raw_text") val rawText: String,
    @ColumnInfo(name = "issues_json") val issuesJson: String,
    @ColumnInfo(name = "dismissed") val dismissed: Boolean = false,
)
