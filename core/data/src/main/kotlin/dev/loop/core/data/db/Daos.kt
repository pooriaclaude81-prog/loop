package dev.loop.core.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Upsert
import java.time.Instant
import java.time.LocalDate
import kotlinx.coroutines.flow.Flow

@Dao
interface PlanDao {

    @Upsert
    suspend fun upsertPlan(plan: PlanEntity)

    @Upsert
    suspend fun upsertSections(sections: List<SectionEntity>)

    @Upsert
    suspend fun upsertTasks(tasks: List<TaskEntity>)

    @Query("UPDATE plans SET is_active = 0 WHERE date = :date")
    suspend fun deactivateAllFor(date: LocalDate)

    @Query("SELECT * FROM plans WHERE date = :date AND is_active = 1 LIMIT 1")
    fun observeActivePlan(date: LocalDate): Flow<PlanEntity?>

    @Query("SELECT * FROM plans WHERE date = :date AND is_active = 1 LIMIT 1")
    suspend fun activePlan(date: LocalDate): PlanEntity?

    @Query("SELECT * FROM plans WHERE plan_id = :planId AND rev = :rev LIMIT 1")
    suspend fun plan(planId: String, rev: Int): PlanEntity?

    @Query("SELECT * FROM plans WHERE date = :date ORDER BY rev DESC")
    suspend fun revisionsFor(date: LocalDate): List<PlanEntity>

    @Query("SELECT * FROM sections WHERE plan_id = :planId AND rev = :rev ORDER BY sort_order")
    fun observeSections(planId: String, rev: Int): Flow<List<SectionEntity>>

    @Query("SELECT * FROM sections WHERE plan_id = :planId AND rev = :rev ORDER BY sort_order")
    suspend fun sections(planId: String, rev: Int): List<SectionEntity>

    @Query("SELECT * FROM tasks WHERE plan_id = :planId AND rev = :rev ORDER BY sort_order")
    fun observeTasks(planId: String, rev: Int): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE plan_id = :planId AND rev = :rev ORDER BY sort_order")
    suspend fun tasks(planId: String, rev: Int): List<TaskEntity>

    @Query("SELECT DISTINCT date FROM plans ORDER BY date DESC LIMIT :limit")
    suspend fun recentDates(limit: Int): List<LocalDate>

    /**
     * Replaces a plan revision's section and task rows wholesale.
     *
     * A revision is written as a new `(plan_id, rev)` row, so this only ever fires when a
     * re-import of the *same* revision arrives — a retried share, or the same draft seen
     * twice. Doing it in one transaction keeps a partially written plan off the screen.
     */
    @Transaction
    suspend fun replaceRevisionContents(
        plan: PlanEntity,
        sections: List<SectionEntity>,
        tasks: List<TaskEntity>,
    ) {
        deleteSections(plan.planId, plan.rev)
        deleteTasks(plan.planId, plan.rev)
        upsertPlan(plan)
        upsertSections(sections)
        upsertTasks(tasks)
    }

    @Query("DELETE FROM sections WHERE plan_id = :planId AND rev = :rev")
    suspend fun deleteSections(planId: String, rev: Int)

    @Query("DELETE FROM tasks WHERE plan_id = :planId AND rev = :rev")
    suspend fun deleteTasks(planId: String, rev: Int)
}

@Dao
interface SessionDao {

    @Insert
    suspend fun insert(session: SessionEntity): Long

    @Upsert
    suspend fun upsert(session: SessionEntity)

    @Query("SELECT * FROM sessions WHERE id = :id")
    suspend fun byId(id: Long): SessionEntity?

    /** The single global active timer of SPEC.md §5.2, if one is running. */
    @Query("SELECT * FROM sessions WHERE is_open = 1 ORDER BY start_ts DESC LIMIT 1")
    fun observeOpenSession(): Flow<SessionEntity?>

    @Query("SELECT * FROM sessions WHERE is_open = 1 ORDER BY start_ts DESC")
    suspend fun openSessions(): List<SessionEntity>

    @Query("SELECT * FROM sessions WHERE logical_date = :date ORDER BY start_ts")
    fun observeForDate(date: LocalDate): Flow<List<SessionEntity>>

    @Query("SELECT * FROM sessions WHERE logical_date = :date ORDER BY start_ts")
    suspend fun forDate(date: LocalDate): List<SessionEntity>

    @Query("SELECT * FROM sessions WHERE task_key = :taskKey AND logical_date = :date ORDER BY start_ts")
    suspend fun forTask(taskKey: String, date: LocalDate): List<SessionEntity>

    /** Heartbeat write of SPEC.md §5.2: a crash costs at most 10 s. */
    @Query("UPDATE sessions SET end_ts = :endTs WHERE id = :id AND is_open = 1")
    suspend fun heartbeat(id: Long, endTs: Long)

    @Query("UPDATE sessions SET end_ts = :endTs, is_open = 0, verified = :verified WHERE id = :id")
    suspend fun close(id: Long, endTs: Long, verified: Boolean = true)

    @Query("UPDATE sessions SET end_ts = :endTs, is_open = 0, verified = 0 WHERE is_open = 1")
    suspend fun closeAllOpen(endTs: Long)

    @Query("DELETE FROM sessions WHERE id = :id")
    suspend fun delete(id: Long)
}

@Dao
interface TaskStateDao {

    @Upsert
    suspend fun upsert(state: TaskStateEntity)

    @Upsert
    suspend fun upsertAll(states: List<TaskStateEntity>)

    @Query("SELECT * FROM task_state WHERE logical_date = :date")
    fun observeForDate(date: LocalDate): Flow<List<TaskStateEntity>>

    @Query("SELECT * FROM task_state WHERE logical_date = :date")
    suspend fun forDate(date: LocalDate): List<TaskStateEntity>

    @Query("SELECT * FROM task_state WHERE task_key = :taskKey AND logical_date = :date LIMIT 1")
    suspend fun forTask(taskKey: String, date: LocalDate): TaskStateEntity?

    @Query(
        "SELECT * FROM task_state WHERE task_key = :taskKey AND logical_date >= :from " +
            "ORDER BY logical_date DESC",
    )
    suspend fun historyFor(taskKey: String, from: LocalDate): List<TaskStateEntity>

    @Query("SELECT * FROM task_state WHERE logical_date >= :from ORDER BY logical_date")
    suspend fun since(from: LocalDate): List<TaskStateEntity>
}

@Dao
interface HealthDao {

    @Upsert
    suspend fun upsert(entity: HealthDailyEntity)

    @Query("SELECT * FROM health_daily WHERE date = :date")
    fun observe(date: LocalDate): Flow<HealthDailyEntity?>

    @Query("SELECT * FROM health_daily WHERE date = :date")
    suspend fun forDate(date: LocalDate): HealthDailyEntity?

    @Query("SELECT * FROM health_daily WHERE date >= :from ORDER BY date")
    suspend fun since(from: LocalDate): List<HealthDailyEntity>

    @Query("SELECT * FROM health_daily ORDER BY date DESC LIMIT :limit")
    suspend fun recent(limit: Int): List<HealthDailyEntity>
}

@Dao
interface ReportDao {

    @Upsert
    suspend fun upsert(report: ReportEntity)

    @Query("SELECT * FROM reports WHERE date = :date")
    fun observe(date: LocalDate): Flow<ReportEntity?>

    @Query("SELECT * FROM reports WHERE date = :date")
    suspend fun forDate(date: LocalDate): ReportEntity?

    @Query("SELECT * FROM reports WHERE status = :status ORDER BY date")
    suspend fun withStatus(status: String): List<ReportEntity>

    @Query("SELECT * FROM reports ORDER BY date DESC LIMIT :limit")
    fun observeRecent(limit: Int): Flow<List<ReportEntity>>

    @Query("UPDATE reports SET status = :status, sent_at = :sentAt, transport = :transport WHERE date = :date")
    suspend fun markSent(date: LocalDate, status: String, sentAt: Instant, transport: String)
}

@Dao
interface AppStateDao {

    @Query("SELECT value FROM app_state WHERE key = :key")
    suspend fun get(key: String): String?

    @Query("SELECT value FROM app_state WHERE key = :key")
    fun observe(key: String): Flow<String?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entity: AppStateEntity)

    @Query("DELETE FROM app_state WHERE key = :key")
    suspend fun remove(key: String)
}

@Dao
interface IngestFailureDao {

    @Insert
    suspend fun insert(failure: IngestFailureEntity): Long

    @Query("SELECT * FROM ingest_failures WHERE dismissed = 0 ORDER BY received_at DESC")
    fun observeOutstanding(): Flow<List<IngestFailureEntity>>

    @Query("SELECT * FROM ingest_failures ORDER BY received_at DESC LIMIT :limit")
    suspend fun recent(limit: Int): List<IngestFailureEntity>

    @Query("UPDATE ingest_failures SET dismissed = 1 WHERE id = :id")
    suspend fun dismiss(id: Long)
}
