package dev.loop.core.data.timer

import dev.loop.core.contract.domain.DataSource
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.data.db.SessionKind
import dev.loop.core.data.repository.SessionRepository
import dev.loop.core.data.util.Clocks
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Live state of the one global timer. `elapsedMs` is derived in-process from
 * `elapsedRealtime` deltas, so moving the system clock cannot inflate or destroy a session.
 */
data class TimerState(
    val sessionId: Long? = null,
    val taskKey: TaskKey? = null,
    val taskLabel: String? = null,
    val sectionColor: String? = null,
    val elapsedMs: Long = 0L,
    val isRunning: Boolean = false,
    val kind: SessionKind = SessionKind.WORK,
) {
    val isActive: Boolean get() = sessionId != null

    companion object {
        val Idle = TimerState()
    }
}

/**
 * The timer engine (SPEC.md §5.2).
 *
 * Three properties this type exists to guarantee:
 *
 * 1. **Elapsed time comes from `elapsedRealtime` deltas, never tick counting.** A dropped
 *    tick, a slow frame or a Doze window cannot lose time, because nothing is counted —
 *    the elapsed value is recomputed from two monotonic readings every time it is asked
 *    for.
 * 2. **What gets persisted is wall clock.** `elapsedRealtime` resets to zero on reboot, so
 *    a session stored in those terms is unrecoverable across exactly the restart the brief
 *    requires it to survive. `endTs = startWall + elapsed` is written instead.
 * 3. **One global active timer.** Starting a second auto-pauses the first and records the
 *    switch as two adjacent sessions, so the handover is visible in the day's history.
 */
@Singleton
class TimerController @Inject constructor(
    private val sessions: SessionRepository,
    private val clocks: Clocks,
) {

    private val mutex = Mutex()
    private val _state = MutableStateFlow(TimerState.Idle)
    val state: StateFlow<TimerState> = _state.asStateFlow()

    /** Monotonic reading at which the current session began. Never persisted. */
    private var startElapsed: Long = 0L

    /** Wall clock at the same instant. This is what reaches the database. */
    private var startWall: Long = 0L

    /**
     * Starts [taskKey], pausing whatever was running. Returns the new session id.
     */
    suspend fun start(
        taskKey: TaskKey,
        label: String? = null,
        sectionColor: String? = null,
        kind: SessionKind = SessionKind.WORK,
    ): Long = mutex.withLock {
        closeCurrentLocked()

        val id = sessions.start(taskKey, kind, DataSource.TIMER)
        startElapsed = clocks.elapsedRealtimeMillis()
        startWall = clocks.wallClockMillis()
        _state.value = TimerState(
            sessionId = id,
            taskKey = taskKey,
            taskLabel = label,
            sectionColor = sectionColor,
            elapsedMs = 0L,
            isRunning = true,
            kind = kind,
        )
        id
    }

    /** Pauses and closes the session. Resuming later opens a fresh one. */
    suspend fun pause() = mutex.withLock {
        closeCurrentLocked()
        _state.value = TimerState.Idle
    }

    suspend fun stop() = pause()

    /**
     * The 10-second heartbeat of §5.2. Writes the elapsed time as wall clock so a process
     * death costs at most one interval.
     */
    suspend fun heartbeat() = mutex.withLock {
        val current = _state.value
        val id = current.sessionId ?: return@withLock
        if (!current.isRunning) return@withLock
        sessions.heartbeat(id, startWall + elapsedNow())
    }

    /** Recomputes elapsed time for the UI and the notification. Never accumulates. */
    fun refresh() {
        val current = _state.value
        if (!current.isRunning) return
        _state.value = current.copy(elapsedMs = elapsedNow())
    }

    /**
     * Auto-pauses and flags the tail unverified — the idle challenge went unanswered
     * (§5.2). The minutes are kept; only their trustworthiness is marked down.
     */
    suspend fun autoPauseUnverified() = mutex.withLock {
        val id = _state.value.sessionId ?: return@withLock
        sessions.close(id, startWall + elapsedNow(), verified = false)
        _state.value = TimerState.Idle
    }

    /**
     * Called at startup. Any session still open belongs to a process that died without
     * closing it, so it is closed at its last heartbeat and flagged unverified: nothing
     * can attest to what happened after that write.
     *
     * The timer is deliberately *not* auto-resumed. Silently continuing to bank minutes
     * across a reboot the user may not have noticed would be dishonest in exactly the way
     * the `unverified` flag exists to prevent.
     */
    suspend fun recoverAfterProcessDeath(): Int = mutex.withLock {
        val recovered = sessions.recoverOpenSessions()
        if (recovered.isNotEmpty()) _state.value = TimerState.Idle
        recovered.size
    }

    private fun elapsedNow(): Long =
        (clocks.elapsedRealtimeMillis() - startElapsed).coerceAtLeast(0L)

    private suspend fun closeCurrentLocked() {
        val current = _state.value
        val id = current.sessionId ?: return
        sessions.close(id, startWall + elapsedNow(), verified = true)
    }
}

/**
 * Lets a feature module start the foreground service without depending on `:app`.
 * Bound to the real implementation in the application module.
 */
interface TimerLauncher {
    fun ensureRunning()
    fun stopService()
}
