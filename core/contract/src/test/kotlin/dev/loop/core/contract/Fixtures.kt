package dev.loop.core.contract

/**
 * The plan from SPEC.md §3.1, verbatim. If this stops parsing, the contract has drifted
 * from the document Claude is writing against.
 */
const val SPEC_PLAN_JSON: String = """
{
  "schema": 1, "type": "plan", "date": "2026-08-16",
  "plan_id": "a4f9-0816", "rev": 1, "tz": "Asia/Tehran",
  "coach_note": "You slept 5h10m and RHR is +6. Tempo run is now an easy 5k.",
  "sleep_target_min": 450,
  "report_gate": "21:30",
  "sections": [
    { "key": "study", "label": "Study", "weight": 0.40, "color": "indigo",
      "tasks": [
        { "key": "study.cardio", "label": "Cardiology", "mode": "timer",
          "target_min": 90, "window": "10:00-12:00", "priority": 1 },
        { "key": "study.pharm", "label": "Pharmacology", "mode": "timer",
          "target_min": 45, "priority": 2 }
      ]},
    { "key": "exercise", "label": "Exercise", "weight": 0.20, "color": "amber",
      "tasks": [
        { "key": "ex.run", "label": "Easy 5k", "mode": "run",
          "target": { "distance_km": 5, "pace_band": ["5:40","6:10"],
                      "run_type": "easy" }},
        { "key": "ex.gym", "label": "Push day", "mode": "lift",
          "target": { "groups": ["chest","triceps"], "exercises": 5,
                      "volume_kg": 8000, "duration_min": 60 }}
      ]},
    { "key": "research", "label": "Research", "weight": 0.25, "color": "teal",
      "tasks": [
        { "key": "res.mirna", "label": "miRNA review — intro", "mode": "timer",
          "target_min": 60 }
      ]},
    { "key": "thesis", "label": "Theses", "weight": 0.15, "color": "coral",
      "tasks": [
        { "key": "th.gholami", "label": "Gholami — results chapter",
          "mode": "status", "note": "4 days untouched" }
      ]}
  ]
}
"""

/** Minimal well-formed plan, for tests that only care about one specific defect. */
fun planJson(
    schema: String = "1",
    type: String = "\"plan\"",
    date: String = "\"2026-08-16\"",
    planId: String = "\"test-0816\"",
    rev: String = "1",
    tz: String = "\"Asia/Tehran\"",
    sections: String = DEFAULT_SECTIONS,
): String = """
{
  "schema": $schema, "type": $type, "date": $date,
  "plan_id": $planId, "rev": $rev, "tz": $tz,
  "sections": $sections
}
"""

const val DEFAULT_SECTIONS: String = """
[
  { "key": "study", "label": "Study", "weight": 1.0, "color": "indigo",
    "tasks": [
      { "key": "study.cardio", "label": "Cardiology", "mode": "timer", "target_min": 90 }
    ]}
]
"""
