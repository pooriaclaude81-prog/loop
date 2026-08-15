package dev.loop.harness

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.domain.Section
import dev.loop.core.contract.validate.Issue
import dev.loop.core.contract.validate.Severity
import dev.loop.core.data.db.PlanSource
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import dev.loop.core.designsystem.theme.SectionAccent
import dev.loop.core.designsystem.theme.color

@Composable
fun ContractHarnessScreen(
    viewModel: ContractHarnessViewModel,
    samplePlanJson: String?,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val clipboard = LocalClipboardManager.current
    var pasted by remember { mutableStateOf("") }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            Column {
                Text("Loop", style = LoopType.numeral, color = MaterialTheme.colorScheme.onBackground)
                Text(
                    "M1 · contract and data layer · logical day ${viewModel.today}",
                    style = LoopType.caption,
                    color = LoopColors.TextTertiary,
                )
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (samplePlanJson != null) {
                    Button(
                        onClick = { viewModel.import(samplePlanJson, PlanSource.SAMPLE) },
                        enabled = !state.busy,
                    ) { Text("Load sample") }
                }
                OutlinedButton(
                    onClick = {
                        clipboard.getText()?.text?.let { viewModel.import(it, PlanSource.CLIPBOARD) }
                    },
                    enabled = !state.busy,
                ) { Text("Paste plan") }
                OutlinedButton(
                    onClick = viewModel::repeatYesterday,
                    enabled = !state.busy,
                ) { Text("Repeat yesterday") }
            }
        }

        item {
            OutlinedTextField(
                value = pasted,
                onValueChange = { pasted = it },
                label = { Text("Plan JSON") },
                textStyle = LoopType.caption.copy(fontFamily = FontFamily.Monospace),
                minLines = 4,
                maxLines = 10,
                modifier = Modifier.fillMaxWidth(),
            )
        }

        item {
            Button(
                onClick = { viewModel.import(pasted, PlanSource.SHARE) },
                enabled = pasted.isNotBlank() && !state.busy,
            ) { Text("Import pasted JSON") }
        }

        state.lastOutcome?.let { outcome ->
            item { OutcomeCard(outcome) }
        }

        if (state.planWarnings.isNotEmpty()) {
            item {
                Card(title = "Active plan was repaired") {
                    state.planWarnings.forEach { IssueRow(it) }
                }
            }
        }

        state.plan?.let { plan ->
            item { PlanCard(plan) }
        }

        if (state.plan == null && state.lastOutcome == null) {
            item {
                Card(title = "No plan for today") {
                    Text(
                        "Load the sample, paste a payload, or share one into Loop from Gmail.",
                        style = LoopType.caption,
                        color = LoopColors.TextSecondary,
                    )
                }
            }
        }

        if (state.failures.isNotEmpty()) {
            item {
                Text(
                    "Rejected payloads",
                    style = LoopType.label,
                    color = MaterialTheme.colorScheme.onBackground,
                )
            }
            items(state.failures, key = { it.id }) { failure ->
                Card(title = "${failure.source} · ${failure.receivedAt}") {
                    viewModel.issuesOf(failure).take(12).forEach { IssueRow(it) }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        failure.rawText.take(400),
                        style = LoopType.caption.copy(fontFamily = FontFamily.Monospace),
                        color = LoopColors.TextTertiary,
                    )
                    TextButton(onClick = { viewModel.dismissFailure(failure.id) }) {
                        Text("Dismiss")
                    }
                }
            }
        }
    }
}

@Composable
private fun OutcomeCard(outcome: HarnessUiState.Outcome) = when (outcome) {
    is HarnessUiState.Outcome.Imported -> Card(title = "Imported") {
        Text(
            "${outcome.taskCount} tasks",
            style = LoopType.caption,
            color = LoopColors.TextSecondary,
        )
        outcome.warnings.forEach { IssueRow(it) }
    }

    is HarnessUiState.Outcome.Revised -> Card(title = "Revised") {
        if (outcome.changes.isEmpty()) {
            Text("No structural changes", style = LoopType.caption, color = LoopColors.TextSecondary)
        }
        outcome.changes.forEach { change ->
            Text(
                "· ${change::class.simpleName}${change.taskKey?.let { " $it" } ?: ""}",
                style = LoopType.caption,
                color = LoopColors.TextSecondary,
            )
        }
        outcome.warnings.forEach { IssueRow(it) }
    }

    is HarnessUiState.Outcome.Skipped -> Card(title = "Skipped") {
        Text(outcome.message, style = LoopType.caption, color = LoopColors.TextSecondary)
    }

    is HarnessUiState.Outcome.Failed -> Card(title = "Rejected — ${outcome.issues.size} problems") {
        outcome.issues.forEach { IssueRow(it) }
    }
}

@Composable
private fun PlanCard(plan: Plan) = Card(title = "${plan.planId} · rev ${plan.rev} · ${plan.date}") {
    plan.coachNote?.let {
        Text(it, style = LoopType.caption, color = LoopColors.TextSecondary)
        Spacer(Modifier.height(8.dp))
    }
    plan.sections.forEach { section ->
        SectionRow(section)
        Spacer(Modifier.height(4.dp))
    }
}

@Composable
private fun SectionRow(section: Section) {
    val accent = SectionAccent.fromKey(section.color).color()
    Row(modifier = Modifier.fillMaxWidth()) {
        // The colour rail of SPEC.md §5.1, driven entirely by the plan's `color` field.
        Box(
            Modifier
                .width(3.dp)
                .height(if (section.tasks.isEmpty()) 24.dp else (24 * section.tasks.size).dp)
                .clip(RoundedCornerShape(2.dp))
                .background(accent),
        )
        Spacer(Modifier.width(12.dp))
        Column(Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(section.label, style = LoopType.label, color = accent)
                Spacer(Modifier.width(8.dp))
                Text(
                    "w ${"%.2f".format(section.weight)}",
                    style = LoopType.caption,
                    color = LoopColors.TextTertiary,
                )
                if (!section.isScorable) {
                    Spacer(Modifier.width(8.dp))
                    Text("unscored", style = LoopType.caption, color = LoopColors.TextTertiary)
                }
            }
            section.tasks.forEach { task ->
                Text(
                    buildString {
                        append(if (task.isTombstoned) "· ${task.label} (removed)" else "· ${task.label}")
                        append("  ")
                        append(task.mode.wire)
                        task.window?.let { append("  ${it.format()}") }
                    },
                    style = LoopType.caption,
                    color = if (task.isTombstoned) LoopColors.TextTertiary else LoopColors.TextSecondary,
                )
            }
        }
    }
}

@Composable
private fun IssueRow(issue: Issue) {
    val tint = when (issue.severity) {
        Severity.ERROR -> LoopColors.Danger
        Severity.WARNING -> LoopColors.Warning
    }
    Column(Modifier.padding(vertical = 3.dp)) {
        Text("${issue.code.name} · ${issue.path.ifEmpty { "/" }}", style = LoopType.caption, color = tint)
        Text(issue.message, style = LoopType.caption, color = LoopColors.TextSecondary)
        issue.hint?.let {
            Text(it, style = LoopType.caption, color = LoopColors.TextTertiary)
        }
    }
}

@Composable
private fun Card(title: String, content: @Composable () -> Unit) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(14.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(title, style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
            HorizontalDivider(
                Modifier.padding(vertical = 8.dp),
                color = MaterialTheme.colorScheme.outline,
            )
            content()
        }
    }
}
