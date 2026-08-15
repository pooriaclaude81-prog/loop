package dev.loop.core.contract.validate

import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.DEFAULT_SECTIONS
import dev.loop.core.contract.SPEC_PLAN_JSON
import dev.loop.core.contract.domain.PaceBand
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.planJson
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import org.junit.Test

class PlanValidatorTest {

    private fun valid(json: String) = PlanValidator.validate(json) as? ValidationResult.Valid
        ?: error(
            "expected Valid, got: " +
                (PlanValidator.validate(json) as ValidationResult.Invalid).issues.joinToString("\n"),
        )

    private fun invalid(json: String) = PlanValidator.validate(json) as? ValidationResult.Invalid
        ?: error("expected Invalid, but the payload parsed")

    private fun codesAt(result: ValidationResult<*>, path: String): List<IssueCode> =
        result.issues.filter { it.path == path }.map { it.code }

    // ------------------------------------------------------------------ happy path

    @Test
    fun `SPEC section 3_1 example plan parses`() {
        val plan = valid(SPEC_PLAN_JSON).value

        assertThat(plan.schema).isEqualTo(1)
        assertThat(plan.planId.value).isEqualTo("a4f9-0816")
        assertThat(plan.date).isEqualTo(LocalDate.of(2026, 8, 16))
        assertThat(plan.rev).isEqualTo(1)
        assertThat(plan.tz).isEqualTo(ZoneId.of("Asia/Tehran"))
        assertThat(plan.sleepTargetMin).isEqualTo(450)
        assertThat(plan.reportGate).isEqualTo(LocalTime.of(21, 30))
        assertThat(plan.sections.map { it.key.value })
            .containsExactly("study", "exercise", "research", "thesis").inOrder()
        assertThat(plan.allTasks).hasSize(6)
    }

    @Test
    fun `SPEC example produces no errors and no warnings`() {
        val result = valid(SPEC_PLAN_JSON)
        assertThat(result.issues).isEmpty()
    }

    @Test
    fun `timer target reads top-level target_min`() {
        val plan = valid(SPEC_PLAN_JSON).value
        val cardio = plan.task(TaskKey("study.cardio"))!!

        assertThat(cardio.mode).isEqualTo(TaskMode.TIMER)
        assertThat(cardio.target).isEqualTo(TaskTarget.Timed(90))
        assertThat(cardio.window?.start).isEqualTo(LocalTime.of(10, 0))
        assertThat(cardio.window?.end).isEqualTo(LocalTime.of(12, 0))
        assertThat(cardio.priority).isEqualTo(1)
    }

    @Test
    fun `run target parses pace band into seconds per km, faster bound first`() {
        val plan = valid(SPEC_PLAN_JSON).value
        val run = plan.task(TaskKey("ex.run"))!!.target as TaskTarget.Run

        assertThat(run.distanceKm).isEqualTo(5.0)
        assertThat(run.runType).isEqualTo("easy")
        assertThat(run.paceBand).isEqualTo(PaceBand(loSecPerKm = 340, hiSecPerKm = 370))
        assertThat(run.paceBand!!.marginSec).isEqualTo(30)
    }

    @Test
    fun `lift target parses groups and volume`() {
        val plan = valid(SPEC_PLAN_JSON).value
        val lift = plan.task(TaskKey("ex.gym"))!!.target as TaskTarget.Lift

        assertThat(lift.groups).containsExactly("chest", "triceps").inOrder()
        assertThat(lift.exercises).isEqualTo(5)
        assertThat(lift.volumeKg).isEqualTo(8000.0)
        assertThat(lift.durationMin).isEqualTo(60)
    }

    @Test
    fun `status task needs no target and keeps its note`() {
        val plan = valid(SPEC_PLAN_JSON).value
        val thesis = plan.task(TaskKey("th.gholami"))!!

        assertThat(thesis.target).isEqualTo(TaskTarget.Status)
        assertThat(thesis.note).isEqualTo("4 days untouched")
        assertThat(thesis.priority).isEqualTo(1) // default when absent
    }

    @Test
    fun `missing priority defaults to 1 so a section with none scores as a plain mean`() {
        val plan = valid(SPEC_PLAN_JSON).value
        val exercise = plan.section(SectionKey("exercise"))!!

        assertThat(exercise.tasks.map { it.priority }).containsExactly(1, 1)
        assertThat(exercise.tasks.map { it.priorityWeight }).containsExactly(1.0, 1.0)
    }

    // ------------------------------------------------------- the six malformed plans

    /** 1 — syntax. Nothing below well-formed JSON can be walked. */
    @Test
    fun `malformed 1 - truncated json reports MALFORMED_JSON`() {
        val result = invalid(SPEC_PLAN_JSON.substringBefore("\"sections\""))

        assertThat(result.errors.map { it.code }).containsExactly(IssueCode.MALFORMED_JSON)
        assertThat(result.errors.single().path).isEmpty()
    }

    /** 2 — envelope: a schema this build does not implement. */
    @Test
    fun `malformed 2 - unsupported schema version reports at slash schema`() {
        val result = invalid(planJson(schema = "2"))

        assertThat(codesAt(result, "/schema")).containsExactly(IssueCode.UNSUPPORTED_SCHEMA)
    }

    /** 3 — type mismatch: the classic quoted number. */
    @Test
    fun `malformed 3 - weight as a quoted string reports TYPE_MISMATCH`() {
        val sections = DEFAULT_SECTIONS.replace("\"weight\": 1.0", "\"weight\": \"0.40\"")
        val result = invalid(planJson(sections = sections))

        assertThat(codesAt(result, "/sections/0/weight")).containsExactly(IssueCode.TYPE_MISMATCH)
        assertThat(result.errors.single().hint).contains("remove the quotes")
    }

    /** 4 — domain range: weights that cannot produce a day score in [0,1]. */
    @Test
    fun `malformed 4 - weights not summing to one are normalised with a warning`() {
        val sections = """
            [
              { "key": "study", "label": "Study", "weight": 0.40, "color": "indigo",
                "tasks": [ { "key": "s.a", "label": "A", "mode": "timer", "target_min": 30 } ]},
              { "key": "research", "label": "Research", "weight": 0.45, "color": "teal",
                "tasks": [ { "key": "r.a", "label": "B", "mode": "timer", "target_min": 30 } ]}
            ]
        """.trimIndent()
        val result = valid(planJson(sections = sections))

        assertThat(codesAt(result, "/sections")).containsExactly(IssueCode.WEIGHTS_NOT_NORMALIZED)
        // Rescaled, not rejected: losing the whole day to a rounding error is the worse bug.
        assertThat(result.value.sections.sumOf { it.weight }).isWithin(1e-9).of(1.0)
        assertThat(result.value.sections[0].weight).isWithin(1e-9).of(0.40 / 0.85)
        assertThat(result.value.sections[0].declaredWeight).isEqualTo(0.40)
    }

    /** 5 — mode/target shape mismatch. */
    @Test
    fun `malformed 5 - run task carrying target_min reports TARGET_SHAPE_MISMATCH`() {
        val sections = """
            [
              { "key": "exercise", "label": "Exercise", "weight": 1.0, "color": "amber",
                "tasks": [ { "key": "ex.run", "label": "Easy 5k", "mode": "run", "target_min": 40 } ]}
            ]
        """.trimIndent()
        val result = invalid(planJson(sections = sections))

        assertThat(codesAt(result, "/sections/0/tasks/0/target_min"))
            .contains(IssueCode.TARGET_SHAPE_MISMATCH)
        assertThat(codesAt(result, "/sections/0/tasks/0/target"))
            .contains(IssueCode.MISSING_TARGET)
    }

    /** 6 — referential integrity: the key that joins history across days. */
    @Test
    fun `malformed 6 - duplicate task key is reported at both sites`() {
        val sections = """
            [
              { "key": "study", "label": "Study", "weight": 0.5, "color": "indigo",
                "tasks": [ { "key": "dup.key", "label": "A", "mode": "timer", "target_min": 30 } ]},
              { "key": "research", "label": "Research", "weight": 0.5, "color": "teal",
                "tasks": [ { "key": "dup.key", "label": "B", "mode": "timer", "target_min": 30 } ]}
            ]
        """.trimIndent()
        val result = invalid(planJson(sections = sections))

        val duplicates = result.errors.filter { it.code == IssueCode.DUPLICATE_TASK_KEY }
        assertThat(duplicates.map { it.path })
            .containsExactly("/sections/0/tasks/0/key", "/sections/1/tasks/0/key")
    }

    // ------------------------------------------------------------------ accumulation

    @Test
    fun `one pass reports every defect rather than stopping at the first`() {
        val sections = """
            [
              { "key": "study", "label": "Study", "weight": "0.4", "color": "indigo",
                "tasks": [ { "key": "s.a", "label": "A", "mode": "nope", "target_min": 30 } ]},
              { "key": "study", "label": "Study again", "weight": 0.3, "color": "indigo",
                "tasks": [ { "key": "s.b", "label": "B", "mode": "timer" } ]}
            ]
        """.trimIndent()
        val result = invalid(planJson(schema = "9", tz = "\"Mars/Olympus\"", sections = sections))

        assertThat(result.errors.map { it.code }).containsAtLeast(
            IssueCode.UNSUPPORTED_SCHEMA,
            IssueCode.INVALID_TIMEZONE,
            IssueCode.TYPE_MISMATCH,
            IssueCode.UNKNOWN_MODE,
            IssueCode.DUPLICATE_SECTION_KEY,
            IssueCode.MISSING_FIELD,
        )
        // A fail-fast parser would have reported exactly one of these.
        assertThat(result.errors.size).isAtLeast(6)
    }

    // ------------------------------------------------------------------ forward compat

    @Test
    fun `unknown fields are warnings, not errors`() {
        val json = planJson().trim().dropLast(1) + """, "mood_forecast": "chaotic" }"""
        val result = valid(json)

        assertThat(result.errors).isEmpty()
        assertThat(codesAt(result, "/mood_forecast")).containsExactly(IssueCode.UNKNOWN_FIELD)
    }

    @Test
    fun `unknown run type still parses but warns because scoring compares literally`() {
        val sections = """
            [
              { "key": "exercise", "label": "Exercise", "weight": 1.0, "color": "amber",
                "tasks": [ { "key": "ex.run", "label": "Run", "mode": "run",
                  "target": { "distance_km": 5, "run_type": "Easy Jog" } } ]}
            ]
        """.trimIndent()
        val result = valid(planJson(sections = sections))

        assertThat(codesAt(result, "/sections/0/tasks/0/target/run_type"))
            .containsExactly(IssueCode.UNKNOWN_RUN_TYPE)
        val run = result.value.allTasks.single().target as TaskTarget.Run
        assertThat(run.runType).isEqualTo("easy_jog")
    }

    // ------------------------------------------------------------------ pace bands

    @Test
    fun `reversed pace band is rejected`() {
        val result = invalid(runPlanWithBand("""["6:10","5:40"]"""))
        assertThat(codesAt(result, "/sections/0/tasks/0/target/pace_band"))
            .contains(IssueCode.INVALID_PACE_BAND)
    }

    @Test
    fun `pace with sixty-plus seconds is rejected`() {
        val result = invalid(runPlanWithBand("""["5:70","6:10"]"""))
        assertThat(codesAt(result, "/sections/0/tasks/0/target/pace_band"))
            .contains(IssueCode.INVALID_PACE_BAND)
    }

    @Test
    fun `zero-width pace band warns because the decay margin becomes zero`() {
        val result = valid(runPlanWithBand("""["5:40","5:40"]"""))
        assertThat(codesAt(result, "/sections/0/tasks/0/target/pace_band"))
            .containsExactly(IssueCode.DEGENERATE_PACE_BAND)
    }

    private fun runPlanWithBand(band: String): String = planJson(
        sections = """
            [
              { "key": "exercise", "label": "Exercise", "weight": 1.0, "color": "amber",
                "tasks": [ { "key": "ex.run", "label": "Run", "mode": "run",
                  "target": { "distance_km": 5, "pace_band": $band, "run_type": "easy" } } ]}
            ]
        """.trimIndent(),
    )

    // ------------------------------------------------------------------ misc rules

    @Test
    fun `empty section warns and is marked unscorable rather than counted as zero`() {
        val sections = """
            [
              { "key": "study", "label": "Study", "weight": 0.5, "color": "indigo",
                "tasks": [ { "key": "s.a", "label": "A", "mode": "timer", "target_min": 30 } ]},
              { "key": "exercise", "label": "Exercise", "weight": 0.5, "color": "amber",
                "tasks": [] }
            ]
        """.trimIndent()
        val result = valid(planJson(sections = sections))

        assertThat(codesAt(result, "/sections/1/tasks"))
            .containsExactly(IssueCode.SECTION_HAS_NO_TASKS)
        assertThat(result.value.section(SectionKey("exercise"))!!.isScorable).isFalse()
    }

    @Test
    fun `window crossing midnight is accepted and flagged`() {
        val sections = DEFAULT_SECTIONS.replace(
            "\"target_min\": 90",
            "\"target_min\": 90, \"window\": \"23:00-01:00\"",
        )
        val plan = valid(planJson(sections = sections)).value

        assertThat(plan.allTasks.single().window!!.crossesMidnight).isTrue()
    }

    @Test
    fun `malformed window is an error with the expected format spelled out`() {
        val sections = DEFAULT_SECTIONS.replace(
            "\"target_min\": 90",
            "\"target_min\": 90, \"window\": \"10am to noon\"",
        )
        val result = invalid(planJson(sections = sections))

        assertThat(codesAt(result, "/sections/0/tasks/0/window"))
            .contains(IssueCode.INVALID_WINDOW)
    }

    @Test
    fun `status task carrying a target is rejected`() {
        val sections = """
            [
              { "key": "thesis", "label": "Theses", "weight": 1.0, "color": "coral",
                "tasks": [ { "key": "th.a", "label": "A", "mode": "status", "target_min": 30 } ]}
            ]
        """.trimIndent()
        val result = invalid(planJson(sections = sections))

        assertThat(codesAt(result, "/sections/0/tasks/0/target"))
            .contains(IssueCode.TARGET_SHAPE_MISMATCH)
    }

    @Test
    fun `report payload submitted as a plan is rejected`() {
        val result = invalid(planJson(type = "\"report\""))
        assertThat(codesAt(result, "/type")).containsExactly(IssueCode.WRONG_PAYLOAD_TYPE)
    }

    @Test
    fun `plan dated in the past warns but still parses`() {
        val result = PlanValidator.validate(planJson(), today = LocalDate.of(2026, 8, 20))

        assertThat(result).isInstanceOf(ValidationResult.Valid::class.java)
        assertThat(result.errors).isEmpty()
        assertThat(codesAt(result, "/date")).containsExactly(IssueCode.PLAN_DATE_IN_PAST)
    }

    @Test
    fun `plan dated today or later raises no date warning`() {
        val result = PlanValidator.validate(planJson(), today = LocalDate.of(2026, 8, 16))

        assertThat(result.issues.map { it.code }).doesNotContain(IssueCode.PLAN_DATE_IN_PAST)
    }

    @Test
    fun `top-level array is rejected without a crash`() {
        val result = invalid("[]")
        assertThat(result.errors.map { it.code }).containsExactly(IssueCode.NOT_AN_OBJECT)
    }

    @Test
    fun `empty string is rejected without a crash`() {
        val result = invalid("")
        assertThat(result.errors.map { it.code }).containsExactly(IssueCode.MALFORMED_JSON)
    }

    @Test
    fun `zero weights are rejected because no section could contribute`() {
        val sections = DEFAULT_SECTIONS.replace("\"weight\": 1.0", "\"weight\": 0.0")
        val result = invalid(planJson(sections = sections))

        assertThat(codesAt(result, "/sections")).contains(IssueCode.INVALID_WEIGHT)
    }
}
