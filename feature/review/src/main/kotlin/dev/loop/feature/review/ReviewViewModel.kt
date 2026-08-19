package dev.loop.feature.review

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.loop.core.contract.domain.Report
import dev.loop.core.contract.domain.ReportStatus
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.data.report.ReportComposer
import dev.loop.core.data.repository.DayRepository
import dev.loop.core.data.repository.ReportRepository
import dev.loop.core.data.util.Clocks
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** Something the app had to guess at, which SPEC.md §2.4 requires be flagged for confirmation. */
data class Ambiguity(
    val taskLabel: String,
    val reason: String,
)

data class ReviewUiState(
    val report: Report? = null,
    val ambiguities: List<Ambiguity> = emptyList(),
    val note: String = "",
    val sending: Boolean = false,
    val sent: Boolean = false,
    val error: String? = null,
    val canSend: Boolean = false,
)

/** Sends the report. Implemented in `:app`, which owns the transport wiring. */
interface ReportSender {
    suspend fun send(report: Report, humanSummary: String): Result<Unit>
    fun shareFallback(report: Report, humanSummary: String)
    val isConfigured: Boolean
}

@HiltViewModel
class ReviewViewModel @Inject constructor(
    private val composer: ReportComposer,
    private val reports: ReportRepository,
    private val days: DayRepository,
    private val sender: ReportSender,
    private val clocks: Clocks,
) : ViewModel() {

    private val _state = MutableStateFlow(ReviewUiState())
    val state: StateFlow<ReviewUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            val date = clocks.logicalToday()
            val existing = reports.forDate(date)
            val report = composer.compose(date, userNote = existing?.userNote)
            reports.save(report, existing?.status ?: ReportStatus.COMPOSED)

            _state.value = ReviewUiState(
                report = report,
                ambiguities = findAmbiguities(report),
                note = existing?.userNote.orEmpty(),
                sent = existing?.status == ReportStatus.SENT,
                canSend = sender.isConfigured,
            )
        }
    }

    fun setNote(text: String) {
        _state.value = _state.value.copy(note = text)
    }

    /**
     * SPEC.md §2.4: nothing auto-sends. This is only ever reached from an explicit tap.
     */
    fun send() {
        val current = _state.value.report ?: return
        viewModelScope.launch {
            _state.value = _state.value.copy(sending = true, error = null)
            val report = current.copy(userNote = _state.value.note.takeIf { it.isNotBlank() })
            reports.save(report)

            val outcome = sender.send(report, composer.humanSummary(report))
            _state.value = if (outcome.isSuccess) {
                reports.markSent(report.date, transport = "smtp")
                _state.value.copy(sending = false, sent = true, report = report)
            } else {
                _state.value.copy(
                    sending = false,
                    error = outcome.exceptionOrNull()?.message ?: "Send failed",
                    report = report,
                )
            }
        }
    }

    /** SPEC.md §2.4 step 4: hand the message to a mail app when SMTP is unavailable. */
    fun sendViaMailApp() {
        val current = _state.value.report ?: return
        val report = current.copy(userNote = _state.value.note.takeIf { it.isNotBlank() })
        viewModelScope.launch { reports.save(report) }
        sender.shareFallback(report, composer.humanSummary(report))
    }

    /**
     * Anything the app inferred rather than observed. §2.4 requires these be surfaced for
     * confirmation rather than quietly folded into the numbers.
     */
    private fun findAmbiguities(report: Report): List<Ambiguity> = buildList {
        report.sections.forEach { section ->
            section.tasks.forEach { task ->
                when (val actual = task.actual) {
                    is TaskActual.Timed -> {
                        if (actual.hasUnverifiedTail) {
                            add(Ambiguity(task.label, "A timer session ended without confirmation"))
                        }
                        if (actual.source == dev.loop.core.contract.domain.DataSource.MANUAL) {
                            add(Ambiguity(task.label, "Minutes were entered by hand"))
                        }
                        if (actual.sessionCount > 4) {
                            add(
                                Ambiguity(
                                    task.label,
                                    "${actual.sessionCount} separate sittings — check the total looks right",
                                ),
                            )
                        }
                    }

                    null -> if (task.removedInRev != null) {
                        add(Ambiguity(task.label, "Removed by a mid-day revision"))
                    }

                    else -> Unit
                }
                if (task.score == null && task.actual != null) {
                    add(Ambiguity(task.label, "Logged data does not match the task's mode"))
                }
            }
        }
    }
}
