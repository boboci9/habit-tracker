#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/streak/domain/streak-engine.ts" ]] || { echo "FAIL: streak engine file missing"; exit 1; }
[[ -f "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" ]] || { echo "FAIL: daily check-in hook missing"; exit 1; }
[[ -f "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" ]] || { echo "FAIL: canonical check-in storage missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q "computeStreakState" "$ROOT/src/features/streak/domain/streak-engine.ts" || { echo "FAIL: streak compute function missing"; exit 1; }
grep -q "graceLimit" "$ROOT/src/features/streak/domain/streak-engine.ts" || { echo "FAIL: grace limit handling missing"; exit 1; }
grep -q "recovered" "$ROOT/src/features/streak/domain/streak-engine.ts" || { echo "FAIL: recovery transition missing"; exit 1; }
grep -q "reset" "$ROOT/src/features/streak/domain/streak-engine.ts" || { echo "FAIL: reset transition missing"; exit 1; }

grep -q "listCompletedCheckinDates" "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" || { echo "FAIL: completed history query missing"; exit 1; }
grep -q "computeStreakState" "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" || { echo "FAIL: hook is not using streak engine"; exit 1; }
grep -q "Grace days remaining" "$ROOT/src/app/index.tsx" || { echo "FAIL: grace-day status not rendered"; exit 1; }
grep -q "Transition:" "$ROOT/src/app/index.tsx" || { echo "FAIL: transition status not rendered"; exit 1; }

# behavior-level check: compile and execute the actual streak engine implementation.
if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-2-2-engine-XXXXXX)
  trap 'rm -rf "$TMP_OUT"' EXIT

  (
    cd "$ROOT"
    npx tsc \
      --target ES2020 \
      --module commonjs \
      --outDir "$TMP_OUT" \
      "src/features/streak/domain/streak-engine.ts"
  )

  node - <<NODE
const { computeStreakState } = require('${TMP_OUT}/streak-engine.js');

const deterministicA = computeStreakState({
  completedDates: ['2026-04-20', '2026-04-21', '2026-04-23'],
  todayDate: '2026-04-23',
  graceLimit: 2,
});

const deterministicB = computeStreakState({
  completedDates: ['2026-04-20', '2026-04-21', '2026-04-23'],
  todayDate: '2026-04-23',
  graceLimit: 2,
});

if (JSON.stringify(deterministicA) !== JSON.stringify(deterministicB)) {
  throw new Error('deterministic outputs mismatch for identical input history');
}

const recovered = computeStreakState({
  completedDates: ['2026-04-20', '2026-04-21', '2026-04-23'],
  todayDate: '2026-04-23',
  graceLimit: 2,
});

if (recovered.status !== 'recovered' || recovered.currentStreak !== 3 || recovered.graceDaysUsed !== 1) {
  throw new Error('expected recovered status with grace usage after recoverable gap');
}

const reset = computeStreakState({
  completedDates: ['2026-04-20', '2026-04-21'],
  todayDate: '2026-04-26',
  graceLimit: 2,
});

if (reset.status !== 'reset' || reset.currentStreak !== 0) {
  throw new Error('expected reset status when gap exceeds grace limit');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level engine execution"
fi

echo "PASS: story 2-2 deterministic streak/grace engine checks"
