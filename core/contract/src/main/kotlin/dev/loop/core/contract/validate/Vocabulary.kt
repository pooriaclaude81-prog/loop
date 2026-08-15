package dev.loop.core.contract.validate

/**
 * Canonical vocabularies for the free-text enums in the plan schema.
 *
 * SPEC.md §6 scores run type by exact equality — `run_type == target.run_type` — and
 * gives it a flat 20% of the run score. That makes `"Easy"` versus `"easy"` a silent 20%
 * loss with nothing in the UI to explain it. Loop case-folds both sides before comparing
 * and warns on values outside the known set, so an unfamiliar-but-deliberate value
 * (`"fartlek"`) still works while a typo gets surfaced.
 *
 * The same list must be given to the Claude skill at setup — see docs/ARCHITECTURE.md.
 */
object Vocabulary {

    val RUN_TYPES: Set<String> = setOf(
        "easy",
        "recovery",
        "long",
        "tempo",
        "threshold",
        "interval",
        "fartlek",
        "hill",
        "race",
        "progression",
    )

    val MUSCLE_GROUPS: Set<String> = setOf(
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "forearms",
        "quads",
        "hamstrings",
        "glutes",
        "calves",
        "core",
        "abs",
        "traps",
        "lats",
        "full_body",
    )

    /**
     * Section accent names used by the design system (SPEC.md §3.1 `color`). Unknown
     * values fall back to a neutral accent with a warning rather than failing the plan.
     */
    val COLORS: Set<String> = setOf(
        "indigo",
        "amber",
        "teal",
        "coral",
        "violet",
        "lime",
        "sky",
        "rose",
        "sand",
        "mint",
    )

    fun normalize(value: String): String = value.trim().lowercase().replace(' ', '_').replace('-', '_')

    fun isKnownRunType(value: String): Boolean = normalize(value) in RUN_TYPES
    fun isKnownGroup(value: String): Boolean = normalize(value) in MUSCLE_GROUPS
    fun isKnownColor(value: String): Boolean = normalize(value) in COLORS
}
