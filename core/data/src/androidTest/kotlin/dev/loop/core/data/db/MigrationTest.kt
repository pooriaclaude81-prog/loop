package dev.loop.core.data.db

import androidx.room.Room
import androidx.room.testing.MigrationTestHelper
import androidx.sqlite.db.framework.FrameworkSQLiteOpenHelperFactory
import androidx.test.platform.app.InstrumentationRegistry
import com.google.common.truth.Truth.assertThat
import java.io.IOException
import org.junit.Rule
import org.junit.Test

/**
 * The migration harness exists from v1, before there is anything to migrate.
 *
 * That is the point: the first schema change to a database holding a year of someone's
 * history is the worst possible moment to discover that schemas were never exported and
 * no test infrastructure exists. Adding v2 should mean adding one entry to
 * [LoopDatabase.MIGRATIONS] and one case below.
 */
class MigrationTest {

    @get:Rule
    val helper = MigrationTestHelper(
        InstrumentationRegistry.getInstrumentation(),
        LoopDatabase::class.java,
        emptyList(),
        FrameworkSQLiteOpenHelperFactory(),
    )

    @Test
    @Throws(IOException::class)
    fun schemaV1IsExportedAndOpenable() {
        helper.createDatabase(TEST_DB, 1).close()

        val db = Room.databaseBuilder(
            InstrumentationRegistry.getInstrumentation().targetContext,
            LoopDatabase::class.java,
            TEST_DB,
        ).addMigrations(*LoopDatabase.MIGRATIONS).build()

        db.openHelper.writableDatabase.use { raw ->
            val tables = mutableListOf<String>()
            raw.query("SELECT name FROM sqlite_master WHERE type='table'").use { cursor ->
                while (cursor.moveToNext()) tables += cursor.getString(0)
            }
            assertThat(tables).containsAtLeast(
                "plans", "sections", "tasks", "sessions", "task_state",
                "health_daily", "reports", "app_state", "ingest_failures",
            )
        }
        db.close()
    }

    /**
     * Runs every migration in sequence against a v1 database. It is trivially satisfied
     * today and becomes the real safety net the moment [LoopDatabase.VERSION] moves.
     */
    @Test
    @Throws(IOException::class)
    fun allMigrationsApplyInSequence() {
        helper.createDatabase(TEST_DB, 1).close()

        for (target in 2..LoopDatabase.VERSION) {
            helper.runMigrationsAndValidate(TEST_DB, target, true, *LoopDatabase.MIGRATIONS)
        }

        assertThat(LoopDatabase.VERSION).isAtLeast(1)
    }

    private companion object {
        const val TEST_DB = "loop-migration-test.db"
    }
}
