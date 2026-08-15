package dev.loop.core.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

/**
 * The single source of truth. SPEC.md §4: everything writes locally first, email is sync.
 *
 * `exportSchema` is on from v1 and `core/data/schemas/` is committed, so every future
 * change lands as a reviewable diff and [androidx.room.testing.MigrationTestHelper] has a
 * starting point. **`fallbackToDestructiveMigration` is never called anywhere in this
 * project** — for an app someone uses daily, silently dropping their history on upgrade is
 * a worse outcome than refusing to start.
 */
@Database(
    entities = [
        PlanEntity::class,
        SectionEntity::class,
        TaskEntity::class,
        SessionEntity::class,
        TaskStateEntity::class,
        HealthDailyEntity::class,
        ReportEntity::class,
        AppStateEntity::class,
        IngestFailureEntity::class,
    ],
    version = LoopDatabase.VERSION,
    exportSchema = true,
)
@TypeConverters(Converters::class)
abstract class LoopDatabase : RoomDatabase() {

    abstract fun planDao(): PlanDao
    abstract fun sessionDao(): SessionDao
    abstract fun taskStateDao(): TaskStateDao
    abstract fun healthDao(): HealthDao
    abstract fun reportDao(): ReportDao
    abstract fun appStateDao(): AppStateDao
    abstract fun ingestFailureDao(): IngestFailureDao

    companion object {
        const val VERSION = 1
        const val NAME = "loop.db"

        /**
         * Migrations are listed here as they are written. The array is empty at v1 and the
         * wiring around it is already in place, which is the point: adding v2 means adding
         * one entry, not retrofitting a migration strategy onto a database full of a
         * year's worth of someone's history.
         */
        val MIGRATIONS: Array<androidx.room.migration.Migration> = emptyArray()
    }
}
