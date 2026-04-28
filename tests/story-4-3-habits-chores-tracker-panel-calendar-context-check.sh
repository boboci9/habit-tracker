#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/calendar/domain/habit-tracker.ts" ]] || { echo "FAIL: habit tracker domain file missing"; exit 1; }
[[ -f "$ROOT/src/features/calendar/hooks/use-habit-tracker-panel.ts" ]] || { echo "FAIL: habit tracker hook file missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q 'projectHabitTrackerRows' "$ROOT/src/features/calendar/domain/habit-tracker.ts" || { echo "FAIL: habit tracker projection logic missing"; exit 1; }
grep -q 'useHabitTrackerPanel' "$ROOT/src/features/calendar/hooks/use-habit-tracker-panel.ts" || { echo "FAIL: habit tracker panel hook missing"; exit 1; }
grep -q 'Show habits/chores tracker\|Hide habits/chores tracker' "$ROOT/src/app/index.tsx" || { echo "FAIL: tracker panel toggle missing"; exit 1; }
grep -q 'Done\|Open' "$ROOT/src/app/index.tsx" || { echo "FAIL: non-color completion cues missing"; exit 1; }

if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-4-3-tracker-XXXXXX)
  trap 'rm -rf "$TMP_OUT"' EXIT

  (
    cd "$ROOT"
    npx tsc \
      --target ES2020 \
      --module commonjs \
      --outDir "$TMP_OUT" \
      "src/features/calendar/domain/habit-tracker.ts"
  )

  node - <<NODE
const {
  getWeeklyTrackerWindow,
  projectHabitTrackerRows,
} = require('${TMP_OUT}/habit-tracker.js');

const { weekDateKeys } = getWeeklyTrackerWindow(new Date(2026, 4, 14));
if (weekDateKeys.length !== 7) {
  throw new Error('expected 7-day weekly tracker window');
}

const rowsA = projectHabitTrackerRows({
  profiles: [
    { profileId: 'p1', childName: 'Ada', color: '#f04438' },
    { profileId: 'p2', childName: 'Ben', color: '#1570ef' },
  ],
  weekDateKeys,
  completedDateKeysByProfile: {
    p1: new Set([weekDateKeys[1], weekDateKeys[3]]),
    p2: new Set([weekDateKeys[2]]),
  },
});

const rowsB = projectHabitTrackerRows({
  profiles: [
    { profileId: 'p1', childName: 'Ada', color: '#f04438' },
    { profileId: 'p2', childName: 'Ben', color: '#1570ef' },
  ],
  weekDateKeys,
  completedDateKeysByProfile: {
    p1: new Set([weekDateKeys[1], weekDateKeys[3]]),
    p2: new Set([weekDateKeys[2]]),
  },
});

if (rowsA[0].cells[1].statusCue !== 'Done' || rowsA[0].cells[0].statusCue !== 'Open') {
  throw new Error('expected completion cues aligned with check-in completion');
}
if (rowsA[1].cells[2].statusCue !== 'Done') {
  throw new Error('expected second profile completion alignment');
}
if (JSON.stringify(rowsA) !== JSON.stringify(rowsB)) {
  throw new Error('expected deterministic tracker projection for identical inputs');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level habit tracker domain execution"
fi

echo "PASS: story 4-3 habits/chores tracker panel calendar context checks"
