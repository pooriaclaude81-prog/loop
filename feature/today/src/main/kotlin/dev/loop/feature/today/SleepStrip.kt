package dev.loop.feature.today

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import dev.loop.core.data.db.HealthDailyEntity
import dev.loop.core.designsystem.component.LoopCard
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import kotlin.math.abs

/**
 * The sleep strip of SPEC.md §5.1: bedtime → wake, duration, and one plain-language line.
 *
 * Hygiene is shown as **context**, never as a pass/fail ring, and never contributes to the
 * day score (§1.5). The sentence explains the day; it does not grade it.
 */
@Composable
fun SleepStrip(
    health: HealthDailyEntity?,
    targetMin: Int,
    onLog: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val asleep: Int? = health?.asleepMin

    LoopCard(modifier = modifier) {
        if (health == null || asleep == null) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column {
                    Text("Sleep", style = LoopType.caption, color = LoopColors.TextTertiary)
                    Text(
                        "Not recorded",
                        style = LoopType.label,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                }
                TextButton(onClick = onLog) { Text("Add") }
            }
            return@LoopCard
        }

        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text("Sleep", style = LoopType.caption, color = LoopColors.TextTertiary)
                Text(
                    "${asleep / 60}h ${asleep % 60}m",
                    style = LoopType.numeralSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                val bed = health.sleepStart?.let(::toTime)
                val wake = health.sleepEnd?.let(::toTime)
                if (bed != null && wake != null) {
                    Text("$bed → $wake", style = LoopType.caption, color = LoopColors.TextSecondary)
                }
                TextButton(onClick = onLog) { Text("Edit") }
            }
        }
        Spacer(Modifier.height(4.dp))
        Text(
            plainLanguage(asleep, targetMin, health.rhrDelta),
            style = LoopType.caption,
            color = LoopColors.TextSecondary,
        )
    }
}

/**
 * One sentence, no score. "2h under target" is information; "sleep: 44%" is a judgement,
 * and §1.5 is explicit that judging sleep makes sleep worse.
 */
private fun plainLanguage(asleepMin: Int, targetMin: Int, rhrDelta: Int?): String {
    val delta = asleepMin - targetMin
    val base = when {
        abs(delta) <= 20 -> "On target."
        delta < 0 -> "${formatGap(-delta)} under target."
        else -> "${formatGap(delta)} over target."
    }
    val hr = rhrDelta?.let {
        when {
            it >= 5 -> " Resting heart rate is up ${it} — take the hard session down a tier."
            it <= -3 -> " Resting heart rate is down ${abs(it)}."
            else -> ""
        }
    }.orEmpty()
    return base + hr
}

private fun formatGap(minutes: Int): String =
    if (minutes >= 60) "${minutes / 60}h ${minutes % 60}m" else "${minutes}m"

private fun toTime(epochMillis: Long): String =
    Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault())
        .toLocalTime().withSecond(0).withNano(0).toString()

/** SPEC.md §1.3: two-tap manual entry, prefilled, so the coach is never blind. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SleepSheet(
    onDismiss: () -> Unit,
    onSave: (bedtimeMillis: Long, wakeMillis: Long) -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var bedHour by remember { mutableStateOf("1") }
    var bedMinute by remember { mutableStateOf("00") }
    var wakeHour by remember { mutableStateOf("8") }
    var wakeMinute by remember { mutableStateOf("00") }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(Modifier.padding(20.dp)) {
            Text("Sleep", style = LoopType.numeralSmall, color = MaterialTheme.colorScheme.onSurface)
            Text(
                "Roughly is fine. This exists so the coach is not blind.",
                style = LoopType.caption,
                color = LoopColors.TextSecondary,
            )
            Spacer(Modifier.height(16.dp))

            Text("Went to bed", style = LoopType.caption, color = LoopColors.TextTertiary)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                NumberField(bedHour, { bedHour = it }, "Hour", Modifier.weight(1f))
                NumberField(bedMinute, { bedMinute = it }, "Min", Modifier.weight(1f))
            }

            Spacer(Modifier.height(12.dp))
            Text("Woke up", style = LoopType.caption, color = LoopColors.TextTertiary)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                NumberField(wakeHour, { wakeHour = it }, "Hour", Modifier.weight(1f))
                NumberField(wakeMinute, { wakeMinute = it }, "Min", Modifier.weight(1f))
            }

            Spacer(Modifier.height(20.dp))
            Button(
                onClick = {
                    val zone = ZoneId.systemDefault()
                    val today = LocalDate.now(zone)
                    val bedTime = LocalTime.of(
                        bedHour.toIntOrNull()?.coerceIn(0, 23) ?: 1,
                        bedMinute.toIntOrNull()?.coerceIn(0, 59) ?: 0,
                    )
                    val wakeTime = LocalTime.of(
                        wakeHour.toIntOrNull()?.coerceIn(0, 23) ?: 8,
                        wakeMinute.toIntOrNull()?.coerceIn(0, 59) ?: 0,
                    )
                    // A bedtime later in the clock than the wake time means last night.
                    val bedDate = if (bedTime.isAfter(wakeTime)) today.minusDays(1) else today
                    onSave(
                        bedDate.atTime(bedTime).atZone(zone).toInstant().toEpochMilli(),
                        today.atTime(wakeTime).atZone(zone).toInstant().toEpochMilli(),
                    )
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Save") }
            Spacer(Modifier.height(24.dp))
        }
    }
}
