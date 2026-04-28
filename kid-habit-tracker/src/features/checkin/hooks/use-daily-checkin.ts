import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  DailyCheckinRecord,
  getTodayCheckin,
  getTodayDateKey,
  listCheckinHistory,
  listCompletedCheckinDates,
  upsertTodayCheckin,
} from '../infrastructure/daily-checkin-storage';
import {
  computeStreakState,
  computeStreakTimeline,
  StreakState,
  StreakTimelineEntry,
} from '../../streak/domain/streak-engine';
import {
  AuthorizationContext,
  createStreakDisputeDiagnosticBundle,
  getLatestStreakDisputeDiagnosticBundle,
  StreakDisputeDiagnosticBundle,
} from '../../streak/infrastructure/streak-dispute-report-storage';

type DailyCheckinForm = {
  pushups: string;
  learningText: string;
};

const EMPTY_FORM: DailyCheckinForm = {
  pushups: '',
  learningText: '',
};

const EMPTY_STREAK: StreakState = {
  currentStreak: 0,
  graceLimit: 2,
  graceDaysUsed: 0,
  graceDaysRemaining: 2,
  status: 'no-data',
  statusReason: 'No completed check-ins yet.',
  lastTransition: 'none',
  lastCheckinDate: null,
};

export function useDailyCheckin(
  profileId: string | null,
  authorizationContext: AuthorizationContext = 'child'
) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<DailyCheckinForm>(EMPTY_FORM);
  const [todayRecord, setTodayRecord] = useState<DailyCheckinRecord | null>(null);
  const [streakState, setStreakState] = useState<StreakState>(EMPTY_STREAK);
  const [historyRecords, setHistoryRecords] = useState<DailyCheckinRecord[]>([]);
  const [timelineByDate, setTimelineByDate] = useState<Record<string, StreakTimelineEntry>>({});
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [latestDiagnosticBundle, setLatestDiagnosticBundle] =
    useState<StreakDisputeDiagnosticBundle | null>(null);
  const [diagnosticError, setDiagnosticError] = useState('');
  const [diagnosticSaving, setDiagnosticSaving] = useState(false);
  const currentProfileRef = useRef<string | null>(profileId);
  const loadRequestIdRef = useRef(0);

  const sortedTimelineEntries = useMemo(
    () => Object.values(timelineByDate).sort((a, b) => (a.checkinDate < b.checkinDate ? -1 : 1)),
    [timelineByDate]
  );

  useEffect(() => {
    currentProfileRef.current = profileId;
  }, [profileId]);

  const loadStreakState = useCallback(async (): Promise<string | null> => {
    if (!profileId) {
      setStreakState(EMPTY_STREAK);
      setHistoryRecords([]);
      setTimelineByDate({});
      setSelectedHistoryDate(null);
      setLatestDiagnosticBundle(null);
      setDiagnosticError('');
      return null;
    }

    const [completedDatesResult, historyResult] = await Promise.all([
      listCompletedCheckinDates(profileId),
      listCheckinHistory(profileId),
    ]);

    if (!completedDatesResult.ok) {
      return completedDatesResult.error;
    }

    if (!historyResult.ok) {
      return historyResult.error;
    }

    const timeline = computeStreakTimeline({
      completedDates: completedDatesResult.data,
      graceLimit: 2,
    });
    const timelineMap = timeline.reduce<Record<string, StreakTimelineEntry>>((acc, entry) => {
      acc[entry.checkinDate] = entry;
      return acc;
    }, {});

    setHistoryRecords(historyResult.data);
    setTimelineByDate(timelineMap);
    setSelectedHistoryDate((prev) => {
      if (prev && historyResult.data.some((record) => record.checkinDate === prev)) {
        return prev;
      }
      return historyResult.data.length > 0 ? historyResult.data[0].checkinDate : null;
    });

    setStreakState(
      computeStreakState({
        completedDates: completedDatesResult.data,
        todayDate: getTodayDateKey(),
        graceLimit: 2,
      })
    );
    return null;
  }, [profileId]);

  const loadToday = useCallback(async () => {
    if (!profileId) {
      setTodayRecord(null);
      setForm(EMPTY_FORM);
      setError('');
      return;
    }

    const requestId = ++loadRequestIdRef.current;
    const targetProfile = profileId;
    setLoading(true);
    try {
      const result = await getTodayCheckin(profileId, getTodayDateKey());
      if (requestId !== loadRequestIdRef.current || currentProfileRef.current !== targetProfile) {
        return;
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const record = result.data;
      setTodayRecord(record);
      setForm(
        record
          ? {
              pushups: `${record.pushups}`,
              learningText: record.learningText,
            }
          : EMPTY_FORM
      );
      const streakError = await loadStreakState();
      if (streakError) {
        setError(streakError);
      } else {
        setError('');
      }
    } catch {
      if (requestId !== loadRequestIdRef.current || currentProfileRef.current !== targetProfile) {
        return;
      }
      setError('Unable to load today\'s check-in.');
    } finally {
      if (requestId === loadRequestIdRef.current && currentProfileRef.current === targetProfile) {
        setLoading(false);
      }
    }
  }, [loadStreakState, profileId]);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestBundle() {
      if (!profileId) {
        setLatestDiagnosticBundle(null);
        setDiagnosticError('');
        return;
      }

      let result: Awaited<ReturnType<typeof getLatestStreakDisputeDiagnosticBundle>>;
      try {
        result = await getLatestStreakDisputeDiagnosticBundle(profileId);
      } catch {
        if (!cancelled) {
          setDiagnosticError('Unable to load streak diagnostics right now.');
        }
        return;
      }

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setDiagnosticError(result.error);
        return;
      }

      setLatestDiagnosticBundle(result.data);
    }

    void loadLatestBundle();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  const formValidation = useMemo(() => {
    const parsedPushups = Number(form.pushups.replace(/[^0-9]/g, ''));
    const pushups = Number.isFinite(parsedPushups) ? parsedPushups : NaN;
    const pushupsOk = Number.isFinite(pushups) && pushups >= 0;
    const learningTextOk = form.learningText.trim().length > 0;

    return {
      pushups,
      pushupsOk,
      learningTextOk,
      isValid: pushupsOk && learningTextOk,
    };
  }, [form]);

  const saveTodayCheckin = useCallback(async () => {
    if (!profileId || saving) {
      return;
    }

    if (!formValidation.isValid) {
      setError('Enter valid pushups and one learning entry.');
      return;
    }

    const targetProfile = profileId;
    setSaving(true);
    setError('');
    try {
      const result = await upsertTodayCheckin({
        profileId,
        pushups: formValidation.pushups,
        learningText: form.learningText,
      });

      if (currentProfileRef.current !== targetProfile) {
        return;
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setTodayRecord(result.data);
      setForm({
        pushups: `${result.data.pushups}`,
        learningText: result.data.learningText,
      });
      const streakError = await loadStreakState();
      if (streakError) {
        setError(streakError);
      } else {
        setError('');
      }
    } catch {
      if (currentProfileRef.current !== targetProfile) {
        return;
      }
      setError('Unable to save today\'s check-in.');
    } finally {
      if (currentProfileRef.current === targetProfile) {
        setSaving(false);
      }
    }
  }, [form.learningText, formValidation.isValid, formValidation.pushups, loadStreakState, profileId, saving]);

  const selectedHistoryRecord = useMemo(() => {
    if (!selectedHistoryDate) {
      return null;
    }

    return historyRecords.find((record) => record.checkinDate === selectedHistoryDate) ?? null;
  }, [historyRecords, selectedHistoryDate]);

  const selectedHistoryTimeline = useMemo(() => {
    if (!selectedHistoryDate) {
      return null;
    }

    return timelineByDate[selectedHistoryDate] ?? null;
  }, [selectedHistoryDate, timelineByDate]);

  const createStreakDisputeReport = useCallback(async () => {
    if (!profileId || diagnosticSaving) {
      return;
    }

    if (authorizationContext !== 'parent') {
      setDiagnosticError('Parent mode is required for this action.');
      return;
    }

    setDiagnosticSaving(true);
    setDiagnosticError('');

    try {
      const result = await createStreakDisputeDiagnosticBundle({
        profileId,
        authorizationContext,
        todayDate: getTodayDateKey(),
        chronology: historyRecords.map((record) => ({
          checkinDate: record.checkinDate,
          completed: record.completed,
        })),
        timelineEntries: sortedTimelineEntries,
        streakState,
      });

      if (!result.ok) {
        setDiagnosticError(result.error);
        return;
      }

      setLatestDiagnosticBundle(result.data);
    } catch {
      setDiagnosticError('Unable to save streak diagnostics right now.');
    } finally {
      setDiagnosticSaving(false);
    }
  }, [
    authorizationContext,
    diagnosticSaving,
    historyRecords,
    profileId,
    sortedTimelineEntries,
    streakState,
  ]);

  return {
    loading,
    saving,
    error,
    form,
    setForm,
    formValidation,
    saveTodayCheckin,
    hasSubmittedToday: !!todayRecord?.completed,
    todayRecord,
    streakState,
    historyRecords,
    selectedHistoryDate,
    setSelectedHistoryDate,
    selectedHistoryRecord,
    selectedHistoryTimeline,
    latestDiagnosticBundle,
    diagnosticError,
    diagnosticSaving,
    createStreakDisputeReport,
  };
}
