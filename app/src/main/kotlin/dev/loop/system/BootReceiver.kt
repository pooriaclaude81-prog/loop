package dev.loop.system

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import dagger.hilt.android.AndroidEntryPoint
import dev.loop.core.data.settings.LoopSettings
import dev.loop.core.data.timer.TimerController
import dev.loop.transport.ingest.IngestScheduler
import javax.inject.Inject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Restores everything a reboot destroys: alarms, the periodic ingest job, and any timer
 * session left open by the shutdown.
 *
 * The open session is closed at its last heartbeat and flagged unverified rather than
 * resumed — see [TimerController.recoverAfterProcessDeath].
 */
@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {

    @Inject lateinit var timer: TimerController
    @Inject lateinit var scheduler: Scheduler
    @Inject lateinit var settings: LoopSettings
    @Inject lateinit var ingest: IngestScheduler

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    override fun onReceive(context: Context, intent: Intent) {
        val pending = goAsync()
        scope.launch {
            try {
                timer.recoverAfterProcessDeath()
                val current = settings.settings.first()
                scheduler.scheduleAll(current.reportGate)
                ingest.ensurePeriodic()
                ingest.runOnce()
            } finally {
                pending.finish()
            }
        }
    }
}
