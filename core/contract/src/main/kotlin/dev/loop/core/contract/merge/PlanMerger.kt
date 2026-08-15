package dev.loop.core.contract.merge

import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.domain.Section
import dev.loop.core.contract.domain.SectionKey
import dev.loop.core.contract.domain.Task
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.domain.TaskMode
import dev.loop.core.contract.domain.TaskTarget
import dev.loop.core.contract.domain.hasLoggedWork
import kotlin.math.abs

/** One structural difference between two revisions, for the UI and the audit trail. */
sealed interface MergeChange {
    val taskKey: TaskKey?

    data class TaskAdded(override val taskKey: TaskKey, val label: String) : MergeChange

    /** Dropped by the revision with nothing logged against it — safe to remove. */
    data class TaskDropped(override val taskKey: TaskKey, val label: String) : MergeChange

    /**
     * Dropped by the revision but work had already been logged. SPEC.md §3.1 forbids
     * discarding actuals, so the task is kept, flagged, and still scored.
     */
    data class TaskTombstoned(
        override val taskKey: TaskKey,
        val label: String,
        val removedInRev: Int,
    ) : MergeChange

    data class TargetChanged(
        override val taskKey: TaskKey,
        val from: TaskTarget,
        val to: TaskTarget,
    ) : MergeChange

    /**
     * The mode changed, which makes any logged actual type-incompatible with the new
     * target. Handled as tombstone-plus-add rather than a silent overwrite, and surfaced
     * loudly: this is the one revision case that can strand data.
     */
    data class ModeChanged(
        override val taskKey: TaskKey,
        val from: TaskMode,
        val to: TaskMode,
    ) : MergeChange

    data class LabelChanged(
        override val taskKey: TaskKey,
        val from: String,
        val to: String,
    ) : MergeChange

    data class SectionAdded(val sectionKey: SectionKey) : MergeChange {
        override val taskKey: TaskKey? get() = null
    }

    /** Kept alive because tombstoned tasks in it still carry logged work. */
    data class SectionRetained(val sectionKey: SectionKey) : MergeChange {
        override val taskKey: TaskKey? get() = null
    }

    data class SectionDropped(val sectionKey: SectionKey) : MergeChange {
        override val taskKey: TaskKey? get() = null
    }

    data class WeightChanged(
        val sectionKey: SectionKey,
        val from: Double,
        val to: Double,
    ) : MergeChange {
        override val taskKey: TaskKey? get() = null
    }
}

enum class RejectReason {
    /** The incoming plan is for a different day; it is stored, not merged. */
    DATE_MISMATCH,

    /** Revision is not newer than the active one — e.g. two drafts arriving out of order. */
    STALE_REVISION,
}

sealed interface MergeResult {
    data class Applied(val plan: Plan, val changes: List<MergeChange>) : MergeResult {
        val strandedActuals: List<MergeChange.ModeChanged>
            get() = changes.filterIsInstance<MergeChange.ModeChanged>()
    }

    data class Rejected(val reason: RejectReason, val message: String) : MergeResult
}

/**
 * Merges a plan revision into the active plan.
 *
 * The single invariant, from SPEC.md §3.1: **logged actuals are never discarded.** Every
 * branch below is a consequence of that plus the fact that `task_key` is stable across
 * days, so it is also the join key for history, streaks and staleness.
 *
 * Pure: takes the actuals it needs as a parameter so it can be exercised without a
 * database. `:core:data` supplies them from Room inside the import transaction.
 */
object PlanMerger {

    private const val WEIGHT_EPSILON = 0.0005

    fun merge(
        current: Plan,
        incoming: Plan,
        actuals: Map<TaskKey, TaskActual> = emptyMap(),
    ): MergeResult {
        if (current.date != incoming.date) {
            return MergeResult.Rejected(
                RejectReason.DATE_MISMATCH,
                "Plan is dated ${incoming.date}, but the active plan is for ${current.date}",
            )
        }
        // A different plan_id for the same date is a replacement rather than a revision;
        // it still merges, so nothing already logged is lost.
        if (current.planId == incoming.planId && incoming.rev <= current.rev) {
            return MergeResult.Rejected(
                RejectReason.STALE_REVISION,
                "Revision ${incoming.rev} is not newer than the active revision ${current.rev}",
            )
        }

        val changes = mutableListOf<MergeChange>()
        val currentTasks = current.allTasks.associateBy { it.key }
        val incomingTasks = incoming.allTasks.associateBy { it.key }

        fun hasWork(key: TaskKey): Boolean = actuals[key]?.hasLoggedWork == true

        // Tasks the revision dropped, split by whether anything was logged against them.
        val carriedOver = mutableMapOf<SectionKey, MutableList<Task>>()
        currentTasks.values
            .filter { it.key !in incomingTasks }
            .forEach { task ->
                if (task.isTombstoned || hasWork(task.key)) {
                    val removedRev = task.removedInRev ?: incoming.rev
                    val tombstone = task.copy(removedInRev = removedRev)
                    carriedOver.getOrPut(task.sectionKey) { mutableListOf() } += tombstone
                    if (!task.isTombstoned) {
                        changes += MergeChange.TaskTombstoned(task.key, task.label, removedRev)
                    }
                } else {
                    changes += MergeChange.TaskDropped(task.key, task.label)
                }
            }

        // Tasks whose mode changed: the old actual can no longer be scored against the new
        // target, so the old definition is tombstoned alongside the new one.
        incomingTasks.values.forEach { incomingTask ->
            val previous = currentTasks[incomingTask.key] ?: return@forEach
            if (previous.mode != incomingTask.mode && hasWork(incomingTask.key)) {
                changes += MergeChange.ModeChanged(
                    incomingTask.key,
                    previous.mode,
                    incomingTask.mode,
                )
                val stranded = previous.copy(
                    key = TaskKey("${previous.key.value}$STRANDED_SUFFIX"),
                    removedInRev = incoming.rev,
                )
                carriedOver.getOrPut(previous.sectionKey) { mutableListOf() } += stranded
            }
        }

        val incomingSectionKeys = incoming.sections.map { it.key }.toSet()
        val currentSections = current.sections.associateBy { it.key }

        val mergedSections = incoming.sections.map { section ->
            val previousSection = currentSections[section.key]
            if (previousSection == null) {
                changes += MergeChange.SectionAdded(section.key)
            } else if (abs(previousSection.declaredWeight - section.declaredWeight) > WEIGHT_EPSILON) {
                changes += MergeChange.WeightChanged(
                    section.key,
                    previousSection.declaredWeight,
                    section.declaredWeight,
                )
            }

            section.tasks.forEach { task ->
                val previous = currentTasks[task.key]
                when {
                    previous == null -> changes += MergeChange.TaskAdded(task.key, task.label)
                    previous.mode == task.mode && previous.target != task.target ->
                        changes += MergeChange.TargetChanged(task.key, previous.target, task.target)
                }
                if (previous != null && previous.label != task.label) {
                    changes += MergeChange.LabelChanged(task.key, previous.label, task.label)
                }
            }

            val tombstones = carriedOver.remove(section.key).orEmpty()
            section.copy(
                tasks = section.tasks + tombstones.mapIndexed { index, task ->
                    task.copy(sortOrder = section.tasks.size + index)
                },
            )
        }.toMutableList()

        // Sections the revision removed. If any of their work survived, the section
        // survives with it — you did the work, it counts.
        currentSections.values
            .filterNot { it.key in incomingSectionKeys }
            .sortedBy { it.sortOrder }
            .forEach { section ->
                val tombstones = carriedOver.remove(section.key).orEmpty()
                if (tombstones.isEmpty()) {
                    changes += MergeChange.SectionDropped(section.key)
                } else {
                    changes += MergeChange.SectionRetained(section.key)
                    mergedSections += section.copy(
                        tasks = tombstones.mapIndexed { index, task -> task.copy(sortOrder = index) },
                        sortOrder = mergedSections.size,
                    )
                }
            }

        // Any tombstone whose section vanished entirely from both sides still has to land
        // somewhere; attach it to its original section definition.
        carriedOver.forEach { (sectionKey, tasks) ->
            val original = currentSections[sectionKey] ?: return@forEach
            changes += MergeChange.SectionRetained(sectionKey)
            mergedSections += original.copy(
                tasks = tasks.mapIndexed { index, task -> task.copy(sortOrder = index) },
                sortOrder = mergedSections.size,
            )
        }

        val renormalized = renormalize(mergedSections)

        return MergeResult.Applied(
            plan = incoming.copy(sections = renormalized),
            changes = changes,
        )
    }

    /** Retained sections re-enter the weight pool, so the total stays 1.0. */
    private fun renormalize(sections: List<Section>): List<Section> {
        val total = sections.sumOf { it.weight }
        if (total <= 0.0 || abs(total - 1.0) <= WEIGHT_EPSILON) return sections
        return sections.map { it.copy(weight = it.weight / total) }
    }

    /**
     * Appended to the key of a task whose mode changed mid-day, so the stranded actual
     * keeps a distinct identity instead of colliding with the redefined task.
     */
    const val STRANDED_SUFFIX = "~pre-rev"
}
