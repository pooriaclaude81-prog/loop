package dev.loop.core.data.db

import androidx.room.TypeConverter
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime

/**
 * Dates are stored as ISO text rather than epoch integers.
 *
 * The cost is a few bytes per row; the benefit is that `adb shell sqlite3` and any DB
 * browser show `2026-08-16` instead of `20318`, which matters a great deal the first time
 * something goes wrong with a day's data on a real device.
 */
class Converters {

    @TypeConverter
    fun toLocalDate(value: String?): LocalDate? = value?.let(LocalDate::parse)

    @TypeConverter
    fun fromLocalDate(value: LocalDate?): String? = value?.toString()

    @TypeConverter
    fun toLocalTime(value: String?): LocalTime? = value?.let(LocalTime::parse)

    @TypeConverter
    fun fromLocalTime(value: LocalTime?): String? = value?.toString()

    @TypeConverter
    fun toInstant(value: Long?): Instant? = value?.let(Instant::ofEpochMilli)

    @TypeConverter
    fun fromInstant(value: Instant?): Long? = value?.toEpochMilli()
}
