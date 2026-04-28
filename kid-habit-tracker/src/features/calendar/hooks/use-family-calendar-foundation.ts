import { useMemo } from 'react';

import type { ChildProfile } from '../../profiles/infrastructure/profile-storage';
import { buildMonthGrid, type CalendarDayCell } from '../domain/month-grid';

export type CalendarLegendItem = {
  profileId: string;
  childName: string;
  color: string;
};

export type FamilyCalendarCell = CalendarDayCell & {
  indicators: CalendarLegendItem[];
};

export function useFamilyCalendarFoundation(anchorDate: Date, profiles: ChildProfile[]) {
  const anchorYear = anchorDate.getFullYear();
  const anchorMonth = anchorDate.getMonth();

  const monthGrid = useMemo(
    () => buildMonthGrid(new Date(anchorYear, anchorMonth, 1)),
    [anchorMonth, anchorYear]
  );

  const legend = useMemo(
    () =>
      profiles.map((profile) => ({
        profileId: profile.id,
        childName: profile.name,
        color: profile.color,
      })),
    [profiles]
  );

  const cells = useMemo<FamilyCalendarCell[]>(
    () =>
      monthGrid.days.map((day) => ({
        ...day,
        indicators: day.inCurrentMonth ? legend : [],
      })),
    [legend, monthGrid.days]
  );

  const weeks = useMemo(() => {
    const rows: FamilyCalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  }, [cells]);

  return {
    monthLabel: monthGrid.monthLabel,
    weekdayLabels: monthGrid.weekdayLabels,
    weeks,
    legend,
  };
}
