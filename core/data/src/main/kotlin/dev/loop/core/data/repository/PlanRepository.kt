package dev.loop.core.data.repository

import androidx.room.withTransaction
import dev.loop.core.contract.domain.Plan
import dev.loop.core.contract.domain.PlanId
import dev.loop.core.contract.domain.TaskActual
import dev.loop.core.contract.domain.TaskKey
import dev.loop.core.contract.json.LoopJsonCompact
import dev.loop.core.contract.merge.MergeChange
import dev.loop.core.contract.merge.MergeResult
import dev.loop.core.contract.merge.PlanMerger
import dev.loop.core.contract.merge.RejectReason
import dev.loop.core.contract.validate.Issue
import dev.loop.core.contract.validate.PlanValidator
import dev.loop.core.contract.validate.ValidationResult
import dev.loop.core.data.db.IngestFailureEntity
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.db.PlanSource
import dev.loop.core.data.mapper.buildPlan
import dev.loop.core.data.mapper.toActual
import dev.loop.core.data.mapper.toEntity
import dev.loop.core.data.mapper.toIssues
import dev.loop.core.data.mapper.toSectionEntities
import dev.loop.core.data.mapper.toTaskEntities
import dev.loop.core.data.util.Clocks
import java.time.Instant
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.encodeToString

/** Outcome of an import attempt. Always returned, never thrown. */
sealed interface ImportResult {

    data class Imported(val plan: Plan, val warnings: List<Issue>) : ImportResult

    data class Revised(
        val plan: Plan,
        val changes: List<MergeChange>,
        val warnings: List<Issue>,
    ) : ImportResult {
        val strandedActuals: Int get() = changes.count { it is MergeChange.ModeChanged }
    }

    /** Parsed, but not applicable — a stale revision, or a day that has already ended. */
    data class Skipped(val reason: RejectReason?, val message: String) : ImportResult

    /**
     * Unusable. The raw text is retained in `ingest_failures` with a manual-import path,
     * per SPEC.md §2.2's "never fail silently".
     */
    data class Failed(val issues: List<Issue>, val failureId: Long) : ImportResult
}

@Singleton
class PlanRepository @Inject constructor(
    private val db: LoopDatabase,
    private val clocks: Clocks,
) {

    private val planDao = db.planDao()

    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    fun observeActivePlan(date: LocalDate): Flow<Plan?> =
        planDao.observeActivePlan(date).flatMapLatest { entity ->
            if (entity == null) {
                flowOf(null)
            } else {
                combine(
                    planDao.observeSections(entity.planId, entity.rev),
                    planDao.observeTasks(entity.planId, entity.rev),
                ) { sections, tasks -> buildPlan(entity, sections, tasks) }
            }
        }

    fun observeToday(): Flow<Plan?> = observeActivePlan(clocks.logicalToday())

    fun observePlanIssues(date: LocalDate): Flow<List<Issue>> =
        planDao.observeActivePlan(date).map { entity ->
            entity?.issuesJson?.toIssues().orEmpty()
        }

    fun observeIngestFailures(): Flow<List<IngestFailureEntity>> =
        db.ingestFailureDao().observeOutstanding()

    suspend fun activePlan(date: LocalDate): Plan? {
        val entity = planDao.activePlan(date) ?: return null
        return buildPlan(
            entity,
            planDao.sections(entity.planId, entity.rev),
            planDao.tasks(entity.planId, entity.rev),
        )
    }

    /**
     * The one write path for a plan, whatever brought it in — IMAP, the share sheet, the
     * clipboard, the debug sample loader, or the 07:00 skeleton generator. Keeping it
     * single means validation, the revision merge and the bookkeeping around them can only
     * be got wrong in one place.
     */
    suspend fun import(
        rawJson: String,
        source: PlanSource,
        subject: String? = null,
    ): ImportResult {
        val now = clocks.now()
        val today = clocks.logicalToday()

        return when (val validation = PlanValidator.validate(rawJson, today)) {
            is ValidationResult.Invalid ->
                recordFailure(rawJson, source, subject, validation.issues, now)

            is ValidationResult.Valid ->
                applyPlan(validation.value, rawJson, source, validation.warnings, now, today)
        }
    }

    private suspend fun applyPlan(
        incoming: Plan,
        rawJson: String,
        source: PlanSource,
        warnings: List<Issue>,
        now: Instant,
        today: LocalDate,
    ): ImportResult {
        if (incoming.date.isBefore(today)) {
            persist(incoming, rawJson, source, warnings, now, isActive = false)
            return ImportResult.Skipped(
                reason = null,
                message = "Plan for ${incoming.date} archived — that day has already ended",
            )
        }

        val current = activePlan(incoming.date)
            ?: run {
                persist(incoming, rawJson, source, warnings, now, isActive = true)
                return ImportResult.Imported(incoming, warnings)
            }

        val actuals = loadActuals(incoming.date)
        return when (val merge = PlanMerger.merge(current, incoming, actuals)) {
            is MergeResult.Rejected -> ImportResult.Skipped(merge.reason, merge.message)
            is MergeResult.Applied -> {
                persist(merge.plan, rawJson, source, warnings, now, isActive = true)
                ImportResult.Revised(merge.plan, merge.changes, warnings)
            }
        }
    }

    /**
     * Writes the plan and flips the active pointer in one transaction, so the UI never
     * observes two active plans, or a plan whose tasks have not landed yet.
     */
    private suspend fun persist(
        plan: Plan,
        rawJson: String,
        source: PlanSource,
        warnings: List<Issue>,
        now: Instant,
        isActive: Boolean,
    ) = db.withTransaction {
        if (isActive) planDao.deactivateAllFor(plan.date)
        planDao.replaceRevisionContents(
            plan = plan.toEntity(rawJson, now, source.name, isActive, warnings),
            sections = plan.toSectionEntities(),
            tasks = plan.toTaskEntities(),
        )
    }

    private suspend fun loadActuals(date: LocalDate): Map<TaskKey, TaskActual> =
        db.taskStateDao().forDate(date)
            .mapNotNull { state -> state.toActual()?.let { TaskKey(state.taskKey) to it } }
            .toMap()

    private suspend fun recordFailure(
        rawText: String,
        source: PlanSource,
        subject: String?,
        issues: List<Issue>,
        now: Instant,
    ): ImportResult.Failed {
        val id = db.ingestFailureDao().insert(
            IngestFailureEntity(
                receivedAt = now,
                source = source.name,
                subject = subject,
                rawText = rawText.take(MAX_RAW_TEXT),
                issuesJson = LoopJsonCompact.encodeToString(ListSerializer(Issue.serializer()), issues),
            ),
        )
        return ImportResult.Failed(issues, id)
    }

    suspend fun dismissFailure(id: Long) = db.ingestFailureDao().dismiss(id)

    /**
     * SPEC.md §5.3's 07:00 fallback: rebuild the most recent day's structure for [target]
     * with every actual cleared. Returns null when there is no previous day to copy.
     */
    suspend fun repeatPreviousSkeleton(target: LocalDate = clocks.logicalToday()): Plan? {
        val previousDate = planDao.recentDates(limit = 14).firstOrNull { it.isBefore(target) }
            ?: return null
        val source = activePlan(previousDate) ?: return null

        val skeleton = source.copy(
            planId = PlanId("skeleton-${target.toString().replace("-", "")}"),
            date = target,
            rev = 1,
            coachNote = "Repeated from $previousDate — no plan arrived for today.",
            sections = source.sections.map { section ->
                section.copy(
                    tasks = section.tasks
                        .filterNot { it.isTombstoned }
                        .map { it.copy(removedInRev = null) },
                )
            },
        )
        persist(
            plan = skeleton,
            rawJson = LoopJsonCompact.encodeToString(Plan.serializer(), skeleton),
            source = PlanSource.GENERATED,
            warnings = emptyList(),
            now = clocks.now(),
            isActive = true,
        )
        return skeleton
    }

    private companion object {
        const val MAX_RAW_TEXT = 64 * 1024
    }
}
