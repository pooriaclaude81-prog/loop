package dev.loop.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import javax.inject.Inject
import javax.inject.Singleton

/** What the platform can currently do, so the UI can degrade honestly (SPEC.md §1.1). */
enum class HealthAvailability {
    AVAILABLE,
    UPDATE_REQUIRED,
    NOT_INSTALLED,
}

data class SleepSummary(
    val start: Instant,
    val end: Instant,
    val asleepMin: Int,
    val inBedMin: Int,
    val deepMin: Int?,
    val remMin: Int?,
)

data class ExerciseSummary(
    val start: Instant,
    val end: Instant,
    val type: Int,
    val title: String?,
    val distanceKm: Double?,
    val durationMin: Double,
    val avgHeartRate: Int?,
) {
    /**
     * SPEC.md §1.1 lists `SpeedRecord`, but Mi Fitness frequently does not write it.
     * Pace is derived from distance and duration, which are almost always present, and
     * `SpeedRecord` is treated as refinement rather than the source of truth.
     */
    val paceSecPerKm: Int?
        get() = distanceKm?.takeIf { it > 0.0 }?.let { ((durationMin * 60.0) / it).toInt() }
}

data class DaySnapshot(
    val date: LocalDate,
    val sleep: SleepSummary?,
    val restingHeartRate: Int?,
    val steps: Int?,
    val exercises: List<ExerciseSummary>,
)

/**
 * Reads Health Connect (SPEC.md §1.1).
 *
 * Treated strictly as a **short-retention buffer**: everything read here is persisted to
 * Room immediately by [HealthSync], and no part of the app ever queries this class for
 * history.
 */
@Singleton
class HealthConnectSource @Inject constructor(
    @ApplicationContext private val context: Context,
) {

    val permissions: Set<String> = setOf(
        HealthPermission.getReadPermission(SleepSessionRecord::class),
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(RestingHeartRateRecord::class),
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
        HealthPermission.getReadPermission(DistanceRecord::class),
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
    )

    fun availability(): HealthAvailability = when (HealthConnectClient.getSdkStatus(context)) {
        HealthConnectClient.SDK_AVAILABLE -> HealthAvailability.AVAILABLE
        HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> HealthAvailability.UPDATE_REQUIRED
        else -> HealthAvailability.NOT_INSTALLED
    }

    private fun clientOrNull(): HealthConnectClient? =
        if (availability() == HealthAvailability.AVAILABLE) {
            runCatching { HealthConnectClient.getOrCreate(context) }.getOrNull()
        } else {
            null
        }

    suspend fun hasPermissions(): Boolean {
        val client = clientOrNull() ?: return false
        return runCatching {
            client.permissionController.getGrantedPermissions().containsAll(permissions)
        }.getOrDefault(false)
    }

    /**
     * Reads one logical day. Sleep uses the §1.1 window — sessions overlapping
     * [yesterday 18:00, today 12:00] — and takes the longest, because naps and a watch
     * that splits the night both produce multiple sessions.
     */
    suspend fun read(date: LocalDate, zone: ZoneId): DaySnapshot? {
        val client = clientOrNull() ?: return null

        val sleepWindow = TimeRangeFilter.between(
            LocalDateTime.of(date.minusDays(1), java.time.LocalTime.of(18, 0)),
            LocalDateTime.of(date, java.time.LocalTime.NOON),
        )
        val dayWindow = TimeRangeFilter.between(
            LocalDateTime.of(date, java.time.LocalTime.MIDNIGHT),
            LocalDateTime.of(date.plusDays(1), java.time.LocalTime.MIDNIGHT),
        )

        val sleep = runCatching {
            client.readRecords(ReadRecordsRequest(SleepSessionRecord::class, sleepWindow))
                .records
                .maxByOrNull { Duration.between(it.startTime, it.endTime) }
                ?.toSummary()
        }.getOrNull()

        val rhr = runCatching {
            client.readRecords(ReadRecordsRequest(RestingHeartRateRecord::class, dayWindow))
                .records
                .map { it.beatsPerMinute.toInt() }
                .takeIf { it.isNotEmpty() }
                ?.average()
                ?.toInt()
        }.getOrNull()

        val steps = runCatching {
            client.readRecords(ReadRecordsRequest(StepsRecord::class, dayWindow))
                .records
                .sumOf { it.count }
                .toInt()
                .takeIf { it > 0 }
        }.getOrNull()

        val exercises = runCatching {
            client.readRecords(ReadRecordsRequest(ExerciseSessionRecord::class, dayWindow))
                .records
                .map { session -> session.toSummary(client) }
        }.getOrDefault(emptyList())

        return DaySnapshot(date, sleep, rhr, steps, exercises)
    }

    private fun SleepSessionRecord.toSummary(): SleepSummary {
        val inBed = Duration.between(startTime, endTime).toMinutes().toInt()
        val awake = stages
            .filter { it.stage == SleepSessionRecord.STAGE_TYPE_AWAKE }
            .sumOf { Duration.between(it.startTime, it.endTime).toMinutes() }
            .toInt()
        val deep = stages
            .filter { it.stage == SleepSessionRecord.STAGE_TYPE_DEEP }
            .sumOf { Duration.between(it.startTime, it.endTime).toMinutes() }
            .toInt()
            .takeIf { it > 0 }
        val rem = stages
            .filter { it.stage == SleepSessionRecord.STAGE_TYPE_REM }
            .sumOf { Duration.between(it.startTime, it.endTime).toMinutes() }
            .toInt()
            .takeIf { it > 0 }

        return SleepSummary(
            start = startTime,
            end = endTime,
            // With no stage data, asleep is taken as in-bed rather than invented.
            asleepMin = (inBed - awake).coerceAtLeast(0),
            inBedMin = inBed,
            deepMin = deep,
            remMin = rem,
        )
    }

    private suspend fun ExerciseSessionRecord.toSummary(client: HealthConnectClient): ExerciseSummary {
        val window = TimeRangeFilter.between(startTime, endTime)

        val distanceKm = runCatching {
            client.readRecords(ReadRecordsRequest(DistanceRecord::class, window))
                .records
                .sumOf { it.distance.inKilometers }
                .takeIf { it > 0.0 }
        }.getOrNull()

        val avgHr = runCatching {
            client.readRecords(ReadRecordsRequest(HeartRateRecord::class, window))
                .records
                .flatMap { it.samples }
                .map { it.beatsPerMinute.toInt() }
                .takeIf { it.isNotEmpty() }
                ?.average()
                ?.toInt()
        }.getOrNull()

        return ExerciseSummary(
            start = startTime,
            end = endTime,
            type = exerciseType,
            title = title,
            distanceKm = distanceKm,
            durationMin = Duration.between(startTime, endTime).toMinutes().toDouble(),
            avgHeartRate = avgHr,
        )
    }
}
