package dev.loop.core.data.repository

import dev.loop.core.contract.domain.DataSource
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.db.SessionEntity
import dev.loop.core.data.db.SessionKind
import dev.loop.core.data.util.Clocks
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.roundToInt
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Timer sessions. The service layer in M2 drives this; the aggregation below is what
 * SPEC.md §6's fragmentation factor needs and is therefore contract, not presentation.
 */
@Singleton
class SessionRepository @Inject constructor(
    db: LoopDatabase,
    private val clocks: Clocks,
) {

    private val dao = db.sessionDao()

    fun observeOpenSession(): Flow<SessionEntity?> = dao.observeOpenSession()

    fun observeForDate(date: LocalDate): Flow<List<SessionEntity>> = dao.observeForDate(date)

    fun observeTotalsForDate(date: LocalDate): Flow<Map<TaskKey, TimedTotals>> =
        dao.observeForDate(date).map { it.toTotals() }

    suspend fun totalsFor(date: LocalDate): Map<TaskKey, TimedTotals> = dao.forDate(date).toTotals()

    suspend fun start(
        taskKey: TaskKey,
        kind: SessionKind = SessionKind.WORK,
        source: DataSource = DataSource.TIMER,
    ): Long {
        val now = clocks.wallClockMillis()
        return dao.insert(
            SessionEntity(
                taskKey = taskKey.value,
                logicalDate = clocks.logicalDateOf(clocks.now()),
                startTs = now,
                endTs = now,
                isOpen = true,
                kind = kind.name,
                source = source.wire,
                bootId = clocks.bootId(),
            ),
        )
    }

    /** SPEC.md §5.2's 10-second heartbeat. A kill costs at most one interval. */
    suspend fun heartbeat(id: Long, endTs: Long = clocks.wallClockMillis()) = dao.heartbeat(id, endTs)

    suspend fun close(id: Long, endTs: Long = clocks.wallClockMillis(), verified: Boolean = true) =
        dao.close(id, endTs, verified)

    /**
     * Retroactive entry (SPEC.md §5.2, mandatory). Flagged `manual` so the report is
     * honest about data quality rather than presenting it as measured time.
     */
    suspend fun logManual(
        taskKey: TaskKey,
        startTs: Long,
        endTs: Long,
        note: String? = null,
    ): Long = dao.insert(
        SessionEntity(
            taskKey = taskKey.value,
            logicalDate = clocks.logicalDateOf(java.time.Instant.ofEpochMilli(startTs)),
            startTs = startTs,
            endTs = endTs,
            isOpen = false,
            kind = SessionKind.WORK.name,
            source = DataSource.MANUAL.wire,
            bootId = clocks.bootId(),
            note = note,
        ),
    )

    /**
     * Recovers from a process death or reboot: any session still marked open is closed at
     * its last persisted heartbeat and flagged unverified, because nothing can attest to
     * what happened after that write.
     */
    suspend fun recoverOpenSessions(): List<SessionEntity> {
        val open = dao.openSessions()
        if (open.isEmpty()) return emptyList()
        open.forEach { dao.close(it.id, it.endTs, verified = false) }
        return open
    }

    suspend fun delete(id: Long) = dao.delete(id)
}

/**
 * Everything SPEC.md §6 needs from a day of sessions for one task.
 *
 * `focusedMin` counts work sessions only — Pomodoro breaks are excluded (§5.2) — while
 * `wallClockSpanMin` runs from the first start to the last end, so 90 minutes spread
 * across five hours scores differently from 90 minutes in one sitting.
 */
data class TimedTotals(
    val focusedMs: Long,
    val breakMs: Long,
    val spanMs: Long,
    val sessionCount: Int,
    val hasUnverifiedTail: Boolean,
    val hasManualEntry: Boolean,
) {
    val focusedMin: Int get() = (focusedMs / 60_000.0).roundToInt()
    val spanMin: Int get() = (spanMs / 60_000.0).roundToInt()

    fun toActual(overflowMin: Int = 0, quality: Int? = null): TaskActual.Timed = TaskActual.Timed(
        focusedMin = focusedMin,
        wallClockSpanMin = spanMin,
        sessionCount = sessionCount,
        overflowMin = overflowMin,
        quality = quality,
        hasUnverifiedTail = hasUnverifiedTail,
        source = if (hasManualEntry) DataSource.MANUAL else DataSource.TIMER,
    )
}

private fun List<SessionEntity>.toTotals(): Map<TaskKey, TimedTotals> =
    groupBy { it.taskKey }.mapValues { (_, sessions) ->
        val work = sessions.filter { it.kind == SessionKind.WORK.name }
        TimedTotals(
            focusedMs = work.sumOf { it.durationMs },
            breakMs = sessions.filter { it.kind == SessionKind.BREAK.name }.sumOf { it.durationMs },
            spanMs = if (work.isEmpty()) {
                0L
            } else {
                (work.maxOf { it.endTs } - work.minOf { it.startTs }).coerceAtLeast(0)
            },
            sessionCount = work.size,
            hasUnverifiedTail = work.any { !it.verified },
            hasManualEntry = work.any { it.source == DataSource.MANUAL.wire },
        )
    }.mapKeys { TaskKey(it.key) }
