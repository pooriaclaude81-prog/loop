package dev.loop.core.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * SPEC.md §5.4: "a single serif face for numerals against a clean sans for labels".
 *
 * Numerals carry the meaning in this app — elapsed minutes, distances, scores — so they
 * get the serif and the optical weight; labels stay quiet in the sans.
 */
object LoopType {

    val numeral = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Medium,
        fontSize = 34.sp,
        letterSpacing = (-0.5).sp,
    )

    val numeralLarge = numeral.copy(fontSize = 56.sp)

    val numeralSmall = numeral.copy(fontSize = 20.sp)

    /** The Focus screen's oversized digits (SPEC.md §5.1). Monospace so they do not jitter. */
    val focusDigits = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Light,
        fontSize = 88.sp,
        letterSpacing = (-2).sp,
    )

    val label = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        letterSpacing = 0.1.sp,
    )

    val caption = label.copy(fontSize = 12.sp, fontWeight = FontWeight.Normal)
}

val LocalIsDark = staticCompositionLocalOf { true }

private val DarkScheme = darkColorScheme(
    background = LoopColors.Ink,
    onBackground = LoopColors.TextPrimary,
    surface = LoopColors.Surface,
    onSurface = LoopColors.TextPrimary,
    surfaceVariant = LoopColors.SurfaceElevated,
    onSurfaceVariant = LoopColors.TextSecondary,
    outline = LoopColors.Outline,
    error = LoopColors.Danger,
    primary = SectionAccent.INDIGO.dark,
    onPrimary = LoopColors.Ink,
)

private val LightScheme = lightColorScheme(
    background = LoopColors.LightSurface,
    onBackground = LoopColors.LightTextPrimary,
    surface = LoopColors.LightSurfaceElevated,
    onSurface = LoopColors.LightTextPrimary,
    surfaceVariant = LoopColors.LightSurfaceHigh,
    onSurfaceVariant = LoopColors.LightTextSecondary,
    outline = LoopColors.LightOutline,
    error = LoopColors.Danger,
    primary = SectionAccent.INDIGO.light,
    onPrimary = LoopColors.LightSurfaceElevated,
)

@Composable
fun LoopTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(LocalIsDark provides darkTheme) {
        MaterialTheme(
            colorScheme = if (darkTheme) DarkScheme else LightScheme,
            typography = Typography(
                bodyLarge = LoopType.label.copy(fontSize = 16.sp, fontWeight = FontWeight.Normal),
                bodyMedium = LoopType.label.copy(fontWeight = FontWeight.Normal),
                labelLarge = LoopType.label,
                labelSmall = LoopType.caption,
                headlineMedium = LoopType.numeral,
                displaySmall = LoopType.numeralLarge,
            ),
            content = content,
        )
    }
}

/** The accent for a section, resolved against the current theme. */
@Composable
fun SectionAccent.color(): androidx.compose.ui.graphics.Color =
    if (LocalIsDark.current) dark else light
