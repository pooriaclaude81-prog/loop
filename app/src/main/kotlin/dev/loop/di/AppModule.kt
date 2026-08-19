package dev.loop.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dev.loop.core.data.timer.TimerLauncher
import dev.loop.feature.review.ReportSender
import dev.loop.notify.AppIngestReporter
import dev.loop.report.AppReportSender
import dev.loop.timer.AndroidTimerLauncher
import dev.loop.transport.ingest.IngestReporter
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class AppModule {

    /** Lets feature modules start the foreground service without depending on `:app`. */
    @Binds
    @Singleton
    abstract fun bindTimerLauncher(impl: AndroidTimerLauncher): TimerLauncher

    @Binds
    @Singleton
    abstract fun bindIngestReporter(impl: AppIngestReporter): IngestReporter

    @Binds
    @Singleton
    abstract fun bindReportSender(impl: AppReportSender): ReportSender
}
