import { useMemo } from 'react';

import { getTodayDateKey } from '../../checkin/infrastructure/daily-checkin-storage';
import {
  mapAgeToLearningBand,
  selectDailyLearningCard,
} from '../domain/learning-card';
import { PRE_BUNDLED_LEARNING_CARDS } from '../infrastructure/learning-card-content';

export function useDailyLearningCard(profileId: string | null, age: number | null, dateKey?: string) {
  const resolvedDateKey = dateKey ?? getTodayDateKey();

  const ageBand = useMemo(() => mapAgeToLearningBand(age ?? 8), [age]);

  const card = useMemo(() => {
    if (!profileId) {
      return null;
    }

    return selectDailyLearningCard({
      profileId,
      dateKey: resolvedDateKey,
      ageBand,
      cards: PRE_BUNDLED_LEARNING_CARDS,
    });
  }, [ageBand, profileId, resolvedDateKey]);

  const error = useMemo(() => {
    if (!profileId) {
      return '';
    }

    if (!card) {
      return 'No approved learning card available for this age band today.';
    }

    return '';
  }, [card, profileId]);

  return {
    loading: false,
    error,
    ageBand,
    dateKey: resolvedDateKey,
    card,
  };
}
