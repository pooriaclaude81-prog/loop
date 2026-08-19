package dev.loop.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent
import dev.loop.MainActivity
import dev.loop.R
import dev.loop.core.data.repository.DayRepository
import dev.loop.core.data.timer.TimerController
import kotlinx.coroutines.runBlocking

/**
 * Home-screen widget showing the next block and a start button.
 *
 * **No score.** SPEC.md §5.1 hides the day score until the review gate, and a widget is
 * the one surface that would put it in front of the user all day long.
 */
class NextBlockWidget : AppWidgetProvider() {

    @EntryPoint
    @InstallIn(SingletonComponent::class)
    interface WidgetEntryPoint {
        fun dayRepository(): DayRepository
        fun timerController(): TimerController
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        appWidgetIds.forEach { id -> render(context, appWidgetManager, id) }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                android.content.ComponentName(context, NextBlockWidget::class.java),
            )
            onUpdate(context, manager, ids)
        }
    }

    private fun render(context: Context, manager: AppWidgetManager, widgetId: Int) {
        val entryPoint = EntryPointAccessors.fromApplication(
            context.applicationContext,
            WidgetEntryPoint::class.java,
        )

        val views = RemoteViews(context.packageName, R.layout.widget_next_block)

        val (title, subtitle) = runCatching {
            runBlocking {
                val timer = entryPoint.timerController().state.value
                if (timer.isActive) {
                    (timer.taskLabel ?: "Running") to "timer running"
                } else {
                    val day = entryPoint.dayRepository().day(
                        entryPoint.dayRepository().day(java.time.LocalDate.now()).date,
                    )
                    val next = day.allTasks.firstOrNull { !it.isComplete }
                    if (next == null) {
                        "Nothing left" to "all blocks done"
                    } else {
                        next.label to (next.targetMin?.let { "$it min" } ?: next.mode.wire)
                    }
                }
            }
        }.getOrDefault("Loop" to "tap to open")

        views.setTextViewText(R.id.widget_title, title)
        views.setTextViewText(R.id.widget_subtitle, subtitle)

        val open = PendingIntent.getActivity(
            context,
            widgetId,
            Intent(context, MainActivity::class.java)
                .setAction(MainActivity.ACTION_OPEN_ROUTE)
                .putExtra(MainActivity.EXTRA_ROUTE, MainActivity.ROUTE_TODAY),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        views.setOnClickPendingIntent(R.id.widget_root, open)

        manager.updateAppWidget(widgetId, views)
    }

    companion object {
        const val ACTION_REFRESH = "dev.loop.widget.REFRESH"

        fun refresh(context: Context) {
            context.sendBroadcast(
                Intent(context, NextBlockWidget::class.java).setAction(ACTION_REFRESH),
            )
        }
    }
}
