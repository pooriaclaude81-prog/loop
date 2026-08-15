package dev.loop.core.data.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStoreFile
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.util.Clocks
import dev.loop.core.data.util.SystemClocks
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): LoopDatabase =
        Room.databaseBuilder(context, LoopDatabase::class.java, LoopDatabase.NAME)
            .addMigrations(*LoopDatabase.MIGRATIONS)
            // No fallbackToDestructiveMigration: a failed upgrade must be a loud crash in
            // testing, never a silently emptied database on someone's phone.
            .build()

    @Provides
    @Singleton
    fun provideSettingsDataStore(@ApplicationContext context: Context): DataStore<Preferences> =
        PreferenceDataStoreFactory.create {
            context.preferencesDataStoreFile("loop_settings")
        }

    @Provides
    @Singleton
    fun provideClocks(impl: SystemClocks): Clocks = impl
}
