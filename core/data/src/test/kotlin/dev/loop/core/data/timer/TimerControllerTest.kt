package dev.loop.core.data.timer

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.data.TestClocks
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.repository.SessionRepository
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

/**
 * The timer's non-negotiables (SPEC.md §5.2 and the brief's hard constraint #1).
 *
 * The process-death and reboot cases are exercised here by driving the clock directly;
 * the on-device suite in `androidTest` proves the same behaviour survives a real
 * `Service` being killed.
 */
@RunWith(RobolectricTestRunner::class)
class TimerControllerTest {

    private lateinit var db: LoopDatabase
    private lateinit var sessions: SessionRepository
    private lateinit var controller: TimerController
    private val clocks = TestClocks()

    private val cardio = TaskKey("study.cardio")
    private val pharm = TaskKey("study.pharm")

    @Before
    fun setUp() {
        db = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            LoopDatabase::class.java,
        ).allowMainThreadQueries().build()
        sessions = SessionRepository(db, clocks)
        controller = TimerController(sessions, clocks)
    }

    @After
    fun tearDown() = db.close()

    @Test
    fun `elapsed time comes from monotonic deltas, not tick counting`() = runTest {
        controller.start(cardio)
        clocks.advanceMinutes(37)
        controller.refresh()

        // Nothing "ticked" — the value is recomputed from two readings, so a service that
        // was starved of CPU for 37 minutes still reports 37 minutes.
        assertThat(controller.state.value.elapsedMs).isEqualTo(37 * 60_000L)
    }

    @Test
    fun `moving the wall clock forward does not inflate the session`() = runTest {
        controller.start(cardio)
        clocks.advanceMinutes(10)

        // An NTP correction or a manual clock change moves wall time while the monotonic
        // reading keeps running at its own pace: instant and boot shift together, so
        // elapsedRealtime is unchanged. Elapsed must follow the monotonic source.
        clocks.instant = clocks.instant.plusSeconds(3600)
        clocks.boot += 60 * 60 * 1000L
        controller.refresh()

        assertThat(controller.state.value.elapsedMs).isEqualTo(10 * 60_000L)
    }

    @Test
    fun `starting a second timer auto-pauses the first and records the switch`() = runTest {
        controller.start(cardio)
        clocks.advanceMinutes(20)
        controller.start(pharm)
        clocks.advanceMinutes(15)
        controller.pause()

        val totals = sessions.totalsFor(clocks.logicalToday())
        assertThat(totals.getValue(cardio).focusedMin).isEqualTo(20)
        assertThat(totals.getValue(pharm).focusedMin).isEqualTo(15)
        // Two adjacent sessions, so the handover is visible in the day's history.
        assertThat(totals.getValue(cardio).sessionCount).isEqualTo(1)
        assertThat(totals.getValue(pharm).sessionCount).isEqualTo(1)
    }

    @Test
    fun `only one timer is ever open`() = runTest {
        controller.start(cardio)
        controller.start(pharm)

        assertThat(db.sessionDao().openSessions()).hasSize(1)
        assertThat(controller.state.value.taskKey).isEqualTo(pharm)
    }

    @Test
    fun `process death costs at most one heartbeat interval`() = runTest {
        controller.start(cardio)
        clocks.advanceMinutes(30)
        controller.heartbeat()

        // The process dies 9 seconds after the last write.
        clocks.instant = clocks.instant.plusSeconds(9)
        val recovered = TimerController(sessions, clocks)
        assertThat(recovered.recoverAfterProcessDeath()).isEqualTo(1)

        val totals = sessions.totalsFor(clocks.logicalToday())
        assertThat(totals.getValue(cardio).focusedMin).isEqualTo(30)
        assertThat(totals.getValue(cardio).hasUnverifiedTail).isTrue()
    }

    @Test
    fun `a reboot mid-session does not corrupt the recorded time`() = runTest {
        controller.start(cardio)
        clocks.advanceMinutes(25)
        controller.heartbeat()

        // Reboot: elapsedRealtime resets to zero, so bootId moves. Anything that had
        // persisted elapsedRealtime rather than wall clock would now compute nonsense.
        clocks.instant = clocks.instant.plusSeconds(120)
        clocks.boot = clocks.instant.toEpochMilli()

        val afterReboot = TimerController(sessions, clocks)
        afterReboot.recoverAfterProcessDeath()

        val totals = sessions.totalsFor(clocks.logicalToday())
        assertThat(totals.getValue(cardio).focusedMin).isEqualTo(25)
    }

    @Test
    fun `the timer is not auto-resumed after recovery`() = runTest {
        controller.start(cardio)
        clocks.advanceMinutes(10)
        controller.heartbeat()

        val recovered = TimerController(sessions, clocks)
        recovered.recoverAfterProcessDeath()

        // Silently banking minutes across a reboot the user may not have noticed is
        // exactly what the unverified flag exists to prevent.
        assertThat(recovered.state.value.isRunning).isFalse()
        assertThat(db.sessionDao().openSessions()).isEmpty()
    }

    @Test
    fun `the idle challenge keeps the minutes but marks the tail unverified`() = runTest {
        controller.start(cardio)
        clocks.advanceMinutes(55)
        controller.autoPauseUnverified()

        val totals = sessions.totalsFor(clocks.logicalToday())
        assertThat(totals.getValue(cardio).focusedMin).isEqualTo(55)
        assertThat(totals.getValue(cardio).hasUnverifiedTail).isTrue()
        assertThat(controller.state.value.isActive).isFalse()
    }

    @Test
    fun `pause then resume produces two sessions, not one long one`() = runTest {
        controller.start(cardio)
        clocks.advanceMinutes(20)
        controller.pause()

        clocks.advanceMinutes(120) // a long break

        controller.start(cardio)
        clocks.advanceMinutes(20)
        controller.pause()

        val totals = sessions.totalsFor(clocks.logicalToday())
        // Focused minutes exclude the break; the span includes it, which is what feeds
        // §6's fragmentation factor.
        assertThat(totals.getValue(cardio).focusedMin).isEqualTo(40)
        assertThat(totals.getValue(cardio).spanMin).isEqualTo(160)
        assertThat(totals.getValue(cardio).sessionCount).isEqualTo(2)
    }

    @Test
    fun `heartbeat on an idle controller is harmless`() = runTest {
        controller.heartbeat()
        controller.refresh()
        assertThat(controller.state.value).isEqualTo(TimerState.Idle)
    }
}
