package dev.loop.core.contract.validate

import dev.loop.core.contract.domain.PaceBand
import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.domain.PlanId
import dev.loop.core.contract.domain.Section
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.Task
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.domain.TimeWindow
import java.time.LocalDate
import kotlin.math.abs
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject

/**
 * Turns a raw plan payload into either a [Plan] or a complete list of everything wrong
 * with it.
 *
 * Contract, per the brief: never a boolean, never a swallowed exception, and never a
 * fail-fast abort — one pass produces every defect it can find so the user fixes them all
 * in a single trip back to Gmail.
 */
object PlanValidator {

    private val structuralJson = Json { isLenient = false }

    private val PLAN_KEYS = setOf(
        "schema", "type", "date", "plan_id", "rev", "tz", "coach_note",
        "sleep_target_min", "report_gate", "sections", "secret",
    )
    private val SECTION_KEYS = setOf("key", "label", "weight", "color", "tasks")
    private val TASK_KEYS = setOf(
        "key", "label", "mode", "target", "target_min", "window", "priority", "note",
    )
    private val RUN_TARGET_KEYS = setOf("distance_km", "pace_band", "run_type", "duration_min")
    private val LIFT_TARGET_KEYS = setOf("groups", "exercises", "volume_kg", "duration_min")

    private val KEY_FORMAT = Regex("^[a-z0-9]+(?:[._-][a-z0-9]+)*$", RegexOption.IGNORE_CASE)

    private const val WEIGHT_EPSILON = 0.005

    /**
     * @param today used only to warn about plans dated in the past; pass the caller's
     *   logical date so the check follows the 04:00 day boundary rather than midnight.
     */
    fun validate(rawJson: String, today: LocalDate? = null): ValidationResult<Plan> {
        val sink = IssueSink()

        val root = try {
            structuralJson.parseToJsonElement(rawJson)
        } catch (e: SerializationException) {
            // The only genuinely fail-fast case: below well-formed JSON there is nothing
            // to walk, so this is the one path that can report a single issue.
            sink.add(
                path = "",
                code = IssueCode.MALFORMED_JSON,
                message = "The payload is not valid JSON",
                hint = e.message?.take(240),
            )
            return ValidationResult.Invalid(sink.issues)
        }

        if (root !is JsonObject) {
            sink.add("", IssueCode.NOT_AN_OBJECT, "The payload must be a JSON object")
            return ValidationResult.Invalid(sink.issues)
        }

        val cursor = JsonCursor(root, "", sink)
        val plan = readPlan(cursor, sink, today)
        return ValidationResult.of(plan, sink.issues)
    }

    // ------------------------------------------------------------------ plan

    private fun readPlan(cursor: JsonCursor, sink: IssueSink, today: LocalDate?): Plan? {
        cursor.reportUnknownKeys(PLAN_KEYS)

        val schema = cursor.int("schema")
        if (schema != null && schema != Plan.CURRENT_SCHEMA) {
            cursor.issue(
                IssueCode.UNSUPPORTED_SCHEMA,
                "Plan schema v$schema is not supported by this build",
                hint = "this app understands schema v${Plan.CURRENT_SCHEMA}",
                at = "/schema",
            )
        }

        val type = cursor.string("type")
        if (type != null && type != "plan") {
            cursor.issue(
                IssueCode.WRONG_PAYLOAD_TYPE,
                "Expected a plan, found type \"$type\"",
                at = "/type",
            )
        }

        val date = cursor.localDate("date")
        val planId = cursor.string("plan_id")
        val rev = cursor.int("rev", required = false) ?: 1
        if (rev < 1) {
            cursor.issue(
                IssueCode.INVALID_REV,
                "Revision must be 1 or greater",
                hint = "found $rev",
                at = "/rev",
            )
        }
        val tz = cursor.zoneId("tz")
        val coachNote = cursor.string("coach_note", required = false)
        val sleepTarget = cursor.int("sleep_target_min", required = false)
        val reportGate = cursor.localTime("report_gate", required = false)

        if (date != null && today != null && date.isBefore(today)) {
            cursor.issue(
                IssueCode.PLAN_DATE_IN_PAST,
                "This plan is dated $date, which has already passed",
                hint = "it will be archived rather than activated",
                at = "/date",
            )
        }

        val registry = KeyRegistry()
        val sectionCursors = cursor.array("sections")
        val sections = sectionCursors?.mapIndexedNotNull { index, sc ->
            readSection(sc, index, sink, registry)
        }.orEmpty()

        crossCheck(registry, cursor)

        val normalized = normalizeWeights(sections, cursor)

        if (schema == null || date == null || planId == null || tz == null || sectionCursors == null) {
            return null
        }
        if (sink.hasErrors) return null

        return Plan(
            schema = schema,
            planId = PlanId(planId),
            date = date,
            rev = rev,
            tz = tz,
            coachNote = coachNote,
            sleepTargetMin = sleepTarget,
            reportGate = reportGate,
            sections = normalized,
        )
    }

    // ------------------------------------------------------------------ section

    private fun readSection(
        cursor: JsonCursor,
        index: Int,
        sink: IssueSink,
        registry: KeyRegistry,
    ): Section? {
        cursor.asObject() ?: return null
        cursor.reportUnknownKeys(SECTION_KEYS)

        val key = cursor.string("key")
        if (key != null) registry.sections += key to cursor.childPath("key")
        if (key != null && !KEY_FORMAT.matches(key)) {
            cursor.issue(
                IssueCode.INVALID_KEY_FORMAT,
                "Section key \"$key\" is not a valid identifier",
                hint = "use lowercase letters, digits, dots, dashes or underscores",
                at = cursor.childPath("key"),
            )
        }

        val label = cursor.string("label")
        val weight = cursor.double("weight")
        if (weight != null && (weight < 0.0 || weight > 1.0)) {
            cursor.issue(
                IssueCode.INVALID_WEIGHT,
                "Section weight must be between 0 and 1",
                hint = "found $weight",
                at = cursor.childPath("weight"),
            )
        }

        val color = cursor.string("color", required = false) ?: DEFAULT_COLOR
        if (!Vocabulary.isKnownColor(color)) {
            cursor.issue(
                IssueCode.UNKNOWN_COLOR,
                "Colour \"$color\" is not one of the built-in section accents",
                hint = "a neutral accent will be used; known: ${Vocabulary.COLORS.joinToString()}",
                at = cursor.childPath("color"),
            )
        }

        val sectionKey = key?.let { SectionKey(it) }
        val taskCursors = cursor.array("tasks", required = true, allowEmpty = true)
        if (taskCursors != null && taskCursors.isEmpty()) {
            cursor.issue(
                IssueCode.SECTION_HAS_NO_TASKS,
                "Section \"${label ?: key}\" has no tasks",
                hint = "it will be excluded from the day score rather than counted as zero",
                at = cursor.childPath("tasks"),
            )
        }

        val tasks = taskCursors?.mapIndexedNotNull { taskIndex, tc ->
            readTask(tc, sectionKey ?: SectionKey(""), taskIndex, sink, registry)
        }.orEmpty()

        if (key == null || label == null || weight == null) return null

        return Section(
            key = SectionKey(key),
            label = label,
            weight = weight,
            declaredWeight = weight,
            color = Vocabulary.normalize(color),
            tasks = tasks,
            sortOrder = index,
        )
    }

    // ------------------------------------------------------------------ task

    private fun readTask(
        cursor: JsonCursor,
        sectionKey: SectionKey,
        index: Int,
        sink: IssueSink,
        registry: KeyRegistry,
    ): Task? {
        cursor.asObject() ?: return null
        cursor.reportUnknownKeys(TASK_KEYS)

        val key = cursor.string("key")
        if (key != null) registry.tasks += key to cursor.childPath("key")
        if (key != null && !KEY_FORMAT.matches(key)) {
            cursor.issue(
                IssueCode.INVALID_KEY_FORMAT,
                "Task key \"$key\" is not a valid identifier",
                hint = "use lowercase letters, digits, dots, dashes or underscores",
                at = cursor.childPath("key"),
            )
        }

        val label = cursor.string("label")
        val modeText = cursor.string("mode")
        val mode = modeText?.let { TaskMode.fromWire(it) }
        if (modeText != null && mode == null) {
            cursor.issue(
                IssueCode.UNKNOWN_MODE,
                "Unknown task mode \"$modeText\"",
                hint = "expected one of ${TaskMode.entries.joinToString { it.wire }}",
                at = cursor.childPath("mode"),
            )
        }

        val priority = cursor.int("priority", required = false) ?: Task.DEFAULT_PRIORITY
        if (priority < 1) {
            cursor.issue(
                IssueCode.INVALID_PRIORITY,
                "Priority must be 1 or greater, where 1 is most important",
                hint = "found $priority",
                at = cursor.childPath("priority"),
            )
        }

        val window = cursor.string("window", required = false)?.let { readWindow(cursor, it) }
        val note = cursor.string("note", required = false)
        val target = mode?.let { readTarget(cursor, it) }

        if (key == null || label == null || mode == null || target == null) return null

        return Task(
            key = TaskKey(key),
            sectionKey = sectionKey,
            label = label,
            mode = mode,
            target = target,
            window = window,
            priority = priority.coerceAtLeast(1),
            note = note,
            sortOrder = index,
        )
    }

    private fun readWindow(cursor: JsonCursor, text: String): TimeWindow? {
        val parts = text.split('-', '–')
        if (parts.size != 2) {
            cursor.issue(
                IssueCode.INVALID_WINDOW,
                "Window must be two times separated by a dash",
                hint = "expected HH:mm-HH:mm, found \"$text\"",
                at = cursor.childPath("window"),
            )
            return null
        }
        val start = cursor.parseTime(parts[0], cursor.childPath("window"), "window") ?: return null
        val end = cursor.parseTime(parts[1], cursor.childPath("window"), "window") ?: return null
        return TimeWindow(start, end)
    }

    // ------------------------------------------------------------------ targets

    /**
     * SPEC.md §3.1 is asymmetric here: `timer` carries a top-level `target_min` while
     * `run` and `lift` nest everything under `target`. Loop accepts only that exact shape
     * — a strict validator that quietly repairs a misplaced field would let Claude drift
     * — and reports the mismatch with the correction spelled out.
     */
    private fun readTarget(cursor: JsonCursor, mode: TaskMode): TaskTarget? = when (mode) {
        TaskMode.TIMER -> readTimerTarget(cursor)
        TaskMode.RUN -> readRunTarget(cursor)
        TaskMode.LIFT -> readLiftTarget(cursor)
        TaskMode.STATUS -> {
            rejectStrayTarget(cursor, mode)
            TaskTarget.Status
        }
        TaskMode.CHECK -> {
            rejectStrayTarget(cursor, mode)
            TaskTarget.Check
        }
    }

    private fun rejectStrayTarget(cursor: JsonCursor, mode: TaskMode) {
        if (cursor.has("target") || cursor.has("target_min")) {
            cursor.issue(
                IssueCode.TARGET_SHAPE_MISMATCH,
                "A \"${mode.wire}\" task takes no target",
                hint = "remove \"target\"/\"target_min\" or change the mode",
                at = cursor.childPath("target"),
            )
        }
    }

    private fun readTimerTarget(cursor: JsonCursor): TaskTarget? {
        if (cursor.has("target") && !cursor.has("target_min")) {
            cursor.issue(
                IssueCode.TARGET_SHAPE_MISMATCH,
                "A \"timer\" task declares its target as top-level \"target_min\"",
                hint = "write \"target_min\": 90 instead of a \"target\" object",
                at = cursor.childPath("target"),
            )
            return null
        }
        val minutes = cursor.int("target_min") ?: return null
        if (minutes <= 0) {
            cursor.issue(
                IssueCode.INVALID_TARGET_VALUE,
                "\"target_min\" must be greater than zero",
                hint = "found $minutes",
                at = cursor.childPath("target_min"),
            )
            return null
        }
        return TaskTarget.Timed(minutes)
    }

    private fun readRunTarget(cursor: JsonCursor): TaskTarget? {
        if (cursor.has("target_min")) {
            cursor.issue(
                IssueCode.TARGET_SHAPE_MISMATCH,
                "A \"run\" task nests its target under \"target\", not \"target_min\"",
                hint = "use \"target\": { \"distance_km\": …, \"pace_band\": […] }",
                at = cursor.childPath("target_min"),
            )
        }
        val target = cursor.cursor("target") ?: run {
            cursor.issue(
                IssueCode.MISSING_TARGET,
                "A \"run\" task requires a \"target\" object",
                hint = "expected distance_km, pace_band and run_type",
                at = cursor.childPath("target"),
            )
            return null
        }
        target.asObject() ?: return null
        target.reportUnknownKeys(RUN_TARGET_KEYS)

        val distance = target.double("distance_km", required = false)
        if (distance != null && distance <= 0.0) {
            target.issue(
                IssueCode.INVALID_TARGET_VALUE,
                "\"distance_km\" must be greater than zero",
                hint = "found $distance",
                at = target.childPath("distance_km"),
            )
        }
        val durationMin = target.int("duration_min", required = false)
        val paceBand = readPaceBand(target)
        val runType = target.string("run_type", required = false)
        if (runType != null && !Vocabulary.isKnownRunType(runType)) {
            target.issue(
                IssueCode.UNKNOWN_RUN_TYPE,
                "Run type \"$runType\" is not in the known vocabulary",
                hint = "scoring compares it literally; known: ${Vocabulary.RUN_TYPES.joinToString()}",
                at = target.childPath("run_type"),
            )
        }

        if (distance == null && durationMin == null) {
            target.issue(
                IssueCode.MISSING_TARGET,
                "A run target needs at least a distance or a duration",
                at = target.path,
            )
            return null
        }

        return TaskTarget.Run(
            distanceKm = distance,
            paceBand = paceBand,
            runType = runType?.let { Vocabulary.normalize(it) },
            durationMin = durationMin,
        )
    }

    private fun readPaceBand(target: JsonCursor): PaceBand? {
        if (!target.has("pace_band")) return null
        val values = target.stringArray("pace_band") ?: return null
        if (values.size != 2) {
            target.issue(
                IssueCode.INVALID_PACE_BAND,
                "\"pace_band\" must hold exactly two paces",
                hint = "expected [\"5:40\", \"6:10\"], found ${values.size} value(s)",
                at = target.childPath("pace_band"),
            )
            return null
        }
        val seconds = values.map { text ->
            parsePaceSeconds(text) ?: run {
                target.issue(
                    IssueCode.INVALID_PACE_BAND,
                    "\"$text\" is not a valid pace",
                    hint = "expected mm:ss per kilometre",
                    at = target.childPath("pace_band"),
                )
                null
            }
        }
        if (seconds.any { it == null }) return null
        val lo = seconds[0]!!
        val hi = seconds[1]!!
        if (lo > hi) {
            target.issue(
                IssueCode.INVALID_PACE_BAND,
                "Pace band is reversed: the faster pace must come first",
                hint = "found [${values[0]}, ${values[1]}]",
                at = target.childPath("pace_band"),
            )
            return null
        }
        if (lo == hi) {
            // §6 decays across a margin of (hi − lo); a zero margin makes the band an
            // exact match test, which is almost certainly not what was intended.
            target.issue(
                IssueCode.DEGENERATE_PACE_BAND,
                "Pace band has zero width, so any deviation scores zero",
                hint = "widen it, e.g. [\"${values[0]}\", \"${PaceBand.formatPace(hi + 30)}\"]",
                at = target.childPath("pace_band"),
            )
        }
        return PaceBand(lo, hi)
    }

    /** Parses `mm:ss` (or plain seconds) into seconds per kilometre. */
    fun parsePaceSeconds(text: String): Int? {
        val trimmed = text.trim()
        if (!trimmed.contains(':')) return trimmed.toIntOrNull()?.takeIf { it > 0 }
        val parts = trimmed.split(':')
        if (parts.size != 2) return null
        val minutes = parts[0].toIntOrNull() ?: return null
        val seconds = parts[1].toIntOrNull() ?: return null
        if (minutes < 0 || seconds < 0 || seconds > 59) return null
        return minutes * 60 + seconds
    }

    private fun readLiftTarget(cursor: JsonCursor): TaskTarget? {
        if (cursor.has("target_min")) {
            cursor.issue(
                IssueCode.TARGET_SHAPE_MISMATCH,
                "A \"lift\" task nests its target under \"target\", not \"target_min\"",
                hint = "use \"target\": { \"groups\": […], \"exercises\": … }",
                at = cursor.childPath("target_min"),
            )
        }
        val target = cursor.cursor("target") ?: run {
            cursor.issue(
                IssueCode.MISSING_TARGET,
                "A \"lift\" task requires a \"target\" object",
                hint = "expected groups, exercises, volume_kg and duration_min",
                at = cursor.childPath("target"),
            )
            return null
        }
        target.asObject() ?: return null
        target.reportUnknownKeys(LIFT_TARGET_KEYS)

        val groups = target.stringArray("groups", required = false).orEmpty()
        groups.filterNot { Vocabulary.isKnownGroup(it) }.forEach { group ->
            target.issue(
                IssueCode.UNKNOWN_MUSCLE_GROUP,
                "Muscle group \"$group\" is not in the known vocabulary",
                hint = "known: ${Vocabulary.MUSCLE_GROUPS.joinToString()}",
                at = target.childPath("groups"),
            )
        }
        val exercises = target.int("exercises", required = false)
        if (exercises != null && exercises <= 0) {
            target.issue(
                IssueCode.INVALID_TARGET_VALUE,
                "\"exercises\" must be greater than zero",
                hint = "found $exercises",
                at = target.childPath("exercises"),
            )
        }
        val volume = target.double("volume_kg", required = false)
        if (volume != null && volume <= 0.0) {
            target.issue(
                IssueCode.INVALID_TARGET_VALUE,
                "\"volume_kg\" must be greater than zero",
                hint = "found $volume",
                at = target.childPath("volume_kg"),
            )
        }
        val duration = target.int("duration_min", required = false)

        return TaskTarget.Lift(
            groups = groups.map { Vocabulary.normalize(it) },
            exercises = exercises,
            volumeKg = volume,
            durationMin = duration,
        )
    }

    // ------------------------------------------------------------------ cross-cutting

    /**
     * Keys collected as they are read, independently of whether the surrounding object
     * assembled successfully.
     *
     * Collision checks must not be gated on a section parsing cleanly: a duplicate
     * `task_key` sitting next to an unrelated type error is exactly the payload that
     * would otherwise reach Room and silently merge two different tasks into one history.
     */
    private class KeyRegistry {
        val sections = mutableListOf<Pair<String, String>>()
        val tasks = mutableListOf<Pair<String, String>>()
    }

    private fun crossCheck(registry: KeyRegistry, cursor: JsonCursor) {
        reportDuplicates(
            entries = registry.sections,
            cursor = cursor,
            code = IssueCode.DUPLICATE_SECTION_KEY,
            noun = "Section",
        )
        // Task keys are global, not per-section: they are the join key for history,
        // streaks and staleness across days, so a collision corrupts all three.
        reportDuplicates(
            entries = registry.tasks,
            cursor = cursor,
            code = IssueCode.DUPLICATE_TASK_KEY,
            noun = "Task",
        )
    }

    private fun reportDuplicates(
        entries: List<Pair<String, String>>,
        cursor: JsonCursor,
        code: IssueCode,
        noun: String,
    ) {
        entries.groupBy({ it.first }, { it.second })
            .filterValues { it.size > 1 }
            .forEach { (key, paths) ->
                // Reported at every site so the UI can highlight whichever the user opens.
                paths.forEach { path ->
                    val others = paths.filterNot { it == path }
                    cursor.issue(
                        code,
                        "$noun key \"$key\" is used more than once",
                        hint = "also at ${others.joinToString()}",
                        at = path,
                    )
                }
            }
    }

    /**
     * Rescales section weights to sum to 1.0.
     *
     * Rejecting the plan over a rounding error would cost the user the entire day, so
     * Loop normalises and warns. The original value is kept in [Section.declaredWeight]
     * and echoed back to Claude so the drift is visible and correctable at the source.
     */
    private fun normalizeWeights(sections: List<Section>, cursor: JsonCursor): List<Section> {
        if (sections.isEmpty()) return sections
        val total = sections.sumOf { it.weight }
        if (total <= 0.0) {
            cursor.issue(
                IssueCode.INVALID_WEIGHT,
                "Section weights sum to zero, so no section could ever contribute",
                at = "/sections",
            )
            return sections
        }
        if (abs(total - 1.0) <= WEIGHT_EPSILON) return sections

        cursor.issue(
            IssueCode.WEIGHTS_NOT_NORMALIZED,
            "Section weights sum to ${"%.3f".format(total)}, not 1.0",
            hint = "they were rescaled proportionally",
            at = "/sections",
        )
        return sections.map { it.copy(weight = it.weight / total) }
    }

    private const val DEFAULT_COLOR = "indigo"
}
