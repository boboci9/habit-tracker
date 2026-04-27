#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/profiles/infrastructure/weekly-summary-storage.ts" ]] || { echo "FAIL: weekly summary storage missing"; exit 1; }
[[ -f "$ROOT/src/features/profiles/hooks/use-weekly-parent-summary.ts" ]] || { echo "FAIL: weekly parent summary hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q "export async function recordDailyCheckin" "$ROOT/src/features/profiles/infrastructure/weekly-summary-storage.ts" || { echo "FAIL: canonical daily check-in write missing"; exit 1; }
grep -q "export async function listWeeklyParentSummary" "$ROOT/src/features/profiles/infrastructure/weekly-summary-storage.ts" || { echo "FAIL: weekly summary read model missing"; exit 1; }
grep -q "daily_checkins" "$ROOT/src/features/profiles/infrastructure/weekly-summary-storage.ts" || { echo "FAIL: canonical check-in table missing"; exit 1; }
grep -q "SUM(c.completed)" "$ROOT/src/features/profiles/infrastructure/weekly-summary-storage.ts" || { echo "FAIL: derived weekly aggregation missing"; exit 1; }
grep -q "EFFORT_FIRST_PROMPTS" "$ROOT/src/features/profiles/hooks/use-weekly-parent-summary.ts" || { echo "FAIL: effort-first prompts source missing"; exit 1; }
grep -q "recordTodayForProfile" "$ROOT/src/features/profiles/hooks/use-weekly-parent-summary.ts" || { echo "FAIL: record-today action missing"; exit 1; }
grep -q "setError('')" "$ROOT/src/features/profiles/hooks/use-weekly-parent-summary.ts" || { echo "FAIL: stale error clearing missing"; exit 1; }
grep -q "Weekly parent summary" "$ROOT/src/app/index.tsx" || { echo "FAIL: weekly summary UI missing"; exit 1; }
grep -q "Reinforcement guidance prompts" "$ROOT/src/app/index.tsx" || { echo "FAIL: reinforcement prompts UI missing"; exit 1; }
grep -q "Record today as complete" "$ROOT/src/app/index.tsx" || { echo "FAIL: canonical completion action missing"; exit 1; }
grep -q "parentVerified ?" "$ROOT/src/app/index.tsx" || { echo "FAIL: parent-only visibility gating missing"; exit 1; }

echo "PASS: story 1-5 weekly parent summary checks"
