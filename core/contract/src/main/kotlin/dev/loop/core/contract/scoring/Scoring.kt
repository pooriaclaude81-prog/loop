package dev.loop.core.contract.scoring

import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.domain.Section
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.Task
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskTarget
import kotlin.math.abs
import kotlin.math.min

/**
 * SPEC.md §6, implemented exactly, as pure functions with no Android dependency.
 *
 * Where §6 is silent or self-contradictory the choice is documented at the call site and
 * in docs/ARCHITECTURE.md §3. The two that matter most:
 *
 *  - A section with no scorable tasks yields `null`, never `0.0`, and day-score weights
 *    renormalise over the sections that remain. Under §6 as literally written, a planned
 *    rest day cannot reach 1.0, which contradicts §7's binding "rest days are planned,
 *    not failures".
 *  - Overflow above target is reported separately and never offsets another task.
 */
object Scoring {

    /**
     * §6: `1.0` inside `[lo, hi]`, decaying linearly to `0` across a margin of `(hi − lo)`.
     *
     * A zero-width band (`lo == hi`) has no margin to decay across, so it degrades to an
     * exact-match test rather than dividing by zero. The validator warns when it sees one.
     */
    fun bandScore(x: Double, lo: Double, hi: Double): Double {
        require(lo <= hi) { "band lo must not exceed hi" }
        if (x in lo..hi) return 1.0
        val margin = hi - lo
        if (margin <= 0.0) return if (x == lo) 1.0 else 0.0
        val distance = if (x < lo) lo - x else x - hi
        return (1.0 - distance / margin).coerceIn(0.0, 1.0)
    }

    /**
     * Timed tasks (§6).
     *
     * `frag` is the fragmentation factor: 90 minutes spread across 5 hours is not 90
     * minutes. It is clamped to `[0.5, 1.0]`, so fragmentation can cost at most half the
     * score and can never be a bonus.
     */
    fun timerScore(actual: TaskActual.Timed, target: TaskTarget.Timed): ScoreBreakdown {
        if (target.targetMin <= 0) {
            return ScoreBreakdown(score = null, components = emptyMap(), overflowMin = 0)
        }
        val raw = min(actual.focusedMin.toDouble() / target.targetMin, 1.0)
        val frag = fragmentation(actual.focusedMin, actual.wallClockSpanMin)
        val overflow = (actual.focusedMin - target.targetMin).coerceAtLeast(0)
        return ScoreBreakdown(
            score = (raw * frag).coerceIn(0.0, 1.0),
            components = mapOf("raw" to raw, "frag" to frag),
            overflowMin = overflow,
        )
    }

    /**
     * `focused / wall_clock_span`, clamped to `[0.5, 1.0]`.
     *
     * A zero span means a retroactive entry with no measured window — there is nothing to
     * penalise, so it scores as unfragmented rather than dividing by zero.
     */
    fun fragmentation(focusedMin: Int, spanMin: Int): Double {
        if (spanMin <= 0 || focusedMin <= 0) return 1.0
        return (focusedMin.toDouble() / spanMin).coerceIn(0.5, 1.0)
    }

    /**
     * Runs (§6). Pace is a **band**: running an easy run fast is a miss, not a bonus —
     * that is the entire point of an easy run.
     *
     * §6 fixes the weights at 0.40 distance / 0.40 pace / 0.20 type, but a plan may omit
     * any of the three. Rather than scoring an absent component as zero — which would
     * punish the user for what Claude did not specify — the weights of the components that
     * *are* present are renormalised.
     */
    fun runScore(actual: TaskActual.Run, target: TaskTarget.Run): ScoreBreakdown {
        val parts = mutableListOf<WeightedPart>()

        target.distanceKm?.let { planned ->
            val done = actual.distanceKm ?: 0.0
            parts += WeightedPart(
                "distance",
                W_RUN_DISTANCE,
                bandScore(done, 0.9 * planned, 1.1 * planned),
            )
        }
        target.paceBand?.let { band ->
            // No recorded pace scores zero rather than being skipped: the pace band is the
            // instruction, and an unrecorded run cannot demonstrate compliance with it.
            val pace = actual.paceSecPerKm?.toDouble()
            parts += WeightedPart(
                "pace",
                W_RUN_PACE,
                if (pace == null) 0.0 else bandScore(pace, band.loSecPerKm.toDouble(), band.hiSecPerKm.toDouble()),
            )
        }
        target.runType?.let { planned ->
            val done = actual.runType
            parts += WeightedPart(
                "run_type",
                W_RUN_TYPE,
                if (done != null && done.equals(planned, ignoreCase = true)) 1.0 else 0.0,
            )
        }
        // A duration-only target (no distance) still needs something to score against.
        if (parts.none { it.name == "distance" }) {
            target.durationMin?.let { planned ->
                val done = actual.durationMin ?: 0.0
                parts += WeightedPart(
                    "duration",
                    W_RUN_DISTANCE,
                    bandScore(done, 0.9 * planned, 1.1 * planned),
                )
            }
        }

        return parts.combine()
    }

    /** Lifts (§6). */
    fun liftScore(actual: TaskActual.Lift, target: TaskTarget.Lift): ScoreBreakdown {
        val parts = mutableListOf<WeightedPart>()

        target.exercises?.takeIf { it > 0 }?.let { planned ->
            parts += WeightedPart(
                "exercises",
                W_LIFT_EXERCISES,
                min(actual.exerciseCount.toDouble() / planned, 1.0),
            )
        }
        target.volumeKg?.takeIf { it > 0.0 }?.let { planned ->
            parts += WeightedPart("volume", W_LIFT_VOLUME, min(actual.volumeKg / planned, 1.0))
        }
        target.durationMin?.takeIf { it > 0 }?.let { planned ->
            val done = actual.durationMin ?: 0.0
            parts += WeightedPart(
                "duration",
                W_LIFT_DURATION,
                bandScore(done, 0.8 * planned, 1.3 * planned),
            )
        }

        return parts.combine()
    }

    /** §6: three fixed steps, no partial credit. */
    fun statusScore(actual: TaskActual.Status): ScoreBreakdown = ScoreBreakdown(
        score = actual.status.score,
        components = mapOf("status" to actual.status.score),
        overflowMin = 0,
    )

    /**
     * `check` mode is listed in §3.1 and given no formula in §6. Binary is the only
     * reading consistent with a checkbox.
     */
    fun checkScore(actual: TaskActual.Check): ScoreBreakdown = ScoreBreakdown(
        score = if (actual.done) 1.0 else 0.0,
        components = emptyMap(),
        overflowMin = 0,
    )

    /**
     * Scores one task. Returns a null score when the actual cannot be paired with the
     * target — a mode change mid-day — rather than inventing a number for it.
     */
    fun taskScore(task: Task, actual: TaskActual?): ScoreBreakdown {
        val target = task.target
        return when {
            actual == null -> zeroFor(target)
            target is TaskTarget.Timed && actual is TaskActual.Timed -> timerScore(actual, target)
            target is TaskTarget.Run && actual is TaskActual.Run -> runScore(actual, target)
            target is TaskTarget.Lift && actual is TaskActual.Lift -> liftScore(actual, target)
            target is TaskTarget.Status && actual is TaskActual.Status -> statusScore(actual)
            target is TaskTarget.Check && actual is TaskActual.Check -> checkScore(actual)
            else -> ScoreBreakdown(null, emptyMap(), 0)
        }
    }

    /** Nothing logged is a real zero, not missing data — the task was planned and not done. */
    private fun zeroFor(target: TaskTarget): ScoreBreakdown = ScoreBreakdown(
        score = 0.0,
        components = emptyMap(),
        overflowMin = 0,
    )

    /**
     * §6: "mean of its task scores, weighted by task priority if present".
     *
     * Priority 1 is most important, so the weight is `1/priority`, normalised within the
     * section. A missing priority defaults to 1, which makes a section with no priorities
     * collapse to the plain mean §6 describes.
     *
     * Returns null when the section has no scorable task — see the class comment.
     */
    fun sectionScore(section: Section, scores: Map<TaskKey, Double?>): Double? {
        val scored = section.tasks.mapNotNull { task ->
            scores[task.key]?.let { task to it }
        }
        if (scored.isEmpty()) return null
        val totalWeight = scored.sumOf { it.first.priorityWeight }
        if (totalWeight <= 0.0) return null
        return scored.sumOf { (task, score) -> task.priorityWeight * score } / totalWeight
    }

    /**
     * §6: `Σ wᵢ · sᵢ`, each `sᵢ` capped at 1.0, hygiene excluded.
     *
     * Weights are renormalised across sections that produced a score, so a day on which
     * Claude planned no exercise is not capped below 1.0. Returns null when nothing at all
     * was scorable.
     */
    fun dayScore(plan: Plan, sectionScores: Map<SectionKey, Double?>): Double? {
        val contributing = plan.sections.mapNotNull { section ->
            sectionScores[section.key]?.let { section to it.coerceIn(0.0, 1.0) }
        }
        if (contributing.isEmpty()) return null
        val totalWeight = contributing.sumOf { it.first.weight }
        if (totalWeight <= 0.0) return null
        return contributing.sumOf { (section, score) -> section.weight * score } / totalWeight
    }

    /**
     * SPEC.md §1.5. **Context only** — excluded from the day score, never rendered as a
     * pass/fail ring. Scoring sleep the way study hours are scored makes sleep worse.
     */
    fun hygieneScore(
        asleepMin: Int?,
        targetMin: Int,
        midpointDeviationMin: Int?,
        efficiency: Double?,
    ): Double? {
        if (asleepMin == null && midpointDeviationMin == null && efficiency == null) return null

        val duration = asleepMin?.let {
            bandScore(it.toDouble(), (targetMin - 45).toDouble(), (targetMin + 45).toDouble())
        }
        val timing = midpointDeviationMin?.let { (1.0 - it / 90.0).coerceIn(0.0, 1.0) }
        val eff = efficiency?.let { ((it - 0.75) / 0.20).coerceIn(0.0, 1.0) }

        val parts = listOfNotNull(
            duration?.let { WeightedPart("duration", 0.50, it) },
            timing?.let { WeightedPart("timing", 0.30, it) },
            eff?.let { WeightedPart("efficiency", 0.20, it) },
        )
        return parts.combine().score
    }

    /**
     * `calibration` from §3.2: actual ÷ planned.
     *
     * Null when nothing was planned. Never 0.0 — §7 step 3 reads a value below 0.8 as
     * "Claude is overplanning, cut this section's targets", which must not fire for a
     * section that was deliberately left empty.
     */
    fun calibration(actualMin: Int, plannedMin: Int): Double? =
        if (plannedMin <= 0) null else actualMin.toDouble() / plannedMin

    internal data class WeightedPart(val name: String, val weight: Double, val value: Double)

    private fun List<WeightedPart>.combine(): ScoreBreakdown {
        if (isEmpty()) return ScoreBreakdown(null, emptyMap(), 0)
        val totalWeight = sumOf { it.weight }
        if (totalWeight <= 0.0) return ScoreBreakdown(null, emptyMap(), 0)
        val score = sumOf { it.weight * it.value } / totalWeight
        return ScoreBreakdown(
            score = score.coerceIn(0.0, 1.0),
            components = associate { it.name to it.value },
            overflowMin = 0,
        )
    }

    // §6 weights, named so the formulas read as the spec writes them.
    private const val W_RUN_DISTANCE = 0.40
    private const val W_RUN_PACE = 0.40
    private const val W_RUN_TYPE = 0.20
    private const val W_LIFT_EXERCISES = 0.50
    private const val W_LIFT_VOLUME = 0.30
    private const val W_LIFT_DURATION = 0.20
}

/**
 * A score plus the parts it was built from, so the Review screen can explain a number
 * instead of merely asserting it.
 */
data class ScoreBreakdown(
    val score: Double?,
    val components: Map<String, Double>,
    val overflowMin: Int,
)
