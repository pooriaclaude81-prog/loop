package dev.loop.transport.ingest

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.loop.core.data.db.PlanSource
import dev.loop.core.data.repository.AppStateRepository
import dev.loop.core.data.repository.ImportResult
import dev.loop.core.data.repository.PlanRepository
import dev.loop.core.data.settings.LoopSettings
import dev.loop.transport.credentials.CredentialStore
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.first

/**
 * Periodic drafts poll (SPEC.md §2.2): every 30 minutes on a connected network, plus
 * one-shots on boot, on network regained, and on app open.
 */
@HiltWorker
class IngestWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val credentials: CredentialStore,
    private val imap: ImapClient,
    private val plans: PlanRepository,
    private val appState: AppStateRepository,
    private val settings: LoopSettings,
    private val reporter: IngestReporter,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val creds = credentials.load() ?: return Result.success() // nothing configured yet
        val token = settings.settings.first().secretToken
        val sinceUid = appState.getLong(AppStateRepository.KEY_LAST_SEEN_UID) ?: 0L

        return when (val result = imap.fetchPlans(creds, token, sinceUid)) {
            is ImapResult.Failure -> {
                reporter.onFailure(result)
                // Network problems are worth retrying; a wrong password is not.
                if (result.kind == FailureKind.NETWORK) Result.retry() else Result.success()
            }

            is ImapResult.Success -> {
                result.plans.forEach { fetched ->
                    val payload = fetched.payloadJson
                    if (payload == null) {
                        reporter.onUnreadablePayload(fetched)
                    } else {
                        val outcome = plans.import(payload, PlanSource.IMAP, fetched.subject)
                        reporter.onImported(fetched, outcome)
                    }
                }
                // Committed only after every draft in the batch has been handled, so a
                // crash mid-batch re-reads rather than skipping a plan.
                appState.putLong(AppStateRepository.KEY_LAST_SEEN_UID, result.highestUid)
                appState.putLong(
                    AppStateRepository.KEY_LAST_INGEST_AT,
                    System.currentTimeMillis(),
                )
                Result.success()
            }
        }
    }
}

/** Lets `:app` surface ingest outcomes without `:transport` depending on the UI. */
interface IngestReporter {
    suspend fun onImported(fetched: FetchedPlan, result: ImportResult)
    suspend fun onUnreadablePayload(fetched: FetchedPlan)
    suspend fun onFailure(failure: ImapResult.Failure)
}

@Singleton
class IngestScheduler @Inject constructor(
    @ApplicationContext private val context: Context,
) {

    private val workManager: WorkManager get() = WorkManager.getInstance(context)

    fun ensurePeriodic() {
        val request = PeriodicWorkRequestBuilder<IngestWorker>(30, TimeUnit.MINUTES)
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build(),
            )
            .build()
        workManager.enqueueUniquePeriodicWork(
            PERIODIC_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            request,
        )
    }

    /** Fired on app open, on boot, and when the network comes back. */
    fun runOnce() {
        val request = OneTimeWorkRequestBuilder<IngestWorker>()
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build(),
            )
            .build()
        workManager.enqueueUniqueWork(ONE_SHOT_NAME, ExistingWorkPolicy.REPLACE, request)
    }

    fun cancelAll() {
        workManager.cancelUniqueWork(PERIODIC_NAME)
        workManager.cancelUniqueWork(ONE_SHOT_NAME)
    }

    private companion object {
        const val PERIODIC_NAME = "loop.ingest.periodic"
        const val ONE_SHOT_NAME = "loop.ingest.oneshot"
    }
}
