import { useEffect, useMemo, useRef, useState } from 'react';

import { StreakState } from '../../streak/domain/streak-engine';
import {
  resolveMascotStage,
  resolveReinforcementMessage,
} from '../domain/reinforcement-mascot';
import {
  MascotEvolutionState,
  syncMascotEvolutionState,
} from '../infrastructure/mascot-evolution-storage';

const EMPTY_MASCOT_STATE: MascotEvolutionState = {
  profileId: '',
  stageKey: 'seed',
  stageLabel: 'Seed',
  sourceCompletedCheckins: 0,
  updatedAt: 0,
};

export function useReinforcementMascot(args: {
  profileId: string | null;
  hasSubmittedToday: boolean;
  streakState: StreakState;
  completedCheckins: number;
  refreshKey: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mascotState, setMascotState] = useState<MascotEvolutionState>(EMPTY_MASCOT_STATE);
  const currentProfileRef = useRef<string | null>(args.profileId);
  const requestIdRef = useRef(0);

  useEffect(() => {
    currentProfileRef.current = args.profileId;
  }, [args.profileId]);

  const reinforcementMessage = useMemo(
    () =>
      resolveReinforcementMessage({
        hasSubmittedToday: args.hasSubmittedToday,
        streakStatus: args.streakState.status,
        streakTransition: args.streakState.lastTransition,
        currentStreak: args.streakState.currentStreak,
        statusReason: args.streakState.statusReason,
      }),
    [
      args.hasSubmittedToday,
      args.streakState.currentStreak,
      args.streakState.lastTransition,
      args.streakState.status,
      args.streakState.statusReason,
    ]
  );

  useEffect(() => {
    if (!args.profileId) {
      setMascotState(EMPTY_MASCOT_STATE);
      setError('');
      return;
    }

    const requestId = ++requestIdRef.current;
    const targetProfile = args.profileId;

    async function loadMascotState() {
      setLoading(true);
      try {
        const stage = resolveMascotStage(args.completedCheckins);
        const syncResult = await syncMascotEvolutionState({
          profileId: args.profileId ?? '',
          stage,
          sourceCompletedCheckins: args.completedCheckins,
        });

        if (requestId !== requestIdRef.current || currentProfileRef.current !== targetProfile) {
          return;
        }

        if (!syncResult.ok) {
          setError(syncResult.error);
          return;
        }

        setMascotState(syncResult.data);
        setError('');
      } catch {
        if (requestId !== requestIdRef.current || currentProfileRef.current !== targetProfile) {
          return;
        }
        setError('Unable to load mascot evolution state.');
      } finally {
        if (requestId === requestIdRef.current && currentProfileRef.current === targetProfile) {
          setLoading(false);
        }
      }
    }

    void loadMascotState();
  }, [args.completedCheckins, args.profileId, args.refreshKey]);

  return {
    loading,
    error,
    mascotState,
    reinforcementMessage,
  };
}
