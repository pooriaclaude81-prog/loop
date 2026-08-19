package dev.loop.timer

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.getSystemService
import dagger.hilt.android.AndroidEntryPoint
import dev.loop.MainActivity
import dev.loop.R
import dev.loop.core.data.timer.TimerController
import dev.loop.core.data.timer.TimerState
import dev.loop.notify.NotificationChannels
import javax.inject.Inject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * The foreground service that keeps the timer alive (SPEC.md §5.2).
 *
 * `specialUse` is the only foreground-service type Android 14 offers that fits a
 * stopwatch — `shortService` caps at three minutes and `dataSync` would be a lie. It
 * additionally requires `PROPERTY_SPECIAL_USE_FGS_SUBTYPE` in the manifest, without which
 * `startForeground` throws on API 34+.
 *
 * The loop below repaints the notification every second and persists every ten. It does
 * **not** count: elapsed time is recomputed by [TimerController] from `elapsedRealtime`
 * deltas, so a delayed or dropped iteration costs display smoothness and nothing else.
 */
@AndroidEntryPoint
class TimerService : Service() {

    @Inject lateinit var controller: TimerController

    @Inject lateinit var idle: IdleChallenge

    @Inject lateinit var notifier: dev.loop.notify.Notifier

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var loop: Job? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        NotificationChannels.ensure(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PAUSE -> {
                scope.launch {
                    controller.pause()
                    stopSelf()
                }
                return START_NOT_STICKY
            }

            ACTION_STOP -> {
                scope.launch {
                    controller.stop()
                    stopSelf()
                }
                return START_NOT_STICKY
            }
        }

        startInForeground(controller.state.value)
        startLoop()
        // START_STICKY: if the system does kill us under pressure, come back and let
        // recovery close the session honestly rather than leaving it open forever.
        return START_STICKY
    }

    private fun startLoop() {
        if (loop?.isActive == true) return
        loop = scope.launch {
            var sincePersistMs = 0L
            var screenOffMs = 0L
            var challengedAtMs: Long? = null
            idle.startWatching()
            while (true) {
                controller.refresh()
                val state = controller.state.value
                if (!state.isActive) {
                    stopSelf()
                    return@launch
                }
                notify(state)

                delay(TICK_MS)
                sincePersistMs += TICK_MS
                if (sincePersistMs >= PERSIST_INTERVAL_MS) {
                    controller.heartbeat()
                    sincePersistMs = 0L
                }

                // SPEC.md §5.2's idle challenge.
                screenOffMs = if (idle.screenIsOn) 0L else screenOffMs + TICK_MS
                val challenged = challengedAtMs
                when {
                    challenged == null &&
                        idle.shouldChallenge(state.elapsedMs, screenOffMs >= idle.idleThresholdMs) -> {
                        notifier.idleChallenge(state.taskLabel ?: "this task")
                        challengedAtMs = state.elapsedMs
                    }

                    // Screen came back on: that is the answer.
                    challenged != null && idle.screenIsOn -> {
                        notifier.idleChallengeTimeout()
                        challengedAtMs = null
                        screenOffMs = 0L
                    }

                    // Ten minutes with no answer: pause and mark the tail unverified.
                    challenged != null &&
                        state.elapsedMs - challenged >= IdleChallenge.ANSWER_WINDOW_MS -> {
                        notifier.idleChallengeTimeout()
                        controller.autoPauseUnverified()
                        stopSelf()
                        return@launch
                    }
                }
            }
        }
    }

    private fun startInForeground(state: TimerState) {
        val notification = build(state)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NotificationChannels.Ids.TIMER,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
            )
        } else {
            startForeground(NotificationChannels.Ids.TIMER, notification)
        }
    }

    private fun notify(state: TimerState) {
        val manager = NotificationManagerCompat.from(this)
        if (androidx.core.content.ContextCompat.checkSelfPermission(
                this,
                android.Manifest.permission.POST_NOTIFICATIONS,
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED ||
            Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
        ) {
            manager.notify(NotificationChannels.Ids.TIMER, build(state))
        }
    }

    private fun build(state: TimerState): Notification {
        val open = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        return NotificationCompat.Builder(this, NotificationChannels.TIMER)
            .setSmallIcon(R.drawable.ic_timer)
            .setContentTitle(state.taskLabel ?: "Loop")
            .setContentText(formatElapsed(state.elapsedMs))
            .setContentIntent(open)
            .setOngoing(true)
            .setSilent(true)
            .setShowWhen(false)
            .setOnlyAlertOnce(true)
            // Bridges to a paired watch as a stopwatch, which is what gives glanceable
            // elapsed time on the wrist without a Wear app (SPEC.md §5.3).
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .addAction(0, "Pause", action(ACTION_PAUSE))
            .addAction(0, "Stop", action(ACTION_STOP))
            .build()
    }

    private fun action(name: String): PendingIntent = PendingIntent.getService(
        this,
        name.hashCode(),
        Intent(this, TimerService::class.java).setAction(name),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    override fun onDestroy() {
        idle.stopWatching()
        loop?.cancel()
        scope.cancel()
        super.onDestroy()
    }

    companion object {
        const val ACTION_START = "dev.loop.timer.START"
        const val ACTION_PAUSE = "dev.loop.timer.PAUSE"
        const val ACTION_STOP = "dev.loop.timer.STOP"

        private const val TICK_MS = 1_000L

        /** SPEC.md §5.2: a crash costs at most ten seconds. */
        private const val PERSIST_INTERVAL_MS = 10_000L

        fun start(context: Context) {
            val intent = Intent(context, TimerService::class.java).setAction(ACTION_START)
            androidx.core.content.ContextCompat.startForegroundService(context, intent)
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, TimerService::class.java))
        }

        fun formatElapsed(ms: Long): String {
            val totalSeconds = ms / 1000
            val h = totalSeconds / 3600
            val m = (totalSeconds % 3600) / 60
            val s = totalSeconds % 60
            return if (h > 0) "%d:%02d:%02d".format(h, m, s) else "%02d:%02d".format(m, s)
        }
    }
}
