package dev.loop.core.contract.scoring

import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.domain.PaceBand
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.plan
import dev.loop.core.contract.section
import dev.loop.core.contract.timerTask
import org.junit.Test

class ScoringTest {

    private val eps = 1e-9

    // ------------------------------------------------------------------ band_score

    @Test
    fun `band score is 1 inside the band and at both edges`() {
        listOf(5.0, 5.5, 6.0).forEach {
            assertThat(Scoring.bandScore(it, 5.0, 6.0)).isWithin(eps).of(1.0)
        }
    }

    @Test
    fun `band score decays linearly across a margin of hi minus lo`() {
        // Band [5,6] → margin 1.0. Half a margin out in either direction is 0.5.
        assertThat(Scoring.bandScore(4.5, 5.0, 6.0)).isWithin(eps).of(0.5)
        assertThat(Scoring.bandScore(6.5, 5.0, 6.0)).isWithin(eps).of(0.5)
    }

    @Test
    fun `band score reaches zero exactly one margin outside and stays there`() {
        assertThat(Scoring.bandScore(4.0, 5.0, 6.0)).isWithin(eps).of(0.0)
        assertThat(Scoring.bandScore(7.0, 5.0, 6.0)).isWithin(eps).of(0.0)
        assertThat(Scoring.bandScore(0.0, 5.0, 6.0)).isWithin(eps).of(0.0)
        assertThat(Scoring.bandScore(100.0, 5.0, 6.0)).isWithin(eps).of(0.0)
    }

    @Test
    fun `band score penalises both directions equally`() {
        val under = Scoring.bandScore(4.75, 5.0, 6.0)
        val over = Scoring.bandScore(6.25, 5.0, 6.0)
        assertThat(under).isWithin(eps).of(over)
    }

    @Test
    fun `a zero-width band degrades to exact match instead of dividing by zero`() {
        assertThat(Scoring.bandScore(5.0, 5.0, 5.0)).isWithin(eps).of(1.0)
        assertThat(Scoring.bandScore(5.01, 5.0, 5.0)).isWithin(eps).of(0.0)
    }

    // ------------------------------------------------------------------ timer

    @Test
    fun `timer at target in one sitting scores 1`() {
        val result = Scoring.timerScore(
            TaskActual.Timed(focusedMin = 90, wallClockSpanMin = 90),
            TaskTarget.Timed(90),
        )
        assertThat(result.score!!).isWithin(eps).of(1.0)
        assertThat(result.overflowMin).isEqualTo(0)
    }

    @Test
    fun `timer below target scores the ratio`() {
        val result = Scoring.timerScore(
            TaskActual.Timed(focusedMin = 45, wallClockSpanMin = 45),
            TaskTarget.Timed(90),
        )
        assertThat(result.score!!).isWithin(eps).of(0.5)
    }

    @Test
    fun `SPEC section 6 example - 90 minutes across 5 hours is not 90 minutes`() {
        val result = Scoring.timerScore(
            TaskActual.Timed(focusedMin = 90, wallClockSpanMin = 300),
            TaskTarget.Timed(90),
        )
        // raw = 1.0, frag = clamp(90/300, 0.5, 1.0) = 0.5 → 0.5
        assertThat(result.score!!).isWithin(eps).of(0.5)
    }

    @Test
    fun `fragmentation can cost at most half and is never a bonus`() {
        assertThat(Scoring.fragmentation(10, 10_000)).isWithin(eps).of(0.5)
        assertThat(Scoring.fragmentation(100, 50)).isWithin(eps).of(1.0)
    }

    @Test
    fun `a zero span does not divide by zero`() {
        assertThat(Scoring.fragmentation(30, 0)).isWithin(eps).of(1.0)
        val result = Scoring.timerScore(
            TaskActual.Timed(focusedMin = 30, wallClockSpanMin = 0),
            TaskTarget.Timed(60),
        )
        assertThat(result.score!!).isWithin(eps).of(0.5)
    }

    @Test
    fun `overflow is reported separately and never lifts the score above 1`() {
        val result = Scoring.timerScore(
            TaskActual.Timed(focusedMin = 150, wallClockSpanMin = 150),
            TaskTarget.Timed(90),
        )
        assertThat(result.score!!).isWithin(eps).of(1.0)
        assertThat(result.overflowMin).isEqualTo(60)
    }

    @Test
    fun `a zero target yields no score rather than infinity`() {
        assertThat(
            Scoring.timerScore(
                TaskActual.Timed(focusedMin = 30, wallClockSpanMin = 30),
                TaskTarget.Timed(0),
            ).score,
        ).isNull()
    }

    // ------------------------------------------------------------------ run

    @Test
    fun `a perfect easy run scores 1`() {
        val result = Scoring.runScore(
            TaskActual.Run(distanceKm = 5.0, durationMin = 29.5, runType = "easy"),
            TaskTarget.Run(distanceKm = 5.0, paceBand = PaceBand(340, 370), runType = "easy"),
        )
        assertThat(result.score!!).isWithin(eps).of(1.0)
    }

    @Test
    fun `running an easy run too fast is a miss, not a bonus`() {
        // 5 km in 24 min = 288 s/km, well under the 340–370 band.
        val result = Scoring.runScore(
            TaskActual.Run(distanceKm = 5.0, durationMin = 24.0, runType = "easy"),
            TaskTarget.Run(distanceKm = 5.0, paceBand = PaceBand(340, 370), runType = "easy"),
        )
        // distance 1.0 (0.40) + pace 0.0 (0.40) + type 1.0 (0.20) = 0.60
        assertThat(result.score!!).isWithin(eps).of(0.60)
        assertThat(result.components["pace"]!!).isWithin(eps).of(0.0)
    }

    @Test
    fun `run type mismatch costs exactly twenty percent`() {
        val result = Scoring.runScore(
            TaskActual.Run(distanceKm = 5.0, durationMin = 29.5, runType = "tempo"),
            TaskTarget.Run(distanceKm = 5.0, paceBand = PaceBand(340, 370), runType = "easy"),
        )
        assertThat(result.score!!).isWithin(eps).of(0.80)
    }

    @Test
    fun `run type comparison is case-insensitive`() {
        val result = Scoring.runScore(
            TaskActual.Run(distanceKm = 5.0, durationMin = 29.5, runType = "Easy"),
            TaskTarget.Run(distanceKm = 5.0, paceBand = PaceBand(340, 370), runType = "easy"),
        )
        assertThat(result.score!!).isWithin(eps).of(1.0)
    }

    @Test
    fun `a run that never happened scores zero, not null`() {
        val result = Scoring.runScore(
            TaskActual.Run(),
            TaskTarget.Run(distanceKm = 5.0, paceBand = PaceBand(340, 370), runType = "easy"),
        )
        assertThat(result.score!!).isWithin(eps).of(0.0)
    }

    @Test
    fun `weights renormalise when the plan omits a component`() {
        // Distance only: it carries the whole score rather than capping it at 0.40.
        val result = Scoring.runScore(
            TaskActual.Run(distanceKm = 5.0, durationMin = 30.0),
            TaskTarget.Run(distanceKm = 5.0),
        )
        assertThat(result.score!!).isWithin(eps).of(1.0)
    }

    @Test
    fun `a duration-only run target is scorable`() {
        val result = Scoring.runScore(
            TaskActual.Run(durationMin = 30.0),
            TaskTarget.Run(durationMin = 30),
        )
        assertThat(result.score!!).isWithin(eps).of(1.0)
    }

    @Test
    fun `distance band is plus or minus ten percent`() {
        val target = TaskTarget.Run(distanceKm = 5.0)
        assertThat(Scoring.runScore(TaskActual.Run(distanceKm = 4.5, durationMin = 27.0), target).score!!)
            .isWithin(eps).of(1.0)
        assertThat(Scoring.runScore(TaskActual.Run(distanceKm = 5.5, durationMin = 33.0), target).score!!)
            .isWithin(eps).of(1.0)
        // One full margin (1.0 km) below the lower bound → zero.
        assertThat(Scoring.runScore(TaskActual.Run(distanceKm = 3.5, durationMin = 21.0), target).score!!)
            .isWithin(eps).of(0.0)
    }

    // ------------------------------------------------------------------ lift

    @Test
    fun `a fully completed lift scores 1`() {
        val result = Scoring.liftScore(
            TaskActual.Lift(
                sets = listOf(
                    setOf("bench", 4, 8, 60.0),
                    setOf("incline", 4, 8, 40.0),
                    setOf("fly", 3, 12, 20.0),
                    setOf("pushdown", 3, 12, 30.0),
                    setOf("dip", 3, 10, 20.0),
                ),
                durationMin = 60.0,
            ),
            TaskTarget.Lift(exercises = 5, volumeKg = 8000.0, durationMin = 60),
        )
        assertThat(result.components["exercises"]!!).isWithin(eps).of(1.0)
        assertThat(result.components["duration"]!!).isWithin(eps).of(1.0)
    }

    @Test
    fun `half the exercises costs half of the exercise component`() {
        val result = Scoring.liftScore(
            TaskActual.Lift(
                sets = listOf(setOf("bench", 4, 8, 60.0), setOf("fly", 3, 12, 20.0)),
                durationMin = 60.0,
            ),
            TaskTarget.Lift(exercises = 4, volumeKg = 1000.0, durationMin = 60),
        )
        assertThat(result.components["exercises"]!!).isWithin(eps).of(0.5)
    }

    @Test
    fun `lift volume is capped at the target and cannot compensate`() {
        val result = Scoring.liftScore(
            TaskActual.Lift(sets = listOf(setOf("bench", 20, 20, 100.0)), durationMin = 60.0),
            TaskTarget.Lift(exercises = 5, volumeKg = 1000.0, durationMin = 60),
        )
        assertThat(result.components["volume"]!!).isWithin(eps).of(1.0)
        assertThat(result.score!!).isLessThan(1.0)
    }

    @Test
    fun `lift duration band is 0_8 to 1_3 of target`() {
        val target = TaskTarget.Lift(durationMin = 60)
        assertThat(Scoring.liftScore(TaskActual.Lift(durationMin = 48.0), target).score!!)
            .isWithin(eps).of(1.0)
        assertThat(Scoring.liftScore(TaskActual.Lift(durationMin = 78.0), target).score!!)
            .isWithin(eps).of(1.0)
    }

    @Test
    fun `an empty lift target yields no score rather than a false zero`() {
        assertThat(Scoring.liftScore(TaskActual.Lift(), TaskTarget.Lift()).score).isNull()
    }

    private fun setOf(exercise: String, sets: Int, reps: Int, weight: Double) =
        dev.loop.core.contract.domain.LiftSet(exercise, sets, reps, weight)

    // ------------------------------------------------------------------ status / check

    @Test
    fun `status scores follow SPEC section 6 with no partial credit`() {
        assertThat(Scoring.statusScore(TaskActual.Status(StatusValue.NOT_STARTED)).score).isEqualTo(0.0)
        assertThat(Scoring.statusScore(TaskActual.Status(StatusValue.IN_PROGRESS)).score).isEqualTo(0.5)
        assertThat(Scoring.statusScore(TaskActual.Status(StatusValue.DONE)).score).isEqualTo(1.0)
    }

    @Test
    fun `check mode is binary`() {
        assertThat(Scoring.checkScore(TaskActual.Check(true)).score).isEqualTo(1.0)
        assertThat(Scoring.checkScore(TaskActual.Check(false)).score).isEqualTo(0.0)
    }

    // ------------------------------------------------------------------ pairing

    @Test
    fun `a task with nothing logged scores zero — it was planned and not done`() {
        val task = timerTask("s.a", targetMin = 60)
        assertThat(Scoring.taskScore(task, null).score).isEqualTo(0.0)
    }

    @Test
    fun `an actual of the wrong mode yields null rather than an invented number`() {
        val task = timerTask("s.a", targetMin = 60)
        val mismatched = TaskActual.Run(distanceKm = 5.0, durationMin = 30.0)
        assertThat(Scoring.taskScore(task, mismatched).score).isNull()
    }

    // ------------------------------------------------------------------ section

    @Test
    fun `a section with no priorities is the plain mean`() {
        val s = section("study", 1.0, timerTask("a"), timerTask("b"))
        val scores = mapOf<TaskKey, Double?>(TaskKey("a") to 1.0, TaskKey("b") to 0.0)
        assertThat(Scoring.sectionScore(s, scores)!!).isWithin(eps).of(0.5)
    }

    @Test
    fun `priority 1 outweighs priority 2 by two to one`() {
        val s = section(
            "study",
            1.0,
            timerTask("a", priority = 1),
            timerTask("b", priority = 2),
        )
        val scores = mapOf<TaskKey, Double?>(TaskKey("a") to 1.0, TaskKey("b") to 0.0)
        // weights 1.0 and 0.5 → 1.0 / 1.5
        assertThat(Scoring.sectionScore(s, scores)!!).isWithin(eps).of(1.0 / 1.5)
    }

    @Test
    fun `a section with no tasks scores null, never zero`() {
        val s = section("exercise", 1.0)
        assertThat(Scoring.sectionScore(s, emptyMap())).isNull()
    }

    @Test
    fun `a tombstoned task still counts — the work was done`() {
        val s = section("study", 1.0, timerTask("a"), timerTask("b").copy(removedInRev = 2))
        val scores = mapOf<TaskKey, Double?>(TaskKey("a") to 0.0, TaskKey("b") to 1.0)
        assertThat(Scoring.sectionScore(s, scores)!!).isWithin(eps).of(0.5)
    }

    // ------------------------------------------------------------------ day

    @Test
    fun `day score is the weighted sum when every section is scorable`() {
        val p = plan(
            sections = arrayOf(
                section("study", 0.6, timerTask("a")),
                section("exercise", 0.4, timerTask("b")),
            ),
        )
        val scores = mapOf(SectionKey("study") to 1.0, SectionKey("exercise") to 0.5)
        assertThat(Scoring.dayScore(p, scores)!!).isWithin(eps).of(0.8)
    }

    @Test
    fun `a planned rest day can still reach 1_0`() {
        // The bug in §6 as literally written: exercise is empty, so under Σ wᵢ·sᵢ the day
        // caps at 0.80 no matter how well everything else went. §7 forbids exactly that.
        val p = plan(
            sections = arrayOf(
                section("study", 0.8, timerTask("a")),
                section("exercise", 0.2),
            ),
        )
        val scores = mapOf<SectionKey, Double?>(
            SectionKey("study") to 1.0,
            SectionKey("exercise") to null,
        )
        assertThat(Scoring.dayScore(p, scores)!!).isWithin(eps).of(1.0)
    }

    @Test
    fun `section scores are capped at 1 before weighting`() {
        val p = plan(sections = arrayOf(section("study", 1.0, timerTask("a"))))
        val scores = mapOf(SectionKey("study") to 3.0)
        assertThat(Scoring.dayScore(p, scores)!!).isWithin(eps).of(1.0)
    }

    @Test
    fun `a day with nothing scorable yields null, not zero`() {
        val p = plan(sections = arrayOf(section("study", 1.0)))
        assertThat(Scoring.dayScore(p, mapOf(SectionKey("study") to null))).isNull()
    }

    // ------------------------------------------------------------------ hygiene

    @Test
    fun `hygiene follows SPEC section 1_5`() {
        // 450 target, slept 450, no midpoint drift, 95% efficiency → 1.0
        val score = Scoring.hygieneScore(450, 450, 0, 0.95)!!
        assertThat(score).isWithin(eps).of(1.0)
    }

    @Test
    fun `oversleeping decays hygiene just as undersleeping does`() {
        val under = Scoring.hygieneScore(360, 450, 0, 0.95)!!
        val over = Scoring.hygieneScore(540, 450, 0, 0.95)!!
        assertThat(under).isWithin(eps).of(over)
    }

    @Test
    fun `hygiene with no data at all is null`() {
        assertThat(Scoring.hygieneScore(null, 450, null, null)).isNull()
    }

    @Test
    fun `hygiene works from partial data`() {
        assertThat(Scoring.hygieneScore(450, 450, null, null)).isNotNull()
    }

    // ------------------------------------------------------------------ calibration

    @Test
    fun `calibration is actual over planned`() {
        assertThat(Scoring.calibration(70, 100)!!).isWithin(eps).of(0.7)
    }

    @Test
    fun `calibration with nothing planned is null, never zero`() {
        // A zero would read to Claude as "cut this section's targets" for a section that
        // was deliberately never planned (§7 step 3).
        assertThat(Scoring.calibration(0, 0)).isNull()
        assertThat(Scoring.calibration(30, 0)).isNull()
    }
}
