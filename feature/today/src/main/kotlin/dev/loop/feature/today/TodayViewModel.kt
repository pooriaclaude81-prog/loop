package dev.loop.feature.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.loop.core.contract.domain.LiftSet
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.scoring.Scoring
import dev.loop.core.data.db.HealthDailyEntity
import dev.loop.core.data.db.PlanSource
import dev.loop.core.data.repository.DayRepository
import dev.loop.core.data.repository.DayTask
import dev.loop.core.data.repository.DayView
import dev.loop.core.data.repository.HealthRepository
import dev.loop.core.data.repository.ImportResult
import dev.loop.core.data.repository.PlanRepository
import dev.loop.core.data.repository.SessionRepository
import dev.loop.core.data.repository.TaskStateRepository
import dev.loop.core.data.settings.LoopSettings
import dev.loop.core.data.timer.TimerController
import dev.loop.core.data.timer.TimerLauncher
import dev.loop.core.data.timer.TimerState
import dev.loop.core.data.util.Clocks
import java.time.LocalDate
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * State for the Today screen.
 *
 * There is deliberately **no day score here**. SPEC.md §5.1 and the brief both require it
 * to stay hidden until the review gate; [DayRepository] serves it from a separate method
 * so this screen cannot render it even by accident.
 */
data class TodayUiState(
    val day: DayView? = null,
    val timer: TimerState = TimerState.Idle,
    val health: HealthDailyEntity? = null,
    val sleepTargetMin: Int = 450,
    val message: String? = null,
    val loading: Boolean = true,
)

@HiltViewModel
class TodayViewModel @Inject constructor(
    private val days: DayRepository,
    private val plans: PlanRepository,
    private val sessions: SessionRepository,
    private val taskStates: TaskStateRepository,
    private val health: HealthRepository,
    private val timer: TimerController,
    private val launcher: TimerLauncher,
    private val settings: LoopSettings,
    private val clocks: Clocks,
) : ViewModel() {

    private val message = MutableStateFlow<String?>(null)

    val state: StateFlow<TodayUiState> = combine(
        days.observeToday(),
        timer.state,
        health.observe(clocks.logicalToday()),
        settings.settings,
        message,
    ) { day, timerState, healthRow, config, msg ->
        TodayUiState(
            day = day,
            timer = timerState,
            health = healthRow,
            sleepTargetMin = config.sleepTargetMin,
            message = msg,
            loading = false,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), TodayUiState())

    val today: LocalDate get() = clocks.logicalToday()

    /** Starting a second timer auto-pauses the first (SPEC.md §5.2). */
    fun toggleTimer(task: DayTask) {
        viewModelScope.launch {
            val current = timer.state.value
            if (current.taskKey == task.key && current.isRunning) {
                timer.pause()
                launcher.stopService()
            } else {
                timer.start(task.key, task.label, task.sectionColor)
                launcher.ensureRunning()
            }
        }
    }

    fun stopTimer() {
        viewModelScope.launch {
            timer.stop()
            launcher.stopService()
        }
    }

    /** Retroactive entry, flagged `manual` so the report stays honest (SPEC.md §5.2). */
    fun logManualMinutes(task: DayTask, minutes: Int) {
        if (minutes <= 0) return
        viewModelScope.launch {
            val end = clocks.wallClockMillis()
            sessions.logManual(task.key, end - minutes * 60_000L, end, note = "manual entry")
            message.value = "Logged $minutes min to ${task.label}"
        }
    }

    fun setStatus(task: DayTask, status: StatusValue, nextAction: String?) {
        viewModelScope.launch {
            val actual = TaskActual.Status(status = status, nextAction = nextAction)
            persist(task, actual)
        }
    }

    fun setCheck(task: DayTask, done: Boolean) {
        viewModelScope.launch { persist(task, TaskActual.Check(done = done)) }
    }

    fun logRun(
        task: DayTask,
        distanceKm: Double?,
        durationMin: Double?,
        runType: String?,
        rpe: Int?,
        detected: Boolean,
    ) {
        viewModelScope.launch {
            persist(
                task,
                TaskActual.Run(
                    distanceKm = distanceKm,
                    durationMin = durationMin,
                    runType = runType,
                    rpe = rpe,
                    source = if (detected) {
                        dev.loop.core.contract.domain.DataSource.HEALTH_CONNECT
                    } else {
                        dev.loop.core.contract.domain.DataSource.MANUAL
                    },
                ),
            )
        }
    }

    fun logLift(
        task: DayTask,
        sets: List<LiftSet>,
        durationMin: Double?,
        groups: List<String>,
        rpe: Int?,
    ) {
        viewModelScope.launch {
            persist(task, TaskActual.Lift(sets = sets, durationMin = durationMin, groups = groups, rpe = rpe))
        }
    }

    private suspend fun persist(task: DayTask, actual: TaskActual) {
        val breakdown = Scoring.taskScore(task.task, actual)
        taskStates.put(
            taskKey = task.key,
            sectionKey = task.sectionKey,
            date = clocks.logicalToday(),
            status = statusFor(actual, breakdown.score),
            actual = actual,
            score = breakdown.score,
            overflowMin = breakdown.overflowMin,
            planId = days.day(clocks.logicalToday()).plan?.planId?.value,
        )
    }

    private fun statusFor(actual: TaskActual, score: Double?): StatusValue = when (actual) {
        is TaskActual.Status -> actual.status
        is TaskActual.Check -> if (actual.done) StatusValue.DONE else StatusValue.NOT_STARTED
        else -> when {
            (score ?: 0.0) >= 0.999 -> StatusValue.DONE
            (score ?: 0.0) > 0.0 -> StatusValue.IN_PROGRESS
            else -> StatusValue.NOT_STARTED
        }
    }

    /** SPEC.md §1.3: two-tap manual sleep, so the coach is never blind. */
    fun logSleep(bedtimeMillis: Long, wakeMillis: Long) {
        viewModelScope.launch {
            val asleep = ((wakeMillis - bedtimeMillis) / 60_000L).toInt().coerceAtLeast(0)
            val target = settings.settings.first().sleepTargetMin
            val midpoint = java.time.Instant.ofEpochMilli((bedtimeMillis + wakeMillis) / 2)
                .atZone(clocks.zone()).toLocalTime()
            health.upsert(
                HealthDailyEntity(
                    date = clocks.logicalToday(),
                    sleepStart = bedtimeMillis,
                    sleepEnd = wakeMillis,
                    asleepMin = asleep,
                    inBedMin = asleep,
                    deepMin = null,
                    remMin = null,
                    efficiency = null,
                    midpoint = midpoint.toString(),
                    midpointDeviationMin = null,
                    sleepDebtMin = null,
                    restingHeartRate = null,
                    rhrDelta = null,
                    steps = null,
                    wakeToStartMin = null,
                    hygiene = Scoring.hygieneScore(asleep, target, null, null),
                    source = dev.loop.core.contract.domain.DataSource.MANUAL.wire,
                    syncedAt = clocks.now(),
                ),
            )
            message.value = "Sleep saved"
        }
    }

    fun importFromClipboard(text: String) {
        viewModelScope.launch {
            message.value = when (val result = plans.import(text, PlanSource.CLIPBOARD)) {
                is ImportResult.Imported -> "Plan imported — ${result.plan.allTasks.size} tasks"
                is ImportResult.Revised -> "Plan revised"
                is ImportResult.Skipped -> result.message
                is ImportResult.Failed -> "Couldn't read that plan: ${result.issues.size} problems"
            }
        }
    }

    fun repeatYesterday() {
        viewModelScope.launch {
            message.value = plans.repeatPreviousSkeleton()
                ?.let { "Repeated — ${it.allTasks.size} tasks" }
                ?: "No previous day to repeat"
        }
    }

    fun clearMessage() {
        message.value = null
    }
}
