package dev.loop

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.ui.Modifier
import dagger.hilt.android.AndroidEntryPoint
import dev.loop.core.data.db.PlanSource
import dev.loop.core.designsystem.theme.LoopTheme
import dev.loop.harness.ContractHarnessScreen
import dev.loop.harness.ContractHarnessViewModel

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val viewModel: ContractHarnessViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        handleShare(intent)

        setContent {
            LoopTheme {
                ContractHarnessScreen(
                    viewModel = viewModel,
                    samplePlanJson = BuildVariant.samplePlanJson(this),
                    modifier = Modifier
                        .windowInsetsPadding(WindowInsets.safeDrawing)
                        .consumeWindowInsets(WindowInsets.safeDrawing),
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleShare(intent)
    }

    /**
     * SPEC.md §2.3: sharing the plan email or its attachment into Loop must always work,
     * with no account setup at all. This is the fallback that keeps the loop closed when
     * IMAP is unavailable.
     */
    private fun handleShare(intent: Intent?) {
        if (intent?.action != Intent.ACTION_SEND) return
        val shared = intent.getStringExtra(Intent.EXTRA_TEXT) ?: return
        val payload = dev.loop.core.contract.envelope.Envelope.extractPayload(shared) ?: shared
        viewModel.import(payload, PlanSource.SHARE)
    }
}
