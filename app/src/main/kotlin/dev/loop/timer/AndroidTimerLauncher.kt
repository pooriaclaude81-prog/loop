package dev.loop.timer

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.loop.core.data.timer.TimerLauncher
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AndroidTimerLauncher @Inject constructor(
    @ApplicationContext private val context: Context,
) : TimerLauncher {
    override fun ensureRunning() = TimerService.start(context)
    override fun stopService() = TimerService.stop(context)
}
