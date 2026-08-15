package dev.loop.core.data.repository

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.merge.RejectReason
import dev.loop.core.data.TestClocks
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.db.PlanSource
import dev.loop.core.data.db.SessionKind
import java.time.LocalDate
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

/**
 * The plan-import write path against real SQLite.
 *
 * The revision cases live in `:core:contract`'s [dev.loop.core.contract.merge.PlanMergerTest]
 * as pure logic; this suite proves the same rules hold once Room's transactions, foreign
 * keys and composite primary keys are in the way.
 */
@RunWith(RobolectricTestRunner::class)
class PlanRepositoryTest {

    private lateinit var db: LoopDatabase
    private lateinit var repo: PlanRepository
    private lateinit var sessions: SessionRepository
    private lateinit var taskStates: TaskStateRepository
    private val clocks = TestClocks()

    private val date = LocalDate.of(2026, 8, 16)

    @Before
    fun setUp() {
        db = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            LoopDatabase::class.java,
        ).allowMainThreadQueries().build()
        repo = PlanRepository(db, clocks)
        sessions = SessionRepository(db, clocks)
        taskStates = TaskStateRepository(db, clocks)
    }

    @After
    fun tearDown() = db.close()

    // ------------------------------------------------------------------ ingest

    @Test
    fun `a valid plan lands and is observable`() = runTest {
        val result = repo.import(rev1Json(), PlanSource.SAMPLE)

        assertThat(result).isInstanceOf(ImportResult.Imported::class.java)
        val plan = repo.observeActivePlan(date).first()!!
        assertThat(plan.planId.value).isEqualTo("p-0816")
        assertThat(plan.allTasks.map { it.key.value })
            .containsExactly("study.cardio", "study.pharm", "ex.run")
    }

    @Test
    fun `a malformed plan is retained for manual import instead of vanishing`() = runTest {
        val result = repo.import("{ not json", PlanSource.IMAP, subject = "[LOOP1|PLAN] …")

        assertThat(result).isInstanceOf(ImportResult.Failed::class.java)
        assertThat(repo.observeActivePlan(date).first()).isNull()

        val failures = repo.observeIngestFailures().first()
        assertThat(failures).hasSize(1)
        assertThat(failures.single().rawText).isEqualTo("{ not json")
        assertThat(failures.single().issuesJson).contains("MALFORMED_JSON")
    }

    @Test
    fun `warnings are stored so a repaired plan can still explain itself later`() = runTest {
        // Weights sum to 0.85 — normalised with a warning rather than rejected.
        repo.import(rev1Json(studyWeight = 0.40, exerciseWeight = 0.45), PlanSource.IMAP)

        val issues = repo.observePlanIssues(date).first()
        assertThat(issues.map { it.code.name }).contains("WEIGHTS_NOT_NORMALIZED")
    }

    @Test
    fun `a plan for a day that has ended is archived, not activated`() = runTest {
        val result = repo.import(rev1Json(date = "2026-08-10"), PlanSource.IMAP)

        assertThat(result).isInstanceOf(ImportResult.Skipped::class.java)
        assertThat(repo.activePlan(LocalDate.of(2026, 8, 10))).isNull()
        // Still on disk — nothing is thrown away.
        assertThat(db.planDao().plan("p-0816", 1)).isNotNull()
    }

    // ------------------------------------------ the M1 headline: revision merge

    @Test
    fun `a revision merges by task_key without discarding logged actuals`() = runTest {
        repo.import(rev1Json(), PlanSource.IMAP)

        // Log real work against a task the revision is about to drop.
        val id = sessions.start(TaskKey("study.pharm"), SessionKind.WORK)
        clocks.advanceMinutes(42)
        sessions.close(id)
        taskStates.put(
            taskKey = TaskKey("study.pharm"),
            sectionKey = dev.loop.core.contract.domain.SectionKey("study"),
            date = date,
            status = StatusValue.IN_PROGRESS,
            actual = sessions.totalsFor(date).getValue(TaskKey("study.pharm")).toActual(),
            score = 0.7,
        )

        val result = repo.import(rev2JsonDroppingPharm(), PlanSource.IMAP)

        assertThat(result).isInstanceOf(ImportResult.Revised::class.java)
        val plan = repo.observeActivePlan(date).first()!!
        assertThat(plan.rev).isEqualTo(2)

        val pharm = plan.task(TaskKey("study.pharm"))
        assertThat(pharm).isNotNull()
        assertThat(pharm!!.isTombstoned).isTrue()
        assertThat(pharm.removedInRev).isEqualTo(2)

        // And the 42 minutes are still there, attached to the same stable key.
        val state = taskStates.forTask(TaskKey("study.pharm"), date)!!
        assertThat((state.actual as TaskActual.Timed).focusedMin).isEqualTo(42)

        // The revision's own changes applied.
        assertThat((plan.task(TaskKey("study.cardio"))!!.target as TaskTarget.Timed).targetMin)
            .isEqualTo(45)
        assertThat(plan.task(TaskKey("study.newtopic"))).isNotNull()
    }

    @Test
    fun `a revision drops an untouched task outright`() = runTest {
        repo.import(rev1Json(), PlanSource.IMAP)
        repo.import(rev2JsonDroppingPharm(), PlanSource.IMAP)

        val plan = repo.observeActivePlan(date).first()!!
        // Nothing was logged against study.pharm this time, so it is simply gone.
        assertThat(plan.task(TaskKey("study.pharm"))).isNull()
    }

    @Test
    fun `an out-of-order revision cannot undo a newer one`() = runTest {
        repo.import(rev1Json(), PlanSource.IMAP)
        repo.import(rev2JsonDroppingPharm(), PlanSource.IMAP)

        val result = repo.import(rev1Json(), PlanSource.IMAP)

        assertThat(result).isInstanceOf(ImportResult.Skipped::class.java)
        assertThat((result as ImportResult.Skipped).reason).isEqualTo(RejectReason.STALE_REVISION)
        assertThat(repo.observeActivePlan(date).first()!!.rev).isEqualTo(2)
    }

    @Test
    fun `exactly one plan is active per date after a revision`() = runTest {
        repo.import(rev1Json(), PlanSource.IMAP)
        repo.import(rev2JsonDroppingPharm(), PlanSource.IMAP)

        val revisions = db.planDao().revisionsFor(date)
        assertThat(revisions).hasSize(2)
        assertThat(revisions.count { it.isActive }).isEqualTo(1)
        // Both revisions survive — the audit trail SPEC.md §4's single-column PK would lose.
        assertThat(revisions.map { it.rev }).containsExactly(2, 1)
    }

    @Test
    fun `re-importing the same revision is idempotent`() = runTest {
        repo.import(rev1Json(), PlanSource.IMAP)
        val before = repo.observeActivePlan(date).first()!!

        repo.import(rev1Json(), PlanSource.IMAP)
        val after = repo.observeActivePlan(date).first()!!

        assertThat(after.allTasks).hasSize(before.allTasks.size)
        assertThat(db.planDao().revisionsFor(date)).hasSize(1)
    }

    // ------------------------------------------------------------------ skeleton

    @Test
    fun `the 0700 fallback repeats the previous day's structure with actuals cleared`() = runTest {
        repo.import(rev1Json(), PlanSource.IMAP)
        clocks.instant = clocks.instant.plusSeconds(24 * 3600)

        val skeleton = repo.repeatPreviousSkeleton(LocalDate.of(2026, 8, 17))!!

        assertThat(skeleton.date).isEqualTo(LocalDate.of(2026, 8, 17))
        assertThat(skeleton.allTasks.map { it.key.value })
            .containsExactly("study.cardio", "study.pharm", "ex.run")
        assertThat(skeleton.coachNote).contains("Repeated from 2026-08-16")
        assertThat(repo.activePlan(LocalDate.of(2026, 8, 17))).isNotNull()
        // The source day is untouched.
        assertThat(repo.activePlan(date)!!.planId.value).isEqualTo("p-0816")
    }

    @Test
    fun `the fallback yields null when there is no history to repeat`() = runTest {
        assertThat(repo.repeatPreviousSkeleton(date)).isNull()
    }

    // ------------------------------------------------------------------ fixtures

    private fun rev1Json(
        date: String = "2026-08-16",
        studyWeight: Double = 0.6,
        exerciseWeight: Double = 0.4,
    ) = """
        {
          "schema": 1, "type": "plan", "date": "$date",
          "plan_id": "p-0816", "rev": 1, "tz": "Asia/Tehran",
          "sections": [
            { "key": "study", "label": "Study", "weight": $studyWeight, "color": "indigo",
              "tasks": [
                { "key": "study.cardio", "label": "Cardiology", "mode": "timer", "target_min": 90 },
                { "key": "study.pharm", "label": "Pharmacology", "mode": "timer", "target_min": 45 }
              ]},
            { "key": "exercise", "label": "Exercise", "weight": $exerciseWeight, "color": "amber",
              "tasks": [
                { "key": "ex.run", "label": "Easy 5k", "mode": "run",
                  "target": { "distance_km": 5, "pace_band": ["5:40","6:10"], "run_type": "easy" } }
              ]}
          ]
        }
    """.trimIndent()

    private fun rev2JsonDroppingPharm() = """
        {
          "schema": 1, "type": "plan", "date": "2026-08-16",
          "plan_id": "p-0816", "rev": 2, "tz": "Asia/Tehran",
          "coach_note": "RHR is up — cutting cardiology to 45.",
          "sections": [
            { "key": "study", "label": "Study", "weight": 0.6, "color": "indigo",
              "tasks": [
                { "key": "study.cardio", "label": "Cardiology", "mode": "timer", "target_min": 45 },
                { "key": "study.newtopic", "label": "Renal", "mode": "timer", "target_min": 30 }
              ]},
            { "key": "exercise", "label": "Exercise", "weight": 0.4, "color": "amber",
              "tasks": [
                { "key": "ex.run", "label": "Easy 5k", "mode": "run",
                  "target": { "distance_km": 5, "pace_band": ["5:40","6:10"], "run_type": "easy" } }
              ]}
          ]
        }
    """.trimIndent()
}
