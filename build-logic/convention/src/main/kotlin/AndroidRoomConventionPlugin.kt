import com.google.devtools.ksp.gradle.KspExtension
import dev.loop.buildlogic.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.dependencies

/**
 * Room with schema export switched on from the very first version.
 *
 * `schemas/` is committed to git so every future schema change shows up as a reviewable
 * diff and [androidx.room.testing.MigrationTestHelper] has something to migrate from.
 * `fallbackToDestructiveMigration` is never called anywhere in this project — losing a
 * user's history is not an acceptable upgrade path for a daily driver.
 */
class AndroidRoomConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        pluginManager.apply("com.google.devtools.ksp")

        val schemaDir = layout.projectDirectory.dir("schemas")

        extensions.configure<KspExtension> {
            arg("room.schemaLocation", schemaDir.asFile.path)
            arg("room.generateKotlin", "true")
        }

        // Migration tests read the exported schemas from assets at runtime.
        extensions.configure<com.android.build.gradle.LibraryExtension> {
            sourceSets.getByName("androidTest").assets.srcDir(schemaDir)
        }

        dependencies {
            add("implementation", libs.findLibrary("androidx-room-runtime").get())
            add("implementation", libs.findLibrary("androidx-room-ktx").get())
            add("ksp", libs.findLibrary("androidx-room-compiler").get())
            add("testImplementation", libs.findLibrary("androidx-room-testing").get())
            add("androidTestImplementation", libs.findLibrary("androidx-room-testing").get())
        }
    }
}
