package dev.loop.core.data.settings

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import dev.loop.core.contract.time.LogicalDay
import java.time.LocalTime
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * User-facing settings.
 *
 * Several of these also appear in the plan JSON (SPEC.md §3.1 carries `report_gate` and
 * `sleep_target_min`), and the spec never says who wins. Loop's rule:
 *
 *  - **The user wins** on `report_gate` and `sleep_target_min`. A coach should not be able
 *    to move someone's evening or redefine their sleep goal from an email.
 *  - **The plan wins** on section structure and weights, because that *is* the coaching.
 *    The values here are the fallback used when no plan has arrived.
 *
 * See docs/ARCHITECTURE.md §"Plan versus settings".
 */
data class Settings(
    val reportGate: LocalTime,
    val sleepTargetMin: Int,
    val dayRolloverHour: Int,
    val emailAddress: String?,
    val secretToken: String?,
    val onboarded: Boolean,
    val healthConnectLinked: Boolean,
) {
    companion object {
        val DEFAULT = Settings(
            reportGate = LocalTime.of(21, 30),
            sleepTargetMin = 450,
            dayRolloverHour = LogicalDay.DEFAULT_ROLLOVER_HOUR,
            emailAddress = null,
            secretToken = null,
            onboarded = false,
            healthConnectLinked = false,
        )
    }
}

@Singleton
class LoopSettings @Inject constructor(
    private val store: DataStore<Preferences>,
) {

    val settings: Flow<Settings> = store.data.map { prefs ->
        Settings(
            reportGate = prefs[REPORT_GATE]?.let(LocalTime::parse) ?: Settings.DEFAULT.reportGate,
            sleepTargetMin = prefs[SLEEP_TARGET] ?: Settings.DEFAULT.sleepTargetMin,
            dayRolloverHour = prefs[ROLLOVER_HOUR] ?: Settings.DEFAULT.dayRolloverHour,
            emailAddress = prefs[EMAIL],
            secretToken = prefs[SECRET_TOKEN],
            onboarded = prefs[ONBOARDED] ?: false,
            healthConnectLinked = prefs[HEALTH_LINKED] ?: false,
        )
    }

    suspend fun setReportGate(time: LocalTime) = edit { it[REPORT_GATE] = time.toString() }

    suspend fun setSleepTarget(minutes: Int) = edit { it[SLEEP_TARGET] = minutes }

    suspend fun setRolloverHour(hour: Int) = edit { it[ROLLOVER_HOUR] = hour.coerceIn(0, 23) }

    suspend fun setEmail(address: String?) = edit { prefs ->
        if (address == null) prefs.remove(EMAIL) else prefs[EMAIL] = address
    }

    /**
     * The routing tag of SPEC.md §2.1. Never written to a log and never included in a
     * report payload — it exists only to filter drafts.
     */
    suspend fun setSecretToken(token: String?) = edit { prefs ->
        if (token == null) prefs.remove(SECRET_TOKEN) else prefs[SECRET_TOKEN] = token
    }

    suspend fun setOnboarded(value: Boolean) = edit { it[ONBOARDED] = value }

    suspend fun setHealthConnectLinked(value: Boolean) = edit { it[HEALTH_LINKED] = value }

    private suspend fun edit(block: (androidx.datastore.preferences.core.MutablePreferences) -> Unit) {
        store.edit(block)
    }

    private companion object {
        val REPORT_GATE = stringPreferencesKey("report_gate")
        val SLEEP_TARGET = intPreferencesKey("sleep_target_min")
        val ROLLOVER_HOUR = intPreferencesKey("day_rollover_hour")
        val EMAIL = stringPreferencesKey("email_address")
        val SECRET_TOKEN = stringPreferencesKey("secret_token")
        val ONBOARDED = booleanPreferencesKey("onboarded")
        val HEALTH_LINKED = booleanPreferencesKey("health_connect_linked")
    }
}
