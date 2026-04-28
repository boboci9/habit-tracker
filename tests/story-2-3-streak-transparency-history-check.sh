#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/streak/domain/streak-engine.ts" ]] || { echo "FAIL: streak engine file missing"; exit 1; }
[[ -f "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" ]] || { echo "FAIL: check-in storage missing"; exit 1; }
[[ -f "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" ]] || { echo "FAIL: check-in hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q "statusReason" "$ROOT/src/features/streak/domain/streak-engine.ts" || { echo "FAIL: streak transparency reason missing"; exit 1; }
grep -q "computeStreakTimeline" "$ROOT/src/features/streak/domain/streak-engine.ts" || { echo "FAIL: streak timeline function missing"; exit 1; }
grep -q "listCheckinHistory" "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" || { echo "FAIL: day-level history query missing"; exit 1; }
grep -q "selectedHistoryDate" "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" || { echo "FAIL: selected history state missing in hook"; exit 1; }
grep -q "Day-level history" "$ROOT/src/app/index.tsx" || { echo "FAIL: day-level history UI title missing"; exit 1; }
grep -q "Rule reason" "$ROOT/src/app/index.tsx" || { echo "FAIL: rule reason text missing in UI"; exit 1; }

# behavior-level check: compile and execute real timeline and reason outputs.
if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-2-3-engine-XXXXXX)
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
const { computeStreakState, computeStreakTimeline } = require('${TMP_OUT}/streak-engine.js');

const state = computeStreakState({
  completedDates: ['2026-04-20', '2026-04-21', '2026-04-23'],
  todayDate: '2026-04-23',
  graceLimit: 2,
});

if (state.status !== 'recovered') {
  throw new Error('expected recovered status for recoverable gap history');
}

if (typeof state.statusReason !== 'string' || state.statusReason.length === 0) {
  throw new Error('expected non-empty transparency reason on streak state');
}

if (!state.statusReason.includes('1 missed day(s)')) {
  throw new Error('expected recovered reason to reflect one-day missed gap');
}

const twoDayRecovered = computeStreakState({
  completedDates: ['2026-04-20', '2026-04-23'],
  todayDate: '2026-04-23',
  graceLimit: 2,
});

if (twoDayRecovered.status !== 'recovered' || !twoDayRecovered.statusReason.includes('2 missed day(s)')) {
  throw new Error('expected recovered reason to reflect two-day missed gap');
}

const timeline = computeStreakTimeline({
  completedDates: ['2026-04-20', '2026-04-21', '2026-04-23'],
  graceLimit: 2,
});

if (timeline.length !== 3) {
  throw new Error('expected one timeline entry per completed check-in date');
}

const last = timeline[timeline.length - 1];
if (last.checkinDate !== '2026-04-23') {
  throw new Error('expected selected date context to map to persisted date');
}
if (last.transition !== 'recovered' || last.status !== 'recovered') {
  throw new Error('expected recover transition/status in timeline for recoverable gap');
}
if (typeof last.reason !== 'string' || last.reason.length === 0) {
  throw new Error('expected non-empty timeline rule reason text');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level engine execution"
fi

echo "PASS: story 2-3 streak transparency and day-level history checks"
