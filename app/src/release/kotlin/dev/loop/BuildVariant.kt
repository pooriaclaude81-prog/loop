package dev.loop

import android.content.Context

/** Release builds ship no sample data. */
object BuildVariant {
    fun samplePlanJson(context: Context): String? = null
}
