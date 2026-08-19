package dev.loop.transport.credentials

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

data class MailCredentials(
    val address: String,
    val appPassword: String,
    val imapHost: String = DEFAULT_IMAP_HOST,
    val imapPort: Int = DEFAULT_IMAP_PORT,
    val smtpHost: String = DEFAULT_SMTP_HOST,
    val smtpPort: Int = DEFAULT_SMTP_PORT,
) {
    companion object {
        const val DEFAULT_IMAP_HOST = "imap.gmail.com"
        const val DEFAULT_IMAP_PORT = 993
        const val DEFAULT_SMTP_HOST = "smtp.gmail.com"
        const val DEFAULT_SMTP_PORT = 587
    }
}

/**
 * Mail credentials in `EncryptedSharedPreferences` behind a Keystore `MasterKey`
 * (SPEC.md §2.2).
 *
 * The password is never logged, never placed in a report payload, and never leaves this
 * class except into a `javax.mail` Session. [toString] is overridden across this file's
 * types for the same reason: an incautious log statement elsewhere must not be able to
 * print it.
 */
@Singleton
class CredentialStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {

    private val prefs: SharedPreferences by lazy {
        val key = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            FILE_NAME,
            key,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }

    fun load(): MailCredentials? {
        val address = prefs.getString(KEY_ADDRESS, null) ?: return null
        val password = prefs.getString(KEY_PASSWORD, null) ?: return null
        return MailCredentials(
            address = address,
            appPassword = password,
            imapHost = prefs.getString(KEY_IMAP_HOST, null) ?: MailCredentials.DEFAULT_IMAP_HOST,
            imapPort = prefs.getInt(KEY_IMAP_PORT, MailCredentials.DEFAULT_IMAP_PORT),
            smtpHost = prefs.getString(KEY_SMTP_HOST, null) ?: MailCredentials.DEFAULT_SMTP_HOST,
            smtpPort = prefs.getInt(KEY_SMTP_PORT, MailCredentials.DEFAULT_SMTP_PORT),
        )
    }

    fun save(credentials: MailCredentials) {
        prefs.edit()
            .putString(KEY_ADDRESS, credentials.address)
            .putString(KEY_PASSWORD, credentials.appPassword)
            .putString(KEY_IMAP_HOST, credentials.imapHost)
            .putInt(KEY_IMAP_PORT, credentials.imapPort)
            .putString(KEY_SMTP_HOST, credentials.smtpHost)
            .putInt(KEY_SMTP_PORT, credentials.smtpPort)
            .apply()
    }

    fun clear() = prefs.edit().clear().apply()

    val isConfigured: Boolean get() = prefs.contains(KEY_ADDRESS) && prefs.contains(KEY_PASSWORD)

    private companion object {
        const val FILE_NAME = "loop_credentials"
        const val KEY_ADDRESS = "address"
        const val KEY_PASSWORD = "app_password"
        const val KEY_IMAP_HOST = "imap_host"
        const val KEY_IMAP_PORT = "imap_port"
        const val KEY_SMTP_HOST = "smtp_host"
        const val KEY_SMTP_PORT = "smtp_port"
    }
}
