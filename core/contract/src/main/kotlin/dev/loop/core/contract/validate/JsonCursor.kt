package dev.loop.core.contract.validate

import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeParseException
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

/** Accumulates issues instead of throwing, so one pass reports every defect. */
class IssueSink {
    private val collected = mutableListOf<Issue>()

    fun add(path: String, code: IssueCode, message: String, hint: String? = null) {
        collected += Issue(path, code, message, hint)
    }

    fun addAll(issues: Collection<Issue>) {
        collected += issues
    }

    val issues: List<Issue> get() = collected.toList()
    val hasErrors: Boolean get() = collected.any { it.severity == Severity.ERROR }
}

/**
 * A read cursor over one [JsonElement] that records a typed [Issue] and returns `null`
 * instead of throwing when a field is missing or the wrong type.
 *
 * This exists because `Json.decodeFromString<T>()` fails fast: the first type mismatch
 * aborts the parse, so the "plan couldn't be read" screen of SPEC.md §2.2 could only ever
 * show one defect at a time and the user would round-trip through Gmail once per mistake.
 * Walking a [JsonObject] by hand costs a few hundred lines and buys a complete error list.
 */
class JsonCursor(
    val element: JsonElement,
    val path: String,
    private val sink: IssueSink,
) {

    fun issue(code: IssueCode, message: String, hint: String? = null, at: String = path) {
        sink.add(at, code, message, hint)
    }

    /** The element as an object, or null (with a recorded issue) if it is not one. */
    fun asObject(): JsonObject? = element as? JsonObject ?: run {
        issue(IssueCode.NOT_AN_OBJECT, "Expected an object, found ${element.kindName()}")
        null
    }

    private fun child(key: String): JsonElement? =
        (element as? JsonObject)?.get(key)?.takeIf { it !is JsonNull }

    fun childPath(key: String): String = "$path/$key"

    fun has(key: String): Boolean = child(key) != null

    fun cursor(key: String): JsonCursor? =
        child(key)?.let { JsonCursor(it, childPath(key), sink) }

    // ---------------------------------------------------------------- primitives

    private fun primitive(key: String, required: Boolean): JsonPrimitive? {
        val raw = child(key)
        if (raw == null) {
            if (required) {
                issue(IssueCode.MISSING_FIELD, "Required field \"$key\" is missing", at = childPath(key))
            }
            return null
        }
        val prim = raw as? JsonPrimitive
        if (prim == null) {
            issue(
                IssueCode.TYPE_MISMATCH,
                "Expected a value for \"$key\", found ${raw.kindName()}",
                at = childPath(key),
            )
        }
        return prim
    }

    fun string(key: String, required: Boolean = true): String? {
        val prim = primitive(key, required) ?: return null
        if (!prim.isString) {
            issue(
                IssueCode.TYPE_MISMATCH,
                "Field \"$key\" must be a string",
                hint = "found ${prim.content.describeNonString()}",
                at = childPath(key),
            )
            return null
        }
        return prim.content
    }

    fun double(key: String, required: Boolean = true): Double? {
        val prim = primitive(key, required) ?: return null
        if (prim.isString) {
            issue(
                IssueCode.TYPE_MISMATCH,
                "Field \"$key\" must be a number, not a quoted string",
                hint = "found \"${prim.content}\" — remove the quotes",
                at = childPath(key),
            )
            return null
        }
        val value = prim.content.toDoubleOrNull()
        if (value == null || !value.isFinite()) {
            issue(
                IssueCode.TYPE_MISMATCH,
                "Field \"$key\" is not a finite number",
                hint = "found ${prim.content}",
                at = childPath(key),
            )
            return null
        }
        return value
    }

    fun int(key: String, required: Boolean = true): Int? {
        val prim = primitive(key, required) ?: return null
        if (prim.isString) {
            issue(
                IssueCode.TYPE_MISMATCH,
                "Field \"$key\" must be a number, not a quoted string",
                hint = "found \"${prim.content}\" — remove the quotes",
                at = childPath(key),
            )
            return null
        }
        val value = prim.content.toIntOrNull()
        if (value == null) {
            issue(
                IssueCode.TYPE_MISMATCH,
                "Field \"$key\" must be a whole number",
                hint = "found ${prim.content}",
                at = childPath(key),
            )
            return null
        }
        return value
    }

    fun boolean(key: String, required: Boolean = true): Boolean? {
        val prim = primitive(key, required) ?: return null
        return when (prim.content.lowercase()) {
            "true" -> true
            "false" -> false
            else -> {
                issue(
                    IssueCode.TYPE_MISMATCH,
                    "Field \"$key\" must be true or false",
                    hint = "found ${prim.content}",
                    at = childPath(key),
                )
                null
            }
        }
    }

    // ---------------------------------------------------------------- arrays

    fun array(key: String, required: Boolean = true, allowEmpty: Boolean = false): List<JsonCursor>? {
        val raw = child(key)
        if (raw == null) {
            if (required) {
                issue(IssueCode.MISSING_FIELD, "Required field \"$key\" is missing", at = childPath(key))
            }
            return null
        }
        val arr = raw as? JsonArray
        if (arr == null) {
            issue(
                IssueCode.TYPE_MISMATCH,
                "Field \"$key\" must be an array",
                hint = "found ${raw.kindName()}",
                at = childPath(key),
            )
            return null
        }
        if (arr.isEmpty() && !allowEmpty) {
            issue(IssueCode.EMPTY_ARRAY, "Field \"$key\" must not be empty", at = childPath(key))
            return null
        }
        return arr.mapIndexed { index, el -> JsonCursor(el, "${childPath(key)}/$index", sink) }
    }

    fun stringArray(key: String, required: Boolean = true): List<String>? {
        val items = array(key, required, allowEmpty = true) ?: return null
        return items.mapNotNull { item ->
            val prim = item.element as? JsonPrimitive
            if (prim == null || !prim.isString) {
                sink.add(
                    item.path,
                    IssueCode.TYPE_MISMATCH,
                    "Expected a string",
                    "found ${item.element.kindName()}",
                )
                null
            } else {
                prim.content
            }
        }
    }

    /** This cursor's own element read as a string (for array members). */
    fun selfString(): String? {
        val prim = element as? JsonPrimitive
        if (prim == null || !prim.isString) {
            issue(IssueCode.TYPE_MISMATCH, "Expected a string", "found ${element.kindName()}")
            return null
        }
        return prim.content
    }

    // ---------------------------------------------------------------- temporal

    fun localDate(key: String, required: Boolean = true): LocalDate? {
        val text = string(key, required) ?: return null
        return try {
            LocalDate.parse(text)
        } catch (e: DateTimeParseException) {
            issue(
                IssueCode.INVALID_DATE,
                "Field \"$key\" is not a valid date",
                hint = "expected YYYY-MM-DD, found \"$text\"",
                at = childPath(key),
            )
            null
        }
    }

    fun localTime(key: String, required: Boolean = true): LocalTime? {
        val text = string(key, required) ?: return null
        return parseTime(text, childPath(key), key)
    }

    fun parseTime(text: String, at: String, key: String): LocalTime? = try {
        LocalTime.parse(text.trim(), dev.loop.core.contract.json.HH_MM)
    } catch (e: DateTimeParseException) {
        issue(
            IssueCode.INVALID_TIME,
            "Field \"$key\" is not a valid time",
            hint = "expected HH:mm (24-hour), found \"$text\"",
            at = at,
        )
        null
    }

    fun zoneId(key: String, required: Boolean = true): ZoneId? {
        val text = string(key, required) ?: return null
        return try {
            ZoneId.of(text.trim())
        } catch (e: Exception) {
            issue(
                IssueCode.INVALID_TIMEZONE,
                "Field \"$key\" is not a known IANA time zone",
                hint = "found \"$text\" — expected something like Asia/Tehran",
                at = childPath(key),
            )
            null
        }
    }

    // ---------------------------------------------------------------- forward compat

    /**
     * Reports keys Loop does not understand as warnings rather than errors: Claude will
     * extend the schema faster than the app ships support, and a new field must never
     * cost the user their morning plan.
     */
    fun reportUnknownKeys(known: Set<String>) {
        val obj = element as? JsonObject ?: return
        obj.keys.filterNot { it in known }.forEach { key ->
            issue(
                IssueCode.UNKNOWN_FIELD,
                "Field \"$key\" is not part of schema v1 and was ignored",
                at = childPath(key),
            )
        }
    }
}

private fun JsonElement.kindName(): String = when (this) {
    is JsonObject -> "an object"
    is JsonArray -> "an array"
    is JsonNull -> "null"
    is JsonPrimitive -> if (isString) "a string" else "a number or boolean"
}

private fun String.describeNonString(): String =
    if (toDoubleOrNull() != null) "the number $this" else "\"$this\""
