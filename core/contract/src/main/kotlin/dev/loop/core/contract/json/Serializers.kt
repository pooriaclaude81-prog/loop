package dev.loop.core.contract.json

import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json

/** `HH:mm` — the wire format for `report_gate` and window bounds. */
internal val HH_MM: DateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm")

object LocalDateSerializer : KSerializer<LocalDate> {
    override val descriptor = PrimitiveSerialDescriptor("LocalDate", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: LocalDate) =
        encoder.encodeString(value.toString())

    override fun deserialize(decoder: Decoder): LocalDate = LocalDate.parse(decoder.decodeString())
}

object LocalTimeSerializer : KSerializer<LocalTime> {
    override val descriptor = PrimitiveSerialDescriptor("LocalTime", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: LocalTime) =
        encoder.encodeString(value.format(HH_MM))

    override fun deserialize(decoder: Decoder): LocalTime =
        LocalTime.parse(decoder.decodeString(), HH_MM)
}

object ZoneIdSerializer : KSerializer<ZoneId> {
    override val descriptor = PrimitiveSerialDescriptor("ZoneId", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: ZoneId) = encoder.encodeString(value.id)
    override fun deserialize(decoder: Decoder): ZoneId = ZoneId.of(decoder.decodeString())
}

object InstantSerializer : KSerializer<Instant> {
    override val descriptor = PrimitiveSerialDescriptor("Instant", PrimitiveKind.STRING)
    override fun serialize(encoder: Encoder, value: Instant) = encoder.encodeString(value.toString())
    override fun deserialize(decoder: Decoder): Instant = Instant.parse(decoder.decodeString())
}

/**
 * The single [Json] instance for everything Loop reads or writes.
 *
 * `ignoreUnknownKeys` is on because Claude will add fields to the plan schema faster than
 * the app can ship support for them; an unrecognised field must never brick the morning.
 * The validator reports them as warnings so they still surface, rather than vanishing.
 *
 * Note that plan *ingest* does not decode through this instance — see
 * [dev.loop.core.contract.validate.PlanValidator] for why. This is used for report
 * egress, for `raw_json` round-tripping, and for the DTO-free structural parse.
 */
@OptIn(kotlinx.serialization.ExperimentalSerializationApi::class)
val LoopJson: Json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
    explicitNulls = false
    prettyPrint = true
    prettyPrintIndent = "  "
    isLenient = false
    allowSpecialFloatingPointValues = false
}

/**
 * Compact variant used when embedding JSON into an email body.
 *
 * `prettyPrintIndent` must be reset alongside `prettyPrint`: [kotlinx.serialization.json.JsonConfiguration]
 * rejects a custom indent when pretty printing is off, and it does so from a static
 * initialiser, which takes the whole file down with it.
 */
val LoopJsonCompact: Json = Json(from = LoopJson) {
    prettyPrint = false
    prettyPrintIndent = "    "
}
