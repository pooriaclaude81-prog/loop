package dev.loop.core.contract.domain

import com.google.common.truth.Truth.assertThat
import dev.loop.core.contract.json.LoopJson
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Test

class ReportSerializationTest {

    private fun report(
        dayScore: Double? = 0.72,
        sectionScores: Map<String, Double?> = mapOf("study" to 0.81, "exercise" to 0.60),
        state: RollingState = RollingState(daysObserved = 14, scores14d = listOf(0.81, 0.66, 0.90)),
    ) = Report(
        date = LocalDate.of(2026, 8, 15),
        planId = PlanId("a4f9-0815"),
        planRev = 1,
        tz = ZoneId.of("Asia/Tehran"),
        appVersion = "0.1.0-M1",
        generatedAt = Instant.parse("2026-08-15T18:00:00Z"),
        dayScore = dayScore,
        sectionScores = sectionScores,
        state = state,
        userNote = "Slept badly, migraine until noon.",
    )

    @Test
    fun `report round-trips`() {
        val original = report()
        val decoded = LoopJson.decodeFromString<Report>(LoopJson.encodeToString(original))

        assertThat(decoded).isEqualTo(original)
    }

    @Test
    fun `wire field names match SPEC section 3_2`() {
        val json = LoopJson.encodeToString(report()).let { Json.parseToJsonElement(it).jsonObject }

        assertThat(json.keys).containsAtLeast(
            "type", "date", "plan_id", "day_score", "section_scores", "state", "user_note",
        )
        assertThat(json["type"]!!.jsonPrimitive.content).isEqualTo("report")
        assertThat(json["date"]!!.jsonPrimitive.content).isEqualTo("2026-08-15")
    }

    @Test
    fun `an unscorable section serialises as null, never as zero`() {
        // §6 computes the day score as Σ wᵢ·sᵢ, which caps a planned rest day below 1.0
        // and contradicts §7's "rest days are planned, not failures". Loop distinguishes
        // "empty" from "failed" on the wire so Claude can too.
        val json = LoopJson.encodeToString(report(sectionScores = mapOf("exercise" to null)))
        val scores = Json.parseToJsonElement(json).jsonObject["section_scores"]!!.jsonObject

        assertThat(scores["exercise"].toString()).isEqualTo("null")
    }

    @Test
    fun `calibration with nothing planned serialises as null, not zero`() {
        // §7 step 3 tells Claude to cut targets when calibration < 0.8. A zero here would
        // make it cut a section that was deliberately never planned.
        val state = RollingState(
            daysObserved = 3,
            calibration = mapOf("study" to 0.71, "exercise" to null),
        )
        val json = LoopJson.encodeToString(report(state = state))
        val calibration = Json.parseToJsonElement(json)
            .jsonObject["state"]!!.jsonObject["calibration"]!!.jsonObject

        assertThat(calibration["exercise"].toString()).isEqualTo("null")
        assertThat(calibration["study"]!!.jsonPrimitive.content).isEqualTo("0.71")
    }

    @Test
    fun `days_observed travels so a short history is not read as a trend`() {
        val json = LoopJson.encodeToString(report(state = RollingState(daysObserved = 3)))
        val state = Json.parseToJsonElement(json).jsonObject["state"]!!.jsonObject

        assertThat(state["days_observed"]!!.jsonPrimitive.content).isEqualTo("3")
    }

    @Test
    fun `task actuals round-trip across every mode`() {
        val actuals: List<TaskActual> = listOf(
            TaskActual.Timed(focusedMin = 90, wallClockSpanMin = 300, sessionCount = 4, overflowMin = 12),
            TaskActual.Run(distanceKm = 5.1, durationMin = 29.5, runType = "easy", rpe = 4),
            TaskActual.Lift(
                sets = listOf(LiftSet("bench", 4, 8, 60.0)),
                durationMin = 58.0,
                groups = listOf("chest"),
            ),
            TaskActual.Status(StatusValue.IN_PROGRESS, nextAction = "Draft the results table"),
            TaskActual.Check(done = true),
        )

        actuals.forEach { actual ->
            val decoded = LoopJson.decodeFromString<TaskActual>(LoopJson.encodeToString(actual))
            assertThat(decoded).isEqualTo(actual)
        }
    }

    @Test
    fun `targets round-trip across every mode`() {
        val targets: List<TaskTarget> = listOf(
            TaskTarget.Timed(90),
            TaskTarget.Run(5.0, PaceBand(340, 370), "easy", null),
            TaskTarget.Lift(listOf("chest", "triceps"), 5, 8000.0, 60),
            TaskTarget.Status,
            TaskTarget.Check,
        )

        targets.forEach { target ->
            val decoded = LoopJson.decodeFromString<TaskTarget>(LoopJson.encodeToString(target))
            assertThat(decoded).isEqualTo(target)
        }
    }

    @Test
    fun `derived run pace is seconds per km and survives a zero distance`() {
        assertThat(TaskActual.Run(distanceKm = 5.0, durationMin = 30.0).paceSecPerKm).isEqualTo(360)
        assertThat(TaskActual.Run(distanceKm = 0.0, durationMin = 30.0).paceSecPerKm).isNull()
        assertThat(TaskActual.Run(distanceKm = 5.0, durationMin = null).paceSecPerKm).isNull()
    }

    @Test
    fun `lift volume and exercise count derive from the sets`() {
        val lift = TaskActual.Lift(
            sets = listOf(
                LiftSet("bench", 4, 8, 60.0),
                LiftSet("bench", 1, 5, 70.0),
                LiftSet("dips", 3, 10, 0.0),
            ),
        )

        assertThat(lift.volumeKg).isEqualTo(4 * 8 * 60.0 + 1 * 5 * 70.0)
        assertThat(lift.exerciseCount).isEqualTo(2)
    }

    @Test
    fun `status scores follow SPEC section 6 exactly`() {
        assertThat(StatusValue.NOT_STARTED.score).isEqualTo(0.0)
        assertThat(StatusValue.IN_PROGRESS.score).isEqualTo(0.5)
        assertThat(StatusValue.DONE.score).isEqualTo(1.0)
    }

    @Test
    fun `a carried day nests a whole report`() {
        val yesterday = report().copy(
            date = LocalDate.of(2026, 8, 14),
            status = ReportStatus.CARRIED,
        )
        val today = report().copy(
            carried = listOf(CarriedDay(LocalDate.of(2026, 8, 14), yesterday)),
        )

        val decoded = LoopJson.decodeFromString<Report>(LoopJson.encodeToString(today))

        assertThat(decoded.carried).hasSize(1)
        assertThat(decoded.carried.single().report.status).isEqualTo(ReportStatus.CARRIED)
    }

    @Test
    fun `health block carries every SPEC section 1_4 derived metric`() {
        val health = HealthBlock(
            asleepMin = 310,
            inBedMin = 348,
            bedtime = LocalTime.of(1, 40),
            wakeTime = LocalTime.of(7, 5),
            efficiency = 0.89,
            midpoint = LocalTime.of(4, 22),
            midpointDeviationMin = 52,
            sleepDebtMin = 240,
            rhrDelta = 6,
            wakeToStartMin = 145,
            hygiene = 0.44,
            source = DataSource.HEALTH_CONNECT,
        )
        val decoded = LoopJson.decodeFromString<HealthBlock>(LoopJson.encodeToString(health))

        assertThat(decoded).isEqualTo(health)
    }
}
