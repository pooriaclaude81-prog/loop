package dev.loop.core.contract.domain

import dev.loop.core.contract.json.LocalDateSerializer
import dev.loop.core.contract.json.LocalTimeSerializer
import dev.loop.core.contract.json.ZoneIdSerializer
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Stable identity for a task across days. SPEC.md §3.1: `th.gholami` is the same task on
 * Monday and Friday — this is what lets streaks, staleness and history survive nightly
 * plan regeneration.
 */
@JvmInline
@Serializable
value class TaskKey(val value: String) {
    override fun toString(): String = value
}

@JvmInline
@Serializable
value class SectionKey(val value: String) {
    override fun toString(): String = value
}

@JvmInline
@Serializable
value class PlanId(val value: String) {
    override fun toString(): String = value
}

@Serializable
enum class TaskMode {
    @SerialName("timer")
    TIMER,

    @SerialName("run")
    RUN,

    @SerialName("lift")
    LIFT,

    @SerialName("status")
    STATUS,

    @SerialName("check")
    CHECK,

    ;

    val wire: String get() = name.lowercase()

    companion object {
        fun fromWire(value: String): TaskMode? =
            entries.firstOrNull { it.wire == value.trim().lowercase() }
    }
}

/**
 * A pace band in seconds per kilometre. [loSecPerKm] is the *faster* bound, so
 * `["5:40", "6:10"]` parses to `lo=340, hi=370` and `lo <= hi` always holds.
 */
@Serializable
data class PaceBand(
    @SerialName("lo_sec_per_km") val loSecPerKm: Int,
    @SerialName("hi_sec_per_km") val hiSecPerKm: Int,
) {
    init {
        require(loSecPerKm <= hiSecPerKm) { "pace band lo must not exceed hi" }
    }

    val marginSec: Int get() = hiSecPerKm - loSecPerKm

    fun format(): List<String> = listOf(formatPace(loSecPerKm), formatPace(hiSecPerKm))

    companion object {
        fun formatPace(secPerKm: Int): String = "%d:%02d".format(secPerKm / 60, secPerKm % 60)
    }
}

/**
 * A soft scheduling hint. SPEC.md §3.1 writes it as `"10:00-12:00"`.
 *
 * Windows are advisory: they drive the block-start and block-end notifications of §5.3
 * but never enter the score. Nothing in §6 penalises working outside the window, and
 * adding such a penalty would punish exactly the flexibility that makes the plan usable.
 *
 * An [end] at or before [start] means the window crosses midnight.
 */
@Serializable
data class TimeWindow(
    @Serializable(with = LocalTimeSerializer::class) val start: LocalTime,
    @Serializable(with = LocalTimeSerializer::class) val end: LocalTime,
) {
    val crossesMidnight: Boolean get() = !end.isAfter(start)

    fun format(): String = "${start.format(dev.loop.core.contract.json.HH_MM)}-" +
        end.format(dev.loop.core.contract.json.HH_MM)
}

/**
 * The per-mode target. Modelled as a sealed hierarchy so the scoring engine (M4) gets an
 * exhaustive `when` with no else branch, and so the wire format's asymmetry — `timer`
 * puts `target_min` at the task's top level while `run`/`lift` nest under `target` —
 * never leaks past the validator.
 */
@Serializable
sealed interface TaskTarget {

    @Serializable
    @SerialName("timer")
    data class Timed(
        @SerialName("target_min") val targetMin: Int,
    ) : TaskTarget

    @Serializable
    @SerialName("run")
    data class Run(
        @SerialName("distance_km") val distanceKm: Double? = null,
        @SerialName("pace_band") val paceBand: PaceBand? = null,
        @SerialName("run_type") val runType: String? = null,
        @SerialName("duration_min") val durationMin: Int? = null,
    ) : TaskTarget

    @Serializable
    @SerialName("lift")
    data class Lift(
        @SerialName("groups") val groups: List<String> = emptyList(),
        @SerialName("exercises") val exercises: Int? = null,
        @SerialName("volume_kg") val volumeKg: Double? = null,
        @SerialName("duration_min") val durationMin: Int? = null,
    ) : TaskTarget

    @Serializable
    @SerialName("status")
    data object Status : TaskTarget

    @Serializable
    @SerialName("check")
    data object Check : TaskTarget
}

@Serializable
data class Task(
    @SerialName("key") val key: TaskKey,
    @SerialName("section_key") val sectionKey: SectionKey,
    @SerialName("label") val label: String,
    @SerialName("mode") val mode: TaskMode,
    @SerialName("target") val target: TaskTarget,
    @SerialName("window") val window: TimeWindow? = null,
    /**
     * Lower is more important. SPEC.md §6 weights section members "by task priority if
     * present" without saying how; Loop uses `1/priority` normalised within the section,
     * and defaults a missing priority to 1 so that a section with no priorities collapses
     * to the plain mean §6 describes. See docs/ARCHITECTURE.md §Scoring.
     */
    @SerialName("priority") val priority: Int = DEFAULT_PRIORITY,
    @SerialName("note") val note: String? = null,
    @SerialName("sort_order") val sortOrder: Int = 0,
    /**
     * Set when a plan revision dropped this task but logged work already existed for it.
     * SPEC.md §3.1 requires that a revision "never discards logged actuals", so the task
     * is tombstoned rather than deleted and still counts toward the section score.
     */
    @SerialName("removed_in_rev") val removedInRev: Int? = null,
) {
    val isTombstoned: Boolean get() = removedInRev != null

    /** Relative weight within its section, before normalisation. */
    val priorityWeight: Double get() = 1.0 / priority.coerceAtLeast(1)

    companion object {
        const val DEFAULT_PRIORITY = 1
    }
}

@Serializable
data class Section(
    @SerialName("key") val key: SectionKey,
    @SerialName("label") val label: String,
    /** Normalised so that the weights of all sections sum to 1.0. */
    @SerialName("weight") val weight: Double,
    /** Exactly what the plan JSON said, before normalisation. Echoed back to Claude. */
    @SerialName("declared_weight") val declaredWeight: Double,
    @SerialName("color") val color: String,
    @SerialName("tasks") val tasks: List<Task> = emptyList(),
    @SerialName("sort_order") val sortOrder: Int = 0,
) {
    /**
     * Sections with no tasks score `null`, never `0.0`.
     *
     * SPEC.md §6 says the day score is `Σ wᵢ · sᵢ`, which caps a planned rest day at
     * `1 − w(exercise)` and makes it unwinnable — contradicting §7's binding rule that
     * "rest days are planned, not failures". Loop renormalises day-score weights across
     * scorable sections only. See docs/ARCHITECTURE.md §Scoring.
     */
    val isScorable: Boolean get() = tasks.isNotEmpty()

    val activeTasks: List<Task> get() = tasks.filterNot { it.isTombstoned }
}

@Serializable
data class Plan(
    @SerialName("schema") val schema: Int,
    @SerialName("plan_id") val planId: PlanId,
    @Serializable(with = LocalDateSerializer::class)
    @SerialName("date") val date: LocalDate,
    @SerialName("rev") val rev: Int,
    @Serializable(with = ZoneIdSerializer::class)
    @SerialName("tz") val tz: ZoneId,
    @SerialName("coach_note") val coachNote: String? = null,
    @SerialName("sleep_target_min") val sleepTargetMin: Int? = null,
    @Serializable(with = LocalTimeSerializer::class)
    @SerialName("report_gate") val reportGate: LocalTime? = null,
    @SerialName("sections") val sections: List<Section> = emptyList(),
) {
    val allTasks: List<Task> get() = sections.flatMap { it.tasks }

    fun task(key: TaskKey): Task? = allTasks.firstOrNull { it.key == key }

    fun section(key: SectionKey): Section? = sections.firstOrNull { it.key == key }

    companion object {
        const val CURRENT_SCHEMA = 1
    }
}
