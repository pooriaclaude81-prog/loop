plugins {
    id("loop.android.application")
    id("loop.android.compose")
    id("loop.android.hilt")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "dev.loop"

    defaultConfig {
        applicationId = "dev.loop"
        versionCode = 1
        versionName = "0.1.0-M1"
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            // Sideload builds are signed with the debug key so `assembleRelease` stays
            // runnable; swap in a real keystore before any wider distribution.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

dependencies {
    implementation(projects.core.contract)
    implementation(projects.core.data)
    implementation(projects.core.designsystem)
    implementation(projects.transport)
    implementation(projects.health)
    implementation(projects.feature.today)
    implementation(projects.feature.focus)
    implementation(projects.feature.review)
    implementation(projects.feature.history)
    implementation(projects.feature.settings)

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
}
