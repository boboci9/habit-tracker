import { useEffect, useMemo, useState } from 'react';

import { listCheckinHistory } from '../../checkin/infrastructure/daily-checkin-storage';
import type { ChildProfile } from '../../profiles/infrastructure/profile-storage';
import {
  getWeeklyTrackerWindow,
  projectHabitTrackerRows,
  type HabitTrackerRow,
} from '../domain/habit-tracker';

export function useHabitTrackerPanel(anchorDate: Date, profiles: ChildProfile[]) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<HabitTrackerRow[]>([]);

  const anchorYear = anchorDate.getFullYear();
  const anchorMonth = anchorDate.getMonth();

  const { weekLabel, weekDateKeys } = useMemo(
    () => getWeeklyTrackerWindow(new Date(anchorYear, anchorMonth, 1)),
    [anchorMonth, anchorYear]
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const byProfile: Record<string, Set<string>> = {};

        for (const profile of profiles) {
          const history = await listCheckinHistory(profile.id);
          if (!history.ok) {
            throw new Error(history.error);
          }

          byProfile[profile.id] = new Set(
            history.data
              .filter((record) => record.completed)
              .map((record) => record.checkinDate)
          );
        }

        if (!mounted) {
          return;
        }

        setRows(
          projectHabitTrackerRows({
            profiles: profiles.map((profile) => ({
              profileId: profile.id,
              childName: profile.name,
              color: profile.color,
            })),
            weekDateKeys,
            completedDateKeysByProfile: byProfile,
          })
        );
        setError('');
      } catch {
        if (!mounted) {
          return;
        }
        setError('Unable to load weekly habits/chores tracker.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [profiles, weekDateKeys]);

  return {
    loading,
    error,
    weekLabel,
    rows,
  };
}
