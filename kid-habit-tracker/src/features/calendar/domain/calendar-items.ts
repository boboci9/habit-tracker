export type CalendarItemType = 'shared_event' | 'child_schedule';

export type CalendarItem = {
  id: string;
  type: CalendarItemType;
  title: string;
  dateKey: string;
  profileId: string | null;
  createdAt: number;
  updatedAt: number;
};

export type CalendarItemDraft = {
  type: CalendarItemType;
  title: string;
  dateKey: string;
  profileId: string | null;
};

export type CalendarDayProjection = {
  sharedEvents: CalendarItem[];
  childSchedules: CalendarItem[];
};

export function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function normalizeDateKey(dateKey: string): string {
  return dateKey.trim();
}

export function validateCalendarItemDraft(draft: CalendarItemDraft): void {
  if (draft.title.trim().length === 0) {
    throw new Error('Calendar item title is required.');
  }

  const normalizedDateKey = normalizeDateKey(draft.dateKey);
  if (!isDateKey(normalizedDateKey)) {
    throw new Error('Calendar item date must use YYYY-MM-DD format.');
  }

  if (draft.type === 'child_schedule' && (!draft.profileId || draft.profileId.trim().length === 0)) {
    throw new Error('Child schedule items require a child profile.');
  }
}

export function projectCalendarItemsByDate(items: CalendarItem[]): Record<string, CalendarDayProjection> {
  const projections: Record<string, CalendarDayProjection> = {};

  for (const item of items) {
    const key = normalizeDateKey(item.dateKey);
    if (!projections[key]) {
      projections[key] = {
        sharedEvents: [],
        childSchedules: [],
      };
    }

    if (item.type === 'shared_event') {
      projections[key].sharedEvents.push(item);
    } else {
      projections[key].childSchedules.push(item);
    }
  }

  for (const key of Object.keys(projections)) {
    projections[key].sharedEvents.sort((a, b) => a.title.localeCompare(b.title));
    projections[key].childSchedules.sort((a, b) => a.title.localeCompare(b.title));
  }

  return projections;
}
