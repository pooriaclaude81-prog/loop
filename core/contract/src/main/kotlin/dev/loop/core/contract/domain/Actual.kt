package dev.loop.core.contract.domain

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Where a piece of logged data came from. Carried into the report so Claude can discount it. */
@Serializable
enum class DataSource {
    /** Live foreground-service timer. */
    @SerialName("timer")
    TIMER,

    /** Retroactive entry by the user. SPEC.md §5.2 requires this be flagged. */
    @SerialName("manual")
    MANUAL,

    @SerialName("health_connect")
    HEALTH_CONNECT,

    @SerialName("gadgetbridge")
    GADGETBRIDGE,

    /** Replaced by a higher-trust source; kept for the audit trail (SPEC.md §1.1). */
    @SerialName("superseded")
    SUPERSEDED,
    ;

    val wire: String get() = name.lowercase()

    companion object {
        fun fromWire(v: String): DataSource? = entries.firstOrNull { it.wire == v.trim().lowercase() }
    }
}

@Serializable
enum class StatusValue {
    @SerialName("not_started")
    NOT_STARTED,

    @SerialName("in_progress")
    IN_PROGRESS,

    @SerialName("done")
    DONE,
    ;

    val wire: String get() = name.lowercase()

    /** SPEC.md §6: no partial credit beyond the three fixed steps. */
    val score: Double
        get() = when (this) {
            NOT_STARTED -> 0.0
            IN_PROGRESS -> 0.5
            DONE -> 1.0
        }

    companion object {
        fun fromWire(v: String): StatusValue? = entries.firstOrNull { it.wire == v.trim().lowercase() }
    }
}

@Serializable
data class LiftSet(
    @SerialName("exercise") val exercise: String,
    @SerialName("sets") val sets: Int,
    @SerialName("reps") val reps: Int,
    @SerialName("weight_kg") val weightKg: Double,
) {
    val volumeKg: Double get() = sets * reps * weightKg
}

/**
 * What actually happened on a task. Mirrors [TaskTarget] one-for-one; the validator and
 * the merge step both refuse to pair an actual with a target of a different mode.
 */
@Serializable
sealed interface TaskActual {

    val source: DataSource

    @Serializable
    @SerialName("timer")
    data class Timed(
        /** Sum of work-session durations. Pomodoro breaks are excluded (SPEC.md §5.2). */
        @SerialName("focused_min") val focusedMin: Int,
        /** First start to last end. Feeds the fragmentation factor of SPEC.md §6. */
        @SerialName("wall_clock_span_min") val wallClockSpanMin: Int,
        @SerialName("session_count") val sessionCount: Int = 0,
        /** Minutes beyond target. Reported separately, never offsets another task. */
        @SerialName("overflow_min") val overflowMin: Int = 0,
        /** Optional 1–5 self-rated output quality (SPEC.md §9 risk register). */
        @SerialName("quality") val quality: Int? = null,
        /** True when the idle challenge auto-paused an unanswered tail (SPEC.md §5.2). */
        @SerialName("has_unverified_tail") val hasUnverifiedTail: Boolean = false,
        @SerialName("source") override val source: DataSource = DataSource.TIMER,
    ) : TaskActual

    @Serializable
    @SerialName("run")
    data class Run(
        @SerialName("distance_km") val distanceKm: Double? = null,
        @SerialName("duration_min") val durationMin: Double? = null,
        @SerialName("run_type") val runType: String? = null,
        @SerialName("rpe") val rpe: Int? = null,
        @SerialName("avg_hr") val avgHr: Int? = null,
        @SerialName("source") override val source: DataSource = DataSource.MANUAL,
    ) : TaskActual {
        /** Seconds per kilometre, or null when either input is missing or zero. */
        val paceSecPerKm: Int?
            get() {
                val d = distanceKm ?: return null
                val t = durationMin ?: return null
                if (d <= 0.0) return null
                return ((t * 60.0) / d).toInt()
            }
    }

    @Serializable
    @SerialName("lift")
    data class Lift(
        @SerialName("sets") val sets: List<LiftSet> = emptyList(),
        @SerialName("duration_min") val durationMin: Double? = null,
        @SerialName("groups") val groups: List<String> = emptyList(),
        @SerialName("rpe") val rpe: Int? = null,
        @SerialName("source") override val source: DataSource = DataSource.MANUAL,
    ) : TaskActual {
        val volumeKg: Double get() = sets.sumOf { it.volumeKg }
        val exerciseCount: Int get() = sets.map { it.exercise.trim().lowercase() }.distinct().size
    }

    @Serializable
    @SerialName("status")
    data class Status(
        @SerialName("status") val status: StatusValue,
        /** SPEC.md §5.1 makes this mandatory when the status is `in_progress`. */
        @SerialName("next_action") val nextAction: String? = null,
        @SerialName("source") override val source: DataSource = DataSource.MANUAL,
    ) : TaskActual

    @Serializable
    @SerialName("check")
    data class Check(
        @SerialName("done") val done: Boolean,
        @SerialName("source") override val source: DataSource = DataSource.MANUAL,
    ) : TaskActual
}

/** The mode an actual belongs to, for pairing checks during merge and scoring. */
val TaskActual.mode: TaskMode
    get() = when (this) {
        is TaskActual.Timed -> TaskMode.TIMER
        is TaskActual.Run -> TaskMode.RUN
        is TaskActual.Lift -> TaskMode.LIFT
        is TaskActual.Status -> TaskMode.STATUS
        is TaskActual.Check -> TaskMode.CHECK
    }

val TaskTarget.mode: TaskMode
    get() = when (this) {
        is TaskTarget.Timed -> TaskMode.TIMER
        is TaskTarget.Run -> TaskMode.RUN
        is TaskTarget.Lift -> TaskMode.LIFT
        is TaskTarget.Status -> TaskMode.STATUS
        is TaskTarget.Check -> TaskMode.CHECK
    }

/** True when any work at all has been recorded — the test the merge uses before tombstoning. */
val TaskActual.hasLoggedWork: Boolean
    get() = when (this) {
        is TaskActual.Timed -> focusedMin > 0 || sessionCount > 0
        is TaskActual.Run -> (distanceKm ?: 0.0) > 0.0 || (durationMin ?: 0.0) > 0.0
        is TaskActual.Lift -> sets.isNotEmpty() || (durationMin ?: 0.0) > 0.0
        is TaskActual.Status -> status != StatusValue.NOT_STARTED
        is TaskActual.Check -> done
    }
