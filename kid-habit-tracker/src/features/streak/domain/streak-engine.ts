export type StreakTransition = 'none' | 'maintained' | 'recovered' | 'reset';
export type StreakStatus = 'no-data' | 'active' | 'grace-active' | 'recovered' | 'reset';

export type StreakState = {
  currentStreak: number;
  graceLimit: number;
  graceDaysUsed: number;
  graceDaysRemaining: number;
  status: StreakStatus;
  statusReason: string;
  lastTransition: StreakTransition;
  lastCheckinDate: string | null;
};

export type StreakTimelineEntry = {
  checkinDate: string;
  currentStreak: number;
  graceDaysUsed: number;
  graceDaysRemaining: number;
  transition: StreakTransition;
  status: Exclude<StreakStatus, 'no-data' | 'grace-active'>;
  reason: string;
};

type ComputeInput = {
  completedDates: string[];
  todayDate?: string;
  graceLimit?: number;
};

const DEFAULT_GRACE_LIMIT = 2;

function transitionReason(transition: StreakTransition, dayGap = 0): string {
  if (transition === 'recovered') {
    return `Recovered streak after ${dayGap} missed day(s) within grace limit.`;
  }

  if (transition === 'reset') {
    return `Streak reset because ${dayGap} missed day(s) exceeded grace limit.`;
  }

  if (transition === 'maintained') {
    return dayGap > 0
      ? 'Streak preserved by valid check-in continuity.'
      : 'Streak preserved with consecutive check-in.';
  }

  return 'No streak transition yet.';
}

function statusReason(state: {
  status: StreakStatus;
  lastTransition: StreakTransition;
  transitionGap: number;
  daysSinceLastCheckin: number;
  graceDaysRemaining: number;
  currentStreak: number;
}): string {
  if (state.status === 'no-data') {
    return 'No completed check-ins yet.';
  }

  if (state.status === 'recovered') {
    return transitionReason('recovered', Math.max(1, state.transitionGap));
  }

  if (state.status === 'active') {
    return state.lastTransition === 'maintained'
      ? transitionReason('maintained')
      : `Active streak at ${state.currentStreak} day(s).`;
  }

  if (state.status === 'grace-active') {
    return `No check-in today. Grace is active with ${state.graceDaysRemaining} day(s) remaining.`;
  }

  return transitionReason('reset', Math.max(1, state.transitionGap));
}

function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(fromDate: string, toDate: string): number {
  const start = parseDateKey(fromDate);
  const end = parseDateKey(toDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

function normalizeDateKeys(keys: string[]): string[] {
  return Array.from(
    new Set(keys.filter((key) => isDateKey(key)).map((key) => key.trim()))
  ).sort((a, b) => (a < b ? -1 : 1));
}

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeStreakState(input: ComputeInput): StreakState {
  const graceLimit = Number.isFinite(input.graceLimit) && (input.graceLimit ?? 0) >= 0
    ? Math.trunc(input.graceLimit ?? DEFAULT_GRACE_LIMIT)
    : DEFAULT_GRACE_LIMIT;
  const completedDates = normalizeDateKeys(input.completedDates);
  const requestedToday = input.todayDate?.trim();
  const todayDate = requestedToday && isDateKey(requestedToday) ? requestedToday : getTodayDateKey();

  if (completedDates.length === 0) {
    return {
      currentStreak: 0,
      graceLimit,
      graceDaysUsed: 0,
      graceDaysRemaining: graceLimit,
      status: 'no-data',
      statusReason: 'No completed check-ins yet.',
      lastTransition: 'none',
      lastCheckinDate: null,
    };
  }

  let currentStreak = 1;
  let graceDaysUsed = 0;
  let lastTransition: StreakTransition = 'none';
  let lastTransitionGap = 0;

  for (let i = 1; i < completedDates.length; i += 1) {
    const prev = completedDates[i - 1];
    const current = completedDates[i];
    const dayGap = daysBetween(prev, current) - 1;

    if (dayGap <= 0) {
      currentStreak += 1;
      lastTransition = 'maintained';
      lastTransitionGap = 0;
      continue;
    }

    if (graceDaysUsed + dayGap <= graceLimit) {
      graceDaysUsed += dayGap;
      currentStreak += 1;
      lastTransition = 'recovered';
      lastTransitionGap = dayGap;
      continue;
    }

    currentStreak = 1;
    graceDaysUsed = 0;
    lastTransition = 'reset';
    lastTransitionGap = dayGap;
  }

  const lastCheckinDate = completedDates[completedDates.length - 1];
  const daysSinceLastCheckin = Math.max(0, daysBetween(lastCheckinDate, todayDate));

  let status: StreakStatus;
  if (daysSinceLastCheckin === 0) {
    status = lastTransition === 'recovered' ? 'recovered' : 'active';
  } else if (graceDaysUsed + daysSinceLastCheckin <= graceLimit) {
    status = 'grace-active';
    graceDaysUsed += daysSinceLastCheckin;
  } else {
    status = 'reset';
    currentStreak = 0;
    graceDaysUsed = graceLimit;
    lastTransition = 'reset';
    lastTransitionGap = daysSinceLastCheckin;
  }

  const graceDaysRemaining = Math.max(0, graceLimit - graceDaysUsed);

  return {
    currentStreak,
    graceLimit,
    graceDaysUsed,
    graceDaysRemaining,
    status,
    statusReason: statusReason({
      status,
      lastTransition,
      transitionGap: lastTransitionGap,
      daysSinceLastCheckin,
      graceDaysRemaining,
      currentStreak,
    }),
    lastTransition,
    lastCheckinDate,
  };
}

export function computeStreakTimeline(input: {
  completedDates: string[];
  graceLimit?: number;
}): StreakTimelineEntry[] {
  const graceLimit = Number.isFinite(input.graceLimit) && (input.graceLimit ?? 0) >= 0
    ? Math.trunc(input.graceLimit ?? DEFAULT_GRACE_LIMIT)
    : DEFAULT_GRACE_LIMIT;
  const completedDates = normalizeDateKeys(input.completedDates);

  if (completedDates.length === 0) {
    return [];
  }

  const timeline: StreakTimelineEntry[] = [];
  let currentStreak = 1;
  let graceDaysUsed = 0;

  timeline.push({
    checkinDate: completedDates[0],
    currentStreak,
    graceDaysUsed,
    graceDaysRemaining: graceLimit,
    transition: 'maintained',
    status: 'active',
    reason: 'Streak started with first completed check-in.',
  });

  for (let i = 1; i < completedDates.length; i += 1) {
    const prev = completedDates[i - 1];
    const current = completedDates[i];
    const dayGap = daysBetween(prev, current) - 1;

    let transition: StreakTransition = 'maintained';
    let status: Exclude<StreakStatus, 'no-data' | 'grace-active'> = 'active';

    if (dayGap <= 0) {
      currentStreak += 1;
      transition = 'maintained';
      status = 'active';
    } else if (graceDaysUsed + dayGap <= graceLimit) {
      graceDaysUsed += dayGap;
      currentStreak += 1;
      transition = 'recovered';
      status = 'recovered';
    } else {
      currentStreak = 1;
      graceDaysUsed = 0;
      transition = 'reset';
      status = 'reset';
    }

    timeline.push({
      checkinDate: current,
      currentStreak,
      graceDaysUsed,
      graceDaysRemaining: Math.max(0, graceLimit - graceDaysUsed),
      transition,
      status,
      reason: transitionReason(transition, Math.max(0, dayGap)),
    });
  }

  return timeline;
}