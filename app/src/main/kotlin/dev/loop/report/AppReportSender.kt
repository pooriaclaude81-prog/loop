package dev.loop.report

import android.content.Context
import android.content.Intent
import android.net.Uri
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.loop.core.contract.domain.Report
import dev.loop.core.contract.envelope.Envelope
import dev.loop.core.contract.json.LoopJson
import dev.loop.core.data.settings.LoopSettings
import dev.loop.feature.review.ReportSender
import dev.loop.transport.credentials.CredentialStore
import dev.loop.transport.egress.SendResult
import dev.loop.transport.egress.SmtpSender
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext

/**
 * Sends the report over SMTP, with the `ACTION_SENDTO` fallback of SPEC.md §2.4 step 4.
 *
 * Only ever invoked from an explicit tap on the Review screen. There is no scheduled or
 * automatic path into this class — nothing auto-sends.
 */
@Singleton
class AppReportSender @Inject constructor(
    @ApplicationContext private val context: Context,
    private val smtp: SmtpSender,
    private val credentials: CredentialStore,
    private val settings: LoopSettings,
) : ReportSender {

    override val isConfigured: Boolean get() = credentials.isConfigured

    override suspend fun send(report: Report, humanSummary: String): Result<Unit> {
        val creds = credentials.load()
            ?: return Result.failure(IllegalStateException("No email account configured"))
        val token = settings.settings.first().secretToken
            ?: return Result.failure(IllegalStateException("No pairing token generated"))

        val payload = LoopJson.encodeToString(Report.serializer(), report)

        return withContext(Dispatchers.IO) {
            when (val result = smtp.send(creds, report.date, token, humanSummary, payload)) {
                SendResult.Sent -> Result.success(Unit)
                is SendResult.Failure -> Result.failure(IllegalStateException(result.message))
            }
        }
    }

    /**
     * Hands the whole message to a mail app. This is what keeps the loop closed when the
     * app password is unavailable or revoked (SPEC.md §9's risk register).
     */
    override fun shareFallback(report: Report, humanSummary: String) {
        val creds = credentials.load()
        val token = runBlocking { settings.settings.first().secretToken } ?: "loop"
        val payload = LoopJson.encodeToString(Report.serializer(), report)
        val subject = Envelope.Subject(Envelope.Kind.REPORT, report.date, token).format()
        val body = Envelope.composeBody(humanSummary, payload)

        val mailto = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:${creds?.address.orEmpty()}")
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, body)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        runCatching { context.startActivity(mailto) }.onFailure {
            // No mail app at all: a plain share sheet rather than silently doing nothing.
            val share = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, subject)
                putExtra(Intent.EXTRA_TEXT, body)
            }
            context.startActivity(
                Intent.createChooser(share, "Send report").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
        }
    }
}
