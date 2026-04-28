#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/rewards/domain/reward-progress.ts" ]] || { echo "FAIL: reward domain model missing"; exit 1; }
[[ -f "$ROOT/src/features/rewards/infrastructure/reward-progress-storage.ts" ]] || { echo "FAIL: reward storage module missing"; exit 1; }
[[ -f "$ROOT/src/features/rewards/hooks/use-reward-progress.ts" ]] || { echo "FAIL: reward progress hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q 'deriveMilestoneUnlockCandidates' "$ROOT/src/features/rewards/domain/reward-progress.ts" || { echo "FAIL: milestone candidate derivation missing"; exit 1; }
grep -q 'computeRewardProgressState' "$ROOT/src/features/rewards/domain/reward-progress.ts" || { echo "FAIL: reward progress state computation missing"; exit 1; }
grep -q 'syncRewardMilestoneUnlocks' "$ROOT/src/features/rewards/infrastructure/reward-progress-storage.ts" || { echo "FAIL: reward unlock sync missing"; exit 1; }
grep -q 'ON CONFLICT(profile_id, milestone_number, target_days) DO NOTHING' "$ROOT/src/features/rewards/infrastructure/reward-progress-storage.ts" || { echo "FAIL: target-aware unlock idempotency persistence rule missing"; exit 1; }
grep -q 'DELETE FROM reward_milestone_unlocks' "$ROOT/src/features/rewards/infrastructure/reward-progress-storage.ts" || { echo "FAIL: target-change unlock migration missing"; exit 1; }
grep -q 'useRewardProgress' "$ROOT/src/app/index.tsx" || { echo "FAIL: reward progress hook not integrated in UI"; exit 1; }
grep -q 'todayRecord?.updatedAt ?? 0' "$ROOT/src/app/index.tsx" || { echo "FAIL: immediate in-session reward refresh key missing"; exit 1; }
grep -q 'Reward progress' "$ROOT/src/app/index.tsx" || { echo "FAIL: reward progress UI title missing"; exit 1; }
grep -q 'Current reward goal:' "$ROOT/src/app/index.tsx" || { echo "FAIL: current reward goal is not visible"; exit 1; }

# behavior-level check: compile and execute reward domain for deterministic milestone/idempotency semantics.
if command -v npx >/dev/null 2>&1; then
  TMP_OUT=$(mktemp -d /tmp/story-3-1-rewards-XXXXXX)
  trap 'rm -rf "$TMP_OUT"' EXIT

  (
    cd "$ROOT"
    npx tsc \
      --target ES2020 \
      --module commonjs \
      --outDir "$TMP_OUT" \
      "src/features/rewards/domain/reward-progress.ts"
  )

  node - <<NODE
const { deriveMilestoneUnlockCandidates, computeRewardProgressState } = require('${TMP_OUT}/reward-progress.js');

const completedDates = [
  '2026-04-20',
  '2026-04-21',
  '2026-04-22',
  '2026-04-23',
  '2026-04-24',
  '2026-04-25',
  '2026-04-26',
  '2026-04-27',
  '2026-04-28',
  '2026-04-29',
  '2026-04-30',
  '2026-05-01',
  '2026-05-02',
  '2026-05-03'
];

const candidatesA = deriveMilestoneUnlockCandidates(completedDates, 7);
const candidatesB = deriveMilestoneUnlockCandidates(completedDates, 7);

if (JSON.stringify(candidatesA) !== JSON.stringify(candidatesB)) {
  throw new Error('expected deterministic milestone candidates for identical check-in history');
}

if (candidatesA.length !== 2) {
  throw new Error('expected two milestone unlock candidates for fourteen completed days with target 7');
}

if (candidatesA[0].milestoneNumber !== 1 || candidatesA[0].sourceCheckinDate !== '2026-04-26') {
  throw new Error('expected first milestone unlock to anchor to the 7th completed check-in date');
}

if (candidatesA[1].milestoneNumber !== 2 || candidatesA[1].sourceCheckinDate !== '2026-05-03') {
  throw new Error('expected second milestone unlock to anchor to the 14th completed check-in date');
}

const rewardState = computeRewardProgressState({
  rewardGoalLabel: 'Movie Night',
  completedDates,
  targetDays: 7,
  unlocks: [
    {
      profileId: 'child_1',
      milestoneNumber: 1,
      sourceCheckinDate: '2026-04-26',
      unlockedAt: 1,
    },
    {
      profileId: 'child_1',
      milestoneNumber: 2,
      sourceCheckinDate: '2026-05-03',
      unlockedAt: 2,
    },
  ],
});

if (rewardState.achievedMilestones !== 2 || rewardState.nextMilestoneNumber !== 3) {
  throw new Error('expected reward state to report achieved milestones and next milestone correctly');
}

if (!rewardState.latestUnlockedMilestone || rewardState.latestUnlockedMilestone.milestoneNumber !== 2) {
  throw new Error('expected latest unlocked milestone to be retained in reward state');
}
NODE
else
  echo "WARN: npx not found; skipping behavior-level reward domain execution"
fi

echo "PASS: story 3-1 reward progress and milestone unlock checks"
