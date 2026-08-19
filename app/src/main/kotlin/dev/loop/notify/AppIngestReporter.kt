package dev.loop.notify

import dev.loop.core.data.repository.ImportResult
import dev.loop.transport.ingest.FetchedPlan
import dev.loop.transport.ingest.ImapResult
import dev.loop.transport.ingest.IngestReporter
import javax.inject.Inject
import javax.inject.Singleton

/** Turns ingest outcomes into the visible, actionable states SPEC.md §2.2 requires. */
@Singleton
class AppIngestReporter @Inject constructor(
    private val notifier: Notifier,
) : IngestReporter {

    override suspend fun onImported(fetched: FetchedPlan, result: ImportResult) {
        when (result) {
            is ImportResult.Imported -> notifier.planImported(result.plan.allTasks.size, revised = false)
            is ImportResult.Revised -> notifier.planImported(result.plan.allTasks.size, revised = true)
            is ImportResult.Failed -> notifier.syncProblem(
                "Plan couldn't be read",
                result.issues.firstOrNull()?.message ?: "The payload failed validation.",
            )
            is ImportResult.Skipped -> Unit
        }
    }

    override suspend fun onUnreadablePayload(fetched: FetchedPlan) {
        notifier.syncProblem(
            "Plan couldn't be read",
            "No loop block found in \"${fetched.subject}\".",
        )
    }

    override suspend fun onFailure(failure: ImapResult.Failure) {
        notifier.syncProblem("Mail sync failed", failure.message)
    }
}
