plugins {
    `kotlin-dsl`
}

group = "dev.loop.buildlogic"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    compileOnly(libs.plugin.android.gradle)
    compileOnly(libs.plugin.kotlin.gradle)
    compileOnly(libs.plugin.ksp.gradle)
    compileOnly(libs.plugin.compose.compiler.gradle)
}

gradlePlugin {
    plugins {
        register("androidApplication") {
            id = "loop.android.application"
            implementationClass = "AndroidApplicationConventionPlugin"
        }
        register("androidLibrary") {
            id = "loop.android.library"
            implementationClass = "AndroidLibraryConventionPlugin"
        }
        register("androidCompose") {
            id = "loop.android.compose"
            implementationClass = "AndroidComposeConventionPlugin"
        }
        register("androidHilt") {
            id = "loop.android.hilt"
            implementationClass = "AndroidHiltConventionPlugin"
        }
        register("androidRoom") {
            id = "loop.android.room"
            implementationClass = "AndroidRoomConventionPlugin"
        }
        register("jvmLibrary") {
            id = "loop.jvm.library"
            implementationClass = "JvmLibraryConventionPlugin"
        }
        register("androidFeature") {
            id = "loop.android.feature"
            implementationClass = "AndroidFeatureConventionPlugin"
        }
    }
}
