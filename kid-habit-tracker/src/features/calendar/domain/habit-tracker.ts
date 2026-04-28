export type HabitTrackerProfile = {
  profileId: string;
  childName: string;
  color: string;
};

export type HabitTrackerCell = {
  dateKey: string;
  dayLabel: string;
  assignmentLabel: string;
  completed: boolean;
  statusCue: 'Done' | 'Open';
};

export type HabitTrackerRow = {
  profileId: string;
  childName: string;
  color: string;
  cells: HabitTrackerCell[];
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function getWeeklyTrackerWindow(anchorDate: Date): { weekLabel: string; weekDateKeys: string[] } {
  // V1 pilot behavior: show the week containing the 1st of the visible month as a monthly-overview anchor.
  // V2 intent: switch to current week (or parent-selected week) once tracker navigation controls are introduced.
  const anchor = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const mondayOffset = (anchor.getDay() + 6) % 7;
  const weekStart = addDays(anchor, -mondayOffset);

  const weekDateKeys: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    weekDateKeys.push(toDateKey(addDays(weekStart, i)));
  }

  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${toDateKey(weekStart)} to ${toDateKey(weekEnd)}`;
  return { weekLabel, weekDateKeys };
}

export function projectHabitTrackerRows(args: {
  profiles: HabitTrackerProfile[];
  weekDateKeys: string[];
  completedDateKeysByProfile: Record<string, Set<string>>;
}): HabitTrackerRow[] {
  return args.profiles.map((profile) => ({
    profileId: profile.profileId,
    childName: profile.childName,
    color: profile.color,
    cells: args.weekDateKeys.map((dateKey) => {
      const day = new Date(`${dateKey}T00:00:00`);
      const completed = args.completedDateKeysByProfile[profile.profileId]?.has(dateKey) ?? false;
      return {
        dateKey,
        dayLabel: DAY_LABELS[day.getDay()],
        assignmentLabel: 'Pushups + learning',
        completed,
        statusCue: completed ? 'Done' : 'Open',
      };
    }),
  }));
}
