package dev.loop.system

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.content.getSystemService
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.loop.core.contract.time.LogicalDay
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Wall-clock alarms for the fixed points of the day (SPEC.md §5.3).
 *
 * `setAlarmClock` is used for the review gate and the missing-plan alarm because they are
 * the two moments the whole loop depends on: it is the one scheduling API that Doze does
 * not defer. The cost is a visible alarm icon, which is an acceptable trade for a report
 * that actually gets written.
 */
@Singleton
class Scheduler @Inject constructor(
    @ApplicationContext private val context: Context,
) {

    private val alarms: AlarmManager? get() = context.getSystemService()

    fun scheduleReportGate(time: LocalTime, zone: ZoneId = ZoneId.systemDefault()) {
        scheduleDaily(AlarmReceiver.ACTION_REPORT_GATE, time, zone, exact = true)
    }

    /** SPEC.md §5.3: 07:00 alarm when no plan arrived, with a one-tap fallback. */
    fun schedulePlanCheck(time: LocalTime = LocalTime.of(7, 0), zone: ZoneId = ZoneId.systemDefault()) {
        scheduleDaily(AlarmReceiver.ACTION_PLAN_MISSING, time, zone, exact = true)
    }

    /** SPEC.md §5.3: 18:00 nudge for `status` tasks nothing has happened to. */
    fun scheduleStaleCheck(time: LocalTime = LocalTime.of(18, 0), zone: ZoneId = ZoneId.systemDefault()) {
        scheduleDaily(AlarmReceiver.ACTION_STALE_TASKS, time, zone, exact = false)
    }

    /** SPEC.md §2.4: a single silent reminder, then `unsent` at 02:00. */
    fun scheduleUnsentSweep(zone: ZoneId = ZoneId.systemDefault()) {
        scheduleDaily(AlarmReceiver.ACTION_UNSENT_SWEEP, LocalTime.of(2, 0), zone, exact = false)
    }

    fun scheduleAll(reportGate: LocalTime, zone: ZoneId = ZoneId.systemDefault()) {
        scheduleReportGate(reportGate, zone)
        schedulePlanCheck(zone = zone)
        scheduleStaleCheck(zone = zone)
        scheduleUnsentSweep(zone)
    }

    private fun scheduleDaily(action: String, time: LocalTime, zone: ZoneId, exact: Boolean) {
        val manager = alarms ?: return
        val next = nextOccurrence(time, zone)
        val pending = pendingIntent(action)

        val canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || manager.canScheduleExactAlarms()
        when {
            exact && canExact ->
                manager.setAlarmClock(AlarmManager.AlarmClockInfo(next, pending), pending)

            else ->
                // Falls back to an inexact window rather than failing outright; the user
                // may not have granted exact-alarm permission and the day must still work.
                manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, pending)
        }
    }

    private fun nextOccurrence(time: LocalTime, zone: ZoneId): Long {
        val now = ZonedDateTime.now(zone)
        var candidate = now.with(time)
        if (!candidate.isAfter(now)) candidate = candidate.plusDays(1)
        return candidate.toInstant().toEpochMilli()
    }

    private fun pendingIntent(action: String): PendingIntent = PendingIntent.getBroadcast(
        context,
        action.hashCode(),
        Intent(context, AlarmReceiver::class.java).setAction(action),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    fun logicalToday(zone: ZoneId = ZoneId.systemDefault()): LocalDate =
        LogicalDay.of(java.time.Instant.now(), zone)
}
