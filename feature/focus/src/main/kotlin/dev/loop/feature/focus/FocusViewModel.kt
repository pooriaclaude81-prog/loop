package dev.loop.feature.focus

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.loop.core.data.timer.TimerController
import dev.loop.core.data.timer.TimerLauncher
import javax.inject.Inject
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class FocusUiState(
    val elapsedText: String = "00:00",
    val taskLabel: String? = null,
    val sectionColor: String? = null,
    val isRunning: Boolean = false,
    val keepScreenOn: Boolean = true,
)

@HiltViewModel
class FocusViewModel @Inject constructor(
    private val timer: TimerController,
    private val launcher: TimerLauncher,
) : ViewModel() {

    private val keepScreenOn = MutableStateFlow(true)
    private val ticker = MutableStateFlow(0L)

    init {
        // Repaints the digits once a second. The value shown is recomputed from
        // elapsedRealtime by the controller, so a missed tick costs smoothness, not time.
        viewModelScope.launch {
            while (true) {
                timer.refresh()
                ticker.value = ticker.value + 1
                delay(1_000)
            }
        }
    }

    val state: StateFlow<FocusUiState> = combine(
        timer.state,
        keepScreenOn,
        ticker,
    ) { timerState, keepOn, _ ->
        FocusUiState(
            elapsedText = format(timerState.elapsedMs),
            taskLabel = timerState.taskLabel,
            sectionColor = timerState.sectionColor,
            isRunning = timerState.isRunning,
            keepScreenOn = keepOn,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(1_000), FocusUiState())

    fun togglePause() {
        viewModelScope.launch {
            if (timer.state.value.isRunning) {
                timer.pause()
                launcher.stopService()
            }
        }
    }

    fun setKeepScreenOn(value: Boolean) {
        keepScreenOn.value = value
    }

    private fun format(ms: Long): String {
        val totalSeconds = ms / 1000
        val h = totalSeconds / 3600
        val m = (totalSeconds % 3600) / 60
        val s = totalSeconds % 60
        return if (h > 0) "%d:%02d:%02d".format(h, m, s) else "%02d:%02d".format(m, s)
    }
}
