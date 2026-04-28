import { useEffect, useMemo, useRef, useState } from 'react';

import { listCompletedCheckinDates } from '../../checkin/infrastructure/daily-checkin-storage';
import { computeRewardProgressState, RewardProgressState } from '../domain/reward-progress';
import { syncRewardMilestoneUnlocks } from '../infrastructure/reward-progress-storage';

const EMPTY_REWARD_STATE: RewardProgressState = {
  rewardGoalLabel: 'Reward goal',
  targetDays: 7,
  completedCheckins: 0,
  progressToNextMilestone: 0,
  remainingToNextMilestone: 7,
  achievedMilestones: 0,
  nextMilestoneNumber: 1,
  latestUnlockedMilestone: null,
};

export function useRewardProgress(
  profileId: string | null,
  rewardTargetDays: number,
  rewardGoalLabel: string,
  refreshKey: number
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rewardState, setRewardState] = useState<RewardProgressState>({
    ...EMPTY_REWARD_STATE,
    targetDays: Math.max(1, Math.trunc(rewardTargetDays || 7)),
    rewardGoalLabel: rewardGoalLabel.trim().length > 0 ? rewardGoalLabel.trim() : EMPTY_REWARD_STATE.rewardGoalLabel,
  });
  const currentProfileRef = useRef<string | null>(profileId);
  const requestIdRef = useRef(0);

  useEffect(() => {
    currentProfileRef.current = profileId;
  }, [profileId]);

  useEffect(() => {
    const targetDays = Math.max(1, Math.trunc(rewardTargetDays || 7));
    const normalizedGoal = rewardGoalLabel.trim().length > 0 ? rewardGoalLabel.trim() : 'Reward goal';

    if (!profileId) {
      setRewardState({
        ...EMPTY_REWARD_STATE,
        targetDays,
        rewardGoalLabel: normalizedGoal,
        remainingToNextMilestone: targetDays,
      });
      setError('');
      return;
    }

    const requestId = ++requestIdRef.current;
    const targetProfile = profileId;

    async function loadRewardProgress() {
      setLoading(true);
      try {
        const completedDatesResult = await listCompletedCheckinDates(profileId);
        if (requestId !== requestIdRef.current || currentProfileRef.current !== targetProfile) {
          return;
        }

        if (!completedDatesResult.ok) {
          setError(completedDatesResult.error);
          return;
        }

        const syncResult = await syncRewardMilestoneUnlocks({
          profileId,
          targetDays,
          completedDates: completedDatesResult.data,
        });
        if (requestId !== requestIdRef.current || currentProfileRef.current !== targetProfile) {
          return;
        }

        if (!syncResult.ok) {
          setError(syncResult.error);
          return;
        }

        setRewardState(
          computeRewardProgressState({
            rewardGoalLabel: normalizedGoal,
            completedDates: completedDatesResult.data,
            targetDays,
            unlocks: syncResult.data,
          })
        );
        setError('');
      } catch {
        if (requestId !== requestIdRef.current || currentProfileRef.current !== targetProfile) {
          return;
        }
        setError('Unable to load reward progress.');
      } finally {
        if (requestId === requestIdRef.current && currentProfileRef.current === targetProfile) {
          setLoading(false);
        }
      }
    }

    void loadRewardProgress();
  }, [profileId, refreshKey, rewardGoalLabel, rewardTargetDays]);

  const unlockMessage = useMemo(() => {
    if (!rewardState.latestUnlockedMilestone) {
      return null;
    }

    return `Milestone ${rewardState.latestUnlockedMilestone.milestoneNumber} unlocked on ${rewardState.latestUnlockedMilestone.sourceCheckinDate}.`;
  }, [rewardState.latestUnlockedMilestone]);

  return {
    loading,
    error,
    rewardState,
    unlockMessage,
  };
}
