package dev.loop.transport.egress

import dev.loop.core.contract.envelope.Envelope
import dev.loop.transport.credentials.MailCredentials
import java.time.LocalDate
import java.util.Properties
import javax.inject.Inject
import javax.inject.Singleton
import javax.mail.Authenticator
import javax.mail.Message
import javax.mail.PasswordAuthentication
import javax.mail.Session
import javax.mail.Transport
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeMessage

sealed interface SendResult {
    data object Sent : SendResult
    data class Failure(val message: String, val recoverable: Boolean) : SendResult
}

/**
 * SMTP egress on 587 with STARTTLS (SPEC.md §2.4).
 *
 * Called only from an explicit tap. There is no scheduled path into this class, because
 * nothing may auto-send.
 */
@Singleton
class SmtpSender @Inject constructor() {

    fun send(
        credentials: MailCredentials,
        date: LocalDate,
        token: String,
        humanSummary: String,
        payloadJson: String,
    ): SendResult = try {
        val session = Session.getInstance(
            smtpProperties(credentials),
            object : Authenticator() {
                override fun getPasswordAuthentication() =
                    PasswordAuthentication(credentials.address, credentials.appPassword)
            },
        )

        val subject = Envelope.Subject(Envelope.Kind.REPORT, date, token).format()
        val message = MimeMessage(session).apply {
            setFrom(InternetAddress(credentials.address))
            // Same account both directions: Claude's connector reads what the app sends.
            setRecipient(Message.RecipientType.TO, InternetAddress(credentials.address))
            setSubject(subject)
            setText(Envelope.composeBody(humanSummary, payloadJson), "UTF-8")
        }

        Transport.send(message)
        SendResult.Sent
    } catch (e: javax.mail.AuthenticationFailedException) {
        SendResult.Failure(
            e.message ?: "Authentication failed — check the app password.",
            recoverable = false,
        )
    } catch (e: javax.mail.MessagingException) {
        val cause = generateSequence(e as Throwable) { it.cause }.last()
        SendResult.Failure(cause.message ?: e.toString(), recoverable = cause is java.io.IOException)
    } catch (e: Exception) {
        SendResult.Failure(e.message ?: e.toString(), recoverable = false)
    }

    private fun smtpProperties(credentials: MailCredentials) = Properties().apply {
        put("mail.transport.protocol", "smtp")
        put("mail.smtp.host", credentials.smtpHost)
        put("mail.smtp.port", credentials.smtpPort.toString())
        put("mail.smtp.auth", "true")
        put("mail.smtp.starttls.enable", "true")
        put("mail.smtp.starttls.required", "true")
        put("mail.smtp.ssl.checkserveridentity", "true")
        put("mail.smtp.connectiontimeout", "20000")
        put("mail.smtp.timeout", "30000")
    }

    fun testConnection(credentials: MailCredentials): SendResult = try {
        val session = Session.getInstance(smtpProperties(credentials))
        val transport = session.getTransport("smtp")
        transport.connect(credentials.smtpHost, credentials.smtpPort, credentials.address, credentials.appPassword)
        transport.close()
        SendResult.Sent
    } catch (e: Exception) {
        SendResult.Failure(e.message ?: e.toString(), recoverable = false)
    }
}
