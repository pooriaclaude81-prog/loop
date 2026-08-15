import dev.loop.buildlogic.configureKotlinJvm
import dev.loop.buildlogic.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.testing.Test
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.withType

/**
 * Pure JVM module — no Android dependencies available at all.
 *
 * This is load bearing for `:core:contract`: the validator and (M4) the scoring engine
 * physically cannot reach for an Android API, and their tests run in milliseconds
 * without Robolectric or a device.
 */
class JvmLibraryConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        pluginManager.apply("org.jetbrains.kotlin.jvm")
        configureKotlinJvm()

        tasks.withType<Test>().configureEach {
            useJUnit()
            testLogging {
                events("passed", "skipped", "failed")
            }
        }

        dependencies {
            add("testImplementation", libs.findLibrary("junit").get())
            add("testImplementation", libs.findLibrary("truth").get())
            add("testImplementation", libs.findLibrary("kotlin-test").get())
            add("testImplementation", libs.findLibrary("kotlinx-coroutines-test").get())
        }
    }
}
