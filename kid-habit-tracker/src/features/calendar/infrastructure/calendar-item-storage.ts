import * as SQLite from 'expo-sqlite';

import {
  CalendarItem,
  CalendarItemDraft,
  normalizeDateKey,
  validateCalendarItemDraft,
} from '../domain/calendar-items';

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
      CREATE TABLE IF NOT EXISTS calendar_items (
        id TEXT PRIMARY KEY NOT NULL,
        item_type TEXT NOT NULL,
        title TEXT NOT NULL,
        date_key TEXT NOT NULL,
        profile_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_calendar_items_date_key ON calendar_items(date_key);');
    initialized = true;
  }

  return db;
}

function mapRowToItem(row: {
  id: string;
  type: string;
  title: string;
  dateKey: string;
  profileId: string | null;
  createdAt: number;
  updatedAt: number;
}): CalendarItem {
  return {
    id: row.id,
    type: row.type === 'child_schedule' ? 'child_schedule' : 'shared_event',
    title: row.title,
    dateKey: row.dateKey,
    profileId: row.profileId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listCalendarItemsForRange(startDateKey: string, endDateKey: string): Promise<CalendarItem[]> {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id: string;
    type: string;
    title: string;
    dateKey: string;
    profileId: string | null;
    createdAt: number;
    updatedAt: number;
  }>(
    `
      SELECT
        id,
        item_type AS type,
        title,
        date_key AS dateKey,
        profile_id AS profileId,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM calendar_items
      WHERE date_key >= ? AND date_key <= ?
      ORDER BY date_key ASC, created_at ASC;
    `,
    [normalizeDateKey(startDateKey), normalizeDateKey(endDateKey)]
  );

  return rows.map(mapRowToItem);
}

export async function addCalendarItem(draft: CalendarItemDraft): Promise<CalendarItem> {
  validateCalendarItemDraft(draft);
  const db = await getDb();

  const id = `cal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  const normalizedDateKey = normalizeDateKey(draft.dateKey);

  await db.runAsync(
    `
      INSERT INTO calendar_items (
        id,
        item_type,
        title,
        date_key,
        profile_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      id,
      draft.type,
      draft.title.trim(),
      normalizedDateKey,
      draft.type === 'child_schedule' ? draft.profileId : null,
      now,
      now,
    ]
  );

  return {
    id,
    type: draft.type,
    title: draft.title.trim(),
    dateKey: normalizedDateKey,
    profileId: draft.type === 'child_schedule' ? draft.profileId : null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCalendarItem(itemId: string, draft: CalendarItemDraft): Promise<void> {
  validateCalendarItemDraft(draft);
  const db = await getDb();

  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM calendar_items WHERE id = ? LIMIT 1;',
    [itemId]
  );
  if (!existing?.id) {
    throw new Error('Calendar item not found.');
  }

  await db.runAsync(
    `
      UPDATE calendar_items
      SET item_type = ?, title = ?, date_key = ?, profile_id = ?, updated_at = ?
      WHERE id = ?;
    `,
    [
      draft.type,
      draft.title.trim(),
      normalizeDateKey(draft.dateKey),
      draft.type === 'child_schedule' ? draft.profileId : null,
      Date.now(),
      itemId,
    ]
  );
}

export async function deleteCalendarItem(itemId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM calendar_items WHERE id = ?;', [itemId]);
}
