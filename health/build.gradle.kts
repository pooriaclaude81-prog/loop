plugins {
    id("loop.android.library")
    id("loop.android.hilt")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "dev.loop.health"
}

dependencies {
    api(projects.core.contract)
    implementation(projects.core.data)
    implementation(libs.androidx.core.ktx)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
    api(libs.androidx.health.connect)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)
}
