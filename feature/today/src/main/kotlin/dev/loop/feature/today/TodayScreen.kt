package dev.loop.feature.today

import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.data.repository.DaySection
import dev.loop.core.data.repository.DayTask
import dev.loop.core.designsystem.component.EmptyState
import dev.loop.core.designsystem.component.LoopCard
import dev.loop.core.designsystem.component.ProgressBar
import dev.loop.core.designsystem.component.ProgressRing
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import dev.loop.core.designsystem.theme.SectionAccent
import dev.loop.core.designsystem.theme.color
import kotlin.math.roundToInt

/**
 * SPEC.md §5.1's Today screen: a vertical timeline, section colour on the left rail, the
 * running task carrying a live ring, and a sleep strip at the top.
 *
 * No day score appears anywhere on this screen. Per-section and per-task progress do.
 */
@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun TodayScreen(
    viewModel: TodayViewModel,
    onOpenFocus: () -> Unit,
    onOpenReview: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var logTarget by remember { mutableStateOf<DayTask?>(null) }
    var sleepSheet by remember { mutableStateOf(false) }

    Box(modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        LazyColumn(
            contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 96.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item { DayHeader(viewModel.today.toString(), state.day?.plan?.coachNote) }

            item {
                SleepStrip(
                    health = state.health,
                    targetMin = state.sleepTargetMin,
                    onLog = { sleepSheet = true },
                )
            }

            val day = state.day
            if (day == null || !day.hasPlan) {
                item {
                    EmptyState(
                        title = "No plan for today",
                        body = "Share tomorrow's plan into Loop from Gmail, paste it, " +
                            "or repeat yesterday's structure.",
                    )
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TextButton(onClick = viewModel::repeatYesterday) {
                            Text("Repeat yesterday")
                        }
                    }
                }
            } else {
                day.sections.forEach { section ->
                    item(key = "section-${section.section.key.value}") {
                        SectionRow(section)
                    }
                    items(section.tasks, key = { it.key.value }) { task ->
                        TaskCard(
                            task = task,
                            isRunning = state.timer.taskKey == task.key && state.timer.isRunning,
                            elapsedMs = if (state.timer.taskKey == task.key) state.timer.elapsedMs else 0L,
                            onPrimary = {
                                when (task.mode) {
                                    TaskMode.TIMER -> {
                                        viewModel.toggleTimer(task)
                                        if (state.timer.taskKey != task.key) onOpenFocus()
                                    }
                                    TaskMode.CHECK -> viewModel.setCheck(
                                        task,
                                        (task.actual as? TaskActual.Check)?.done != true,
                                    )
                                    else -> logTarget = task
                                }
                            },
                            // SPEC.md §5.1: long-press any task to log retroactively.
                            onLongPress = { logTarget = task },
                        )
                    }
                }

                item {
                    TextButton(onClick = onOpenReview, modifier = Modifier.padding(top = 8.dp)) {
                        Text("Open review")
                    }
                }
            }
        }

        state.message?.let { message ->
            MessageBar(
                message = message,
                onDismiss = viewModel::clearMessage,
                modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp),
            )
        }
    }

    logTarget?.let { task ->
        LogSheet(
            task = task,
            onDismiss = { logTarget = null },
            onLogMinutes = { minutes -> viewModel.logManualMinutes(task, minutes); logTarget = null },
            onLogStatus = { status, next -> viewModel.setStatus(task, status, next); logTarget = null },
            onLogCheck = { done -> viewModel.setCheck(task, done); logTarget = null },
            onLogRun = { d, t, type, rpe ->
                viewModel.logRun(task, d, t, type, rpe, detected = false)
                logTarget = null
            },
            onLogLift = { sets, duration, groups, rpe ->
                viewModel.logLift(task, sets, duration, groups, rpe)
                logTarget = null
            },
        )
    }

    if (sleepSheet) {
        SleepSheet(
            onDismiss = { sleepSheet = false },
            onSave = { bed, wake -> viewModel.logSleep(bed, wake); sleepSheet = false },
        )
    }
}

@Composable
private fun DayHeader(date: String, coachNote: String?) {
    Column(Modifier.padding(bottom = 4.dp)) {
        Text("Today", style = LoopType.numeral, color = MaterialTheme.colorScheme.onBackground)
        Text(date, style = LoopType.caption, color = LoopColors.TextTertiary)
        coachNote?.takeIf { it.isNotBlank() }?.let {
            Spacer(Modifier.height(10.dp))
            Text(it, style = LoopType.caption, color = LoopColors.TextSecondary)
        }
    }
}

@Composable
private fun SectionRow(section: DaySection) {
    val accent = SectionAccent.fromKey(section.section.color).color()
    Column(Modifier.padding(top = 10.dp)) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(section.section.label.uppercase(), style = LoopType.caption, color = accent)
            // Per-section progress is visible all day (§5.1); only the composite is hidden.
            Text(
                section.score?.let { "${(it * 100).roundToInt()}%" } ?: "—",
                style = LoopType.caption,
                color = LoopColors.TextTertiary,
            )
        }
        Spacer(Modifier.height(6.dp))
        ProgressBar(progress = (section.score ?: 0.0).toFloat(), accent = accent)
    }
}

@OptIn(ExperimentalComposeUiApi::class, androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
private fun TaskCard(
    task: DayTask,
    isRunning: Boolean,
    elapsedMs: Long,
    onPrimary: () -> Unit,
    onLongPress: () -> Unit,
) {
    val accent = SectionAccent.fromKey(task.sectionColor).color()

    LoopCard(
        accent = accent,
        modifier = Modifier.combinedClickable(onClick = onPrimary, onLongClick = onLongPress),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            ProgressRing(
                progress = task.progress.toFloat(),
                accent = accent,
                diameter = if (isRunning) 52.dp else 40.dp,
            ) {
                if (isRunning) {
                    Text(
                        formatShort(elapsedMs),
                        style = LoopType.caption,
                        color = accent,
                        fontWeight = FontWeight.Medium,
                    )
                }
            }
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    task.label,
                    style = LoopType.label,
                    color = if (task.task.isTombstoned) {
                        LoopColors.TextTertiary
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    },
                )
                Spacer(Modifier.height(3.dp))
                Text(subtitle(task), style = LoopType.caption, color = LoopColors.TextSecondary)
            }
            if (task.mode == TaskMode.TIMER) {
                Text(
                    if (isRunning) "Pause" else "Start",
                    style = LoopType.caption,
                    color = accent,
                )
            }
        }
    }
}

private fun subtitle(task: DayTask): String = when (task.mode) {
    TaskMode.TIMER -> {
        val target = task.targetMin
        buildString {
            append("${task.focusedMin} min")
            if (target != null) append(" of $target")
            if (task.overflowMin > 0) append("  ·  +${task.overflowMin} over")
            task.task.window?.let { append("  ·  ${it.format()}") }
        }
    }

    TaskMode.RUN -> (task.actual as? TaskActual.Run)?.let { run ->
        buildString {
            run.distanceKm?.let { append("%.1f km".format(it)) }
            run.paceSecPerKm?.let { append("  ·  %d:%02d/km".format(it / 60, it % 60)) }
        }.ifBlank { "Not logged" }
    } ?: "Tap to log the run"

    TaskMode.LIFT -> (task.actual as? TaskActual.Lift)?.let {
        "${it.exerciseCount} exercises  ·  ${it.volumeKg.roundToInt()} kg"
    } ?: "Tap to log the session"

    TaskMode.STATUS -> when (val actual = task.actual) {
        is TaskActual.Status -> actual.nextAction?.takeIf { it.isNotBlank() }
            ?: actual.status.wire.replace('_', ' ')
        else -> "Not started"
    }

    TaskMode.CHECK -> if ((task.actual as? TaskActual.Check)?.done == true) "Done" else "Not done"
}

private fun formatShort(ms: Long): String {
    val totalSeconds = ms / 1000
    val m = totalSeconds / 60
    val s = totalSeconds % 60
    return if (m >= 60) "${m / 60}h${m % 60}" else "%d:%02d".format(m, s)
}

@Composable
private fun MessageBar(message: String, onDismiss: () -> Unit, modifier: Modifier = Modifier) {
    LoopCard(modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(message, style = LoopType.caption, color = LoopColors.TextSecondary, modifier = Modifier.weight(1f))
            TextButton(onClick = onDismiss) { Text("OK") }
        }
    }
}
