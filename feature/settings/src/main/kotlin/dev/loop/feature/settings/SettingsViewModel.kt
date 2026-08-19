package dev.loop.feature.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.loop.core.contract.envelope.Envelope
import dev.loop.core.data.settings.LoopSettings
import dev.loop.core.data.settings.Settings
import dev.loop.health.HealthAvailability
import dev.loop.health.HealthConnectSource
import dev.loop.health.HealthSync
import dev.loop.health.SyncOutcome
import dev.loop.transport.credentials.CredentialStore
import dev.loop.transport.credentials.MailCredentials
import dev.loop.transport.egress.SendResult
import dev.loop.transport.egress.SmtpSender
import dev.loop.transport.ingest.ImapClient
import dev.loop.transport.ingest.ImapResult
import java.time.LocalTime
import javax.inject.Inject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/** Outcome of the "test connection" button, carrying the real server error. */
sealed interface ConnectionTest {
    data object Idle : ConnectionTest
    data object Running : ConnectionTest
    data class Ok(val detail: String) : ConnectionTest
    data class Failed(val imap: String?, val smtp: String?) : ConnectionTest
}

data class SettingsUiState(
    val settings: Settings = Settings.DEFAULT,
    val emailAddress: String = "",
    val hasPassword: Boolean = false,
    val test: ConnectionTest = ConnectionTest.Idle,
    val healthAvailability: HealthAvailability = HealthAvailability.NOT_INSTALLED,
    val healthPermitted: Boolean = false,
    val batteryExempt: Boolean = false,
    val message: String? = null,
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settings: LoopSettings,
    private val credentials: CredentialStore,
    private val imap: ImapClient,
    private val smtp: SmtpSender,
    private val healthSource: HealthConnectSource,
    private val healthSync: HealthSync,
) : ViewModel() {

    private val test = MutableStateFlow<ConnectionTest>(ConnectionTest.Idle)
    private val message = MutableStateFlow<String?>(null)
    private val healthState = MutableStateFlow(HealthAvailability.NOT_INSTALLED to false)
    private val batteryExempt = MutableStateFlow(false)

    val state: StateFlow<SettingsUiState> = combine(
        settings.settings,
        test,
        message,
        healthState,
        batteryExempt,
    ) { config, testState, msg, health, battery ->
        SettingsUiState(
            settings = config,
            emailAddress = credentials.load()?.address ?: config.emailAddress.orEmpty(),
            hasPassword = credentials.isConfigured,
            test = testState,
            healthAvailability = health.first,
            healthPermitted = health.second,
            batteryExempt = battery,
            message = msg,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SettingsUiState())

    init {
        refreshHealth()
    }

    fun refreshHealth() {
        viewModelScope.launch {
            healthState.value = healthSource.availability() to healthSource.hasPermissions()
        }
    }

    fun setBatteryExempt(value: Boolean) {
        batteryExempt.value = value
    }

    fun saveAccount(address: String, password: String) {
        viewModelScope.launch {
            credentials.save(MailCredentials(address = address.trim(), appPassword = password))
            settings.setEmail(address.trim())
            message.value = "Account saved"
        }
    }

    fun clearAccount() {
        viewModelScope.launch {
            credentials.clear()
            settings.setEmail(null)
            message.value = "Account removed"
        }
    }

    /**
     * SPEC.md §9 / M9: report the **real** IMAP and SMTP errors. "Couldn't connect" is
     * useless when the true cause is that IMAP is switched off in Gmail settings.
     */
    fun testConnection() {
        viewModelScope.launch {
            val creds = credentials.load()
            if (creds == null) {
                test.value = ConnectionTest.Failed("No account saved yet", null)
                return@launch
            }
            test.value = ConnectionTest.Running

            val (imapError, smtpError) = withContext(Dispatchers.IO) {
                val imapResult = imap.testConnection(creds)
                val smtpResult = smtp.testConnection(creds)
                val i = (imapResult as? ImapResult.Failure)?.let { "${it.kind}: ${it.message}" }
                val s = (smtpResult as? SendResult.Failure)?.message
                i to s
            }

            test.value = if (imapError == null && smtpError == null) {
                ConnectionTest.Ok("IMAP and SMTP both connected.")
            } else {
                ConnectionTest.Failed(imapError, smtpError)
            }
        }
    }

    fun generateToken() {
        viewModelScope.launch {
            settings.setSecretToken(Envelope.generateToken())
            message.value = "New token generated"
        }
    }

    fun setReportGate(time: LocalTime) {
        viewModelScope.launch { settings.setReportGate(time) }
    }

    fun setSleepTarget(minutes: Int) {
        viewModelScope.launch { settings.setSleepTarget(minutes) }
    }

    fun setRolloverHour(hour: Int) {
        viewModelScope.launch { settings.setRolloverHour(hour) }
    }

    fun syncHealthNow() {
        viewModelScope.launch {
            message.value = when (val outcome = healthSync.sync()) {
                is SyncOutcome.Synced -> "Synced — ${outcome.row.asleepMin ?: 0} min of sleep"
                is SyncOutcome.Unavailable -> "Health Connect is ${outcome.availability.name.lowercase()}"
                SyncOutcome.PermissionsMissing -> "Health Connect permissions not granted"
                SyncOutcome.NoData -> "No health data for today"
            }
            refreshHealth()
        }
    }

    fun completeOnboarding() {
        viewModelScope.launch { settings.setOnboarded(true) }
    }

    fun clearMessage() {
        message.value = null
    }

    val healthPermissions: Set<String> get() = healthSource.permissions
}
