import * as SQLite from 'expo-sqlite';

import {
  assertCanAddCalendarNote,
  CalendarNote,
  CalendarNoteDraft,
  normalizeDateKey,
  projectCalendarNotes,
  validateCalendarNoteDraft,
} from '../domain/calendar-notes';

const DB_NAME = 'family-setup.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initialized = false;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  const db = await dbPromise;

  if (!initialized) {
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS calendar_notes (
        id TEXT PRIMARY KEY NOT NULL,
        note_text TEXT NOT NULL,
        date_key TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_calendar_notes_date_key ON calendar_notes(date_key);');
    initialized = true;
  }

  return db;
}

function mapRowToCalendarNote(row: {
  id: string;
  noteText: string;
  dateKey: string;
  createdAt: number;
  updatedAt: number;
}): CalendarNote {
  return {
    id: row.id,
    noteText: row.noteText,
    dateKey: row.dateKey,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCalendarNotes(): Promise<CalendarNote[]> {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id: string;
    noteText: string;
    dateKey: string;
    createdAt: number;
    updatedAt: number;
  }>(
    `
      SELECT
        id,
        note_text AS noteText,
        date_key AS dateKey,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM calendar_notes;
    `
  );

  return projectCalendarNotes(rows.map(mapRowToCalendarNote));
}

export async function addCalendarNote(draft: CalendarNoteDraft): Promise<CalendarNote> {
  validateCalendarNoteDraft(draft);
  const db = await getDb();

  const countRow = await db.getFirstAsync<{ noteCount: number }>(
    'SELECT COUNT(*) AS noteCount FROM calendar_notes;'
  );
  assertCanAddCalendarNote(countRow?.noteCount ?? 0);

  const id = `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();

  await db.runAsync(
    `
      INSERT INTO calendar_notes (
        id,
        note_text,
        date_key,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?);
    `,
    [id, draft.noteText.trim(), normalizeDateKey(draft.dateKey), now, now]
  );

  return {
    id,
    noteText: draft.noteText.trim(),
    dateKey: normalizeDateKey(draft.dateKey),
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCalendarNote(noteId: string, draft: CalendarNoteDraft): Promise<void> {
  validateCalendarNoteDraft(draft);
  const db = await getDb();

  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM calendar_notes WHERE id = ? LIMIT 1;',
    [noteId]
  );

  if (!existing?.id) {
    throw new Error('Upcoming note not found.');
  }

  await db.runAsync(
    `
      UPDATE calendar_notes
      SET note_text = ?, date_key = ?, updated_at = ?
      WHERE id = ?;
    `,
    [draft.noteText.trim(), normalizeDateKey(draft.dateKey), Date.now(), noteId]
  );
}

export async function deleteCalendarNote(noteId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM calendar_notes WHERE id = ?;', [noteId]);
}
