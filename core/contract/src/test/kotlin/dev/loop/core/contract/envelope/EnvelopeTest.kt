package dev.loop.core.contract.envelope

import com.google.common.truth.Truth.assertThat
import java.time.LocalDate
import kotlin.random.Random
import org.junit.Test

class EnvelopeTest {

    @Test
    fun `SPEC section 2_1 plan subject parses`() {
        val subject = Envelope.parseSubject("[LOOP1|PLAN] 2026-08-16 · a4f9")!!

        assertThat(subject.kind).isEqualTo(Envelope.Kind.PLAN)
        assertThat(subject.date).isEqualTo(LocalDate.of(2026, 8, 16))
        assertThat(subject.token).isEqualTo("a4f9")
    }

    @Test
    fun `SPEC section 2_1 report subject parses`() {
        val subject = Envelope.parseSubject("[LOOP1|REPORT] 2026-08-15 · a4f9")!!

        assertThat(subject.kind).isEqualTo(Envelope.Kind.REPORT)
        assertThat(subject.date).isEqualTo(LocalDate.of(2026, 8, 15))
    }

    @Test
    fun `subjects survive clients rewriting the separator`() {
        // Gmail, Outlook and various relays all rewrite subject punctuation. Losing a
        // day's plan to a substituted middot is not an acceptable failure.
        listOf(
            "[LOOP1|PLAN] 2026-08-16 - a4f9",
            "[LOOP1|PLAN] 2026-08-16 – a4f9",
            "[LOOP1|PLAN] 2026-08-16: a4f9",
            "[LOOP1|PLAN] 2026-08-16 a4f9",
            "[LOOP1 | PLAN] 2026-08-16 · a4f9",
            "  [loop1|plan] 2026-08-16 · A4F9  ",
        ).forEach { raw ->
            assertThat(Envelope.parseSubject(raw)).isNotNull()
        }
    }

    @Test
    fun `unrelated subjects are simply not ours`() {
        listOf(
            "Your Amazon order has shipped",
            "[LOOP2|PLAN] 2026-08-16 · a4f9",
            "[LOOP1|SOMETHING] 2026-08-16 · a4f9",
            "[LOOP1|PLAN] 16-08-2026 · a4f9",
            "",
        ).forEach { raw ->
            assertThat(Envelope.parseSubject(raw)).isNull()
        }
    }

    @Test
    fun `token comparison is case-insensitive but exact otherwise`() {
        val subject = Envelope.parseSubject("[LOOP1|PLAN] 2026-08-16 · A4F9")!!

        assertThat(Envelope.matchesToken(subject, "a4f9")).isTrue()
        assertThat(Envelope.matchesToken(subject, " a4f9 ")).isTrue()
        assertThat(Envelope.matchesToken(subject, "a4f8")).isFalse()
    }

    @Test
    fun `format round-trips`() {
        val original = Envelope.Subject(Envelope.Kind.PLAN, LocalDate.of(2026, 8, 16), "K7M2QX")
        val reparsed = Envelope.parseSubject(original.format())

        assertThat(reparsed).isEqualTo(original)
    }

    @Test
    fun `payload is extracted from a loop fence`() {
        val body = """
            Morning. Tempo run is now an easy 5k.

            ```loop
            {"schema": 1, "type": "plan"}
            ```

            — Claude
        """.trimIndent()

        assertThat(Envelope.extractPayload(body)).isEqualTo("""{"schema": 1, "type": "plan"}""")
    }

    @Test
    fun `payload is recovered when the fence was stripped`() {
        val body = """
            Morning notes here.
            {"schema": 1, "sections": [{"key": "study"}]}
            Trailing prose.
        """.trimIndent()

        assertThat(Envelope.extractPayload(body))
            .isEqualTo("""{"schema": 1, "sections": [{"key": "study"}]}""")
    }

    @Test
    fun `braces inside strings do not terminate the payload early`() {
        val body = """{"note": "a } brace and a \" quote", "schema": 1}"""

        assertThat(Envelope.extractPayload(body)).isEqualTo(body)
    }

    @Test
    fun `a body with no payload yields null`() {
        assertThat(Envelope.extractPayload("Just a note, no plan today.")).isNull()
    }

    @Test
    fun `composed body round-trips through extraction`() {
        val payload = """{"schema": 1}"""
        val body = Envelope.composeBody("Day summary", payload)

        assertThat(Envelope.extractPayload(body)).isEqualTo(payload)
    }

    @Test
    fun `generated tokens avoid glyphs that get misread when transcribed`() {
        val random = Random(1234)
        repeat(200) {
            val token = Envelope.generateToken(random)
            assertThat(token).hasLength(Envelope.TOKEN_LENGTH)
            assertThat(token.none { it in "01OIL" }).isTrue()
        }
    }
}
