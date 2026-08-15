package dev.loop.core.contract.time

import com.google.common.truth.Truth.assertThat
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import org.junit.Test

class LogicalDayTest {

    private val tehran = ZoneId.of("Asia/Tehran")

    private fun at(y: Int, m: Int, d: Int, h: Int, min: Int = 0) =
        LocalDateTime.of(y, m, d, h, min).atZone(tehran).toInstant()

    @Test
    fun `after the rollover hour the logical day is the calendar day`() {
        assertThat(LogicalDay.of(at(2026, 8, 16, 10), tehran))
            .isEqualTo(LocalDate.of(2026, 8, 16))
    }

    @Test
    fun `a session at 1am belongs to the previous logical day`() {
        // SPEC.md §3.2's own example has bedtime 01:40. Under a midnight boundary this
        // study session would land on the 17th, split its wall-clock span, and break the
        // streak it should have extended.
        assertThat(LogicalDay.of(at(2026, 8, 17, 1, 30), tehran))
            .isEqualTo(LocalDate.of(2026, 8, 16))
    }

    @Test
    fun `0359 is still yesterday and 0400 is today`() {
        assertThat(LogicalDay.of(at(2026, 8, 17, 3, 59), tehran))
            .isEqualTo(LocalDate.of(2026, 8, 16))
        assertThat(LogicalDay.of(at(2026, 8, 17, 4, 0), tehran))
            .isEqualTo(LocalDate.of(2026, 8, 17))
    }

    @Test
    fun `midnight boundary is available for anyone who wants it`() {
        assertThat(LogicalDay.of(at(2026, 8, 17, 1, 30), tehran, rolloverHour = 0))
            .isEqualTo(LocalDate.of(2026, 8, 17))
    }

    @Test
    fun `start and end bracket the logical day`() {
        val date = LocalDate.of(2026, 8, 16)
        val start = LogicalDay.startOf(date, tehran)
        val end = LogicalDay.endOf(date, tehran)

        assertThat(start).isEqualTo(at(2026, 8, 16, 4))
        assertThat(end).isEqualTo(at(2026, 8, 17, 4))
        assertThat(LogicalDay.contains(at(2026, 8, 17, 3, 59), date, tehran)).isTrue()
        assertThat(LogicalDay.contains(at(2026, 8, 17, 4, 0), date, tehran)).isFalse()
    }

    @Test
    fun `a session crossing the boundary is split proportionally`() {
        val slices = LogicalDay.split(
            start = at(2026, 8, 17, 3, 0),
            end = at(2026, 8, 17, 5, 0),
            zone = tehran,
        )

        assertThat(slices).hasSize(2)
        assertThat(slices[0].date).isEqualTo(LocalDate.of(2026, 8, 16))
        assertThat(slices[0].durationMs).isEqualTo(60 * 60 * 1000L)
        assertThat(slices[1].date).isEqualTo(LocalDate.of(2026, 8, 17))
        assertThat(slices[1].durationMs).isEqualTo(60 * 60 * 1000L)
    }

    @Test
    fun `a session inside one day yields a single slice`() {
        val slices = LogicalDay.split(at(2026, 8, 16, 10), at(2026, 8, 16, 11, 30), tehran)

        assertThat(slices).hasSize(1)
        assertThat(slices.single().durationMs).isEqualTo(90 * 60 * 1000L)
    }

    @Test
    fun `an empty or reversed span yields nothing rather than looping`() {
        assertThat(LogicalDay.split(at(2026, 8, 16, 10), at(2026, 8, 16, 10), tehran)).isEmpty()
        assertThat(LogicalDay.split(at(2026, 8, 16, 11), at(2026, 8, 16, 10), tehran)).isEmpty()
    }

    @Test
    fun `a multi-day span produces one slice per logical day`() {
        val slices = LogicalDay.split(at(2026, 8, 16, 10), at(2026, 8, 19, 10), tehran)

        assertThat(slices.map { it.date }).containsExactly(
            LocalDate.of(2026, 8, 16),
            LocalDate.of(2026, 8, 17),
            LocalDate.of(2026, 8, 18),
            LocalDate.of(2026, 8, 19),
        ).inOrder()
    }

    @Test
    fun `Tehran has no DST so a summer boundary is exactly 24 hours`() {
        // Iran abolished DST in 2022. This asserts the bundled tzdb agrees — a device
        // with a frozen tzdb would produce a 23- or 25-hour day here.
        val date = LocalDate.of(2026, 6, 21)
        val span = LogicalDay.endOf(date, tehran).toEpochMilli() -
            LogicalDay.startOf(date, tehran).toEpochMilli()

        assertThat(span).isEqualTo(24 * 60 * 60 * 1000L)
    }
}
