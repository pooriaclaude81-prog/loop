package dev.loop.notify

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.content.getSystemService

/**
 * SPEC.md §5.3: every alert on its own channel, so each can be silenced independently.
 *
 * The day score never appears in any of these. A notification is exactly the surface where
 * a hidden score would leak, so the rule is enforced by the content builders, not by
 * convention.
 */
object NotificationChannels {

    const val TIMER = "timer"
    const val BLOCK_START = "block_start"
    const val BLOCK_END = "block_end"
    const val IDLE_CHALLENGE = "idle_challenge"
    const val STALE_TASK = "stale_task"
    const val REPORT_GATE = "report_gate"
    const val PLAN_MISSING = "plan_missing"
    const val SYNC = "sync"

    fun ensure(context: Context) {
        val manager = context.getSystemService<NotificationManager>() ?: return
        listOf(
            channel(TIMER, "Running timer", NotificationManager.IMPORTANCE_LOW,
                "The ongoing timer. Silent by design — it is a display, not an alert."),
            channel(BLOCK_START, "Block starting", NotificationManager.IMPORTANCE_DEFAULT,
                "Five minutes before a scheduled block."),
            channel(BLOCK_END, "Block ending", NotificationManager.IMPORTANCE_LOW,
                "When a scheduled block's window closes."),
            channel(IDLE_CHALLENGE, "Idle check", NotificationManager.IMPORTANCE_HIGH,
                "Asks whether a long-running timer is still real."),
            channel(STALE_TASK, "Untouched tasks", NotificationManager.IMPORTANCE_LOW,
                "An evening nudge about tasks nothing has happened to."),
            channel(REPORT_GATE, "Daily review", NotificationManager.IMPORTANCE_HIGH,
                "The review gate. Opens the report for you to check and send."),
            channel(PLAN_MISSING, "Missing plan", NotificationManager.IMPORTANCE_HIGH,
                "Fires in the morning when no plan arrived."),
            channel(SYNC, "Sync problems", NotificationManager.IMPORTANCE_DEFAULT,
                "Mail that could not be read or sent."),
        ).forEach(manager::createNotificationChannel)
    }

    private fun channel(id: String, name: String, importance: Int, description: String) =
        NotificationChannel(id, name, importance).also {
            it.description = description
            if (importance == NotificationManager.IMPORTANCE_LOW) {
                it.setSound(null, null)
                it.enableVibration(false)
            }
        }

    object Ids {
        const val TIMER = 1001
        const val IDLE_CHALLENGE = 1002
        const val REPORT_GATE = 1003
        const val PLAN_MISSING = 1004
        const val BLOCK = 1005
        const val STALE = 1006
        const val SYNC = 1007
    }
}
