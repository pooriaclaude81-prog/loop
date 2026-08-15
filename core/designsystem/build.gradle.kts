plugins {
    id("loop.android.library")
    id("loop.android.compose")
}

android {
    namespace = "dev.loop.core.designsystem"
}

dependencies {
    api(libs.androidx.compose.material3)
    api(libs.androidx.compose.material.icons)
    implementation(libs.androidx.core.ktx)
}
