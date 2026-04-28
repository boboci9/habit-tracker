#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/calendar/domain/month-grid.ts" ]] || { echo "FAIL: calendar month-grid domain file missing"; exit 1; }
[[ -f "$ROOT/src/features/calendar/hooks/use-family-calendar-foundation.ts" ]] || { echo "FAIL: family calendar hook file missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q 'buildMonthGrid' "$ROOT/src/features/calendar/domain/month-grid.ts" || { echo "FAIL: month-grid builder missing"; exit 1; }
grep -q 'CALENDAR_WEEKDAY_LABELS' "$ROOT/src/features/calendar/domain/month-grid.ts" || { echo "FAIL: weekday labels missing"; exit 1; }
grep -q 'useFamilyCalendarFoundation' "$ROOT/src/features/calendar/hooks/use-family-calendar-foundation.ts" || { echo "FAIL: family calendar foundation hook missing"; exit 1; }
grep -q 'Open Family Calendar' "$ROOT/src/app/index.tsx" || { echo "FAIL: family calendar entry action missing"; exit 1; }
grep -q 'Family Calendar path is independent from child profile selection' "$ROOT/src/app/index.tsx" || { echo "FAIL: independent path cue missing"; exit 1; }
grep -q 'Mon' "$ROOT/src/features/calendar/domain/month-grid.ts" || { echo "FAIL: Monday-first labels not found"; exit 1; }

# behavior-level check: compile and execute month-grid determinism logic.
if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-4-1-calendar-XXXXXX)
  trap 'rm -rf "$TMP_OUT"' EXIT

  (
    cd "$ROOT"
    npx tsc \
      --target ES2020 \
      --module commonjs \
      --outDir "$TMP_OUT" \
      "src/features/calendar/domain/month-grid.ts"
  )

  node - <<NODE
const { buildMonthGrid } = require('${TMP_OUT}/month-grid.js');

const july = buildMonthGrid(new Date(2026, 6, 14));
const julyAgain = buildMonthGrid(new Date(2026, 6, 14));

if (july.weekdayLabels.join(',') !== 'Mon,Tue,Wed,Thu,Fri,Sat,Sun') {
  throw new Error('expected Monday-Sunday weekday order');
}
if (july.days.length !== 42) {
  throw new Error('expected fixed 42-cell month grid');
}
if (july.days[0].dateKey !== '2026-06-29') {
  throw new Error('expected July 2026 grid to start on Monday 2026-06-29');
}
if (july.days[0].inCurrentMonth !== false || july.days[2].inCurrentMonth !== true) {
  throw new Error('expected out-of-month padding then current-month cells');
}
if (JSON.stringify(july) !== JSON.stringify(julyAgain)) {
  throw new Error('expected deterministic month-grid output for identical input');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level calendar-domain execution"
fi

echo "PASS: story 4-1 family calendar entry and monthly view foundation checks"
