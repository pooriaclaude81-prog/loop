package dev.loop.core.data.repository

import dev.loop.core.data.db.HealthDailyEntity
import dev.loop.core.data.db.LoopDatabase
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow

/**
 * Persisted health data.
 *
 * SPEC.md §1.1: Health Connect is a short-retention *buffer*, not a database. The reader
 * in `:health` (M5) pulls and immediately writes here; nothing else may query Health
 * Connect for history. This repository is the only history there is.
 */
@Singleton
class HealthRepository @Inject constructor(db: LoopDatabase) {

    private val dao = db.healthDao()

    fun observe(date: LocalDate): Flow<HealthDailyEntity?> = dao.observe(date)

    suspend fun forDate(date: LocalDate): HealthDailyEntity? = dao.forDate(date)

    suspend fun upsert(entity: HealthDailyEntity) = dao.upsert(entity)

    suspend fun since(from: LocalDate): List<HealthDailyEntity> = dao.since(from)

    suspend fun recent(limit: Int): List<HealthDailyEntity> = dao.recent(limit)
}

/**
 * Transactional sync bookkeeping — see [dev.loop.core.data.db.AppStateEntity] for why this
 * lives in Room while user preferences live in DataStore.
 */
@Singleton
class AppStateRepository @Inject constructor(
    db: LoopDatabase,
    private val clocks: dev.loop.core.data.util.Clocks,
) {

    private val dao = db.appStateDao()

    suspend fun get(key: String): String? = dao.get(key)

    fun observe(key: String): Flow<String?> = dao.observe(key)

    suspend fun put(key: String, value: String) = dao.put(
        dev.loop.core.data.db.AppStateEntity(key, value, clocks.now()),
    )

    suspend fun getLong(key: String): Long? = get(key)?.toLongOrNull()

    suspend fun putLong(key: String, value: Long) = put(key, value.toString())

    suspend fun remove(key: String) = dao.remove(key)

    companion object {
        /** Highest IMAP UID already imported, per SPEC.md §2.2. */
        const val KEY_LAST_SEEN_UID = "imap.last_seen_uid"
        const val KEY_LAST_INGEST_AT = "imap.last_ingest_at"
        const val KEY_LAST_HEALTH_SYNC_AT = "health.last_sync_at"
        const val KEY_ONBOARDED = "app.onboarded"
    }
}
