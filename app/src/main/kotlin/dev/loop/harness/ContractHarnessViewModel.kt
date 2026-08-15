package dev.loop.harness

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.merge.MergeChange
import dev.loop.core.contract.validate.Issue
import dev.loop.core.data.db.IngestFailureEntity
import dev.loop.core.data.db.PlanSource
import dev.loop.core.data.mapper.toIssues
import dev.loop.core.data.repository.ImportResult
import dev.loop.core.data.repository.PlanRepository
import dev.loop.core.data.util.Clocks
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * The M1 harness.
 *
 * There is no Today screen yet — that is M2 — but the contract and data layer are the
 * whole of M1, so the app has to make them exercisable on a real device: paste what Claude
 * actually produced and see either the parsed plan or every reason it was rejected.
 */
data class HarnessUiState(
    val plan: Plan? = null,
    val planWarnings: List<Issue> = emptyList(),
    val failures: List<IngestFailureEntity> = emptyList(),
    val lastOutcome: Outcome? = null,
    val busy: Boolean = false,
) {
    sealed interface Outcome {
        data class Imported(val taskCount: Int, val warnings: List<Issue>) : Outcome
        data class Revised(val changes: List<MergeChange>, val warnings: List<Issue>) : Outcome
        data class Skipped(val message: String) : Outcome
        data class Failed(val issues: List<Issue>) : Outcome
    }
}

@HiltViewModel
class ContractHarnessViewModel @Inject constructor(
    private val plans: PlanRepository,
    private val clocks: Clocks,
) : ViewModel() {

    private val outcome = MutableStateFlow<HarnessUiState.Outcome?>(null)
    private val busy = MutableStateFlow(false)

    val state: StateFlow<HarnessUiState> = combine(
        plans.observeToday(),
        plans.observePlanIssues(clocks.logicalToday()),
        plans.observeIngestFailures(),
        outcome,
        busy,
    ) { plan, issues, failures, lastOutcome, isBusy ->
        HarnessUiState(
            plan = plan,
            planWarnings = issues,
            failures = failures,
            lastOutcome = lastOutcome,
            busy = isBusy,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HarnessUiState())

    val today: String get() = clocks.logicalToday().toString()

    fun import(rawJson: String, source: PlanSource) {
        if (rawJson.isBlank()) return
        viewModelScope.launch {
            busy.value = true
            outcome.value = when (val result = plans.import(rawJson, source)) {
                is ImportResult.Imported ->
                    HarnessUiState.Outcome.Imported(result.plan.allTasks.size, result.warnings)

                is ImportResult.Revised ->
                    HarnessUiState.Outcome.Revised(result.changes, result.warnings)

                is ImportResult.Skipped -> HarnessUiState.Outcome.Skipped(result.message)
                is ImportResult.Failed -> HarnessUiState.Outcome.Failed(result.issues)
            }
            busy.value = false
        }
    }

    fun repeatYesterday() {
        viewModelScope.launch {
            busy.value = true
            val skeleton = plans.repeatPreviousSkeleton()
            outcome.value = if (skeleton == null) {
                HarnessUiState.Outcome.Skipped("No previous day to repeat")
            } else {
                HarnessUiState.Outcome.Imported(skeleton.allTasks.size, emptyList())
            }
            busy.value = false
        }
    }

    fun dismissFailure(id: Long) {
        viewModelScope.launch { plans.dismissFailure(id) }
    }

    fun issuesOf(failure: IngestFailureEntity): List<Issue> =
        runCatching { failure.issuesJson.toIssues() }.getOrDefault(emptyList())
}
