import com.android.build.api.dsl.ApplicationExtension
import dev.loop.buildlogic.configureKotlinAndroid
import dev.loop.buildlogic.int
import dev.loop.buildlogic.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.dependencies

class AndroidApplicationConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        pluginManager.apply("com.android.application")
        pluginManager.apply("org.jetbrains.kotlin.android")

        extensions.configure<ApplicationExtension> {
            configureKotlinAndroid(this)
            defaultConfig {
                targetSdk = libs.int("targetSdk")
                testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
            }
            buildFeatures.buildConfig = true
        }

        dependencies {
            add("testImplementation", libs.findLibrary("junit").get())
            add("testImplementation", libs.findLibrary("truth").get())
            add("testImplementation", libs.findLibrary("robolectric").get())
            add("testImplementation", libs.findLibrary("kotlinx-coroutines-test").get())
            add("androidTestImplementation", libs.findLibrary("androidx-test-junit").get())
            add("androidTestImplementation", libs.findLibrary("androidx-test-runner").get())
            add("androidTestImplementation", libs.findLibrary("androidx-test-rules").get())
            add("androidTestImplementation", libs.findLibrary("androidx-test-uiautomator").get())
            add("androidTestImplementation", libs.findLibrary("truth").get())
            add("androidTestImplementation", libs.findLibrary("kotlinx-coroutines-test").get())
        }
    }
}
