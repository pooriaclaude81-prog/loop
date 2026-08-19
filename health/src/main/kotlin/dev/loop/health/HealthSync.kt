package dev.loop.health

import dev.loop.core.contract.domain.DataSource
import dev.loop.core.contract.scoring.Scoring
import dev.loop.core.data.db.HealthDailyEntity
import dev.loop.core.data.repository.HealthRepository
import dev.loop.core.data.repository.SessionRepository
import dev.loop.core.data.settings.LoopSettings
import dev.loop.core.data.util.Clocks
import java.time.Duration
import java.time.LocalDate
import java.time.LocalTime
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.abs
import kotlin.math.roundToInt
import kotlinx.coroutines.flow.first

/**
 * Reads Health Connect and immediately persists to Room, then computes every derived
 * metric of SPEC.md §1.4.
 *
 * Health Connect is a buffer with short retention (§1.1). Everything worth keeping is
 * written here on first read; nothing downstream ever queries the platform for history.
 */
@Singleton
class HealthSync @Inject constructor(
    private val source: HealthConnectSource,
    private val health: HealthRepository,
    private val sessions: SessionRepository,
    private val settings: LoopSettings,
    private val clocks: Clocks,
) {

    suspend fun sync(date: LocalDate = clocks.logicalToday()): SyncOutcome {
        if (source.availability() != HealthAvailability.AVAILABLE) {
            return SyncOutcome.Unavailable(source.availability())
        }
        if (!source.hasPermissions()) return SyncOutcome.PermissionsMissing

        val snapshot = source.read(date, clocks.zone()) ?: return SyncOutcome.NoData
        val target = settings.settings.first().sleepTargetMin

        val existing = health.forDate(date)
        val history = health.since(date.minusDays(14)).filter { it.date < date }

        val sleep = snapshot.sleep
        val midpoint = sleep?.let {
            java.time.Instant.ofEpochMilli((it.start.toEpochMilli() + it.end.toEpochMilli()) / 2)
                .atZone(clocks.zone())
                .toLocalTime()
        }

        val entity = HealthDailyEntity(
            date = date,
            sleepStart = sleep?.start?.toEpochMilli() ?: existing?.sleepStart,
            sleepEnd = sleep?.end?.toEpochMilli() ?: existing?.sleepEnd,
            asleepMin = sleep?.asleepMin ?: existing?.asleepMin,
            inBedMin = sleep?.inBedMin ?: existing?.inBedMin,
            deepMin = sleep?.deepMin ?: existing?.deepMin,
            remMin = sleep?.remMin ?: existing?.remMin,
            efficiency = sleep?.let { efficiency(it.asleepMin, it.inBedMin) } ?: existing?.efficiency,
            midpoint = midpoint?.toString() ?: existing?.midpoint,
            midpointDeviationMin = midpoint?.let { deviationFromMedian(it, history) },
            sleepDebtMin = sleepDebt(sleep?.asleepMin, history, target),
            restingHeartRate = snapshot.restingHeartRate ?: existing?.restingHeartRate,
            rhrDelta = snapshot.restingHeartRate?.let { rhrDelta(it, history) },
            steps = snapshot.steps ?: existing?.steps,
            wakeToStartMin = sleep?.let { wakeToFirstStart(date, it.end.toEpochMilli()) },
            hygiene = null,
            // Health Connect wins over a manual entry; §1.1 keeps the manual one as
            // superseded rather than deleting it.
            source = if (sleep != null) DataSource.HEALTH_CONNECT.wire else existing?.source,
            syncedAt = clocks.now(),
        )

        val withHygiene = entity.copy(
            hygiene = Scoring.hygieneScore(
                asleepMin = entity.asleepMin,
                targetMin = target,
                midpointDeviationMin = entity.midpointDeviationMin,
                efficiency = entity.efficiency,
            ),
        )

        health.upsert(withHygiene)
        return SyncOutcome.Synced(withHygiene, snapshot.exercises)
    }

    private fun efficiency(asleepMin: Int, inBedMin: Int): Double? =
        if (inBedMin <= 0) null else (asleepMin.toDouble() / inBedMin).coerceIn(0.0, 1.0)

    /** §1.4: |midpoint − 14-day median midpoint|, in minutes. */
    private fun deviationFromMedian(midpoint: LocalTime, history: List<HealthDailyEntity>): Int? {
        val past = history.mapNotNull { row ->
            row.midpoint?.let { runCatching { LocalTime.parse(it) }.getOrNull() }
        }
        if (past.isEmpty()) return null

        // Wrapped around midnight so 01:40 and 23:50 are an hour apart, not 22.
        fun wrapped(time: LocalTime): Double {
            val hours = time.hour + time.minute / 60.0
            return if (hours > 12) hours - 24 else hours
        }

        val sorted = past.map(::wrapped).sorted()
        val median = if (sorted.size % 2 == 1) {
            sorted[sorted.size / 2]
        } else {
            (sorted[sorted.size / 2 - 1] + sorted[sorted.size / 2]) / 2
        }
        return (abs(wrapped(midpoint) - median) * 60).roundToInt()
    }

    /** §1.4: Σ over 7 days of max(0, target − actual). */
    private fun sleepDebt(
        todayAsleep: Int?,
        history: List<HealthDailyEntity>,
        target: Int,
    ): Int {
        val recent = history.takeLast(6).mapNotNull { it.asleepMin } + listOfNotNull(todayAsleep)
        return recent.sumOf { (target - it).coerceAtLeast(0) }
    }

    /** §1.4: today's resting HR minus the 14-day baseline. */
    private fun rhrDelta(today: Int, history: List<HealthDailyEntity>): Int? {
        val baseline = history.mapNotNull { it.restingHeartRate }
        if (baseline.isEmpty()) return null
        return today - baseline.average().roundToInt()
    }

    /**
     * §1.4's `wake_to_start_min`: wake time to the first timer start. A strong
     * procrastination signal, and free — it needs no extra sensor or user input.
     */
    private suspend fun wakeToFirstStart(date: LocalDate, wakeMillis: Long): Int? {
        val first = sessions.observeForDate(date).first()
            .minByOrNull { it.startTs }
            ?: return null
        val minutes = Duration.ofMillis(first.startTs - wakeMillis).toMinutes()
        return minutes.toInt().takeIf { it >= 0 }
    }
}

sealed interface SyncOutcome {
    data class Synced(val row: HealthDailyEntity, val exercises: List<ExerciseSummary>) : SyncOutcome
    data class Unavailable(val availability: HealthAvailability) : SyncOutcome
    data object PermissionsMissing : SyncOutcome
    data object NoData : SyncOutcome
}
