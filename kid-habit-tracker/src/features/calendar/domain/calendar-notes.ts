export const CALENDAR_NOTES_MAX_COUNT = 5;
export const CALENDAR_NOTE_TEXT_MAX_LENGTH = 120;

export type CalendarNote = {
  id: string;
  noteText: string;
  dateKey: string;
  createdAt: number;
  updatedAt: number;
};

export type CalendarNoteDraft = {
  noteText: string;
  dateKey: string;
};

export function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

export function normalizeDateKey(dateKey: string): string {
  return dateKey.trim();
}

export function validateCalendarNoteDraft(draft: CalendarNoteDraft): void {
  const noteText = draft.noteText.trim();
  if (noteText.length === 0) {
    throw new Error('Upcoming note text is required.');
  }

  if (noteText.length > CALENDAR_NOTE_TEXT_MAX_LENGTH) {
    throw new Error(`Upcoming note text must be at most ${CALENDAR_NOTE_TEXT_MAX_LENGTH} characters.`);
  }

  const normalizedDateKey = normalizeDateKey(draft.dateKey);
  if (!isDateKey(normalizedDateKey)) {
    throw new Error('Upcoming note date must use YYYY-MM-DD format.');
  }
}

export function assertCanAddCalendarNote(existingCount: number): void {
  if (existingCount >= CALENDAR_NOTES_MAX_COUNT) {
    throw new Error(`You can only keep up to ${CALENDAR_NOTES_MAX_COUNT} upcoming notes.`);
  }
}

export function projectCalendarNotes(notes: CalendarNote[]): CalendarNote[] {
  return [...notes].sort((a, b) => {
    if (a.dateKey !== b.dateKey) {
      return a.dateKey.localeCompare(b.dateKey);
    }

    if (a.createdAt !== b.createdAt) {
      return a.createdAt - b.createdAt;
    }

    return a.id.localeCompare(b.id);
  });
}
