package dev.loop.feature.focus

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import dev.loop.core.designsystem.theme.SectionAccent
import dev.loop.core.designsystem.theme.color

/**
 * SPEC.md §5.1's Focus screen: full-bleed section colour, oversized monospace digits, the
 * task label, and nothing else. Swipe down to exit, tap to pause.
 *
 * The restraint is the feature. Anything added here — a progress bar, a target, a score —
 * turns a focus surface back into a dashboard.
 */
@Composable
fun FocusScreen(
    viewModel: FocusViewModel,
    onExit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val accent = SectionAccent.fromKey(state.sectionColor).color()
    val view = LocalView.current

    // Optional per §5.1. Released on exit so it cannot outlive the screen.
    DisposableEffect(state.keepScreenOn) {
        view.keepScreenOn = state.keepScreenOn
        onDispose { view.keepScreenOn = false }
    }

    Box(
        modifier
            .fillMaxSize()
            .background(accent)
            .pointerInput(Unit) {
                detectVerticalDragGestures { _, dragAmount ->
                    if (dragAmount > 24f) onExit()
                }
            },
        contentAlignment = Alignment.Center,
    ) {
        AnimatedVisibility(
            visible = true,
            enter = fadeIn(tween(500)),
            exit = fadeOut(tween(240)),
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.padding(32.dp),
            ) {
                Text(
                    text = state.elapsedText,
                    style = LoopType.focusDigits,
                    color = LoopColors.Ink,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.pointerInput(Unit) {
                        // Tap anywhere on the digits to pause or resume.
                        detectTapGestures {
                            viewModel.togglePause()
                        }
                    },
                )
                Spacer(Modifier.height(20.dp))
                Text(
                    text = state.taskLabel ?: "No timer running",
                    style = LoopType.label,
                    color = LoopColors.Ink.copy(alpha = 0.75f),
                    textAlign = TextAlign.Center,
                )
                if (!state.isRunning && state.taskLabel != null) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "paused",
                        style = LoopType.caption,
                        color = LoopColors.Ink.copy(alpha = 0.55f),
                    )
                }
            }
        }
    }
}
