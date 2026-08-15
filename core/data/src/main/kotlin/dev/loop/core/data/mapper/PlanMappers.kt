package dev.loop.core.data.mapper

import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.domain.PlanId
import dev.loop.core.contract.domain.Section
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.Task
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.domain.TimeWindow
import dev.loop.core.contract.json.LoopJsonCompact
import dev.loop.core.contract.validate.Issue
import dev.loop.core.data.db.PlanEntity
import dev.loop.core.data.db.SectionEntity
import dev.loop.core.data.db.TaskEntity
import dev.loop.core.data.db.TaskStateEntity
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneId
import kotlinx.serialization.encodeToString

/**
 * Domain ↔ Room mapping.
 *
 * Structured columns exist for everything the app queries or sorts by; the polymorphic
 * bits ([TaskTarget], [TaskActual]) are stored as JSON because SQL cannot express a sealed
 * hierarchy without a column per variant. `raw_json` is kept verbatim alongside so a
 * payload can always be re-parsed after a schema change, without a migration having to
 * reconstruct it.
 */

fun Plan.toEntity(
    rawJson: String,
    importedAt: Instant,
    source: String,
    isActive: Boolean,
    issues: List<Issue>,
): PlanEntity = PlanEntity(
    planId = planId.value,
    rev = rev,
    date = date,
    tz = tz.id,
    rawJson = rawJson,
    coachNote = coachNote,
    sleepTargetMin = sleepTargetMin,
    reportGate = reportGate?.toString(),
    importedAt = importedAt,
    source = source,
    isActive = isActive,
    issuesJson = issues.takeIf { it.isNotEmpty() }?.let { LoopJsonCompact.encodeToString(it) },
)

fun Plan.toSectionEntities(): List<SectionEntity> = sections.map { section ->
    SectionEntity(
        planId = planId.value,
        rev = rev,
        sectionKey = section.key.value,
        label = section.label,
        weight = section.weight,
        declaredWeight = section.declaredWeight,
        color = section.color,
        sortOrder = section.sortOrder,
    )
}

fun Plan.toTaskEntities(): List<TaskEntity> = sections.flatMap { section ->
    section.tasks.map { task ->
        TaskEntity(
            planId = planId.value,
            rev = rev,
            taskKey = task.key.value,
            sectionKey = section.key.value,
            label = task.label,
            mode = task.mode.wire,
            targetJson = LoopJsonCompact.encodeToString(task.target),
            windowStart = task.window?.start?.toString(),
            windowEnd = task.window?.end?.toString(),
            priority = task.priority,
            note = task.note,
            sortOrder = task.sortOrder,
            removedInRev = task.removedInRev,
        )
    }
}

fun buildPlan(
    plan: PlanEntity,
    sections: List<SectionEntity>,
    tasks: List<TaskEntity>,
): Plan {
    val tasksBySection = tasks.groupBy { it.sectionKey }
    return Plan(
        schema = Plan.CURRENT_SCHEMA,
        planId = PlanId(plan.planId),
        date = plan.date,
        rev = plan.rev,
        tz = ZoneId.of(plan.tz),
        coachNote = plan.coachNote,
        sleepTargetMin = plan.sleepTargetMin,
        reportGate = plan.reportGate?.let(LocalTime::parse),
        sections = sections.sortedBy { it.sortOrder }.map { section ->
            Section(
                key = SectionKey(section.sectionKey),
                label = section.label,
                weight = section.weight,
                declaredWeight = section.declaredWeight,
                color = section.color,
                sortOrder = section.sortOrder,
                tasks = tasksBySection[section.sectionKey]
                    .orEmpty()
                    .sortedBy { it.sortOrder }
                    .map(TaskEntity::toDomain),
            )
        },
    )
}

fun TaskEntity.toDomain(): Task = Task(
    key = TaskKey(taskKey),
    sectionKey = SectionKey(sectionKey),
    label = label,
    mode = TaskMode.fromWire(mode) ?: TaskMode.CHECK,
    target = LoopJsonCompact.decodeFromString<TaskTarget>(targetJson),
    window = windowStart?.let { start ->
        windowEnd?.let { end -> TimeWindow(LocalTime.parse(start), LocalTime.parse(end)) }
    },
    priority = priority,
    note = note,
    sortOrder = sortOrder,
    removedInRev = removedInRev,
)

fun TaskStateEntity.toActual(): TaskActual? =
    actualJson?.let { LoopJsonCompact.decodeFromString<TaskActual>(it) }

fun TaskActual.toJson(): String = LoopJsonCompact.encodeToString(this)

fun String.toIssues(): List<Issue> = LoopJsonCompact.decodeFromString<List<Issue>>(this)
