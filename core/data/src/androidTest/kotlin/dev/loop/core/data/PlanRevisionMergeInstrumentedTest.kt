package dev.loop.core.data

import androidx.room.Room
import androidx.test.platform.app.InstrumentationRegistry
import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.db.PlanSource
import dev.loop.core.data.db.SessionKind
import dev.loop.core.data.repository.ImportResult
import dev.loop.core.data.repository.PlanRepository
import dev.loop.core.data.repository.SessionRepository
import dev.loop.core.data.repository.TaskStateRepository
import java.io.File
import java.time.LocalDate
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Before
import org.junit.Test

/**
 * The plan-revision merge against on-device SQLite, surviving a real database close and
 * reopen.
 *
 * The Robolectric suite covers the same rules in-memory; this one additionally proves they
 * hold across an actual file-backed database with foreign keys enforced and WAL in play —
 * the configuration that will be running on the phone.
 */
class PlanRevisionMergeInstrumentedTest {

    private lateinit var db: LoopDatabase
    private lateinit var plans: PlanRepository
    private lateinit var sessions: SessionRepository
    private lateinit var taskStates: TaskStateRepository
    private val clocks = TestClocks()

    private val context = InstrumentationRegistry.getInstrumentation().targetContext
    private val dbFile: File get() = context.getDatabasePath(DB_NAME)
    private val date = LocalDate.of(2026, 8, 16)

    @Before
    fun setUp() {
        context.deleteDatabase(DB_NAME)
        db = openDatabase()
        wire()
    }

    @After
    fun tearDown() {
        db.close()
        context.deleteDatabase(DB_NAME)
    }

    private fun openDatabase() =
        Room.databaseBuilder(context, LoopDatabase::class.java, DB_NAME)
            .addMigrations(*LoopDatabase.MIGRATIONS)
            .build()

    private fun wire() {
        plans = PlanRepository(db, clocks)
        sessions = SessionRepository(db, clocks)
        taskStates = TaskStateRepository(db, clocks)
    }

    @Test
    fun revisionPreservesLoggedActualsAcrossDatabaseReopen() = runBlocking {
        assertThat(plans.import(REV_1, PlanSource.IMAP)).isInstanceOf(ImportResult.Imported::class.java)

        val id = sessions.start(TaskKey("study.pharm"), SessionKind.WORK)
        clocks.advanceMinutes(42)
        sessions.close(id)
        taskStates.put(
            taskKey = TaskKey("study.pharm"),
            sectionKey = SectionKey("study"),
            date = date,
            status = StatusValue.IN_PROGRESS,
            actual = sessions.totalsFor(date).getValue(TaskKey("study.pharm")).toActual(),
            score = 0.7,
        )

        val revised = plans.import(REV_2, PlanSource.IMAP)
        assertThat(revised).isInstanceOf(ImportResult.Revised::class.java)

        // Close and reopen: everything below has to come off disk, not out of a cache.
        db.close()
        assertThat(dbFile.exists()).isTrue()
        db = openDatabase()
        wire()

        val plan = plans.observeActivePlan(date).first()!!
        assertThat(plan.rev).isEqualTo(2)

        val pharm = plan.task(TaskKey("study.pharm"))
        assertThat(pharm).isNotNull()
        assertThat(pharm!!.isTombstoned).isTrue()
        assertThat(pharm.removedInRev).isEqualTo(2)

        val state = taskStates.forTask(TaskKey("study.pharm"), date)!!
        assertThat((state.actual as TaskActual.Timed).focusedMin).isEqualTo(42)

        val revisions = db.planDao().revisionsFor(date)
        assertThat(revisions.map { it.rev }).containsExactly(2, 1)
        assertThat(revisions.count { it.isActive }).isEqualTo(1)
    }

    private companion object {
        const val DB_NAME = "loop-merge-instrumented.db"

        val REV_1 = """
            {
              "schema": 1, "type": "plan", "date": "2026-08-16",
              "plan_id": "p-0816", "rev": 1, "tz": "Asia/Tehran",
              "sections": [
                { "key": "study", "label": "Study", "weight": 1.0, "color": "indigo",
                  "tasks": [
                    { "key": "study.cardio", "label": "Cardiology", "mode": "timer", "target_min": 90 },
                    { "key": "study.pharm", "label": "Pharmacology", "mode": "timer", "target_min": 45 }
                  ]}
              ]
            }
        """.trimIndent()

        val REV_2 = """
            {
              "schema": 1, "type": "plan", "date": "2026-08-16",
              "plan_id": "p-0816", "rev": 2, "tz": "Asia/Tehran",
              "sections": [
                { "key": "study", "label": "Study", "weight": 1.0, "color": "indigo",
                  "tasks": [
                    { "key": "study.cardio", "label": "Cardiology", "mode": "timer", "target_min": 45 }
                  ]}
              ]
            }
        """.trimIndent()
    }
}
