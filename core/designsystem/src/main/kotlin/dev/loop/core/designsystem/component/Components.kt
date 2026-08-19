package dev.loop.core.designsystem.component

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import dev.loop.core.designsystem.theme.LoopColors
import dev.loop.core.designsystem.theme.LoopType

/**
 * The live progress ring of SPEC.md §5.1.
 *
 * Motion only on state change: the sweep animates when progress moves and is otherwise
 * completely still. Nothing pulses, spins or breathes.
 */
@Composable
fun ProgressRing(
    progress: Float,
    accent: Color,
    modifier: Modifier = Modifier,
    diameter: Dp = 44.dp,
    strokeWidth: Dp = 3.dp,
    content: @Composable (() -> Unit)? = null,
) {
    val animated by animateFloatAsState(
        targetValue = progress.coerceIn(0f, 1f),
        animationSpec = tween(durationMillis = 420),
        label = "ring",
    )

    Box(modifier = modifier.size(diameter), contentAlignment = Alignment.Center) {
        Canvas(Modifier.size(diameter)) {
            val stroke = strokeWidth.toPx()
            val inset = stroke / 2
            val arcSize = Size(size.width - stroke, size.height - stroke)

            drawArc(
                color = accent.copy(alpha = 0.18f),
                startAngle = 0f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = androidx.compose.ui.geometry.Offset(inset, inset),
                size = arcSize,
                style = Stroke(width = stroke),
            )
            if (animated > 0f) {
                drawArc(
                    color = accent,
                    startAngle = -90f,
                    sweepAngle = 360f * animated,
                    useCenter = false,
                    topLeft = androidx.compose.ui.geometry.Offset(inset, inset),
                    size = arcSize,
                    style = Stroke(width = stroke, cap = androidx.compose.ui.graphics.StrokeCap.Round),
                )
            }
        }
        content?.invoke()
    }
}

/** A flat horizontal meter. Used for per-section progress, which is visible all day. */
@Composable
fun ProgressBar(
    progress: Float,
    accent: Color,
    modifier: Modifier = Modifier,
    height: Dp = 3.dp,
) {
    val animated by animateFloatAsState(
        targetValue = progress.coerceIn(0f, 1f),
        animationSpec = tween(durationMillis = 420),
        label = "bar",
    )
    Box(
        modifier
            .fillMaxWidth()
            .height(height)
            .clip(RoundedCornerShape(height / 2))
            .background(accent.copy(alpha = 0.16f)),
    ) {
        Box(
            Modifier
                .fillMaxWidth(animated)
                .height(height)
                .clip(RoundedCornerShape(height / 2))
                .background(accent),
        )
    }
}

@Composable
fun LoopCard(
    modifier: Modifier = Modifier,
    accent: Color? = null,
    content: @Composable ColumnScopeAlias.() -> Unit,
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(16.dp),
        modifier = modifier.fillMaxWidth(),
    ) {
        // IntrinsicSize.Min lets the colour rail match the card's own height exactly,
        // rather than guessing at a fixed one.
        Row(
            Modifier
                .fillMaxWidth()
                .height(androidx.compose.foundation.layout.IntrinsicSize.Min),
        ) {
            if (accent != null) {
                // The section colour rail of SPEC.md §5.1.
                Box(
                    Modifier
                        .width(3.dp)
                        .fillMaxHeight()
                        .background(accent),
                )
            }
            Column(Modifier.padding(16.dp).fillMaxWidth()) { content() }
        }
    }
}

typealias ColumnScopeAlias = androidx.compose.foundation.layout.ColumnScope

@Composable
fun SectionHeader(
    label: String,
    accent: Color,
    trailing: String? = null,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label.uppercase(), style = LoopType.caption, color = accent)
        trailing?.let {
            Text(it, style = LoopType.caption, color = LoopColors.TextTertiary)
        }
    }
}

@Composable
fun EmptyState(
    title: String,
    body: String,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier.fillMaxWidth().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            title,
            style = LoopType.label,
            color = MaterialTheme.colorScheme.onBackground,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            body,
            style = LoopType.caption,
            color = LoopColors.TextSecondary,
            textAlign = TextAlign.Center,
        )
    }
}

/** Elapsed or target minutes rendered in the serif face SPEC.md §5.4 reserves for numerals. */
@Composable
fun Numeral(text: String, modifier: Modifier = Modifier, color: Color = LoopColors.TextPrimary) {
    Text(text, style = LoopType.numeralSmall, color = color, modifier = modifier)
}
