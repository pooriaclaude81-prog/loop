package dev.loop.core.contract.validate

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class Severity {
    /** The plan cannot be used as-is. Ingest stops and the UI shows the raw payload. */
    @SerialName("error")
    ERROR,

    /**
     * The plan is usable but something was assumed, repaired or ignored. Warnings are
     * surfaced in the UI and echoed to Claude in the report's `plan_feedback` block so
     * the next payload can correct itself.
     */
    @SerialName("warning")
    WARNING,
}

/**
 * A stable, machine-checkable identifier for one class of defect.
 *
 * Tests assert on these, never on message text. The UI maps them to actions ("re-import",
 * "fix in Gmail", "use anyway"). SPEC.md §2.2: ingest must never fail silently.
 */
@Serializable
enum class IssueCode(val severity: Severity) {
    // --- structural ---
    MALFORMED_JSON(Severity.ERROR),
    NOT_AN_OBJECT(Severity.ERROR),
    MISSING_FIELD(Severity.ERROR),
    TYPE_MISMATCH(Severity.ERROR),
    EMPTY_ARRAY(Severity.ERROR),

    // --- envelope ---
    UNSUPPORTED_SCHEMA(Severity.ERROR),
    WRONG_PAYLOAD_TYPE(Severity.ERROR),
    INVALID_DATE(Severity.ERROR),
    INVALID_TIME(Severity.ERROR),
    INVALID_TIMEZONE(Severity.ERROR),
    INVALID_REV(Severity.ERROR),
    SECRET_MISMATCH(Severity.ERROR),
    PLAN_DATE_IN_PAST(Severity.WARNING),

    // --- sections ---
    DUPLICATE_SECTION_KEY(Severity.ERROR),
    INVALID_KEY_FORMAT(Severity.ERROR),
    INVALID_WEIGHT(Severity.ERROR),

    /**
     * Weights did not sum to 1.0. Loop normalises and continues rather than rejecting:
     * a plan discarded over a rounding error means no plan for the whole day, which is a
     * far worse failure than a silently rescaled weight — and it is not silent, it is
     * this warning.
     */
    WEIGHTS_NOT_NORMALIZED(Severity.WARNING),
    SECTION_HAS_NO_TASKS(Severity.WARNING),
    UNKNOWN_COLOR(Severity.WARNING),

    // --- tasks ---
    DUPLICATE_TASK_KEY(Severity.ERROR),
    UNKNOWN_MODE(Severity.ERROR),
    MISSING_TARGET(Severity.ERROR),

    /** e.g. `mode: "run"` carrying `target_min`, or a `timer` task with no `target_min`. */
    TARGET_SHAPE_MISMATCH(Severity.ERROR),
    INVALID_TARGET_VALUE(Severity.ERROR),
    INVALID_PACE_BAND(Severity.ERROR),

    /** `lo == hi`: the §6 decay margin is zero, so the band becomes exact-match-or-zero. */
    DEGENERATE_PACE_BAND(Severity.WARNING),
    INVALID_WINDOW(Severity.ERROR),
    INVALID_PRIORITY(Severity.ERROR),

    /** Scored by exact match in §6, so an unrecognised spelling silently costs 20%. */
    UNKNOWN_RUN_TYPE(Severity.WARNING),
    UNKNOWN_MUSCLE_GROUP(Severity.WARNING),

    // --- forward compatibility ---
    UNKNOWN_FIELD(Severity.WARNING),
    ;

    val isError: Boolean get() = severity == Severity.ERROR
}

/**
 * One defect, addressed by a JSON-Pointer-style [path] so the UI can point at the exact
 * offending line of Claude's payload.
 */
@Serializable
data class Issue(
    @SerialName("path") val path: String,
    @SerialName("code") val code: IssueCode,
    @SerialName("message") val message: String,
    @SerialName("hint") val hint: String? = null,
) {
    val severity: Severity get() = code.severity

    override fun toString(): String = buildString {
        append(severity.name.lowercase()).append(' ')
        append(code.name).append(" at ").append(path.ifEmpty { "/" })
        append(": ").append(message)
        hint?.let { append(" (").append(it).append(')') }
    }
}

/**
 * The result of validating a payload. Deliberately not a `Boolean` and not a thrown
 * exception: the brief requires a structured list of every problem found, because a
 * fail-fast parse can only ever show the user the first thing wrong with the plan.
 */
sealed interface ValidationResult<out T> {

    val issues: List<Issue>

    val warnings: List<Issue> get() = issues.filter { it.severity == Severity.WARNING }
    val errors: List<Issue> get() = issues.filter { it.severity == Severity.ERROR }

    data class Valid<out T>(
        val value: T,
        override val issues: List<Issue> = emptyList(),
    ) : ValidationResult<T>

    data class Invalid(
        override val issues: List<Issue>,
    ) : ValidationResult<Nothing> {
        init {
            require(issues.any { it.severity == Severity.ERROR }) {
                "Invalid must carry at least one ERROR issue"
            }
        }
    }

    fun valueOrNull(): T? = (this as? Valid)?.value

    companion object {
        /** Builds [Valid] or [Invalid] depending on whether [issues] contains any error. */
        fun <T> of(value: T?, issues: List<Issue>): ValidationResult<T> =
            if (value == null || issues.any { it.severity == Severity.ERROR }) {
                Invalid(
                    issues.takeIf { list -> list.any { it.severity == Severity.ERROR } }
                        ?: (issues + INTERNAL_FAILURE),
                )
            } else {
                Valid(value, issues)
            }

        private val INTERNAL_FAILURE = Issue(
            path = "",
            code = IssueCode.MALFORMED_JSON,
            message = "Payload could not be assembled",
        )
    }
}

inline fun <T, R> ValidationResult<T>.map(transform: (T) -> R): ValidationResult<R> = when (this) {
    is ValidationResult.Valid -> ValidationResult.Valid(transform(value), issues)
    is ValidationResult.Invalid -> this
}
