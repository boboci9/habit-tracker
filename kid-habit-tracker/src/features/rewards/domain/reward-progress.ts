export type RewardUnlockCandidate = {
  milestoneNumber: number;
  sourceCheckinDate: string;
};

export type RewardMilestoneUnlock = RewardUnlockCandidate & {
  profileId: string;
  unlockedAt: number;
};

export type RewardProgressState = {
  rewardGoalLabel: string;
  targetDays: number;
  completedCheckins: number;
  progressToNextMilestone: number;
  remainingToNextMilestone: number;
  achievedMilestones: number;
  nextMilestoneNumber: number;
  latestUnlockedMilestone: RewardMilestoneUnlock | null;
};

function normalizeCompletedDates(completedDates: string[]): string[] {
  return Array.from(new Set(completedDates)).sort((a, b) => a.localeCompare(b));
}

export function deriveMilestoneUnlockCandidates(
  completedDates: string[],
  targetDays: number
): RewardUnlockCandidate[] {
  if (!Number.isFinite(targetDays) || targetDays < 1) {
    return [];
  }

  const normalized = normalizeCompletedDates(completedDates);
  const unlockedMilestoneCount = Math.floor(normalized.length / targetDays);
  const candidates: RewardUnlockCandidate[] = [];

  for (let milestone = 1; milestone <= unlockedMilestoneCount; milestone += 1) {
    const sourceIndex = milestone * targetDays - 1;
    const sourceCheckinDate = normalized[sourceIndex];
    if (!sourceCheckinDate) {
      continue;
    }

    candidates.push({
      milestoneNumber: milestone,
      sourceCheckinDate,
    });
  }

  return candidates;
}

export function computeRewardProgressState(args: {
  rewardGoalLabel: string;
  completedDates: string[];
  targetDays: number;
  unlocks: RewardMilestoneUnlock[];
}): RewardProgressState {
  const normalized = normalizeCompletedDates(args.completedDates);
  const completedCheckins = normalized.length;
  const targetDays = Math.max(1, Math.trunc(args.targetDays));
  const achievedMilestones = Math.floor(completedCheckins / targetDays);
  const progressToNextMilestone = completedCheckins % targetDays;
  const remainingToNextMilestone =
    progressToNextMilestone === 0 ? targetDays : targetDays - progressToNextMilestone;

  const latestUnlockedMilestone =
    args.unlocks.length > 0
      ? args.unlocks
          .slice()
          .sort((a, b) => {
            if (b.milestoneNumber !== a.milestoneNumber) {
              return b.milestoneNumber - a.milestoneNumber;
            }
            return b.unlockedAt - a.unlockedAt;
          })[0]
      : null;

  return {
    rewardGoalLabel: args.rewardGoalLabel.trim().length > 0 ? args.rewardGoalLabel.trim() : 'Reward goal',
    targetDays,
    completedCheckins,
    progressToNextMilestone,
    remainingToNextMilestone,
    achievedMilestones,
    nextMilestoneNumber: achievedMilestones + 1,
    latestUnlockedMilestone,
  };
}
