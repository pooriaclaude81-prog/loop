package dev.loop.core.data.repository

import dev.loop.core.contract.domain.Report
import dev.loop.core.contract.domain.ReportStatus
import dev.loop.core.contract.json.LoopJson
import dev.loop.core.data.db.LoopDatabase
import dev.loop.core.data.db.ReportEntity
import dev.loop.core.data.util.Clocks
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString

@Singleton
class ReportRepository @Inject constructor(
    db: LoopDatabase,
    private val clocks: Clocks,
) {

    private val dao = db.reportDao()

    fun observe(date: LocalDate): Flow<Report?> = dao.observe(date).map { it?.decode() }

    fun observeRecent(limit: Int = 30): Flow<List<Report>> =
        dao.observeRecent(limit).map { rows -> rows.mapNotNull { it.decode() } }

    suspend fun forDate(date: LocalDate): Report? = dao.forDate(date)?.decode()

    suspend fun save(report: Report, status: ReportStatus = ReportStatus.COMPOSED) = dao.upsert(
        ReportEntity(
            date = report.date,
            json = LoopJson.encodeToString(report),
            status = status.name.lowercase(),
            composedAt = clocks.now(),
            sentAt = null,
            transport = null,
            carriedFromDate = report.carried.firstOrNull()?.date,
            lastError = null,
        ),
    )

    /** Nothing auto-sends: this is only ever called from an explicit tap (SPEC.md §2.4). */
    suspend fun markSent(date: LocalDate, transport: String) =
        dao.markSent(date, ReportStatus.SENT.name.lowercase(), clocks.now(), transport)

    /**
     * SPEC.md §2.4: still unsent at 02:00 → mark `unsent` and carry the day forward.
     * Returns the reports that need carrying into the next one.
     */
    suspend fun outstandingForCarry(): List<Report> =
        dao.withStatus(ReportStatus.UNSENT.name.lowercase()).mapNotNull { it.decode() }

    private fun ReportEntity.decode(): Report? = runCatching {
        LoopJson.decodeFromString<Report>(json)
    }.getOrNull()
}
