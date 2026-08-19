package dev.loop.system

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import dagger.hilt.android.AndroidEntryPoint
import dev.loop.notify.Notifier
import javax.inject.Inject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/** Fires the fixed daily moments of SPEC.md §5.3 and re-arms the next day's alarm. */
@AndroidEntryPoint
class AlarmReceiver : BroadcastReceiver() {

    @Inject lateinit var notifier: Notifier
    @Inject lateinit var scheduler: Scheduler

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val pending = goAsync()
        scope.launch {
            try {
                when (action) {
                    ACTION_REPORT_GATE -> notifier.reportGate()
                    ACTION_PLAN_MISSING -> notifier.planMissingIfNeeded()
                    ACTION_STALE_TASKS -> notifier.staleTasks()
                    ACTION_UNSENT_SWEEP -> notifier.sweepUnsent()
                    ACTION_IDLE_CHALLENGE -> notifier.idleChallengeTimeout()
                }
                notifier.rearm(scheduler)
            } finally {
                pending.finish()
            }
        }
    }

    companion object {
        const val ACTION_REPORT_GATE = "dev.loop.alarm.REPORT_GATE"
        const val ACTION_PLAN_MISSING = "dev.loop.alarm.PLAN_MISSING"
        const val ACTION_STALE_TASKS = "dev.loop.alarm.STALE_TASKS"
        const val ACTION_UNSENT_SWEEP = "dev.loop.alarm.UNSENT_SWEEP"
        const val ACTION_IDLE_CHALLENGE = "dev.loop.alarm.IDLE_CHALLENGE"
    }
}
