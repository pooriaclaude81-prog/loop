plugins {
    id("loop.android.library")
    id("loop.android.hilt")
    id("loop.android.room")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "dev.loop.core.data"

    // Shared by both test source sets so fixtures like TestClocks are written once.
    sourceSets {
        getByName("test").kotlin.srcDir("src/testShared/kotlin")
        getByName("androidTest").kotlin.srcDir("src/testShared/kotlin")
    }
}

dependencies {
    api(projects.core.contract)
    implementation(libs.androidx.core.ktx)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.androidx.datastore.preferences)
}
