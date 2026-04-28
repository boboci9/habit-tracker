export const CALENDAR_WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type CalendarDayCell = {
  dateKey: string;
  dayOfMonth: number;
  inCurrentMonth: boolean;
};

export type CalendarMonthGrid = {
  monthLabel: string;
  year: number;
  monthIndex: number;
  weekdayLabels: readonly string[];
  days: CalendarDayCell[];
};

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function toUtcDate(year: number, monthIndex: number, dayOfMonth: number): Date {
  return new Date(Date.UTC(year, monthIndex, dayOfMonth));
}

function addUtcDays(date: Date, days: number): Date {
  const clone = new Date(date.getTime());
  clone.setUTCDate(clone.getUTCDate() + days);
  return clone;
}

function toDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildMonthGrid(anchorDate: Date): CalendarMonthGrid {
  const year = anchorDate.getFullYear();
  const monthIndex = anchorDate.getMonth();
  const monthStart = toUtcDate(year, monthIndex, 1);

  // Convert JS weekday (Sun=0) to Monday-first index (Mon=0).
  const mondayFirstOffset = (monthStart.getUTCDay() + 6) % 7;
  const gridStart = addUtcDays(monthStart, -mondayFirstOffset);

  const days: CalendarDayCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const day = addUtcDays(gridStart, i);
    days.push({
      dateKey: toDateKey(day),
      dayOfMonth: day.getUTCDate(),
      inCurrentMonth: day.getUTCMonth() === monthIndex,
    });
  }

  return {
    monthLabel: `${MONTH_LABELS[monthIndex]} ${year}`,
    year,
    monthIndex,
    weekdayLabels: CALENDAR_WEEKDAY_LABELS,
    days,
  };
}
