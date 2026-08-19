package dev.loop.feature.review

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.loop.core.contract.domain.Report
import dev.loop.core.designsystem.component.LoopCard
import dev.loop.core.designsystem.component.ProgressRing
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import dev.loop.core.designsystem.theme.SectionAccent
import dev.loop.core.designsystem.theme.color
import kotlin.math.roundToInt

/**
 * The review gate (SPEC.md §2.4).
 *
 * This is the **only** screen besides History on which the composite day score appears.
 * It has been computed all day; showing it earlier is what produces late-night
 * score-chasing, which is why the number arrives here and not in the Today header.
 */
@Composable
fun ReviewScreen(
    viewModel: ReviewViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val report = state.report

    Box(modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        LazyColumn(
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Column {
                    Text("Review", style = LoopType.numeral, color = MaterialTheme.colorScheme.onBackground)
                    Text(
                        report?.date?.toString().orEmpty(),
                        style = LoopType.caption,
                        color = LoopColors.TextTertiary,
                    )
                }
            }

            if (report == null) {
                item { Text("Composing…", style = LoopType.caption, color = LoopColors.TextSecondary) }
            } else {
                item { DayScoreCard(report) }

                if (state.ambiguities.isNotEmpty()) {
                    item { AmbiguityCard(state.ambiguities) }
                }

                items(report.sections.size) { index ->
                    SectionSummary(report, index)
                }

                item {
                    LoopCard {
                        Text("Note", style = LoopType.caption, color = LoopColors.TextTertiary)
                        Text(
                            "This outranks every metric on the screen.",
                            style = LoopType.caption,
                            color = LoopColors.TextTertiary,
                        )
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = state.note,
                            onValueChange = viewModel::setNote,
                            placeholder = { Text("How did the day actually go?") },
                            minLines = 3,
                            textStyle = LoopType.caption,
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }

                state.error?.let { error ->
                    item {
                        LoopCard {
                            Text("Send failed", style = LoopType.label, color = LoopColors.Danger)
                            Spacer(Modifier.height(4.dp))
                            // The real server message, per SPEC.md §2.2.
                            Text(error, style = LoopType.caption, color = LoopColors.TextSecondary)
                        }
                    }
                }

                item {
                    Column {
                        Button(
                            onClick = viewModel::send,
                            enabled = !state.sending && !state.sent && state.canSend,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            if (state.sending) {
                                CircularProgressIndicator(
                                    Modifier.height(16.dp),
                                    strokeWidth = 2.dp,
                                )
                            } else {
                                Text(if (state.sent) "Sent" else "Send report")
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                        OutlinedButton(
                            onClick = viewModel::sendViaMailApp,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(if (state.canSend) "Send from a mail app instead" else "Send from a mail app")
                        }
                        if (!state.canSend) {
                            Spacer(Modifier.height(6.dp))
                            Text(
                                "Add an email account in Settings to send directly.",
                                style = LoopType.caption,
                                color = LoopColors.TextTertiary,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DayScoreCard(report: Report) {
    val score = report.dayScore
    LoopCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            ProgressRing(
                progress = (score ?: 0.0).toFloat(),
                accent = MaterialTheme.colorScheme.primary,
                diameter = 76.dp,
                strokeWidth = 5.dp,
            ) {
                Text(
                    score?.let { "${(it * 100).roundToInt()}" } ?: "—",
                    style = LoopType.numeralSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                )
            }
            Spacer(Modifier.padding(horizontal = 10.dp))
            Column {
                Text("Day score", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
                Spacer(Modifier.height(2.dp))
                Text(
                    if (score == null) {
                        "Nothing was scorable today."
                    } else {
                        "Rolling averages matter more than any single day."
                    },
                    style = LoopType.caption,
                    color = LoopColors.TextSecondary,
                )
            }
        }
    }
}

@Composable
private fun AmbiguityCard(items: List<Ambiguity>) {
    LoopCard {
        Text("Worth a second look", style = LoopType.label, color = LoopColors.Warning)
        Spacer(Modifier.height(6.dp))
        items.forEach {
            Text("· ${it.taskLabel} — ${it.reason}", style = LoopType.caption, color = LoopColors.TextSecondary)
        }
    }
}

@Composable
private fun SectionSummary(report: Report, index: Int) {
    val section = report.sections[index]
    val accent = SectionAccent.NEUTRAL.color()
    LoopCard(accent = accent) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(section.label, style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
            Text(
                section.score?.let { "${(it * 100).roundToInt()}%" } ?: "no tasks",
                style = LoopType.caption,
                color = LoopColors.TextTertiary,
            )
        }
        Spacer(Modifier.height(6.dp))
        section.tasks.forEach { task ->
            val score = task.score
            val mark = when {
                score == null -> "?"
                score >= 0.999 -> "done"
                score > 0.0 -> "${(score * 100).roundToInt()}%"
                else -> "—"
            }
            Text("· ${task.label}  $mark", style = LoopType.caption, color = LoopColors.TextSecondary)
        }
    }
}
