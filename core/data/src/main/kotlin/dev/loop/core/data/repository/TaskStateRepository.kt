package dev.loop.core.data.repository

import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.StatusValue
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.db.TaskStateEntity
import dev.loop.core.data.mapper.toActual
import dev.loop.core.data.mapper.toJson
import dev.loop.core.data.util.Clocks
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/** Domain view of one task's state on one logical day. */
data class TaskDayState(
    val taskKey: TaskKey,
    val sectionKey: SectionKey,
    val date: LocalDate,
    val status: StatusValue,
    val actual: TaskActual?,
    /**
     * Computed continuously but deliberately not surfaced before the review gate — the
     * *day* score is what §5.1 hides, while per-task progress stays visible all day.
     */
    val score: Double?,
    val overflowMin: Int,
)

@Singleton
class TaskStateRepository @Inject constructor(
    db: LoopDatabase,
    private val clocks: Clocks,
) {

    private val dao = db.taskStateDao()

    fun observeForDate(date: LocalDate): Flow<Map<TaskKey, TaskDayState>> =
        dao.observeForDate(date).map { rows -> rows.associate { TaskKey(it.taskKey) to it.toDomain() } }

    fun observeToday(): Flow<Map<TaskKey, TaskDayState>> = observeForDate(clocks.logicalToday())

    suspend fun forDate(date: LocalDate): Map<TaskKey, TaskDayState> =
        dao.forDate(date).associate { TaskKey(it.taskKey) to it.toDomain() }

    suspend fun forTask(taskKey: TaskKey, date: LocalDate): TaskDayState? =
        dao.forTask(taskKey.value, date)?.toDomain()

    suspend fun since(from: LocalDate): List<TaskDayState> = dao.since(from).map { it.toDomain() }

    suspend fun put(
        taskKey: TaskKey,
        sectionKey: SectionKey,
        date: LocalDate,
        status: StatusValue,
        actual: TaskActual?,
        score: Double?,
        overflowMin: Int = 0,
        planId: String? = null,
    ) = dao.upsert(
        TaskStateEntity(
            taskKey = taskKey.value,
            logicalDate = date,
            sectionKey = sectionKey.value,
            status = status.wire,
            actualJson = actual?.toJson(),
            score = score,
            overflowMin = overflowMin,
            planId = planId,
            updatedAt = clocks.now(),
        ),
    )

    /**
     * Staleness for `status` tasks: how many days since the task was last anything other
     * than `not_started`. Feeds the 18:00 nudge (§5.3) and the report's `stale_tasks`.
     */
    suspend fun daysSinceProgress(taskKey: TaskKey, today: LocalDate, lookback: Long = 30): Int? {
        val history = dao.historyFor(taskKey.value, today.minusDays(lookback))
        val lastTouched = history
            .filter { it.status != StatusValue.NOT_STARTED.wire }
            .maxByOrNull { it.logicalDate }
            ?: return null
        return (today.toEpochDay() - lastTouched.logicalDate.toEpochDay()).toInt()
    }

    private fun TaskStateEntity.toDomain() = TaskDayState(
        taskKey = TaskKey(taskKey),
        sectionKey = SectionKey(sectionKey),
        date = logicalDate,
        status = StatusValue.fromWire(status) ?: StatusValue.NOT_STARTED,
        actual = toActual(),
        score = score,
        overflowMin = overflowMin,
    )
}
