package dev.loop.core.data.report

import dev.loop.core.contract.domain.CarriedDay
import dev.loop.core.contract.domain.DataQuality
import dev.loop.core.contract.domain.DataSource
import dev.loop.core.contract.domain.HealthBlock
import dev.loop.core.contract.domain.Report
import dev.loop.core.contract.domain.ReportSection
import dev.loop.core.contract.domain.ReportStatus
import dev.loop.core.contract.domain.ReportTask
import dev.loop.core.contract.domain.RollingState
import dev.loop.core.contract.domain.StaleTask
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.scoring.Scoring
import dev.loop.core.data.repository.DayRepository
import dev.loop.core.data.repository.HealthRepository
import dev.loop.core.data.repository.ReportRepository
import dev.loop.core.data.repository.TaskDayState
import dev.loop.core.data.repository.TaskStateRepository
import dev.loop.core.data.settings.LoopSettings
import dev.loop.core.data.util.Clocks
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.roundToInt
import kotlinx.coroutines.flow.first

/**
 * Builds the report payload of SPEC.md §3.2, including the rolling `state` block that
 * makes Claude stateless between runs.
 *
 * Composition is automatic; sending is not. Nothing in this class transmits anything.
 */
@Singleton
class ReportComposer @Inject constructor(
    private val days: DayRepository,
    private val health: HealthRepository,
    private val taskStates: TaskStateRepository,
    private val reports: ReportRepository,
    private val settings: LoopSettings,
    private val clocks: Clocks,
) {

    suspend fun compose(
        date: LocalDate = clocks.logicalToday(),
        userNote: String? = null,
        appVersion: String = "1.0",
    ): Report {
        val view = days.day(date)
        val current = settings.settings.first()

        return Report(
            date = date,
            planId = view.plan?.planId,
            planRev = view.plan?.rev,
            tz = clocks.zone(),
            appVersion = appVersion,
            generatedAt = clocks.now(),
            status = ReportStatus.COMPOSED,
            dayScore = days.dayScoreOf(view),
            sectionScores = view.sections.associate { it.section.key.value to it.score },
            sections = view.sections.map { section ->
                ReportSection(
                    key = section.section.key,
                    label = section.section.label,
                    weight = section.section.weight,
                    score = section.score,
                    tasks = section.tasks.map { task ->
                        ReportTask(
                            key = task.key,
                            label = task.label,
                            mode = task.mode,
                            target = task.task.target,
                            actual = task.actual,
                            score = task.score,
                            overflowMin = task.overflowMin.takeIf { it > 0 },
                            priority = task.task.priority,
                            removedInRev = task.task.removedInRev,
                        )
                    },
                )
            },
            health = healthBlock(date, current.sleepTargetMin),
            state = rollingState(date),
            userNote = userNote,
            planFeedback = view.warnings,
            carried = carriedDays(date),
        )
    }

    private suspend fun healthBlock(date: LocalDate, sleepTarget: Int): HealthBlock? {
        val row = health.forDate(date) ?: return null
        return HealthBlock(
            asleepMin = row.asleepMin,
            inBedMin = row.inBedMin,
            bedtime = row.sleepStart?.let(::toLocalTime),
            wakeTime = row.sleepEnd?.let(::toLocalTime),
            efficiency = row.efficiency,
            deepMin = row.deepMin,
            remMin = row.remMin,
            midpoint = row.midpoint?.let { runCatching { LocalTime.parse(it) }.getOrNull() },
            midpointDeviationMin = row.midpointDeviationMin,
            sleepDebtMin = row.sleepDebtMin,
            restingHeartRate = row.restingHeartRate,
            rhrDelta = row.rhrDelta,
            steps = row.steps,
            wakeToStartMin = row.wakeToStartMin,
            hygiene = row.hygiene ?: Scoring.hygieneScore(
                asleepMin = row.asleepMin,
                targetMin = sleepTarget,
                midpointDeviationMin = row.midpointDeviationMin,
                efficiency = row.efficiency,
            ),
            source = row.source?.let { DataSource.fromWire(it) },
        )
    }

    private fun toLocalTime(epochMillis: Long): LocalTime =
        Instant.ofEpochMilli(epochMillis).atZone(clocks.zone()).toLocalTime()

    /**
     * The `state` block of SPEC.md §3.2.
     *
     * Windows are truncated to the history that actually exists, and `days_observed`
     * travels alongside: §7 step 2 tells Claude to react to the 7–14 day trend, and on
     * day three, three days is not a trend.
     */
    suspend fun rollingState(date: LocalDate): RollingState {
        val recentReports = reports.observeRecent(30).first()
            .filter { !it.date.isAfter(date) }
            .sortedBy { it.date }

        val scores14 = recentReports
            .filter { !it.date.isBefore(date.minusDays(13)) }
            .mapNotNull { it.dayScore }

        val states7 = taskStates.since(date.minusDays(6)).filter { !it.date.isAfter(date) }
        val adherence = states7.groupBy { it.sectionKey.value }
            .mapValues { (_, rows) ->
                rows.mapNotNull { it.score }.takeIf { it.isNotEmpty() }?.average() ?: 0.0
            }

        val streaks = computeStreaks(
            taskStates.since(date.minusDays(60)).groupBy { it.sectionKey.value },
            date,
        )

        val sleepAvg = health.since(date.minusDays(6))
            .filter { !it.date.isAfter(date) }
            .mapNotNull { it.asleepMin }
            .takeIf { it.isNotEmpty() }
            ?.average()
            ?.roundToInt()

        val today = taskStates.forDate(date)

        return RollingState(
            daysObserved = recentReports.size,
            scores14d = scores14,
            sectionAdherence7d = adherence,
            streaks = streaks,
            staleTasks = staleStatusTasks(date),
            calibration = calibration(date),
            sleep7dAvgMin = sleepAvg,
            dataQuality = DataQuality(
                manualEntries = today.values.count { it.actual?.source == DataSource.MANUAL },
                timerGaps = today.values.count {
                    ((it.actual as? TaskActual.Timed)?.sessionCount ?: 0) > 3
                },
                unverifiedTails = today.values.count {
                    (it.actual as? TaskActual.Timed)?.hasUnverifiedTail == true
                },
                healthSourceMissing = health.forDate(date) == null,
            ),
        )
    }

    /** Consecutive days back from [date] on which a section produced any score at all. */
    private fun computeStreaks(
        bySection: Map<String, List<TaskDayState>>,
        date: LocalDate,
    ): Map<String, Int> = bySection.mapValues { (_, rows) ->
        val productive = rows.filter { (it.score ?: 0.0) > 0.0 }.map { it.date }.toSet()
        var streak = 0
        var cursor = date
        while (cursor in productive) {
            streak++
            cursor = cursor.minusDays(1)
        }
        streak
    }

    private suspend fun staleStatusTasks(date: LocalDate): List<StaleTask> =
        days.day(date).allTasks
            .filter { it.task.target is TaskTarget.Status }
            .mapNotNull { task ->
                val idle = taskStates.daysSinceProgress(task.key, date) ?: return@mapNotNull null
                if (idle < 2) null else StaleTask(task.key, task.label, idle)
            }
            .sortedByDescending { it.days }

    /**
     * `calibration` = actual ÷ planned per section over seven days. Null where nothing was
     * planned — never 0.0, which §7 step 3 would read as "cut this section's targets".
     */
    private suspend fun calibration(date: LocalDate): Map<String, Double?> {
        val planned = mutableMapOf<String, Int>()
        val actual = mutableMapOf<String, Int>()

        (0L..6L).forEach { back ->
            days.day(date.minusDays(back)).allTasks.forEach { task ->
                val target = (task.task.target as? TaskTarget.Timed)?.targetMin ?: return@forEach
                val section = task.sectionKey.value
                planned[section] = (planned[section] ?: 0) + target
                actual[section] = (actual[section] ?: 0) + task.focusedMin
            }
        }

        return planned.keys.associateWith { Scoring.calibration(actual[it] ?: 0, planned[it] ?: 0) }
    }

    /** SPEC.md §2.4: a day still unsent at 02:00 rolls into the next report. */
    private suspend fun carriedDays(date: LocalDate): List<CarriedDay> =
        reports.outstandingForCarry()
            .filter { it.date.isBefore(date) }
            .map { CarriedDay(it.date, it.copy(status = ReportStatus.CARRIED)) }

    /**
     * The human-readable half of the email (SPEC.md §2.1): markdown first, payload second,
     * so the message is legible in Gmail without expanding the JSON.
     */
    fun humanSummary(report: Report): String = buildString {
        appendLine("# Loop - ${report.date}")
        appendLine()
        report.dayScore?.let { appendLine("**Day score:** ${percent(it)}") }
        appendLine()
        report.sections.forEach { section ->
            appendLine("## ${section.label} - ${section.score?.let(::percent) ?: "no tasks"}")
            section.tasks.forEach { task ->
                val score = task.score
                val mark = when {
                    score == null -> "?"
                    score >= 0.999 -> "x"
                    score > 0.0 -> "~"
                    else -> " "
                }
                append("- [$mark] ${task.label}")
                describeActual(task)?.let { append(" - $it") }
                task.overflowMin?.let { append(" (+$it min over)") }
                appendLine()
            }
            appendLine()
        }
        report.health?.let { h ->
            appendLine("## Sleep")
            h.asleepMin?.let { appendLine("- Asleep: ${it / 60}h ${it % 60}m") }
            h.bedtime?.let { appendLine("- Bedtime: $it") }
            h.wakeTime?.let { appendLine("- Wake: $it") }
            h.rhrDelta?.let { appendLine("- Resting HR delta: ${if (it >= 0) "+" else ""}$it") }
            appendLine()
        }
        report.userNote?.takeIf { it.isNotBlank() }?.let {
            appendLine("## Note")
            appendLine(it)
            appendLine()
        }
        if (report.planFeedback.isNotEmpty()) {
            appendLine("## Plan feedback")
            report.planFeedback.forEach { appendLine("- ${it.code.name} at ${it.path}: ${it.message}") }
        }
    }

    private fun describeActual(task: ReportTask): String? = when (val a = task.actual) {
        is TaskActual.Timed ->
            "${a.focusedMin} min" + ((task.target as? TaskTarget.Timed)?.let { " of ${it.targetMin}" } ?: "")

        is TaskActual.Run -> buildString {
            a.distanceKm?.let { append("%.1f km".format(it)) }
            a.durationMin?.let { append(" in %.0f min".format(it)) }
            a.paceSecPerKm?.let { append(" (%d:%02d/km)".format(it / 60, it % 60)) }
        }.trim().ifBlank { null }

        is TaskActual.Lift -> "${a.exerciseCount} exercises, ${a.volumeKg.roundToInt()} kg"
        is TaskActual.Status -> a.status.wire.replace('_', ' ')
        is TaskActual.Check -> if (a.done) "done" else null
        null -> null
    }

    private fun percent(value: Double): String = "${(value * 100).roundToInt()}%"
}
