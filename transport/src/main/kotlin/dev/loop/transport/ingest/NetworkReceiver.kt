package dev.loop.transport.ingest

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

/** SPEC.md §2.2: a one-shot poll when connectivity returns. */
@AndroidEntryPoint
class NetworkReceiver : BroadcastReceiver() {

    @Inject lateinit var scheduler: IngestScheduler

    override fun onReceive(context: Context, intent: Intent) {
        scheduler.runOnce()
    }
}
