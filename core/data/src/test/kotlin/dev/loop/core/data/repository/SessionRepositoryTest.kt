package dev.loop.core.data.repository

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.domain.DataSource
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.data.TestClocks
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.db.SessionKind
import java.time.Instant
import java.time.LocalDate
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class SessionRepositoryTest {

    private lateinit var db: LoopDatabase
    private lateinit var repo: SessionRepository
    private val clocks = TestClocks()

    @Before
    fun setUp() {
        db = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            LoopDatabase::class.java,
        ).allowMainThreadQueries().build()
        repo = SessionRepository(db, clocks)
    }

    @After
    fun tearDown() = db.close()

    private val cardio = TaskKey("study.cardio")

    @Test
    fun `a closed session contributes its minutes`() = runTest {
        val id = repo.start(cardio)
        clocks.advanceMinutes(30)
        repo.close(id)

        val totals = repo.totalsFor(clocks.logicalToday()).getValue(cardio)
        assertThat(totals.focusedMin).isEqualTo(30)
        assertThat(totals.sessionCount).isEqualTo(1)
    }

    @Test
    fun `focused minutes and wall-clock span diverge when work is fragmented`() = runTest {
        // 30 + 30 minutes of work spread across a four-hour window. SPEC.md §6: "90 minutes
        // spread across 5 hours is not 90 minutes."
        val first = repo.start(cardio)
        clocks.advanceMinutes(30)
        repo.close(first)

        clocks.advanceMinutes(180)

        val second = repo.start(cardio)
        clocks.advanceMinutes(30)
        repo.close(second)

        val totals = repo.totalsFor(clocks.logicalToday()).getValue(cardio)
        assertThat(totals.focusedMin).isEqualTo(60)
        assertThat(totals.spanMin).isEqualTo(240)
        assertThat(totals.sessionCount).isEqualTo(2)
    }

    @Test
    fun `pomodoro breaks are tracked but excluded from focused minutes`() = runTest {
        val work = repo.start(cardio, SessionKind.WORK)
        clocks.advanceMinutes(25)
        repo.close(work)

        val rest = repo.start(cardio, SessionKind.BREAK)
        clocks.advanceMinutes(5)
        repo.close(rest)

        val totals = repo.totalsFor(clocks.logicalToday()).getValue(cardio)
        assertThat(totals.focusedMin).isEqualTo(25)
        assertThat(totals.breakMs).isEqualTo(5 * 60_000L)
    }

    @Test
    fun `an open session is observable as the single active timer`() = runTest {
        repo.start(cardio)

        val open = repo.observeOpenSession().first()
        assertThat(open).isNotNull()
        assertThat(open!!.taskKey).isEqualTo(cardio.value)
        assertThat(open.isOpen).isTrue()
    }

    @Test
    fun `the heartbeat bounds how much a kill can cost`() = runTest {
        val id = repo.start(cardio)
        clocks.advanceMinutes(20)
        repo.heartbeat(id)

        // Simulate the process dying 8 seconds after the last heartbeat.
        clocks.instant = clocks.instant.plusSeconds(8)
        val recovered = repo.recoverOpenSessions()

        assertThat(recovered).hasSize(1)
        val totals = repo.totalsFor(clocks.logicalToday()).getValue(cardio)
        // 20 minutes survive; only the unpersisted 8-second tail is lost.
        assertThat(totals.focusedMin).isEqualTo(20)
    }

    @Test
    fun `a recovered session is flagged unverified because nothing can attest to the tail`() =
        runTest {
            val id = repo.start(cardio)
            clocks.advanceMinutes(15)
            repo.heartbeat(id)
            repo.recoverOpenSessions()

            val totals = repo.totalsFor(clocks.logicalToday()).getValue(cardio)
            assertThat(totals.hasUnverifiedTail).isTrue()
            assertThat(totals.toActual().hasUnverifiedTail).isTrue()
        }

    @Test
    fun `retroactive entry is flagged manual so the report stays honest`() = runTest {
        val start = clocks.wallClockMillis()
        repo.logManual(cardio, start, start + 45 * 60_000L)

        val totals = repo.totalsFor(clocks.logicalToday()).getValue(cardio)
        assertThat(totals.focusedMin).isEqualTo(45)
        assertThat(totals.hasManualEntry).isTrue()
        assertThat(totals.toActual().source).isEqualTo(DataSource.MANUAL)
    }

    @Test
    fun `a session started before 4am is attributed to the previous logical day`() = runTest {
        // 01:30 Tehran on the 17th belongs to the 16th.
        clocks.instant = Instant.parse("2026-08-16T22:00:00Z") // 01:30 +03:30
        val id = repo.start(cardio)
        clocks.advanceMinutes(30)
        repo.close(id)

        assertThat(repo.totalsFor(LocalDate.of(2026, 8, 16))).containsKey(cardio)
        assertThat(repo.totalsFor(LocalDate.of(2026, 8, 17))).doesNotContainKey(cardio)
    }

    @Test
    fun `a day with no sessions yields no totals rather than a zero row`() = runTest {
        assertThat(repo.totalsFor(clocks.logicalToday())).isEmpty()
    }
}
