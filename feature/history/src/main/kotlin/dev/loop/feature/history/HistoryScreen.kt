package dev.loop.feature.history

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.loop.core.designsystem.component.EmptyState
import dev.loop.core.designsystem.component.LoopCard
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import dev.loop.core.designsystem.theme.SectionAccent
import dev.loop.core.designsystem.theme.color
import kotlin.math.roundToInt

/**
 * SPEC.md §5.1's History: a per-section heatmap, the day-score trend with the 7-day
 * rolling average visually dominant, calibration, sleep, and streaks.
 *
 * The rolling average is drawn thick and the daily scores thin, deliberately: §6 says
 * daily numbers are noisy and punishing, and the chart should say the same thing without
 * needing a caption.
 */
@Composable
fun HistoryScreen(viewModel: HistoryViewModel, modifier: Modifier = Modifier) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Box(modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        LazyColumn(
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Text("History", style = LoopType.numeral, color = MaterialTheme.colorScheme.onBackground)
            }

            if (!state.loading && state.dayScores.none { it.score != null }) {
                item {
                    EmptyState(
                        title = "Nothing to show yet",
                        body = "History fills in as you send reports. Come back after a few days.",
                    )
                }
                return@LazyColumn
            }

            item { TrendCard(state) }
            item { HeatmapCard(state) }
            if (state.calibration.isNotEmpty()) item { CalibrationCard(state) }
            if (state.streaks.isNotEmpty()) item { StreakCard(state) }
            if (state.sleepMinutes.isNotEmpty()) item { SleepCard(state) }
        }
    }
}

@Composable
private fun TrendCard(state: HistoryUiState) {
    LoopCard {
        Text("Day score", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
        Text(
            "Thick line is the 7-day average.",
            style = LoopType.caption,
            color = LoopColors.TextTertiary,
        )
        Spacer(Modifier.height(12.dp))

        val accent = MaterialTheme.colorScheme.primary
        Canvas(Modifier.fillMaxWidth().height(120.dp)) {
            val daily = state.dayScores.map { it.score }
            val rolling = state.rollingAverage.map { it.score }
            if (daily.isEmpty()) return@Canvas

            fun pathOf(values: List<Double?>): Path {
                val path = Path()
                var started = false
                values.forEachIndexed { index, value ->
                    if (value == null) return@forEachIndexed
                    val x = size.width * index / (values.size - 1).coerceAtLeast(1)
                    val y = size.height * (1f - value.toFloat())
                    if (!started) {
                        path.moveTo(x, y)
                        started = true
                    } else {
                        path.lineTo(x, y)
                    }
                }
                return path
            }

            // Daily: thin and faint. It is the noise, not the signal.
            drawPath(pathOf(daily), color = accent.copy(alpha = 0.35f), style = Stroke(width = 1.5f))
            // Rolling average: dominant.
            drawPath(pathOf(rolling), color = accent, style = Stroke(width = 4f))

            drawLine(
                color = LoopColors.Outline,
                start = Offset(0f, size.height),
                end = Offset(size.width, size.height),
                strokeWidth = 1f,
            )
        }
    }
}

@Composable
private fun HeatmapCard(state: HistoryUiState) {
    LoopCard {
        Text("Sections", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(10.dp))
        state.heatmap.forEach { (section, cells) ->
            val accent = SectionAccent.fromKey(section).color()
            Text(section, style = LoopType.caption, color = accent)
            Spacer(Modifier.height(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                cells.takeLast(28).forEach { cell ->
                    Box(
                        Modifier
                            .size(9.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(
                                cell.score
                                    ?.let { accent.copy(alpha = (0.15f + it.toFloat() * 0.85f)) }
                                    ?: LoopColors.Outline,
                            ),
                    )
                }
            }
            Spacer(Modifier.height(10.dp))
        }
    }
}

@Composable
private fun CalibrationCard(state: HistoryUiState) {
    LoopCard {
        Text("Calibration", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
        Text(
            "Actual minutes over planned. Under 0.8 for a week means the plans are too big.",
            style = LoopType.caption,
            color = LoopColors.TextTertiary,
        )
        Spacer(Modifier.height(8.dp))
        state.calibration.forEach { (section, ratio) ->
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(section, style = LoopType.caption, color = LoopColors.TextSecondary)
                Text(
                    ratio?.let { "%.2f".format(it) } ?: "not planned",
                    style = LoopType.caption,
                    color = when {
                        ratio == null -> LoopColors.TextTertiary
                        ratio < 0.8 -> LoopColors.Warning
                        else -> LoopColors.Success
                    },
                )
            }
        }
    }
}

@Composable
private fun StreakCard(state: HistoryUiState) {
    LoopCard {
        Text("Streaks", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(6.dp))
        state.streaks.forEach { (section, days) ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(section, style = LoopType.caption, color = LoopColors.TextSecondary)
                Text(
                    if (days == 0) "—" else "$days days",
                    style = LoopType.caption,
                    color = LoopColors.TextSecondary,
                )
            }
        }
    }
}

@Composable
private fun SleepCard(state: HistoryUiState) {
    LoopCard {
        Text("Sleep", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(10.dp))

        val accent = MaterialTheme.colorScheme.primary
        Canvas(Modifier.fillMaxWidth().height(90.dp)) {
            val values = state.sleepMinutes.map { it.second }
            if (values.isEmpty()) return@Canvas
            val max = (values.maxOrNull() ?: 1).coerceAtLeast(540)
            val barWidth = size.width / values.size

            values.forEachIndexed { index, minutes ->
                val height = size.height * (minutes.toFloat() / max)
                drawRect(
                    color = accent.copy(alpha = 0.7f),
                    topLeft = Offset(index * barWidth + barWidth * 0.15f, size.height - height),
                    size = androidx.compose.ui.geometry.Size(barWidth * 0.7f, height),
                )
            }
        }
        Spacer(Modifier.height(6.dp))
        val avg = state.sleepMinutes.map { it.second }.average().roundToInt()
        Text(
            "Average ${avg / 60}h ${avg % 60}m over ${state.sleepMinutes.size} nights",
            style = LoopType.caption,
            color = LoopColors.TextSecondary,
        )
    }
}
