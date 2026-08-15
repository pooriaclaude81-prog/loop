package dev.loop.core.contract.time

import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime

/**
 * Which day a moment belongs to.
 *
 * SPEC.md keys almost everything on `date` but never says when a day ends, and midnight
 * is the wrong answer for this app: §3.2's own example has `bedtime: "01:40"`. Under a
 * midnight boundary a study session started at 01:30 lands on the following day, splits
 * the wall-clock span that §6's fragmentation factor divides by, and breaks the streak it
 * should have extended.
 *
 * Loop rolls the logical day at 04:00 local by default. The hour is configurable so the
 * choice is the user's, but it is fixed at import time for a given day's data because it
 * is part of the primary key of `task_state` and `sessions`.
 */
object LogicalDay {

    const val DEFAULT_ROLLOVER_HOUR: Int = 4

    /** The logical date [instant] falls on. */
    fun of(
        instant: Instant,
        zone: ZoneId,
        rolloverHour: Int = DEFAULT_ROLLOVER_HOUR,
    ): LocalDate {
        val local = ZonedDateTime.ofInstant(instant, zone)
        return if (local.hour < rolloverHour.coerceIn(0, 23)) {
            local.toLocalDate().minusDays(1)
        } else {
            local.toLocalDate()
        }
    }

    /** The first instant of logical day [date]. */
    fun startOf(
        date: LocalDate,
        zone: ZoneId,
        rolloverHour: Int = DEFAULT_ROLLOVER_HOUR,
    ): Instant = date.atTime(LocalTime.of(rolloverHour.coerceIn(0, 23), 0))
        .atZone(zone)
        .toInstant()

    /** Exclusive upper bound of logical day [date]. */
    fun endOf(
        date: LocalDate,
        zone: ZoneId,
        rolloverHour: Int = DEFAULT_ROLLOVER_HOUR,
    ): Instant = startOf(date.plusDays(1), zone, rolloverHour)

    fun contains(
        instant: Instant,
        date: LocalDate,
        zone: ZoneId,
        rolloverHour: Int = DEFAULT_ROLLOVER_HOUR,
    ): Boolean {
        val start = startOf(date, zone, rolloverHour)
        val end = endOf(date, zone, rolloverHour)
        return !instant.isBefore(start) && instant.isBefore(end)
    }

    /**
     * Splits a span across logical-day boundaries, so a session running through 04:00 is
     * attributed to both days in the right proportion rather than landing entirely on
     * whichever day it started.
     */
    fun split(
        start: Instant,
        end: Instant,
        zone: ZoneId,
        rolloverHour: Int = DEFAULT_ROLLOVER_HOUR,
    ): List<DaySlice> {
        if (!end.isAfter(start)) return emptyList()
        val slices = mutableListOf<DaySlice>()
        var cursor = start
        while (cursor.isBefore(end)) {
            val date = of(cursor, zone, rolloverHour)
            val boundary = endOf(date, zone, rolloverHour)
            val sliceEnd = if (boundary.isBefore(end)) boundary else end
            slices += DaySlice(date, cursor, sliceEnd)
            cursor = sliceEnd
        }
        return slices
    }
}

data class DaySlice(
    val date: LocalDate,
    val start: Instant,
    val end: Instant,
) {
    val durationMs: Long get() = end.toEpochMilli() - start.toEpochMilli()
}
