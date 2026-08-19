package dev.loop.core.data

import androidx.room.Room
import androidx.test.platform.app.InstrumentationRegistry
import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.repository.SessionRepository
import dev.loop.core.data.timer.TimerController
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Before
import org.junit.Test

/**
 * Hard constraint #1, on real hardware: killing the app, rebooting, or Doze must not lose
 * more than ten seconds.
 *
 * The database is closed and reopened between phases to model the process actually dying —
 * everything asserted afterwards has to come off disk.
 */
class TimerPersistenceInstrumentedTest {

    private val context = InstrumentationRegistry.getInstrumentation().targetContext
    private lateinit var db: LoopDatabase
    private lateinit var sessions: SessionRepository
    private lateinit var controller: TimerController
    private val clocks = TestClocks()

    private val task = TaskKey("study.cardio")

    @Before
    fun setUp() {
        context.deleteDatabase(DB)
        open()
    }

    @After
    fun tearDown() {
        db.close()
        context.deleteDatabase(DB)
    }

    private fun open() {
        db = Room.databaseBuilder(context, LoopDatabase::class.java, DB)
            .addMigrations(*LoopDatabase.MIGRATIONS)
            .build()
        sessions = SessionRepository(db, clocks)
        controller = TimerController(sessions, clocks)
    }

    @Test
    fun sessionSurvivesProcessDeathWithAtMostTenSecondsLost() = runBlocking {
        controller.start(task)
        clocks.advanceMinutes(42)
        controller.heartbeat()

        // Process dies 9 s after the last heartbeat, without closing anything.
        clocks.instant = clocks.instant.plusSeconds(9)
        db.close()

        open()
        val recovered = controller.recoverAfterProcessDeath()
        assertThat(recovered).isEqualTo(1)

        val totals = sessions.totalsFor(clocks.logicalToday()).getValue(task)
        assertThat(totals.focusedMin).isEqualTo(42)
        assertThat(totals.hasUnverifiedTail).isTrue()
    }

    @Test
    fun sessionSurvivesRebootMidSession() = runBlocking {
        controller.start(task)
        clocks.advanceMinutes(31)
        controller.heartbeat()

        // Reboot: elapsedRealtime resets. Anything that persisted elapsedRealtime rather
        // than wall clock would compute a negative or absurd duration here.
        clocks.instant = clocks.instant.plusSeconds(180)
        clocks.boot = clocks.instant.toEpochMilli()
        db.close()

        open()
        controller.recoverAfterProcessDeath()

        val totals = sessions.totalsFor(clocks.logicalToday()).getValue(task)
        assertThat(totals.focusedMin).isEqualTo(31)
        assertThat(totals.focusedMin).isGreaterThan(0)
    }

    @Test
    fun heartbeatBoundsWorstCaseLossToTheIntervalItself() = runBlocking {
        controller.start(task)

        // Ten minutes of heartbeats at the real 10-second cadence.
        repeat(60) {
            clocks.instant = clocks.instant.plusSeconds(10)
            controller.heartbeat()
        }
        // Then die 9 seconds later, before the next write lands.
        clocks.instant = clocks.instant.plusSeconds(9)
        db.close()

        open()
        controller.recoverAfterProcessDeath()

        val persistedMs = sessions.totalsFor(clocks.logicalToday()).getValue(task).focusedMs
        val actualMs = 10 * 60_000L + 9_000L
        assertThat(actualMs - persistedMs).isAtMost(10_000L)
    }

    private companion object {
        const val DB = "loop-timer-instrumented.db"
    }
}
