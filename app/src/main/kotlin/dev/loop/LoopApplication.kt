package dev.loop

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

/**
 * Supplies WorkManager with Hilt's worker factory.
 *
 * Without this the ingest worker cannot be constructed — its dependencies are injected —
 * and mail sync would fail silently at runtime while everything still compiled.
 */
@HiltAndroidApp
class LoopApplication : Application(), Configuration.Provider {

    @Inject lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .setMinimumLoggingLevel(android.util.Log.INFO)
            .build()
}
