package dev.loop.core.contract.domain

import dev.loop.core.contract.json.InstantSerializer
import dev.loop.core.contract.json.LocalDateSerializer
import dev.loop.core.contract.json.LocalTimeSerializer
import dev.loop.core.contract.json.ZoneIdSerializer
import dev.loop.core.contract.validate.Issue
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class ReportStatus {
    /** Assembled and waiting at the review gate. */
    @SerialName("composed")
    COMPOSED,

    @SerialName("sent")
    SENT,

    /** Still unsent at 02:00 (SPEC.md §2.4). Its data rolls into tomorrow. */
    @SerialName("unsent")
    UNSENT,

    /** An earlier unsent day, carried inside a later report. */
    @SerialName("carried")
    CARRIED,
}

@Serializable
data class HealthBlock(
    @SerialName("asleep_min") val asleepMin: Int? = null,
    @SerialName("in_bed_min") val inBedMin: Int? = null,
    @Serializable(with = LocalTimeSerializer::class)
    @SerialName("bedtime") val bedtime: LocalTime? = null,
    @Serializable(with = LocalTimeSerializer::class)
    @SerialName("wake_time") val wakeTime: LocalTime? = null,
    @SerialName("efficiency") val efficiency: Double? = null,
    @SerialName("deep_min") val deepMin: Int? = null,
    @SerialName("rem_min") val remMin: Int? = null,
    /** Clock midpoint of the sleep session — SPEC.md §1.4's circadian marker. */
    @Serializable(with = LocalTimeSerializer::class)
    @SerialName("midpoint") val midpoint: LocalTime? = null,
    @SerialName("midpoint_deviation_min") val midpointDeviationMin: Int? = null,
    @SerialName("sleep_debt_min") val sleepDebtMin: Int? = null,
    @SerialName("rhr") val restingHeartRate: Int? = null,
    @SerialName("rhr_delta") val rhrDelta: Int? = null,
    @SerialName("steps") val steps: Int? = null,
    @SerialName("wake_to_start_min") val wakeToStartMin: Int? = null,
    /**
     * SPEC.md §1.5. Context only: excluded from the day score, and never rendered as a
     * pass/fail ring. Scoring sleep the way study hours are scored makes sleep worse.
     */
    @SerialName("hygiene") val hygiene: Double? = null,
    @SerialName("source") val source: DataSource? = null,
)

@Serializable
data class StaleTask(
    @SerialName("key") val key: TaskKey,
    @SerialName("label") val label: String? = null,
    @SerialName("days") val days: Int,
)

/**
 * The rolling state block of SPEC.md §3.2 — what makes Claude stateless between runs.
 *
 * Every aggregate is nullable or explicitly sized, and [daysObserved] says how much
 * history actually exists. On day three a 14-day average is three days of data, and §7
 * step 2 tells Claude to react to the 7–14 day trend; without this field it would read a
 * short window as a real trend.
 */
@Serializable
data class RollingState(
    @SerialName("days_observed") val daysObserved: Int,
    @SerialName("scores_14d") val scores14d: List<Double> = emptyList(),
    @SerialName("section_adherence_7d") val sectionAdherence7d: Map<String, Double> = emptyMap(),
    @SerialName("streaks") val streaks: Map<String, Int> = emptyMap(),
    @SerialName("stale_tasks") val staleTasks: List<StaleTask> = emptyList(),
    /**
     * actual ÷ planned per section. Null where nothing was planned — never 0.0, which
     * §7 step 3 would read as "calibration below 0.8, cut this section's targets" for a
     * section that was deliberately left empty.
     */
    @SerialName("calibration") val calibration: Map<String, Double?> = emptyMap(),
    @SerialName("sleep_7d_avg_min") val sleep7dAvgMin: Int? = null,
    @SerialName("data_quality") val dataQuality: DataQuality = DataQuality(),
)

@Serializable
data class DataQuality(
    @SerialName("manual_entries") val manualEntries: Int = 0,
    @SerialName("timer_gaps") val timerGaps: Int = 0,
    @SerialName("unverified_tails") val unverifiedTails: Int = 0,
    @SerialName("health_source_missing") val healthSourceMissing: Boolean = false,
)

@Serializable
data class ReportTask(
    @SerialName("key") val key: TaskKey,
    @SerialName("label") val label: String,
    @SerialName("mode") val mode: TaskMode,
    @SerialName("target") val target: TaskTarget,
    @SerialName("actual") val actual: TaskActual? = null,
    @SerialName("score") val score: Double? = null,
    @SerialName("overflow_min") val overflowMin: Int? = null,
    @SerialName("priority") val priority: Int = Task.DEFAULT_PRIORITY,
    /** Present when a mid-day revision dropped this task after work was logged. */
    @SerialName("removed_in_rev") val removedInRev: Int? = null,
)

@Serializable
data class ReportSection(
    @SerialName("key") val key: SectionKey,
    @SerialName("label") val label: String,
    @SerialName("weight") val weight: Double,
    /** Null when the section had no tasks — see [Section.isScorable]. */
    @SerialName("score") val score: Double? = null,
    @SerialName("tasks") val tasks: List<ReportTask> = emptyList(),
)

/**
 * A previously unsent day travelling inside today's report (SPEC.md §2.4).
 */
@Serializable
data class CarriedDay(
    @Serializable(with = LocalDateSerializer::class)
    @SerialName("date") val date: LocalDate,
    @SerialName("report") val report: Report,
)

@Serializable
data class Report(
    @SerialName("schema") val schema: Int = Plan.CURRENT_SCHEMA,
    @SerialName("type") val type: String = "report",
    @Serializable(with = LocalDateSerializer::class)
    @SerialName("date") val date: LocalDate,
    @SerialName("plan_id") val planId: PlanId? = null,
    @SerialName("plan_rev") val planRev: Int? = null,
    @Serializable(with = ZoneIdSerializer::class)
    @SerialName("tz") val tz: ZoneId,
    @SerialName("app_version") val appVersion: String,
    @Serializable(with = InstantSerializer::class)
    @SerialName("generated_at") val generatedAt: Instant,
    @SerialName("status") val status: ReportStatus = ReportStatus.COMPOSED,

    /** Null when no section was scorable at all. */
    @SerialName("day_score") val dayScore: Double? = null,
    @SerialName("section_scores") val sectionScores: Map<String, Double?> = emptyMap(),
    @SerialName("sections") val sections: List<ReportSection> = emptyList(),
    @SerialName("health") val health: HealthBlock? = null,
    @SerialName("state") val state: RollingState,

    /** SPEC.md §2.4 step 3: outranks every metric (§7 tone rules). */
    @SerialName("user_note") val userNote: String? = null,

    /**
     * Validation warnings raised against the plan this report answers.
     *
     * Not in SPEC.md §3.2, added deliberately: without a channel back, a plan that Loop
     * had to repair — rescaled weights, an unrecognised `run_type` costing 20% of a run
     * score — fails silently and identically every single morning.
     */
    @SerialName("plan_feedback") val planFeedback: List<Issue> = emptyList(),

    @SerialName("carried") val carried: List<CarriedDay> = emptyList(),
)
