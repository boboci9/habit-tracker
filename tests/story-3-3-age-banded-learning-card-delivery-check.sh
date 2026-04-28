#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/rewards/domain/learning-card.ts" ]] || { echo "FAIL: learning card domain file missing"; exit 1; }
[[ -f "$ROOT/src/features/rewards/infrastructure/learning-card-content.ts" ]] || { echo "FAIL: learning card content source missing"; exit 1; }
[[ -f "$ROOT/src/features/rewards/hooks/use-daily-learning-card.ts" ]] || { echo "FAIL: daily learning card hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q 'mapAgeToLearningBand' "$ROOT/src/features/rewards/domain/learning-card.ts" || { echo "FAIL: age-band mapping missing"; exit 1; }
grep -q 'selectDailyLearningCard' "$ROOT/src/features/rewards/domain/learning-card.ts" || { echo "FAIL: deterministic daily card selector missing"; exit 1; }
grep -q 'isGovernanceEligibleCard' "$ROOT/src/features/rewards/domain/learning-card.ts" || { echo "FAIL: governance validation missing"; exit 1; }
grep -q 'PRE_BUNDLED_LEARNING_CARDS' "$ROOT/src/features/rewards/infrastructure/learning-card-content.ts" || { echo "FAIL: pre-bundled content export missing"; exit 1; }
grep -q 'useDailyLearningCard' "$ROOT/src/app/index.tsx" || { echo "FAIL: daily learning card hook not integrated in UI"; exit 1; }
grep -q 'Daily learning card' "$ROOT/src/app/index.tsx" || { echo "FAIL: daily learning card UI section missing"; exit 1; }
grep -q 'Age band:' "$ROOT/src/app/index.tsx" || { echo "FAIL: age-band cue missing in UI"; exit 1; }

# behavior-level check: compile and execute learning card domain logic.
if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-3-3-learning-XXXXXX)
  trap 'rm -rf "$TMP_OUT"' EXIT

  (
    cd "$ROOT"
    npx tsc \
      --target ES2020 \
      --module commonjs \
      --outDir "$TMP_OUT" \
      "src/features/rewards/domain/learning-card.ts"
  )

  node - <<NODE
const {
  mapAgeToLearningBand,
  filterEligibleCardsByBand,
  selectDailyLearningCard,
} = require('${TMP_OUT}/learning-card.js');

if (mapAgeToLearningBand(8) !== '8-9' || mapAgeToLearningBand(9) !== '8-9') {
  throw new Error('expected ages 8-9 to map to 8-9 band');
}
if (mapAgeToLearningBand(10) !== '10-11' || mapAgeToLearningBand(11) !== '10-11') {
  throw new Error('expected ages 10-11 to map to 10-11 band');
}
if (mapAgeToLearningBand(12) !== '12' || mapAgeToLearningBand(15) !== '12') {
  throw new Error('expected ages 12+ to map to 12 band');
}

const cards = [
  { id: 'a', title: 'A', body: 'Body A', ageBand: '8-9', approved: true, resolved: true },
  { id: 'b', title: 'B', body: 'Body B', ageBand: '8-9', approved: false, resolved: true },
  { id: 'c', title: 'C', body: 'Body C', ageBand: '8-9', approved: true, resolved: false },
  { id: 'd', title: 'D', body: ' ', ageBand: '8-9', approved: true, resolved: true },
  { id: 'e', title: 'E', body: 'Body E', ageBand: '10-11', approved: true, resolved: true },
];

const eligible = filterEligibleCardsByBand(cards, '8-9');
if (eligible.length !== 1 || eligible[0].id !== 'a') {
  throw new Error('expected governance filtering to exclude invalid/unapproved/unresolved cards before selection');
}

const selectedA = selectDailyLearningCard({
  profileId: 'child-1',
  dateKey: '2026-04-28',
  ageBand: '8-9',
  cards,
});
const selectedB = selectDailyLearningCard({
  profileId: 'child-1',
  dateKey: '2026-04-28',
  ageBand: '8-9',
  cards,
});

if (!selectedA || selectedA.id !== 'a') {
  throw new Error('expected one governance-approved card for 8-9 band');
}
if (JSON.stringify(selectedA) !== JSON.stringify(selectedB)) {
  throw new Error('expected deterministic same-day card selection for identical input');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level learning domain execution"
fi

echo "PASS: story 3-3 age-banded daily learning card delivery checks"
