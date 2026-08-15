package dev.loop.core.contract.merge

import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.TEST_DATE
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.loggedMinutes
import dev.loop.core.contract.loggedStatus
import dev.loop.core.contract.plan
import dev.loop.core.contract.runTask
import dev.loop.core.contract.section
import dev.loop.core.contract.statusTask
import dev.loop.core.contract.taskKeys
import dev.loop.core.contract.timerTask
import org.junit.Test

/**
 * SPEC.md §3.1: "`rev` lets Claude push a mid-day revision. The app merges by key and
 * never discards logged actuals."
 *
 * Every case below is a way that sentence can be violated.
 */
class PlanMergerTest {

    private fun applied(result: MergeResult): MergeResult.Applied =
        result as? MergeResult.Applied ?: error("expected Applied, got $result")

    private fun rejected(result: MergeResult): MergeResult.Rejected =
        result as? MergeResult.Rejected ?: error("expected Rejected, got $result")

    // ------------------------------------------------------------------ guards

    @Test
    fun `revision for a different date is rejected rather than merged`() {
        val current = plan(sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val incoming = plan(rev = 2, date = TEST_DATE.plusDays(1))

        val result = rejected(PlanMerger.merge(current, incoming))
        assertThat(result.reason).isEqualTo(RejectReason.DATE_MISMATCH)
    }

    @Test
    fun `out-of-order revision is rejected so a late rev1 cannot undo rev2`() {
        val current = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val incoming = plan(rev = 1, sections = arrayOf(section("study", 1.0, timerTask("s.b"))))

        val result = rejected(PlanMerger.merge(current, incoming))
        assertThat(result.reason).isEqualTo(RejectReason.STALE_REVISION)
    }

    @Test
    fun `same revision number is treated as stale, not reapplied`() {
        val current = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val incoming = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))

        assertThat(rejected(PlanMerger.merge(current, incoming)).reason)
            .isEqualTo(RejectReason.STALE_REVISION)
    }

    @Test
    fun `a different plan_id for the same date merges as a replacement`() {
        val current = plan("p-a", rev = 3, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val incoming = plan("p-b", rev = 1, sections = arrayOf(section("study", 1.0, timerTask("s.b"))))

        val result = applied(PlanMerger.merge(current, incoming, mapOf(TaskKey("s.a") to loggedMinutes(30))))

        // Lower rev, but a different plan entirely — the guard must not swallow it, and
        // the work logged against the old plan still has to survive.
        assertThat(result.plan.taskKeys()).containsExactly("s.b", "s.a")
    }

    // ------------------------------------------------------------------ core merge

    @Test
    fun `added task appears`() {
        val current = plan(sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val incoming = plan(
            rev = 2,
            sections = arrayOf(section("study", 1.0, timerTask("s.a"), timerTask("s.b"))),
        )

        val result = applied(PlanMerger.merge(current, incoming))

        assertThat(result.plan.taskKeys()).containsExactly("s.a", "s.b").inOrder()
        assertThat(result.changes).contains(MergeChange.TaskAdded(TaskKey("s.b"), "s.b"))
    }

    @Test
    fun `task dropped with nothing logged is removed`() {
        val current = plan(
            sections = arrayOf(section("study", 1.0, timerTask("s.a"), timerTask("s.b"))),
        )
        val incoming = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))

        val result = applied(PlanMerger.merge(current, incoming))

        assertThat(result.plan.taskKeys()).containsExactly("s.a")
        assertThat(result.changes).contains(MergeChange.TaskDropped(TaskKey("s.b"), "s.b"))
    }

    @Test
    fun `task dropped after work was logged is tombstoned, never discarded`() {
        val current = plan(
            sections = arrayOf(section("study", 1.0, timerTask("s.a"), timerTask("s.b"))),
        )
        val incoming = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val actuals = mapOf(TaskKey("s.b") to loggedMinutes(42))

        val result = applied(PlanMerger.merge(current, incoming, actuals))

        val kept = result.plan.task(TaskKey("s.b"))
        assertThat(kept).isNotNull()
        assertThat(kept!!.isTombstoned).isTrue()
        assertThat(kept.removedInRev).isEqualTo(2)
        assertThat(result.changes).contains(
            MergeChange.TaskTombstoned(TaskKey("s.b"), "s.b", removedInRev = 2),
        )
    }

    @Test
    fun `a tombstone survives a further revision without being re-flagged`() {
        val rev1 = plan(sections = arrayOf(section("study", 1.0, timerTask("s.a"), timerTask("s.b"))))
        val rev2 = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val actuals = mapOf(TaskKey("s.b") to loggedMinutes(42))

        val afterRev2 = applied(PlanMerger.merge(rev1, rev2, actuals)).plan
        val rev3 = plan(rev = 3, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val afterRev3 = applied(PlanMerger.merge(afterRev2, rev3, actuals))

        val kept = afterRev3.plan.task(TaskKey("s.b"))!!
        assertThat(kept.isTombstoned).isTrue()
        // Still removed in rev 2 — the revision that actually dropped it.
        assertThat(kept.removedInRev).isEqualTo(2)
        assertThat(afterRev3.changes.filterIsInstance<MergeChange.TaskTombstoned>()).isEmpty()
    }

    @Test
    fun `changed target is adopted while the actual is untouched`() {
        val current = plan(sections = arrayOf(section("study", 1.0, timerTask("s.a", targetMin = 90))))
        val incoming = plan(
            rev = 2,
            sections = arrayOf(section("study", 1.0, timerTask("s.a", targetMin = 45))),
        )
        val actuals = mapOf(TaskKey("s.a") to loggedMinutes(60))

        val result = applied(PlanMerger.merge(current, incoming, actuals))

        assertThat(result.plan.task(TaskKey("s.a"))!!.target).isEqualTo(TaskTarget.Timed(45))
        assertThat(result.changes).contains(
            MergeChange.TargetChanged(TaskKey("s.a"), TaskTarget.Timed(90), TaskTarget.Timed(45)),
        )
    }

    @Test
    fun `mode change with logged work strands the old actual under a distinct key`() {
        val current = plan(sections = arrayOf(section("exercise", 1.0, timerTask("ex.a"))))
        val incoming = plan(rev = 2, sections = arrayOf(section("exercise", 1.0, runTask("ex.a"))))
        val actuals = mapOf(TaskKey("ex.a") to loggedMinutes(30))

        val result = applied(PlanMerger.merge(current, incoming, actuals))

        // The redefined task is present with its new mode...
        assertThat(result.plan.task(TaskKey("ex.a"))!!.mode).isEqualTo(TaskMode.RUN)
        // ...and the timer minutes are still reachable rather than silently orphaned.
        val stranded = result.plan.task(TaskKey("ex.a${PlanMerger.STRANDED_SUFFIX}"))
        assertThat(stranded).isNotNull()
        assertThat(stranded!!.mode).isEqualTo(TaskMode.TIMER)
        assertThat(stranded.isTombstoned).isTrue()
        assertThat(result.strandedActuals).hasSize(1)
    }

    @Test
    fun `mode change with nothing logged simply replaces the task`() {
        val current = plan(sections = arrayOf(section("exercise", 1.0, timerTask("ex.a"))))
        val incoming = plan(rev = 2, sections = arrayOf(section("exercise", 1.0, runTask("ex.a"))))

        val result = applied(PlanMerger.merge(current, incoming))

        assertThat(result.plan.taskKeys()).containsExactly("ex.a")
        assertThat(result.strandedActuals).isEmpty()
    }

    @Test
    fun `a not_started status counts as no logged work`() {
        val current = plan(sections = arrayOf(section("thesis", 1.0, statusTask("th.a"))))
        val incoming = plan(rev = 2, sections = arrayOf(section("thesis", 1.0, statusTask("th.b"))))
        val actuals = mapOf<TaskKey, TaskActual>(
            TaskKey("th.a") to loggedStatus(StatusValue.NOT_STARTED),
        )

        val result = applied(PlanMerger.merge(current, incoming, actuals))

        assertThat(result.plan.taskKeys()).containsExactly("th.b")
    }

    @Test
    fun `an in_progress status counts as logged work and is kept`() {
        val current = plan(sections = arrayOf(section("thesis", 1.0, statusTask("th.a"))))
        val incoming = plan(rev = 2, sections = arrayOf(section("thesis", 1.0, statusTask("th.b"))))
        val actuals = mapOf<TaskKey, TaskActual>(
            TaskKey("th.a") to loggedStatus(StatusValue.IN_PROGRESS),
        )

        val result = applied(PlanMerger.merge(current, incoming, actuals))

        assertThat(result.plan.taskKeys()).containsExactly("th.b", "th.a")
    }

    @Test
    fun `zero logged minutes do not keep a task alive`() {
        val current = plan(sections = arrayOf(section("study", 1.0, timerTask("s.a"), timerTask("s.b"))))
        val incoming = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val actuals = mapOf<TaskKey, TaskActual>(
            TaskKey("s.b") to TaskActual.Timed(focusedMin = 0, wallClockSpanMin = 0, sessionCount = 0),
        )

        val result = applied(PlanMerger.merge(current, incoming, actuals))
        assertThat(result.plan.taskKeys()).containsExactly("s.a")
    }

    // ------------------------------------------------------------------ sections

    @Test
    fun `section removed with no logged work is dropped and weights renormalise`() {
        val current = plan(
            sections = arrayOf(
                section("study", 0.6, timerTask("s.a")),
                section("exercise", 0.4, timerTask("ex.a")),
            ),
        )
        val incoming = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))

        val result = applied(PlanMerger.merge(current, incoming))

        assertThat(result.plan.sections.map { it.key.value }).containsExactly("study")
        assertThat(result.plan.sections.sumOf { it.weight }).isWithin(1e-9).of(1.0)
        assertThat(result.changes).contains(MergeChange.SectionDropped(dev.loop.core.contract.domain.SectionKey("exercise")))
    }

    @Test
    fun `section removed after work was logged survives with its tombstones`() {
        val current = plan(
            sections = arrayOf(
                section("study", 0.6, timerTask("s.a")),
                section("exercise", 0.4, timerTask("ex.a")),
            ),
        )
        val incoming = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val actuals = mapOf(TaskKey("ex.a") to loggedMinutes(25))

        val result = applied(PlanMerger.merge(current, incoming, actuals))

        assertThat(result.plan.sections.map { it.key.value })
            .containsExactly("study", "exercise").inOrder()
        assertThat(result.plan.task(TaskKey("ex.a"))!!.isTombstoned).isTrue()
        // The retained section is back in the weight pool, so the total is still 1.0.
        assertThat(result.plan.sections.sumOf { it.weight }).isWithin(1e-9).of(1.0)
    }

    @Test
    fun `weight change is recorded`() {
        val current = plan(
            sections = arrayOf(
                section("study", 0.5, timerTask("s.a")),
                section("exercise", 0.5, timerTask("ex.a")),
            ),
        )
        val incoming = plan(
            rev = 2,
            sections = arrayOf(
                section("study", 0.7, timerTask("s.a")),
                section("exercise", 0.3, timerTask("ex.a")),
            ),
        )

        val result = applied(PlanMerger.merge(current, incoming))

        assertThat(result.changes.filterIsInstance<MergeChange.WeightChanged>()).hasSize(2)
    }

    @Test
    fun `label change is recorded without disturbing the actual`() {
        val current = plan(sections = arrayOf(section("study", 1.0, timerTask("s.a", label = "Cardio"))))
        val incoming = plan(
            rev = 2,
            sections = arrayOf(section("study", 1.0, timerTask("s.a", label = "Cardiology"))),
        )

        val result = applied(PlanMerger.merge(current, incoming, mapOf(TaskKey("s.a") to loggedMinutes(20))))

        assertThat(result.changes).contains(
            MergeChange.LabelChanged(TaskKey("s.a"), "Cardio", "Cardiology"),
        )
        assertThat(result.plan.task(TaskKey("s.a"))!!.label).isEqualTo("Cardiology")
    }

    @Test
    fun `no structural change produces no change records`() {
        val current = plan(sections = arrayOf(section("study", 1.0, timerTask("s.a"))))
        val incoming = plan(rev = 2, sections = arrayOf(section("study", 1.0, timerTask("s.a"))))

        val result = applied(PlanMerger.merge(current, incoming))
        assertThat(result.changes).isEmpty()
    }

    @Test
    fun `every logged task survives a wholesale plan replacement`() {
        val current = plan(
            sections = arrayOf(
                section("study", 0.5, timerTask("s.a"), timerTask("s.b")),
                section("exercise", 0.5, runTask("ex.a")),
            ),
        )
        val incoming = plan(rev = 2, sections = arrayOf(section("research", 1.0, timerTask("r.a"))))
        val actuals = mapOf<TaskKey, TaskActual>(
            TaskKey("s.a") to loggedMinutes(30),
            TaskKey("ex.a") to TaskActual.Run(distanceKm = 5.0, durationMin = 29.0),
        )

        val result = applied(PlanMerger.merge(current, incoming, actuals))

        assertThat(result.plan.taskKeys()).containsExactly("r.a", "s.a", "ex.a")
        assertThat(result.plan.taskKeys()).doesNotContain("s.b") // nothing logged
        assertThat(result.plan.sections.sumOf { it.weight }).isWithin(1e-9).of(1.0)
    }
}
