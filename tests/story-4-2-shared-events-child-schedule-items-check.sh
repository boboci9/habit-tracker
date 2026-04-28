#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/calendar/domain/calendar-items.ts" ]] || { echo "FAIL: calendar items domain file missing"; exit 1; }
[[ -f "$ROOT/src/features/calendar/infrastructure/calendar-item-storage.ts" ]] || { echo "FAIL: calendar item storage file missing"; exit 1; }
[[ -f "$ROOT/src/features/calendar/hooks/use-family-calendar-items.ts" ]] || { echo "FAIL: family calendar items hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q 'projectCalendarItemsByDate' "$ROOT/src/features/calendar/domain/calendar-items.ts" || { echo "FAIL: day projection logic missing"; exit 1; }
grep -q 'addCalendarItem\|updateCalendarItem\|deleteCalendarItem' "$ROOT/src/features/calendar/infrastructure/calendar-item-storage.ts" || { echo "FAIL: calendar CRUD storage functions missing"; exit 1; }
grep -q 'Calendar edit controls' "$ROOT/src/app/index.tsx" || { echo "FAIL: calendar edit controls UI missing"; exit 1; }
grep -q 'Shared event\|Child schedule' "$ROOT/src/app/index.tsx" || { echo "FAIL: shared/child event type UI missing"; exit 1; }

if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-4-2-calendar-items-XXXXXX)
  trap 'rm -rf "$TMP_OUT"' EXIT

  (
    cd "$ROOT"
    npx tsc \
      --target ES2020 \
      --module commonjs \
      --outDir "$TMP_OUT" \
      "src/features/calendar/domain/calendar-items.ts"
  )

  node - <<NODE
const {
  projectCalendarItemsByDate,
  validateCalendarItemDraft,
} = require('${TMP_OUT}/calendar-items.js');

const items = [
  { id: '3', type: 'child_schedule', title: 'Science fair', dateKey: '2026-05-07', profileId: 'p2', createdAt: 1, updatedAt: 1 },
  { id: '1', type: 'shared_event', title: 'Family dinner', dateKey: '2026-05-07', profileId: null, createdAt: 1, updatedAt: 1 },
  { id: '2', type: 'child_schedule', title: 'Art club', dateKey: '2026-05-07', profileId: 'p1', createdAt: 1, updatedAt: 1 },
  { id: '4', type: 'shared_event', title: 'Zoo trip', dateKey: '2026-05-08', profileId: null, createdAt: 1, updatedAt: 1 },
];

const projectionA = projectCalendarItemsByDate(items);
const projectionB = projectCalendarItemsByDate(items);

if (!projectionA['2026-05-07'] || projectionA['2026-05-07'].sharedEvents.length !== 1) {
  throw new Error('expected shared event projection on correct day');
}
if (projectionA['2026-05-07'].childSchedules.length !== 2) {
  throw new Error('expected child schedule projection on correct day');
}
if (projectionA['2026-05-07'].childSchedules[0].title !== 'Art club') {
  throw new Error('expected deterministic title sorting inside day projection');
}
if (JSON.stringify(projectionA) !== JSON.stringify(projectionB)) {
  throw new Error('expected deterministic projections for identical input');
}

validateCalendarItemDraft({
  type: 'shared_event',
  title: 'School holiday',
  dateKey: '2026-05-10',
  profileId: null,
});

let errorThrown = false;
try {
  validateCalendarItemDraft({
    type: 'child_schedule',
    title: 'Piano',
    dateKey: '2026-05-11',
    profileId: null,
  });
} catch {
  errorThrown = true;
}

if (!errorThrown) {
  throw new Error('expected child_schedule draft validation to require profileId');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level calendar items domain execution"
fi

echo "PASS: story 4-2 shared events and child schedule items checks"
