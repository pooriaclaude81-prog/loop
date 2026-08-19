package dev.loop.notify

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.loop.MainActivity
import dev.loop.R
import dev.loop.core.contract.domain.ReportStatus
import dev.loop.core.data.repository.DayRepository
import dev.loop.core.data.repository.PlanRepository
import dev.loop.core.data.repository.ReportRepository
import dev.loop.core.data.repository.TaskStateRepository
import dev.loop.core.data.settings.LoopSettings
import dev.loop.core.data.util.Clocks
import dev.loop.system.Scheduler
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.first

/**
 * Every notification Loop raises (SPEC.md §5.3).
 *
 * **No notification ever carries the day score.** §5.1 hides it until the review gate, and
 * a notification is precisely the surface where it would leak. The review-gate alert says
 * how many tasks are done, never how well.
 */
@Singleton
class Notifier @Inject constructor(
    @ApplicationContext private val context: Context,
    private val days: DayRepository,
    private val plans: PlanRepository,
    private val reports: ReportRepository,
    private val taskStates: TaskStateRepository,
    private val settings: LoopSettings,
    private val clocks: Clocks,
) {

    suspend fun reportGate() {
        val view = days.observeToday().first()
        if (!view.hasPlan) return

        // "Review today — 4 of 6 done." Counts, never a score.
        post(
            channel = NotificationChannels.REPORT_GATE,
            id = NotificationChannels.Ids.REPORT_GATE,
            title = "Review today",
            body = "${view.completedCount} of ${view.totalCount} done",
            route = MainActivity.ROUTE_REVIEW,
            ongoing = false,
        )
    }

    /** SPEC.md §5.3: 07:00, only if nothing arrived, with a one-tap skeleton fallback. */
    suspend fun planMissingIfNeeded() {
        val today = clocks.logicalToday()
        if (plans.activePlan(today) != null) return

        val repeat = PendingIntent.getActivity(
            context,
            REQUEST_REPEAT,
            Intent(context, MainActivity::class.java)
                .setAction(MainActivity.ACTION_REPEAT_SKELETON)
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        post(
            channel = NotificationChannels.PLAN_MISSING,
            id = NotificationChannels.Ids.PLAN_MISSING,
            title = "No plan for today",
            body = "Nothing arrived overnight.",
            route = MainActivity.ROUTE_TODAY,
            ongoing = false,
        ) { builder ->
            builder.addAction(0, "Repeat yesterday", repeat)
        }
    }

    /** SPEC.md §5.3: 18:00 nudge for `status` tasks nothing has happened to. */
    suspend fun staleTasks() {
        val today = clocks.logicalToday()
        val view = days.day(today)
        val stale = view.allTasks.filter { task ->
            task.task.target is dev.loop.core.contract.domain.TaskTarget.Status &&
                (taskStates.daysSinceProgress(task.key, today) ?: 0) >= 3
        }
        if (stale.isEmpty()) return

        post(
            channel = NotificationChannels.STALE_TASK,
            id = NotificationChannels.Ids.STALE,
            title = if (stale.size == 1) stale.single().label else "${stale.size} tasks untouched",
            body = stale.joinToString(", ") { it.label },
            route = MainActivity.ROUTE_TODAY,
            ongoing = false,
        )
    }

    /**
     * SPEC.md §2.4: still unsent at 02:00 → mark `unsent`, carry into tomorrow.
     * Never sends anything.
     */
    suspend fun sweepUnsent() {
        val yesterday = clocks.logicalToday().minusDays(1)
        val report = reports.forDate(yesterday) ?: return
        if (report.status == ReportStatus.SENT) return
        reports.save(report, ReportStatus.UNSENT)
    }

    /** The idle challenge went unanswered for ten minutes (SPEC.md §5.2). */
    fun idleChallengeTimeout() {
        NotificationManagerCompat.from(context).cancel(NotificationChannels.Ids.IDLE_CHALLENGE)
    }

    fun idleChallenge(taskLabel: String) {
        post(
            channel = NotificationChannels.IDLE_CHALLENGE,
            id = NotificationChannels.Ids.IDLE_CHALLENGE,
            title = "Still on $taskLabel?",
            body = "No movement for 45 minutes. Tap to confirm, or it will pause itself.",
            route = MainActivity.ROUTE_TODAY,
            ongoing = false,
        )
    }

    fun syncProblem(title: String, detail: String) {
        post(
            channel = NotificationChannels.SYNC,
            id = NotificationChannels.Ids.SYNC,
            title = title,
            // The real server error, per SPEC.md §2.2 — never a generic "sync failed".
            body = detail.take(240),
            route = MainActivity.ROUTE_SETTINGS,
            ongoing = false,
        )
    }

    fun planImported(taskCount: Int, revised: Boolean) {
        post(
            channel = NotificationChannels.SYNC,
            id = NotificationChannels.Ids.SYNC,
            title = if (revised) "Plan revised" else "Tomorrow's plan arrived",
            body = "$taskCount tasks",
            route = MainActivity.ROUTE_TODAY,
            ongoing = false,
        )
    }

    suspend fun rearm(scheduler: Scheduler) {
        val current = settings.settings.first()
        scheduler.scheduleAll(current.reportGate)
    }

    private fun post(
        channel: String,
        id: Int,
        title: String,
        body: String,
        route: String,
        ongoing: Boolean,
        customize: (NotificationCompat.Builder) -> Unit = {},
    ) {
        if (!canPost()) return

        val open = PendingIntent.getActivity(
            context,
            route.hashCode(),
            Intent(context, MainActivity::class.java)
                .setAction(MainActivity.ACTION_OPEN_ROUTE)
                .putExtra(MainActivity.EXTRA_ROUTE, route)
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        val builder = NotificationCompat.Builder(context, channel)
            .setSmallIcon(R.drawable.ic_timer)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(open)
            .setAutoCancel(!ongoing)
            .setOngoing(ongoing)
        customize(builder)

        NotificationManagerCompat.from(context).notify(id, builder.build())
    }

    private fun canPost(): Boolean =
        android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS,
            ) == PackageManager.PERMISSION_GRANTED

    private companion object {
        const val REQUEST_REPEAT = 9001
    }
}
