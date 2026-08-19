plugins {
    id("loop.android.feature")
}

android {
    namespace = "dev.loop.feature.settings"
}

dependencies {
    implementation(projects.transport)
    implementation(projects.health)
}
