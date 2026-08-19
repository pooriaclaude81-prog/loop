package dev.loop.transport.ingest

import com.sun.mail.imap.IMAPFolder
import dev.loop.core.contract.envelope.Envelope
import dev.loop.transport.credentials.MailCredentials
import java.util.Properties
import javax.inject.Inject
import javax.inject.Singleton
import javax.mail.Folder
import javax.mail.Message
import javax.mail.Multipart
import javax.mail.Part
import javax.mail.Session
import javax.mail.Store
import javax.mail.search.SubjectTerm

/** One draft that carried a Loop payload. */
data class FetchedPlan(
    val uid: Long,
    val subject: String,
    val payloadJson: String?,
    val rawBody: String,
)

sealed interface ImapResult {
    data class Success(val plans: List<FetchedPlan>, val highestUid: Long) : ImapResult

    /**
     * Carries the real server message. SPEC.md §2.2 and the brief both require the actual
     * IMAP error to reach the user — "couldn't connect" is useless when the true cause is
     * that IMAP is disabled in Gmail settings or the app password was revoked.
     */
    data class Failure(val kind: FailureKind, val message: String) : ImapResult
}

enum class FailureKind {
    AUTH,
    NETWORK,
    NO_DRAFTS_FOLDER,
    PROTOCOL,
    NOT_CONFIGURED,
}

/**
 * Reads plans out of the Gmail **Drafts** folder (SPEC.md §2.2).
 *
 * Drafts, not the inbox, because Claude's Gmail connector can only create drafts. The
 * folder is found by its IMAP `\Drafts` special-use attribute rather than by name:
 * `[Gmail]/Drafts` is localised and would break for anyone whose Gmail is not in English.
 */
@Singleton
class ImapClient @Inject constructor() {

    fun fetchPlans(
        credentials: MailCredentials,
        token: String?,
        sinceUid: Long,
    ): ImapResult {
        var store: Store? = null
        var folder: Folder? = null
        return try {
            val session = Session.getInstance(imapProperties(credentials))
            store = session.getStore("imaps")
            store.connect(credentials.imapHost, credentials.address, credentials.appPassword)

            folder = findDraftsFolder(store)
                ?: return ImapResult.Failure(
                    FailureKind.NO_DRAFTS_FOLDER,
                    "No folder on this account advertises the IMAP \\Drafts attribute.",
                )

            folder.open(Folder.READ_WRITE)
            val imapFolder = folder as IMAPFolder

            val candidates = folder.search(SubjectTerm("[${Envelope.PROTOCOL}|PLAN]"))
            var highest = sinceUid
            val plans = buildList {
                candidates.forEach { message ->
                    val uid = imapFolder.getUID(message)
                    if (uid <= sinceUid) return@forEach
                    val subject = message.subject.orEmpty()
                    val parsed = Envelope.parseSubject(subject) ?: return@forEach
                    if (parsed.kind != Envelope.Kind.PLAN) return@forEach
                    if (token != null && !Envelope.matchesToken(parsed, token)) return@forEach

                    val body = extractText(message)
                    add(
                        FetchedPlan(
                            uid = uid,
                            subject = subject,
                            payloadJson = Envelope.extractPayload(body),
                            rawBody = body,
                        ),
                    )
                    // Marked seen, never deleted (§2.2) — the drafts stay readable in Gmail.
                    message.setFlag(javax.mail.Flags.Flag.SEEN, true)
                    if (uid > highest) highest = uid
                }
            }
            ImapResult.Success(plans, highest)
        } catch (e: javax.mail.AuthenticationFailedException) {
            ImapResult.Failure(
                FailureKind.AUTH,
                e.message ?: "Authentication failed. Check the app password and that IMAP is enabled.",
            )
        } catch (e: javax.mail.MessagingException) {
            val cause = generateSequence(e as Throwable) { it.cause }.last()
            val kind = if (cause is java.io.IOException) FailureKind.NETWORK else FailureKind.PROTOCOL
            ImapResult.Failure(kind, cause.message ?: e.toString())
        } catch (e: Exception) {
            ImapResult.Failure(FailureKind.PROTOCOL, e.message ?: e.toString())
        } finally {
            runCatching { folder?.close(false) }
            runCatching { store?.close() }
        }
    }

    /**
     * Finds Drafts by the RFC 6154 `\Drafts` special-use attribute, falling back to a
     * name match only if the server does not advertise one.
     */
    private fun findDraftsFolder(store: Store): Folder? {
        val roots = runCatching { store.defaultFolder.list("*") }.getOrDefault(emptyArray())

        roots.forEach { folder ->
            val attributes = (folder as? IMAPFolder)?.let { imap ->
                runCatching { imap.attributes }.getOrNull()
            }.orEmpty()
            if (attributes.any { it.equals("\\Drafts", ignoreCase = true) }) return folder
        }

        // Last resort for servers without SPECIAL-USE. Still not a hardcoded Gmail path:
        // any folder whose leaf name looks like Drafts in the account's own language would
        // have been caught above if the server advertised it properly.
        return roots.firstOrNull { it.name.equals("Drafts", ignoreCase = true) }
    }

    private fun extractText(part: Part): String = when {
        part.isMimeType("text/plain") -> part.content?.toString().orEmpty()
        part.isMimeType("text/html") -> part.content?.toString().orEmpty().stripHtml()
        part.isMimeType("multipart/*") -> {
            val multipart = part.content as? Multipart
            buildString {
                for (i in 0 until (multipart?.count ?: 0)) {
                    append(extractText(multipart!!.getBodyPart(i)))
                    append('\n')
                }
            }
        }
        else -> part.content?.toString().orEmpty()
    }

    private fun String.stripHtml(): String = replace(Regex("<br\\s*/?>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("</p>", RegexOption.IGNORE_CASE), "\n")
        .replace(Regex("<[^>]+>"), "")
        .replace("&quot;", "\"")
        .replace("&#34;", "\"")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&nbsp;", " ")

    private fun imapProperties(credentials: MailCredentials) = Properties().apply {
        put("mail.store.protocol", "imaps")
        put("mail.imaps.host", credentials.imapHost)
        put("mail.imaps.port", credentials.imapPort.toString())
        put("mail.imaps.ssl.enable", "true")
        put("mail.imaps.ssl.checkserveridentity", "true")
        put("mail.imaps.connectiontimeout", "20000")
        put("mail.imaps.timeout", "30000")
        put("mail.imaps.writetimeout", "20000")
    }

    /** Used by the "test connection" button in settings (M9). */
    fun testConnection(credentials: MailCredentials): ImapResult =
        fetchPlans(credentials, token = null, sinceUid = Long.MAX_VALUE - 1)
}
