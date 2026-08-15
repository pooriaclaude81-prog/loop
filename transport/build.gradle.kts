plugins {
    id("loop.android.library")
    id("loop.android.hilt")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "dev.loop.transport"
}

dependencies {
    implementation(projects.core.contract)
    implementation(projects.core.data)
    implementation(libs.androidx.core.ktx)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
}
