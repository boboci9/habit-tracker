#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/rewards/domain/reinforcement-mascot.ts" ]] || { echo "FAIL: reinforcement + mascot domain file missing"; exit 1; }
[[ -f "$ROOT/src/features/rewards/infrastructure/mascot-evolution-storage.ts" ]] || { echo "FAIL: mascot evolution storage missing"; exit 1; }
[[ -f "$ROOT/src/features/rewards/hooks/use-reinforcement-mascot.ts" ]] || { echo "FAIL: reinforcement mascot hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q 'resolveReinforcementMessage' "$ROOT/src/features/rewards/domain/reinforcement-mascot.ts" || { echo "FAIL: reinforcement resolver missing"; exit 1; }
grep -q 'resolveMascotStage' "$ROOT/src/features/rewards/domain/reinforcement-mascot.ts" || { echo "FAIL: mascot stage resolver missing"; exit 1; }
grep -q 'syncMascotEvolutionState' "$ROOT/src/features/rewards/infrastructure/mascot-evolution-storage.ts" || { echo "FAIL: mascot evolution sync missing"; exit 1; }
grep -q 'ON CONFLICT(profile_id) DO UPDATE' "$ROOT/src/features/rewards/infrastructure/mascot-evolution-storage.ts" || { echo "FAIL: mascot persistence upsert missing"; exit 1; }
grep -q 'useReinforcementMascot' "$ROOT/src/app/index.tsx" || { echo "FAIL: reinforcement/mascot hook not integrated in UI"; exit 1; }
grep -q 'Reinforcement feedback' "$ROOT/src/app/index.tsx" || { echo "FAIL: reinforcement UI section missing"; exit 1; }
grep -q 'Mascot evolution' "$ROOT/src/app/index.tsx" || { echo "FAIL: mascot evolution UI section missing"; exit 1; }

# behavior-level check: compile and execute reinforcement + mascot domain logic.
if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-3-2-mascot-XXXXXX)
  trap 'rm -rf "$TMP_OUT"' EXIT

  (
    cd "$ROOT"
    npx tsc \
      --target ES2020 \
      --module commonjs \
      --outDir "$TMP_OUT" \
      "src/features/rewards/domain/reinforcement-mascot.ts"
  )

  node - <<NODE
const { resolveMascotStage, resolveReinforcementMessage } = require('${TMP_OUT}/reinforcement-mascot.js');

const seed = resolveMascotStage(0);
const sprout = resolveMascotStage(3);
const streaker = resolveMascotStage(7);
const champion = resolveMascotStage(14);

if (seed.key !== 'seed') {
  throw new Error('expected seed stage at 0 completed check-ins');
}
if (sprout.key !== 'sprout') {
  throw new Error('expected sprout stage at 3 completed check-ins');
}
if (streaker.key !== 'streaker') {
  throw new Error('expected streaker stage at 7 completed check-ins');
}
if (champion.key !== 'champion') {
  throw new Error('expected champion stage at 14 completed check-ins');
}

const noSubmit = resolveReinforcementMessage({
  hasSubmittedToday: false,
  streakStatus: 'active',
  streakTransition: 'maintained',
  currentStreak: 2,
  statusReason: 'Active streak.',
});
if (noSubmit !== null) {
  throw new Error('expected no reinforcement message when child has not submitted today');
}

const recovered = resolveReinforcementMessage({
  hasSubmittedToday: true,
  streakStatus: 'recovered',
  streakTransition: 'recovered',
  currentStreak: 3,
  statusReason: 'Recovered streak after missed day.',
});
if (!recovered || recovered.variant !== 'recovery') {
  throw new Error('expected recovery encouragement message for recovered streak state');
}

const active = resolveReinforcementMessage({
  hasSubmittedToday: true,
  streakStatus: 'active',
  streakTransition: 'maintained',
  currentStreak: 4,
  statusReason: 'Streak maintained.',
});
if (!active || active.variant !== 'success') {
  throw new Error('expected success reinforcement message for active streak state');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level domain execution"
fi

echo "PASS: story 3-2 reinforcement messaging and mascot evolution checks"
