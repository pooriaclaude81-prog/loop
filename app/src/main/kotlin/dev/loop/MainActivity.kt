package dev.loop

import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Done
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import dagger.hilt.android.AndroidEntryPoint
import dev.loop.core.contract.envelope.Envelope
import dev.loop.core.data.db.PlanSource
import dev.loop.core.data.repository.PlanRepository
import dev.loop.core.data.settings.LoopSettings
import dev.loop.core.data.timer.TimerController
import dev.loop.core.designsystem.theme.LoopTheme
import dev.loop.feature.focus.FocusScreen
import dev.loop.feature.history.HistoryScreen
import dev.loop.feature.review.ReviewScreen
import dev.loop.feature.settings.SettingsScreen
import dev.loop.feature.today.TodayScreen
import dev.loop.notify.NotificationChannels
import dev.loop.system.Scheduler
import dev.loop.transport.ingest.IngestScheduler
import javax.inject.Inject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject lateinit var plans: PlanRepository
    @Inject lateinit var timer: TimerController
    @Inject lateinit var ingest: IngestScheduler
    @Inject lateinit var scheduler: Scheduler
    @Inject lateinit var settings: LoopSettings

    private val background = CoroutineScope(Dispatchers.Default)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        NotificationChannels.ensure(this)

        background.launch {
            // A session left open by a killed process is closed at its last heartbeat and
            // flagged unverified, rather than silently continuing to bank minutes.
            timer.recoverAfterProcessDeath()
            // SPEC.md §2.2: ingest also runs on app open, so an OEM battery killer that
            // stops WorkManager cannot break the loop entirely.
            ingest.ensurePeriodic()
            ingest.runOnce()
            scheduler.scheduleAll(settings.settings.first().reportGate)
        }

        val startRoute = routeFrom(intent)
        handleIntent(intent)

        setContent {
            LoopTheme {
                LoopApp(startRoute = startRoute)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    /** SPEC.md §2.3: share-sheet ingest, always available, zero setup. */
    private fun handleIntent(intent: Intent?) {
        when (intent?.action) {
            Intent.ACTION_SEND -> {
                val shared = intent.getStringExtra(Intent.EXTRA_TEXT) ?: return
                val payload = Envelope.extractPayload(shared) ?: shared
                background.launch { plans.import(payload, PlanSource.SHARE) }
            }

            ACTION_REPEAT_SKELETON -> background.launch { plans.repeatPreviousSkeleton() }
        }
    }

    private fun routeFrom(intent: Intent?): String = when {
        intent?.action == ACTION_OPEN_ROUTE ->
            intent.getStringExtra(EXTRA_ROUTE) ?: ROUTE_TODAY
        else -> ROUTE_TODAY
    }

    companion object {
        const val ROUTE_TODAY = "today"
        const val ROUTE_FOCUS = "focus"
        const val ROUTE_REVIEW = "review"
        const val ROUTE_HISTORY = "history"
        const val ROUTE_SETTINGS = "settings"

        const val ACTION_OPEN_ROUTE = "dev.loop.OPEN_ROUTE"
        const val ACTION_REPEAT_SKELETON = "dev.loop.REPEAT_SKELETON"
        const val EXTRA_ROUTE = "route"
    }
}

private data class Tab(val route: String, val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

@Composable
private fun LoopApp(startRoute: String) {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route

    val tabs = listOf(
        Tab(MainActivity.ROUTE_TODAY, "Today", Icons.Default.Home),
        Tab(MainActivity.ROUTE_REVIEW, "Review", Icons.Default.Done),
        Tab(MainActivity.ROUTE_HISTORY, "History", Icons.Default.DateRange),
        Tab(MainActivity.ROUTE_SETTINGS, "Settings", Icons.Default.Settings),
    )

    // Asked for once, on first launch. Without it the timer notification — the whole
    // point of the foreground service — is invisible on Android 13+.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        var asked by remember { mutableStateOf(false) }
        val launcher = rememberLauncherForActivityResult(
            ActivityResultContracts.RequestPermission(),
        ) { }
        LaunchedEffect(Unit) {
            if (!asked) {
                asked = true
                launcher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            // The Focus screen is full-bleed by design (§5.1) — no chrome over it.
            if (currentRoute != MainActivity.ROUTE_FOCUS) {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                    tabs.forEach { tab ->
                        NavigationBarItem(
                            selected = backStack?.destination?.hierarchy?.any { it.route == tab.route } == true,
                            onClick = {
                                navController.navigate(tab.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, contentDescription = tab.label) },
                            label = { Text(tab.label) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = startRoute,
            modifier = Modifier
                .fillMaxSize()
                .padding(
                    if (currentRoute == MainActivity.ROUTE_FOCUS) {
                        androidx.compose.foundation.layout.PaddingValues(0.dp)
                    } else {
                        padding
                    },
                ),
        ) {
            composable(MainActivity.ROUTE_TODAY) {
                TodayScreen(
                    viewModel = hiltViewModel(),
                    onOpenFocus = { navController.navigate(MainActivity.ROUTE_FOCUS) },
                    onOpenReview = { navController.navigate(MainActivity.ROUTE_REVIEW) },
                    modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                )
            }
            composable(MainActivity.ROUTE_FOCUS) {
                FocusScreen(
                    viewModel = hiltViewModel(),
                    onExit = { navController.popBackStack() },
                )
            }
            composable(MainActivity.ROUTE_REVIEW) {
                ReviewScreen(
                    viewModel = hiltViewModel(),
                    onBack = { navController.popBackStack() },
                    modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                )
            }
            composable(MainActivity.ROUTE_HISTORY) {
                HistoryScreen(
                    viewModel = hiltViewModel(),
                    modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                )
            }
            composable(MainActivity.ROUTE_SETTINGS) {
                SettingsScreen(
                    viewModel = hiltViewModel(),
                    modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                )
            }
        }
    }
}
