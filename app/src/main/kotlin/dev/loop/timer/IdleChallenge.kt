package dev.loop.timer

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager
import android.hardware.TriggerEvent
import android.hardware.TriggerEventListener
import android.os.PowerManager
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * SPEC.md §5.2's idle challenge: a timer running 45 minutes with the screen dark and no
 * significant-motion events is probably a timer someone forgot to stop.
 *
 * `TYPE_SIGNIFICANT_MOTION` is not present on every device — it is an optional hardware
 * sensor, and §9's risk register calls this out. The fallback is screen state alone with a
 * longer threshold, which is weaker evidence but still catches the overnight case that
 * matters most. [motionSensorAvailable] lets the UI say which mode is in force rather than
 * silently behaving differently on different phones.
 */
@Singleton
class IdleChallenge @Inject constructor(
    @ApplicationContext private val context: Context,
) {

    private val sensorManager: SensorManager? =
        context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

    private val motionSensor: Sensor? =
        sensorManager?.getDefaultSensor(Sensor.TYPE_SIGNIFICANT_MOTION)

    val motionSensorAvailable: Boolean get() = motionSensor != null

    /** Threshold before the challenge fires. Longer when there is no motion sensor. */
    val idleThresholdMs: Long
        get() = if (motionSensorAvailable) SENSOR_THRESHOLD_MS else NO_SENSOR_THRESHOLD_MS

    @Volatile
    private var motionSeen = false
    private var listener: TriggerEventListener? = null

    fun startWatching() {
        val sensor = motionSensor ?: return
        motionSeen = false
        val trigger = object : TriggerEventListener() {
            override fun onTrigger(event: TriggerEvent?) {
                motionSeen = true
                // One-shot by design; re-arm to keep watching.
                sensorManager?.requestTriggerSensor(this, sensor)
            }
        }
        listener = trigger
        sensorManager?.requestTriggerSensor(trigger, sensor)
    }

    fun stopWatching() {
        val sensor = motionSensor ?: return
        listener?.let { sensorManager?.cancelTriggerSensor(it, sensor) }
        listener = null
    }

    fun consumeMotionSeen(): Boolean {
        val seen = motionSeen
        motionSeen = false
        return seen
    }

    private val powerManager: PowerManager? = context.getSystemService(PowerManager::class.java)

    val screenIsOn: Boolean get() = powerManager?.isInteractive != false

    /**
     * True when the session looks abandoned: running long enough, screen dark throughout,
     * and — where the hardware can tell us — no significant motion.
     */
    fun shouldChallenge(runningMs: Long, screenOffThroughout: Boolean): Boolean {
        if (runningMs < idleThresholdMs) return false
        if (!screenOffThroughout) return false
        if (motionSensorAvailable && consumeMotionSeen()) return false
        return true
    }

    companion object {
        const val SENSOR_THRESHOLD_MS = 45 * 60 * 1000L

        /**
         * Without a motion sensor the only evidence is a dark screen, which is much weaker
         * — someone can read a paper book for an hour. Doubling the threshold trades a
         * slower catch for far fewer false accusations.
         */
        const val NO_SENSOR_THRESHOLD_MS = 90 * 60 * 1000L

        /** §5.2: no answer within ten minutes → auto-pause and flag the tail. */
        const val ANSWER_WINDOW_MS = 10 * 60 * 1000L
    }
}
