package dev.loop.core.contract

import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.domain.PlanId
import dev.loop.core.contract.domain.Section
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.Task
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.contract.domain.TaskTarget
import java.time.LocalDate
import java.time.ZoneId

/** Terse builders so merge tests read as the scenario they describe. */

val TEST_DATE: LocalDate = LocalDate.of(2026, 8, 16)
val TEST_ZONE: ZoneId = ZoneId.of("Asia/Tehran")

fun plan(
    planId: String = "p-0816",
    rev: Int = 1,
    date: LocalDate = TEST_DATE,
    vararg sections: Section,
): Plan = Plan(
    schema = 1,
    planId = PlanId(planId),
    date = date,
    rev = rev,
    tz = TEST_ZONE,
    sections = sections.toList(),
)

fun section(
    key: String,
    weight: Double = 1.0,
    vararg tasks: Task,
): Section = Section(
    key = SectionKey(key),
    label = key.replaceFirstChar { it.uppercase() },
    weight = weight,
    declaredWeight = weight,
    color = "indigo",
    tasks = tasks.mapIndexed { index, task ->
        task.copy(sectionKey = SectionKey(key), sortOrder = index)
    },
)

fun timerTask(
    key: String,
    targetMin: Int = 60,
    label: String = key,
    priority: Int = 1,
): Task = Task(
    key = TaskKey(key),
    sectionKey = SectionKey(""),
    label = label,
    mode = TaskMode.TIMER,
    target = TaskTarget.Timed(targetMin),
    priority = priority,
)

fun statusTask(key: String, label: String = key): Task = Task(
    key = TaskKey(key),
    sectionKey = SectionKey(""),
    label = label,
    mode = TaskMode.STATUS,
    target = TaskTarget.Status,
)

fun runTask(key: String, distanceKm: Double = 5.0, label: String = key): Task = Task(
    key = TaskKey(key),
    sectionKey = SectionKey(""),
    label = label,
    mode = TaskMode.RUN,
    target = TaskTarget.Run(distanceKm = distanceKm),
)

fun loggedMinutes(minutes: Int, span: Int = minutes): TaskActual.Timed = TaskActual.Timed(
    focusedMin = minutes,
    wallClockSpanMin = span,
    sessionCount = 1,
)

fun loggedStatus(value: StatusValue): TaskActual.Status = TaskActual.Status(status = value)

fun Plan.taskKeys(): List<String> = allTasks.map { it.key.value }
