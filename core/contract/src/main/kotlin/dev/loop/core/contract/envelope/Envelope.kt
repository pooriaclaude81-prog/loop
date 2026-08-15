package dev.loop.core.contract.envelope

import java.time.LocalDate
import java.time.format.DateTimeParseException

/**
 * The mail envelope of SPEC.md §2.1.
 *
 * ```
 * [LOOP1|PLAN] 2026-08-16 · a4f9
 * [LOOP1|REPORT] 2026-08-15 · a4f9
 * ```
 *
 * The token is a **routing tag, not authentication**. It rides in a subject line, so it
 * is visible in Gmail search and notification previews, and anyone able to write to the
 * Drafts folder already controls the mailbox. Its job is to stop Loop from importing an
 * unrelated message, nothing more. Six characters of Crockford base32 (no `0/O/1/I`)
 * because the user types it into the Claude skill by hand exactly once.
 */
object Envelope {

    const val PROTOCOL = "LOOP1"
    const val SEPARATOR = "·"

    /** Crockford base32 minus the glyphs that get misread when transcribed. */
    const val TOKEN_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ"
    const val TOKEN_LENGTH = 6

    enum class Kind(val wire: String) {
        PLAN("PLAN"),
        REPORT("REPORT"),
        ;

        companion object {
            fun fromWire(v: String): Kind? = entries.firstOrNull { it.wire.equals(v, ignoreCase = true) }
        }
    }

    data class Subject(
        val kind: Kind,
        val date: LocalDate,
        val token: String,
    ) {
        fun format(): String = "[$PROTOCOL|${kind.wire}] $date $SEPARATOR $token"
    }

    // Tolerant of the separator being a middot, a hyphen, or absent: Gmail and various
    // clients rewrite punctuation in subject lines and this must not cost a day's plan.
    private val SUBJECT_REGEX = Regex(
        """^\s*\[\s*$PROTOCOL\s*\|\s*(PLAN|REPORT)\s*]\s*(\d{4}-\d{2}-\d{2})\s*[·\-–—:]?\s*([0-9A-Za-z]{3,16})\s*$""",
        RegexOption.IGNORE_CASE,
    )

    /**
     * Parses a subject line. Returns null when it is not a Loop envelope at all — that is
     * an ordinary "not for us" outcome, not an error worth surfacing.
     */
    fun parseSubject(subject: String): Subject? {
        val match = SUBJECT_REGEX.find(subject.replace(' ', ' ')) ?: return null
        val (kindText, dateText, token) = match.destructured
        val kind = Kind.fromWire(kindText) ?: return null
        val date = try {
            LocalDate.parse(dateText)
        } catch (e: DateTimeParseException) {
            return null
        }
        return Subject(kind, date, token)
    }

    fun matchesToken(subject: Subject, expected: String): Boolean =
        subject.token.equals(expected.trim(), ignoreCase = true)

    /**
     * Pulls the JSON out of a ```` ```loop ```` fenced block (SPEC.md §2.1: human-readable
     * markdown first, then the payload).
     *
     * Falls back to the first balanced top-level object in the body, because a mail client
     * that reflows or strips the fence must not make the payload unreadable.
     */
    fun extractPayload(body: String): String? {
        FENCE_REGEX.find(body)?.let { return it.groupValues[1].trim() }
        return firstBalancedObject(body)
    }

    private val FENCE_REGEX = Regex(
        """```[ \t]*loop[ \t]*\r?\n(.*?)```""",
        setOf(RegexOption.DOT_MATCHES_ALL, RegexOption.IGNORE_CASE),
    )

    private fun firstBalancedObject(text: String): String? {
        val start = text.indexOf('{')
        if (start < 0) return null
        var depth = 0
        var inString = false
        var escaped = false
        for (i in start until text.length) {
            val c = text[i]
            when {
                escaped -> escaped = false
                c == '\\' && inString -> escaped = true
                c == '"' -> inString = !inString
                inString -> Unit
                c == '{' -> depth++
                c == '}' -> {
                    depth--
                    if (depth == 0) return text.substring(start, i + 1)
                }
            }
        }
        return null
    }

    /** Builds the body of an outbound report: readable summary first, payload second. */
    fun composeBody(humanSummary: String, payloadJson: String): String = buildString {
        appendLine(humanSummary.trimEnd())
        appendLine()
        appendLine("```loop")
        appendLine(payloadJson.trimEnd())
        appendLine("```")
    }

    /** Generates a routing token. [random] is injectable so tests are deterministic. */
    fun generateToken(random: kotlin.random.Random = kotlin.random.Random.Default): String =
        (1..TOKEN_LENGTH).map { TOKEN_ALPHABET.random(random) }.joinToString("")
}
