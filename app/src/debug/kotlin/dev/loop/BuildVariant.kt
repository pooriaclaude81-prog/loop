package dev.loop

import android.content.Context
import dev.loop.core.contract.time.LogicalDay
import java.time.ZoneId

/**
 * Debug-only affordances, per the brief: the whole app must be exercisable without
 * waiting for real email or a real night's sleep.
 *
 * The sample is SPEC.md §3.1's plan verbatim apart from its date, which is rewritten to
 * the current logical day — a fixture pinned to a date in the past would import and then
 * immediately archive itself, which is correct behaviour and a useless demo.
 */
object BuildVariant {

    fun samplePlanJson(context: Context): String? = runCatching {
        val today = LogicalDay.of(java.time.Instant.now(), ZoneId.systemDefault())
        context.assets.open("sample_plan.json").bufferedReader().use { it.readText() }
            .replace("__TODAY__", today.toString())
            .replace("__COMPACT__", today.toString().replace("-", ""))
    }.getOrNull()
}
