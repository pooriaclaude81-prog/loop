package dev.loop.feature.history

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.loop.core.data.repository.HealthRepository
import dev.loop.core.data.repository.ReportRepository
import dev.loop.core.data.repository.TaskStateRepository
import dev.loop.core.data.report.ReportComposer
import dev.loop.core.data.util.Clocks
import java.time.LocalDate
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

data class DayPoint(val date: LocalDate, val score: Double?)

data class SectionCell(val date: LocalDate, val score: Double?)

data class HistoryUiState(
    val dayScores: List<DayPoint> = emptyList(),
    /** 7-day rolling average — the headline, because daily scores are noisy and punishing. */
    val rollingAverage: List<DayPoint> = emptyList(),
    val heatmap: Map<String, List<SectionCell>> = emptyMap(),
    val calibration: Map<String, Double?> = emptyMap(),
    val streaks: Map<String, Int> = emptyMap(),
    val sleepMinutes: List<Pair<LocalDate, Int>> = emptyList(),
    val sleepMidpoints: List<Pair<LocalDate, Double>> = emptyList(),
    val loading: Boolean = true,
)

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val reports: ReportRepository,
    private val taskStates: TaskStateRepository,
    private val health: HealthRepository,
    private val composer: ReportComposer,
    private val clocks: Clocks,
) : ViewModel() {

    private val _state = MutableStateFlow(HistoryUiState())
    val state: StateFlow<HistoryUiState> = _state.asStateFlow()

    init {
        load()
    }

    fun load(days: Int = 28) {
        viewModelScope.launch {
            val today = clocks.logicalToday()
            val from = today.minusDays((days - 1).toLong())
            val window = (0 until days).map { from.plusDays(it.toLong()) }

            val byDate = reports.observeRecent(60).first().associateBy { it.date }
            val scores = window.map { DayPoint(it, byDate[it]?.dayScore) }

            val states = taskStates.since(from)
            val heat = states.groupBy { it.sectionKey.value }
                .mapValues { (_, rows) ->
                    val perDay = rows.groupBy { it.date }
                        .mapValues { (_, day) ->
                            day.mapNotNull { it.score }.takeIf { it.isNotEmpty() }?.average()
                        }
                    window.map { SectionCell(it, perDay[it]) }
                }

            val sleepRows = health.since(from)
            val rolling = composer.rollingState(today)

            _state.value = HistoryUiState(
                dayScores = scores,
                rollingAverage = rollingAverage(scores),
                heatmap = heat,
                calibration = rolling.calibration,
                streaks = rolling.streaks,
                sleepMinutes = sleepRows.mapNotNull { row -> row.asleepMin?.let { row.date to it } },
                sleepMidpoints = sleepRows.mapNotNull { row ->
                    row.midpoint
                        ?.let { runCatching { java.time.LocalTime.parse(it) }.getOrNull() }
                        ?.let { time ->
                            // Wrapped so a 01:40 midpoint plots next to 23:50 rather than
                            // at the opposite end of the axis.
                            val hours = time.hour + time.minute / 60.0
                            row.date to if (hours > 12) hours - 24 else hours
                        }
                },
                loading = false,
            )
        }
    }

    /** SPEC.md §6: the rolling average is the headline, daily scores are the noise. */
    private fun rollingAverage(points: List<DayPoint>, window: Int = 7): List<DayPoint> =
        points.indices.map { index ->
            val slice = points.subList(maxOf(0, index - window + 1), index + 1)
                .mapNotNull { it.score }
            DayPoint(points[index].date, slice.takeIf { it.isNotEmpty() }?.average())
        }
}
