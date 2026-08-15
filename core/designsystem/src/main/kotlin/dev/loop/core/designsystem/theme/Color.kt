package dev.loop.core.designsystem.theme

import androidx.compose.ui.graphics.Color

/**
 * SPEC.md §5.4: dark-first, near-black surfaces, one saturated accent per section,
 * no gradients and no glass. Restraint reads as premium.
 */
object LoopColors {

    val Ink = Color(0xFF0A0A0B)
    val Surface = Color(0xFF121214)
    val SurfaceElevated = Color(0xFF1A1A1D)
    val SurfaceHigh = Color(0xFF232327)
    val Outline = Color(0xFF2E2E33)

    val TextPrimary = Color(0xFFF2F2F3)
    val TextSecondary = Color(0xFFA0A0A8)
    val TextTertiary = Color(0xFF6B6B73)

    val Danger = Color(0xFFE5484D)
    val Warning = Color(0xFFE8A33D)
    val Success = Color(0xFF46A758)

    /** Light-mode counterparts. Dark is the default, but the app must not be unusable at noon. */
    val LightSurface = Color(0xFFFBFBFC)
    val LightSurfaceElevated = Color(0xFFFFFFFF)
    val LightSurfaceHigh = Color(0xFFF1F1F3)
    val LightOutline = Color(0xFFDFDFE3)
    val LightTextPrimary = Color(0xFF16161A)
    val LightTextSecondary = Color(0xFF5C5C66)
    val LightTextTertiary = Color(0xFF8B8B96)
}

/**
 * Section accents, keyed by the plan's `color` field (SPEC.md §3.1).
 *
 * Nothing about sections is hardcoded — the plan names a colour, this maps the name to a
 * pigment. An unrecognised name falls back to [Neutral] rather than failing the plan.
 */
enum class SectionAccent(val key: String, val dark: Color, val light: Color) {
    INDIGO("indigo", Color(0xFF7C7CFF), Color(0xFF4B4BE0)),
    AMBER("amber", Color(0xFFF5A524), Color(0xFFB86E00)),
    TEAL("teal", Color(0xFF2DD4BF), Color(0xFF0E8A7C)),
    CORAL("coral", Color(0xFFFF7A6B), Color(0xFFD8412F)),
    VIOLET("violet", Color(0xFFC77DFF), Color(0xFF8B3DD1)),
    LIME("lime", Color(0xFFA3E635), Color(0xFF5C8A0F)),
    SKY("sky", Color(0xFF56B6FF), Color(0xFF0B6FC4)),
    ROSE("rose", Color(0xFFFF6FA5), Color(0xFFC42667)),
    SAND("sand", Color(0xFFD6C29A), Color(0xFF8A7448)),
    MINT("mint", Color(0xFF6EE7B7), Color(0xFF15805C)),
    NEUTRAL("neutral", Color(0xFF9A9AA5), Color(0xFF6B6B77)),
    ;

    companion object {
        fun fromKey(key: String?): SectionAccent =
            entries.firstOrNull { it.key == key?.trim()?.lowercase() } ?: NEUTRAL
    }
}
