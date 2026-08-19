package dev.loop.feature.settings

import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings as AndroidSettings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.health.connect.client.PermissionController
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.loop.core.designsystem.component.LoopCard
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import dev.loop.health.HealthAvailability
import java.time.LocalTime

/**
 * Settings and onboarding (M9).
 *
 * Everything personal lives here rather than in code: the account, the routing token, the
 * report gate, the sleep target and the day-rollover hour. Nothing about the user's
 * sections is configured here — those come from the plan.
 */
@Composable
fun SettingsScreen(viewModel: SettingsViewModel, modifier: Modifier = Modifier) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current

    var address by remember(state.emailAddress) { mutableStateOf(state.emailAddress) }
    var password by remember { mutableStateOf("") }

    val healthLauncher = rememberLauncherForActivityResult(
        contract = PermissionController.createRequestPermissionResultContract(),
    ) { viewModel.refreshHealth() }

    Box(modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        LazyColumn(
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Text("Settings", style = LoopType.numeral, color = MaterialTheme.colorScheme.onBackground)
            }

            // ---------------------------------------------------------- email
            item {
                LoopCard {
                    Text("Email account", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
                    Text(
                        "Loop reads plans from this account's Drafts folder and sends reports " +
                            "back to the same address.",
                        style = LoopType.caption,
                        color = LoopColors.TextSecondary,
                    )
                    Spacer(Modifier.height(12.dp))

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Gmail address") },
                        singleLine = true,
                        textStyle = LoopType.caption,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text(if (state.hasPassword) "App password (saved)" else "App password") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        textStyle = LoopType.caption,
                        modifier = Modifier.fillMaxWidth(),
                    )

                    Spacer(Modifier.height(10.dp))
                    // Inline, because this is the single most common setup failure.
                    Text(
                        "This is not your Google password. Turn on 2-step verification, then " +
                            "create an App Password at myaccount.google.com/apppasswords and paste " +
                            "the 16-character code here. IMAP must also be enabled in Gmail settings.",
                        style = LoopType.caption,
                        color = LoopColors.TextTertiary,
                    )
                    TextButton(onClick = {
                        context.startActivity(
                            Intent(Intent.ACTION_VIEW, Uri.parse("https://myaccount.google.com/apppasswords")),
                        )
                    }) { Text("Open Google App Passwords") }

                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { viewModel.saveAccount(address, password) },
                            enabled = address.isNotBlank() && password.isNotBlank(),
                        ) { Text("Save") }
                        OutlinedButton(
                            onClick = viewModel::testConnection,
                            enabled = state.hasPassword && state.test != ConnectionTest.Running,
                        ) { Text("Test connection") }
                        if (state.hasPassword) {
                            TextButton(onClick = viewModel::clearAccount) { Text("Remove") }
                        }
                    }

                    when (val test = state.test) {
                        ConnectionTest.Running ->
                            Text("Testing…", style = LoopType.caption, color = LoopColors.TextSecondary)

                        is ConnectionTest.Ok ->
                            Text(test.detail, style = LoopType.caption, color = LoopColors.Success)

                        is ConnectionTest.Failed -> Column {
                            test.imap?.let {
                                Text("IMAP: $it", style = LoopType.caption, color = LoopColors.Danger)
                            }
                            test.smtp?.let {
                                Text("SMTP: $it", style = LoopType.caption, color = LoopColors.Danger)
                            }
                        }

                        ConnectionTest.Idle -> Unit
                    }
                }
            }

            // ---------------------------------------------------------- token
            item {
                LoopCard {
                    Text("Pairing token", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
                    Text(
                        "Paste this into the Claude skill. It tags messages so Loop ignores " +
                            "anything else in your mailbox.",
                        style = LoopType.caption,
                        color = LoopColors.TextSecondary,
                    )
                    Spacer(Modifier.height(10.dp))
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(
                            state.settings.secretToken ?: "not generated",
                            style = LoopType.numeralSmall,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                        Row {
                            state.settings.secretToken?.let { token ->
                                TextButton(onClick = { clipboard.setText(AnnotatedString(token)) }) {
                                    Text("Copy")
                                }
                            }
                            TextButton(onClick = viewModel::generateToken) { Text("Generate") }
                        }
                    }
                }
            }

            // ---------------------------------------------------------- times
            item {
                LoopCard {
                    Text("Day", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
                    Spacer(Modifier.height(10.dp))

                    TimeRow("Review gate", state.settings.reportGate) { viewModel.setReportGate(it) }
                    Spacer(Modifier.height(10.dp))

                    NumberRow(
                        label = "Sleep target (minutes)",
                        value = state.settings.sleepTargetMin,
                        onChange = viewModel::setSleepTarget,
                    )
                    Spacer(Modifier.height(10.dp))

                    NumberRow(
                        label = "Day starts at (hour)",
                        value = state.settings.dayRolloverHour,
                        onChange = viewModel::setRolloverHour,
                    )
                    Text(
                        "Work logged before this hour counts toward the previous day. " +
                            "Set to 4 so a session at 1am belongs to the night you started.",
                        style = LoopType.caption,
                        color = LoopColors.TextTertiary,
                    )
                }
            }

            // ---------------------------------------------------------- health
            item {
                LoopCard {
                    Text("Health Connect", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
                    Text(
                        when (state.healthAvailability) {
                            HealthAvailability.AVAILABLE ->
                                if (state.healthPermitted) "Connected." else "Installed, permissions not granted."
                            HealthAvailability.UPDATE_REQUIRED -> "Health Connect needs updating."
                            HealthAvailability.NOT_INSTALLED ->
                                "Not installed. Sleep can still be entered by hand on Today."
                        },
                        style = LoopType.caption,
                        color = LoopColors.TextSecondary,
                    )
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (state.healthAvailability == HealthAvailability.AVAILABLE && !state.healthPermitted) {
                            Button(onClick = { healthLauncher.launch(viewModel.healthPermissions) }) {
                                Text("Grant access")
                            }
                        }
                        OutlinedButton(onClick = viewModel::syncHealthNow) { Text("Sync now") }
                    }
                }
            }

            // ---------------------------------------------------------- battery
            item {
                LoopCard {
                    Text("Background reliability", style = LoopType.label, color = MaterialTheme.colorScheme.onSurface)
                    Text(
                        "Android may stop Loop from checking mail or keeping the timer alive " +
                            "while the screen is off. Two separate settings control this.",
                        style = LoopType.caption,
                        color = LoopColors.TextSecondary,
                    )
                    Spacer(Modifier.height(8.dp))

                    val powerManager = context.getSystemService(PowerManager::class.java)
                    val exempt = powerManager?.isIgnoringBatteryOptimizations(context.packageName) == true
                    Text(
                        if (exempt) "Battery optimisation: exempt" else "Battery optimisation: active",
                        style = LoopType.caption,
                        color = if (exempt) LoopColors.Success else LoopColors.Warning,
                    )
                    if (!exempt) {
                        TextButton(onClick = {
                            context.startActivity(
                                Intent(AndroidSettings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS),
                            )
                        }) { Text("Open battery settings") }
                    }

                    Spacer(Modifier.height(6.dp))
                    // Xiaomi/HyperOS Autostart cannot be requested programmatically, so the
                    // only honest thing to do is tell the user exactly where to go.
                    Text(
                        "On Xiaomi, Redmi and POCO phones there is a second setting called " +
                            "Autostart, in Settings → Apps → Loop → Autostart. It must be turned on " +
                            "separately, and no app can turn it on for you.",
                        style = LoopType.caption,
                        color = LoopColors.TextTertiary,
                    )
                    TextButton(onClick = {
                        runCatching {
                            context.startActivity(
                                Intent(AndroidSettings.ACTION_APPLICATION_DETAILS_SETTINGS)
                                    .setData(Uri.parse("package:${context.packageName}")),
                            )
                        }
                    }) { Text("Open app settings") }
                }
            }

            state.message?.let { message ->
                item {
                    LoopCard {
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text(message, style = LoopType.caption, color = LoopColors.TextSecondary)
                            TextButton(onClick = viewModel::clearMessage) { Text("OK") }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TimeRow(label: String, value: LocalTime, onChange: (LocalTime) -> Unit) {
    var hour by remember(value) { mutableStateOf(value.hour.toString()) }
    var minute by remember(value) { mutableStateOf(value.minute.toString().padStart(2, '0')) }

    Text(label, style = LoopType.caption, color = LoopColors.TextTertiary)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedTextField(
            value = hour,
            onValueChange = {
                hour = it.filter(Char::isDigit).take(2)
                commit(hour, minute, onChange)
            },
            label = { Text("Hour") },
            singleLine = true,
            textStyle = LoopType.caption,
            modifier = Modifier.weight(1f),
        )
        OutlinedTextField(
            value = minute,
            onValueChange = {
                minute = it.filter(Char::isDigit).take(2)
                commit(hour, minute, onChange)
            },
            label = { Text("Minute") },
            singleLine = true,
            textStyle = LoopType.caption,
            modifier = Modifier.weight(1f),
        )
    }
}

private fun commit(hour: String, minute: String, onChange: (LocalTime) -> Unit) {
    val h = hour.toIntOrNull() ?: return
    val m = minute.toIntOrNull() ?: return
    if (h in 0..23 && m in 0..59) onChange(LocalTime.of(h, m))
}

@Composable
private fun NumberRow(label: String, value: Int, onChange: (Int) -> Unit) {
    var text by remember(value) { mutableStateOf(value.toString()) }
    OutlinedTextField(
        value = text,
        onValueChange = {
            text = it.filter(Char::isDigit).take(4)
            text.toIntOrNull()?.let(onChange)
        },
        label = { Text(label) },
        singleLine = true,
        textStyle = LoopType.caption,
        modifier = Modifier.fillMaxWidth(),
    )
}
