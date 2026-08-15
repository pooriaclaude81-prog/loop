package dev.loop.core.data

import dev.loop.core.contract.time.LogicalDay
import dev.loop.core.data.util.Clocks
import java.time.Instant
import java.time.ZoneId

/** A clock the test drives, so nothing has to sleep and the 04:00 rollover is exercisable. */
class TestClocks(
    var instant: Instant = Instant.parse("2026-08-16T09:00:00Z"),
    private val zoneId: ZoneId = ZoneId.of("Asia/Tehran"),
    var boot: Long = 1_000_000L,
) : Clocks {

    override fun now(): Instant = instant
    override fun zone(): ZoneId = zoneId
    override fun rolloverHour(): Int = LogicalDay.DEFAULT_ROLLOVER_HOUR
    override fun wallClockMillis(): Long = instant.toEpochMilli()
    override fun elapsedRealtimeMillis(): Long = instant.toEpochMilli() - boot

    fun advanceMinutes(minutes: Long) {
        instant = instant.plusSeconds(minutes * 60)
    }
}
