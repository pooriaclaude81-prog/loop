package dev.loop.core.data.repository

import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.domain.Section
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.Task
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.scoring.Scoring
import dev.loop.core.contract.validate.Issue
import dev.loop.core.data.util.Clocks
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map

/** One task as the day sees it: plan definition, what happened, and where that leaves it. */
data class DayTask(
    val task: Task,
    val sectionKey: SectionKey,
    val sectionColor: String,
    val actual: TaskActual?,
    val status: StatusValue,
    val score: Double?,
    val overflowMin: Int,
    /** Live minutes for a timed task, straight from today's sessions. */
    val focusedMin: Int,
    val targetMin: Int?,
) {
    val mode: TaskMode get() = task.mode
    val key: TaskKey get() = task.key
    val label: String get() = task.label

    /** Per-task progress, which SPEC.md §5.1 makes visible all day. */
    val progress: Double
        get() = when (val t = task.target) {
            is TaskTarget.Timed -> if (t.targetMin <= 0) 0.0 else
                (focusedMin.toDouble() / t.targetMin).coerceIn(0.0, 1.0)
            else -> score ?: 0.0
        }

    val isComplete: Boolean get() = (score ?: 0.0) >= 0.999
}

data class DaySection(
    val section: Section,
    val tasks: List<DayTask>,
    /** Per-section progress is visible all day; only the composite day score is withheld. */
    val score: Double?,
)

data class DayView(
    val date: LocalDate,
    val plan: Plan?,
    val sections: List<DaySection>,
    val warnings: List<Issue>,
) {
    val allTasks: List<DayTask> get() = sections.flatMap { it.tasks }
    val hasPlan: Boolean get() = plan != null
    val completedCount: Int get() = allTasks.count { it.isComplete }
    val totalCount: Int get() = allTasks.size
}

/**
 * Assembles the day: plan + logged sessions + task state, scored.
 *
 * The composite day score is deliberately **not** on [DayView]. SPEC.md §5.1 and the brief
 * both require it to stay hidden until the review gate, and the surest way to keep it out
 * of the Today header, a widget or a notification is to make it unreachable from the type
 * those surfaces consume. It is served separately by [observeDayScore], which only Review
 * and History call.
 */
@Singleton
class DayRepository @Inject constructor(
    private val plans: PlanRepository,
    private val taskStates: TaskStateRepository,
    private val sessions: SessionRepository,
    private val clocks: Clocks,
) {

    fun observeDay(date: LocalDate): Flow<DayView> = combine(
        plans.observeActivePlan(date),
        taskStates.observeForDate(date),
        sessions.observeTotalsForDate(date),
        plans.observePlanIssues(date),
    ) { plan, states, totals, issues ->
        buildView(date, plan, states, totals, issues)
    }

    fun observeToday(): Flow<DayView> = observeDay(clocks.logicalToday())

    suspend fun day(date: LocalDate): DayView = buildView(
        date = date,
        plan = plans.activePlan(date),
        states = taskStates.forDate(date),
        totals = sessions.totalsFor(date),
        issues = emptyList(),
    )

    /**
     * The composite day score of SPEC.md §6.
     *
     * Computed continuously, rendered only on Review and History. Do not call this from
     * Today, a notification, or the widget.
     */
    fun observeDayScore(date: LocalDate): Flow<Double?> =
        observeDay(date).map { view -> dayScoreOf(view) }

    suspend fun dayScore(date: LocalDate): Double? = dayScoreOf(day(date))

    fun dayScoreOf(view: DayView): Double? {
        val plan = view.plan ?: return null
        val sectionScores = view.sections.associate { it.section.key to it.score }
        return Scoring.dayScore(plan, sectionScores)
    }

    private fun buildView(
        date: LocalDate,
        plan: Plan?,
        states: Map<TaskKey, TaskDayState>,
        totals: Map<TaskKey, TimedTotals>,
        issues: List<Issue>,
    ): DayView {
        if (plan == null) return DayView(date, null, emptyList(), issues)

        val sections = plan.sections.map { section ->
            val dayTasks = section.tasks.map { task ->
                buildTask(task, section, states[task.key], totals[task.key])
            }
            DaySection(
                section = section,
                tasks = dayTasks,
                score = Scoring.sectionScore(section, dayTasks.associate { it.key to it.score }),
            )
        }
        return DayView(date, plan, sections, issues)
    }

    private fun buildTask(
        task: Task,
        section: Section,
        state: TaskDayState?,
        totals: TimedTotals?,
    ): DayTask {
        // For timed tasks the sessions table is the truth — it updates every 10 s while the
        // timer runs, whereas task_state is only rewritten at checkpoints.
        val actual: TaskActual? = when (task.target) {
            is TaskTarget.Timed -> totals?.toActual(
                overflowMin = overflowFor(task, totals),
                quality = (state?.actual as? TaskActual.Timed)?.quality,
            )
            else -> state?.actual
        }

        val breakdown = Scoring.taskScore(task, actual)
        val focused = totals?.focusedMin ?: 0

        return DayTask(
            task = task,
            sectionKey = section.key,
            sectionColor = section.color,
            actual = actual,
            status = state?.status ?: inferStatus(task, actual),
            score = breakdown.score,
            overflowMin = breakdown.overflowMin,
            focusedMin = focused,
            targetMin = (task.target as? TaskTarget.Timed)?.targetMin,
        )
    }

    private fun overflowFor(task: Task, totals: TimedTotals): Int {
        val target = (task.target as? TaskTarget.Timed)?.targetMin ?: return 0
        return (totals.focusedMin - target).coerceAtLeast(0)
    }

    private fun inferStatus(task: Task, actual: TaskActual?): StatusValue = when {
        actual == null -> StatusValue.NOT_STARTED
        actual is TaskActual.Status -> actual.status
        actual is TaskActual.Check -> if (actual.done) StatusValue.DONE else StatusValue.NOT_STARTED
        Scoring.taskScore(task, actual).score?.let { it >= 0.999 } == true -> StatusValue.DONE
        else -> StatusValue.IN_PROGRESS
    }
}
