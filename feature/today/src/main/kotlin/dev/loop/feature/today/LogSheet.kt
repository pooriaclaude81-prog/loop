package dev.loop.feature.today

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import dev.loop.core.contract.domain.LiftSet
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.validate.Vocabulary
import dev.loop.core.data.repository.DayTask
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import kotlin.math.roundToInt

/**
 * The mode-specific log sheets of SPEC.md §5.1.
 *
 * Each mode gets the fields its scoring formula actually consumes and nothing else — the
 * run sheet shows a live pace-band verdict because §6 scores pace as a band and it would
 * otherwise be invisible why a fast easy run lost points.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogSheet(
    task: DayTask,
    onDismiss: () -> Unit,
    onLogMinutes: (Int) -> Unit,
    onLogStatus: (StatusValue, String?) -> Unit,
    onLogCheck: (Boolean) -> Unit,
    onLogRun: (Double?, Double?, String?, Int?) -> Unit,
    onLogLift: (List<LiftSet>, Double?, List<String>, Int?) -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(Modifier.padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text(task.label, style = LoopType.numeralSmall, color = MaterialTheme.colorScheme.onSurface)
            Text(
                task.mode.wire,
                style = LoopType.caption,
                color = LoopColors.TextTertiary,
            )
            HorizontalDivider(Modifier.padding(vertical = 14.dp), color = MaterialTheme.colorScheme.outline)

            when (task.mode) {
                TaskMode.TIMER -> TimerLogBody(task, onLogMinutes)
                TaskMode.RUN -> RunLogBody(task, onLogRun)
                TaskMode.LIFT -> LiftLogBody(task, onLogLift)
                TaskMode.STATUS -> StatusLogBody(task, onLogStatus)
                TaskMode.CHECK -> CheckLogBody(task, onLogCheck)
            }
        }
    }
}

@Composable
private fun TimerLogBody(task: DayTask, onLog: (Int) -> Unit) {
    var minutes by remember { mutableStateOf("") }

    Text(
        "Add minutes you did not time. These are flagged as manual so the report stays honest.",
        style = LoopType.caption,
        color = LoopColors.TextSecondary,
    )
    Spacer(Modifier.height(12.dp))

    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(15, 25, 45, 60, 90).forEach { preset ->
            OutlinedButton(onClick = { onLog(preset) }) { Text("$preset") }
        }
    }
    Spacer(Modifier.height(12.dp))
    NumberField(minutes, { minutes = it }, "Minutes")
    Spacer(Modifier.height(12.dp))
    Button(
        onClick = { minutes.toIntOrNull()?.let(onLog) },
        enabled = minutes.toIntOrNull()?.let { it > 0 } == true,
        modifier = Modifier.fillMaxWidth(),
    ) { Text("Log minutes") }
}

@Composable
private fun RunLogBody(task: DayTask, onLog: (Double?, Double?, String?, Int?) -> Unit) {
    val target = task.task.target as? TaskTarget.Run
    val existing = task.actual as? TaskActual.Run

    var distance by remember { mutableStateOf(existing?.distanceKm?.toString() ?: "") }
    var duration by remember { mutableStateOf(existing?.durationMin?.toString() ?: "") }
    var runType by remember { mutableStateOf(existing?.runType ?: target?.runType ?: "easy") }
    var rpe by remember { mutableStateOf(existing?.rpe ?: 5) }

    if (existing?.source == dev.loop.core.contract.domain.DataSource.HEALTH_CONNECT) {
        DetectedBadge()
        Spacer(Modifier.height(10.dp))
    }

    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        NumberField(distance, { distance = it }, "Distance (km)", Modifier.weight(1f), decimal = true)
        NumberField(duration, { duration = it }, "Duration (min)", Modifier.weight(1f), decimal = true)
    }

    // The pace-band verdict of §5.1 — without it, losing 40% of the score to a band is
    // invisible until the report.
    val paceSec = paceOf(distance.toDoubleOrNull(), duration.toDoubleOrNull())
    if (paceSec != null) {
        Spacer(Modifier.height(10.dp))
        PaceVerdict(paceSec, target)
    }

    Spacer(Modifier.height(14.dp))
    Text("Type", style = LoopType.caption, color = LoopColors.TextTertiary)
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(Vocabulary.RUN_TYPES.toList().size) { index ->
            val type = Vocabulary.RUN_TYPES.toList()[index]
            FilterChip(
                selected = runType == type,
                onClick = { runType = type },
                label = { Text(type) },
            )
        }
    }

    Spacer(Modifier.height(14.dp))
    RpeRow(rpe) { rpe = it }

    Spacer(Modifier.height(16.dp))
    Button(
        onClick = { onLog(distance.toDoubleOrNull(), duration.toDoubleOrNull(), runType, rpe) },
        enabled = distance.toDoubleOrNull() != null || duration.toDoubleOrNull() != null,
        modifier = Modifier.fillMaxWidth(),
    ) { Text("Save run") }
}

@Composable
private fun PaceVerdict(paceSec: Int, target: TaskTarget.Run?) {
    val band = target?.paceBand
    val text = "%d:%02d /km".format(paceSec / 60, paceSec % 60)
    if (band == null) {
        Text(text, style = LoopType.caption, color = LoopColors.TextSecondary)
        return
    }
    val inside = paceSec in band.loSecPerKm..band.hiSecPerKm
    val verdict = when {
        inside -> "inside the band"
        paceSec < band.loSecPerKm -> "too fast for this run"
        else -> "slower than the band"
    }
    Text(
        "$text  ·  $verdict  (${band.format().joinToString(" – ")})",
        style = LoopType.caption,
        color = if (inside) LoopColors.Success else LoopColors.Warning,
    )
}

private fun paceOf(distanceKm: Double?, durationMin: Double?): Int? {
    if (distanceKm == null || durationMin == null || distanceKm <= 0.0) return null
    return ((durationMin * 60.0) / distanceKm).roundToInt()
}

@Composable
private fun LiftLogBody(
    task: DayTask,
    onLog: (List<LiftSet>, Double?, List<String>, Int?) -> Unit,
) {
    val target = task.task.target as? TaskTarget.Lift
    val existing = task.actual as? TaskActual.Lift

    val rows = remember {
        mutableStateListOf<MutableLiftRow>().apply {
            existing?.sets?.forEach {
                add(MutableLiftRow(it.exercise, it.sets.toString(), it.reps.toString(), it.weightKg.toString()))
            }
            if (isEmpty()) add(MutableLiftRow())
        }
    }
    var duration by remember { mutableStateOf(existing?.durationMin?.toString() ?: "") }
    val groups = remember {
        mutableStateListOf<String>().apply { addAll(existing?.groups ?: target?.groups.orEmpty()) }
    }
    var rpe by remember { mutableStateOf(existing?.rpe ?: 6) }

    rows.forEachIndexed { index, row ->
        Row(
            Modifier.fillMaxWidth().padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = row.exercise,
                onValueChange = { rows[index] = row.copy(exercise = it) },
                label = { Text("Exercise") },
                singleLine = true,
                textStyle = LoopType.caption,
                modifier = Modifier.weight(2.2f),
            )
            NumberField(row.sets, { rows[index] = row.copy(sets = it) }, "Sets", Modifier.weight(1f))
            NumberField(row.reps, { rows[index] = row.copy(reps = it) }, "Reps", Modifier.weight(1f))
            NumberField(row.weight, { rows[index] = row.copy(weight = it) }, "kg", Modifier.weight(1.1f), decimal = true)
        }
    }

    TextButton(onClick = { rows.add(MutableLiftRow()) }) { Text("+ Add exercise") }

    // Running volume total (§5.1), so the 30% volume component is not a surprise.
    val volume = rows.sumOf { it.toLiftSet()?.volumeKg ?: 0.0 }
    Text(
        buildString {
            append("Volume ${volume.roundToInt()} kg")
            target?.volumeKg?.let { append(" of ${it.roundToInt()} kg") }
        },
        style = LoopType.caption,
        color = LoopColors.TextSecondary,
    )

    Spacer(Modifier.height(12.dp))
    NumberField(duration, { duration = it }, "Duration (min)", Modifier.fillMaxWidth(), decimal = true)

    Spacer(Modifier.height(12.dp))
    Text("Muscle groups", style = LoopType.caption, color = LoopColors.TextTertiary)
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        val all = Vocabulary.MUSCLE_GROUPS.toList()
        items(all.size) { index ->
            val group = all[index]
            FilterChip(
                selected = group in groups,
                onClick = { if (group in groups) groups.remove(group) else groups.add(group) },
                label = { Text(group.replace('_', ' ')) },
            )
        }
    }

    Spacer(Modifier.height(12.dp))
    RpeRow(rpe) { rpe = it }

    Spacer(Modifier.height(16.dp))
    Button(
        onClick = {
            onLog(rows.mapNotNull { it.toLiftSet() }, duration.toDoubleOrNull(), groups.toList(), rpe)
        },
        enabled = rows.any { it.toLiftSet() != null },
        modifier = Modifier.fillMaxWidth(),
    ) { Text("Save session") }
}

private data class MutableLiftRow(
    val exercise: String = "",
    val sets: String = "",
    val reps: String = "",
    val weight: String = "",
) {
    fun toLiftSet(): LiftSet? {
        val name = exercise.trim().ifBlank { return null }
        val s = sets.toIntOrNull() ?: return null
        val r = reps.toIntOrNull() ?: return null
        val w = weight.toDoubleOrNull() ?: 0.0
        return LiftSet(name, s, r, w)
    }
}

@Composable
private fun StatusLogBody(task: DayTask, onLog: (StatusValue, String?) -> Unit) {
    val existing = task.actual as? TaskActual.Status
    var status by remember { mutableStateOf(existing?.status ?: StatusValue.NOT_STARTED) }
    var nextAction by remember { mutableStateOf(existing?.nextAction ?: "") }

    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        StatusValue.entries.forEach { value ->
            FilterChip(
                selected = status == value,
                onClick = { status = value },
                label = { Text(value.wire.replace('_', ' ')) },
            )
        }
    }

    // §5.1 makes the next action mandatory for in_progress: "in progress" with no next
    // step is how a thesis chapter sits untouched for five weeks.
    if (status == StatusValue.IN_PROGRESS) {
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = nextAction,
            onValueChange = { nextAction = it },
            label = { Text("Next action (required)") },
            singleLine = true,
            textStyle = LoopType.caption,
            modifier = Modifier.fillMaxWidth(),
        )
    }

    Spacer(Modifier.height(16.dp))
    Button(
        onClick = { onLog(status, nextAction.takeIf { it.isNotBlank() }) },
        enabled = status != StatusValue.IN_PROGRESS || nextAction.isNotBlank(),
        modifier = Modifier.fillMaxWidth(),
    ) { Text("Save status") }
}

@Composable
private fun CheckLogBody(task: DayTask, onLog: (Boolean) -> Unit) {
    val done = (task.actual as? TaskActual.Check)?.done == true
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
        Button(onClick = { onLog(true) }, enabled = !done, modifier = Modifier.weight(1f)) {
            Text("Done")
        }
        OutlinedButton(onClick = { onLog(false) }, enabled = done, modifier = Modifier.weight(1f)) {
            Text("Not done")
        }
    }
}

@Composable
private fun RpeRow(value: Int, onChange: (Int) -> Unit) {
    Text("RPE $value", style = LoopType.caption, color = LoopColors.TextTertiary)
    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        items(10) { index ->
            val level = index + 1
            FilterChip(
                selected = value == level,
                onClick = { onChange(level) },
                label = { Text("$level") },
            )
        }
    }
}

@Composable
private fun DetectedBadge() {
    Text(
        "detected from Health Connect",
        style = LoopType.caption,
        color = LoopColors.Success,
    )
}

@Composable
internal fun NumberField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    decimal: Boolean = false,
) {
    OutlinedTextField(
        value = value,
        onValueChange = { text ->
            val filtered = text.filter { it.isDigit() || (decimal && it == '.') }
            onValueChange(filtered)
        },
        label = { Text(label, style = LoopType.caption) },
        singleLine = true,
        textStyle = LoopType.caption,
        keyboardOptions = KeyboardOptions(
            keyboardType = if (decimal) KeyboardType.Decimal else KeyboardType.Number,
        ),
        modifier = modifier,
    )
}
