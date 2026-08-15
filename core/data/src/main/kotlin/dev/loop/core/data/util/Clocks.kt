package dev.loop.core.data.util

import dev.loop.core.contract.time.LogicalDay
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import javax.inject.Inject
import javax.inject.Singleton

/**
 * All time reading goes through here.
 *
 * Two reasons it is an injectable object rather than direct calls to `Instant.now()`:
 * tests get to control the clock without sleeping, and the 04:00 logical-day rollover is
 * applied in exactly one place instead of being re-derived at every call site.
 */
interface Clocks {
    fun now(): Instant
    fun zone(): ZoneId
    fun rolloverHour(): Int

    /** Wall-clock milliseconds. Persisted; survives reboot. */
    fun wallClockMillis(): Long

    /**
     * Monotonic milliseconds since boot. Used only for in-process elapsed deltas — it
     * resets on reboot, so it must never be the thing that gets persisted.
     */
    fun elapsedRealtimeMillis(): Long

    /** `wallClock − elapsedRealtime`: stable within a boot, changes across one. */
    fun bootId(): Long = wallClockMillis() - elapsedRealtimeMillis()

    fun logicalToday(): LocalDate = LogicalDay.of(now(), zone(), rolloverHour())

    fun logicalDateOf(instant: Instant): LocalDate =
        LogicalDay.of(instant, zone(), rolloverHour())
}

@Singleton
class SystemClocks @Inject constructor() : Clocks {
    override fun now(): Instant = Instant.now()
    override fun zone(): ZoneId = ZoneId.systemDefault()
    override fun rolloverHour(): Int = LogicalDay.DEFAULT_ROLLOVER_HOUR
    override fun wallClockMillis(): Long = System.currentTimeMillis()
    override fun elapsedRealtimeMillis(): Long = android.os.SystemClock.elapsedRealtime()
}
