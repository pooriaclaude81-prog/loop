package dev.loop.health

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType
import dev.loop.core.designsystem.theme.LoopTheme

/**
 * SPEC.md §1.1 requires this activity even for a sideloaded build — Health Connect will
 * not show the grant screen without somewhere to send "why does this app want my data?".
 */
class HealthRationaleActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LoopTheme {
                Surface(
                    color = MaterialTheme.colorScheme.background,
                    modifier = Modifier.fillMaxSize(),
                ) {
                    Column(Modifier.padding(24.dp)) {
                        Text(
                            "Why Loop reads health data",
                            style = LoopType.numeralSmall,
                            color = MaterialTheme.colorScheme.onBackground,
                        )
                        Spacer(Modifier.height(16.dp))
                        Text(
                            "Loop reads last night's sleep, your resting heart rate, and any " +
                                "recorded runs or gym sessions.\n\n" +
                                "Sleep and resting heart rate are used to shape the next day's " +
                                "plan — a short night or a raised resting heart rate means the " +
                                "hard session gets downgraded rather than repeated.\n\n" +
                                "Runs and gym sessions pre-fill their log cards so you do not " +
                                "type in what your watch already recorded.\n\n" +
                                "Everything is stored on this device and is only sent in the daily " +
                                "report you review and send yourself. Sleep is never scored or " +
                                "graded.",
                            style = LoopType.caption,
                            color = LoopColors.TextSecondary,
                        )
                    }
                }
            }
        }
    }
}
