import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DailyCheckinInput,
  WeeklySummaryRow,
  listWeeklyParentSummary,
  recordDailyCheckin,
} from '../infrastructure/weekly-summary-storage';

const EFFORT_FIRST_PROMPTS = [
  'I noticed your consistency this week. Showing up matters more than perfection.',
  'You kept trying even on hard days. That effort is what builds strong habits.',
  'Let us celebrate practice and progress, not just outcomes.',
  'Small daily actions are turning into a powerful routine.',
];

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const offset = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - offset);
  const year = monday.getFullYear();
  const month = `${monday.getMonth() + 1}`.padStart(2, '0');
  const date = `${monday.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export function useWeeklyParentSummary() {
  const [weekStart] = useState(getCurrentWeekStart());
  const [rows, setRows] = useState<WeeklySummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSummary = useCallback(async () => {
    const data = await listWeeklyParentSummary(weekStart);
    setRows(data);
    setError('');
  }, [weekStart]);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        await loadSummary();
      } catch {
        if (mounted) {
          setError('Unable to load weekly summary.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [loadSummary]);

  const recordTodayForProfile = useCallback(
    async (profileId: string) => {
      if (saving) {
        return;
      }

      setSaving(true);
      setError('');
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const day = `${now.getDate()}`.padStart(2, '0');
        const checkinDate = `${year}-${month}-${day}`;

        const input: DailyCheckinInput = {
          profileId,
          checkinDate,
        };

        await recordDailyCheckin(input);
        await loadSummary();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to save weekly summary.');
      } finally {
        setSaving(false);
      }
    },
    [loadSummary, saving]
  );

  const prompts = useMemo(() => EFFORT_FIRST_PROMPTS, []);

  return {
    weekStart,
    rows,
    loading,
    error,
    saving,
    recordTodayForProfile,
    prompts,
  };
}
