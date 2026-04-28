#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/calendar/domain/calendar-notes.ts" ]] || { echo "FAIL: calendar notes domain file missing"; exit 1; }
[[ -f "$ROOT/src/features/calendar/infrastructure/calendar-note-storage.ts" ]] || { echo "FAIL: calendar note storage file missing"; exit 1; }
[[ -f "$ROOT/src/features/calendar/hooks/use-upcoming-calendar-notes.ts" ]] || { echo "FAIL: upcoming calendar notes hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q 'CALENDAR_NOTES_MAX_COUNT' "$ROOT/src/features/calendar/domain/calendar-notes.ts" || { echo "FAIL: note max count constraint missing"; exit 1; }
grep -q 'addCalendarNote\|updateCalendarNote\|deleteCalendarNote\|listCalendarNotes' "$ROOT/src/features/calendar/infrastructure/calendar-note-storage.ts" || { echo "FAIL: calendar note CRUD storage functions missing"; exit 1; }
grep -q 'useUpcomingCalendarNotes' "$ROOT/src/features/calendar/hooks/use-upcoming-calendar-notes.ts" || { echo "FAIL: upcoming notes hook usage missing"; exit 1; }
grep -q 'Upcoming notes' "$ROOT/src/app/index.tsx" || { echo "FAIL: upcoming notes panel UI missing"; exit 1; }

if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-4-4-upcoming-notes-XXXXXX)
  trap 'rm -rf "$TMP_OUT"' EXIT

  (
    cd "$ROOT"
    npx tsc \
      --target ES2020 \
      --module commonjs \
      --outDir "$TMP_OUT" \
      "src/features/calendar/domain/calendar-notes.ts"
  )

  node - <<NODE
const {
  CALENDAR_NOTES_MAX_COUNT,
  assertCanAddCalendarNote,
  projectCalendarNotes,
  validateCalendarNoteDraft,
} = require('${TMP_OUT}/calendar-notes.js');

validateCalendarNoteDraft({
  noteText: 'Pack swim bag',
  dateKey: '2026-05-06',
});

let limitErrorThrown = false;
try {
  assertCanAddCalendarNote(CALENDAR_NOTES_MAX_COUNT);
} catch {
  limitErrorThrown = true;
}

if (!limitErrorThrown) {
  throw new Error('expected max note limit to reject additional notes');
}

const persistedRows = [
  { id: 'n3', noteText: 'Book dentist', dateKey: '2026-05-08', createdAt: 3, updatedAt: 3 },
  { id: 'n1', noteText: 'Pack swim bag', dateKey: '2026-05-06', createdAt: 1, updatedAt: 1 },
  { id: 'n2', noteText: 'Library return', dateKey: '2026-05-06', createdAt: 2, updatedAt: 2 },
];

const restoreA = projectCalendarNotes(persistedRows);
const restoreB = projectCalendarNotes(persistedRows);

if (restoreA[0].id !== 'n1' || restoreA[1].id !== 'n2' || restoreA[2].id !== 'n3') {
  throw new Error('expected deterministic upcoming-note ordering for persisted restore rows');
}

if (JSON.stringify(restoreA) !== JSON.stringify(restoreB)) {
  throw new Error('expected deterministic restore projection for identical persisted rows');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level upcoming notes domain execution"
fi

echo "PASS: story 4-4 upcoming notes panel and calendar persistence checks"
