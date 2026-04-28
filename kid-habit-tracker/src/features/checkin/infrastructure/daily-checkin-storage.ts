import * as SQLite from 'expo-sqlite';

const DB_NAME = 'family-setup.db';
const SCHEMA_VERSION = 4;

export type DailyCheckinInput = {
  profileId: string;
  pushups: number;
  learningText: string;
  checkinDate?: string;
};

export type DailyCheckinRecord = {
  profileId: string;
  checkinDate: string;
  pushups: number;
  learningText: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initialized = false;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return toDateKey(new Date());
}

async function ensureInitialized(db: SQLite.SQLiteDatabase): Promise<void> {
  if (initialized) {
    return;
  }

  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_checkins (
      profile_id TEXT NOT NULL,
      checkin_date TEXT NOT NULL,
      pushups INTEGER NOT NULL DEFAULT 0,
      learning_text TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (profile_id, checkin_date)
    );
  `);

  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(daily_checkins);');
  const names = new Set(columns.map((column) => column.name));

  if (!names.has('pushups')) {
    await db.execAsync('ALTER TABLE daily_checkins ADD COLUMN pushups INTEGER NOT NULL DEFAULT 0;');
  }

  if (!names.has('learning_text')) {
    await db.execAsync("ALTER TABLE daily_checkins ADD COLUMN learning_text TEXT NOT NULL DEFAULT '';\n");
  }

  if (!names.has('updated_at')) {
    await db.execAsync('ALTER TABLE daily_checkins ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;');
    await db.execAsync('UPDATE daily_checkins SET updated_at = created_at WHERE updated_at = 0;');
  }

  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = versionRow?.user_version ?? 0;
  if (currentVersion < SCHEMA_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }

  initialized = true;
}

export async function initializeDailyCheckinStorage(): Promise<void> {
  const db = await getDb();
  await ensureInitialized(db);
}

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  const db = await dbPromise;
  await ensureInitialized(db);

  return db;
}

function validateInput(input: DailyCheckinInput): string | null {
  if (input.profileId.trim().length === 0) {
    return 'Profile id is required.';
  }

  if (!Number.isFinite(input.pushups) || input.pushups < 0) {
    return 'Pushups must be a non-negative number.';
  }

  if (input.learningText.trim().length === 0) {
    return 'Learning entry is required.';
  }

  if (input.checkinDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.checkinDate.trim())) {
    return 'Check-in date must use YYYY-MM-DD format.';
  }

  return null;
}

export async function getTodayCheckin(
  profileId: string,
  checkinDate = getTodayDateKey()
): Promise<ServiceResult<DailyCheckinRecord | null>> {
  if (profileId.trim().length === 0) {
    return { ok: false, error: 'Profile id is required.' };
  }

  const db = await getDb();
  const row = await db.getFirstAsync<{
    profileId: string;
    checkinDate: string;
    pushups: number;
    learningText: string;
    completed: number;
    createdAt: number;
    updatedAt: number;
  }>(
    `
      SELECT
        profile_id AS profileId,
        checkin_date AS checkinDate,
        pushups AS pushups,
        learning_text AS learningText,
        completed AS completed,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM daily_checkins
      WHERE profile_id = ? AND checkin_date = ?
      LIMIT 1;
    `,
    [profileId.trim(), checkinDate.trim()]
  );

  if (!row) {
    return { ok: true, data: null };
  }

  return {
    ok: true,
    data: {
      profileId: row.profileId,
      checkinDate: row.checkinDate,
      pushups: row.pushups,
      learningText: row.learningText,
      completed: row.completed === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  };
}

export async function upsertTodayCheckin(input: DailyCheckinInput): Promise<ServiceResult<DailyCheckinRecord>> {
  const validationError = validateInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const db = await getDb();
  const checkinDate = input.checkinDate?.trim() || getTodayDateKey();
  const now = Date.now();

  await db.runAsync(
    `
      INSERT INTO daily_checkins (
        profile_id,
        checkin_date,
        pushups,
        learning_text,
        completed,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(profile_id, checkin_date) DO UPDATE SET
        pushups = excluded.pushups,
        learning_text = excluded.learning_text,
        completed = excluded.completed,
        updated_at = excluded.updated_at;
    `,
    [
      input.profileId.trim(),
      checkinDate,
      Math.trunc(input.pushups),
      input.learningText.trim(),
      now,
      now,
    ]
  );

  const saved = await getTodayCheckin(input.profileId, checkinDate);
  if (!saved.ok || !saved.data) {
    return { ok: false, error: 'Unable to load saved check-in.' };
  }

  return { ok: true, data: saved.data };
}

export async function listCompletedCheckinDates(profileId: string): Promise<ServiceResult<string[]>> {
  if (profileId.trim().length === 0) {
    return { ok: false, error: 'Profile id is required.' };
  }

  const db = await getDb();
  const rows = await db.getAllAsync<{ checkinDate: string }>(
    `
      SELECT checkin_date AS checkinDate
      FROM daily_checkins
      WHERE profile_id = ? AND completed = 1
      ORDER BY checkin_date ASC;
    `,
    [profileId.trim()]
  );

  return {
    ok: true,
    data: rows.map((row) => row.checkinDate),
  };
}

export async function listCheckinHistory(profileId: string): Promise<ServiceResult<DailyCheckinRecord[]>> {
  if (profileId.trim().length === 0) {
    return { ok: false, error: 'Profile id is required.' };
  }

  const db = await getDb();
  const rows = await db.getAllAsync<{
    profileId: string;
    checkinDate: string;
    pushups: number;
    learningText: string;
    completed: number;
    createdAt: number;
    updatedAt: number;
  }>(
    `
      SELECT
        profile_id AS profileId,
        checkin_date AS checkinDate,
        pushups AS pushups,
        learning_text AS learningText,
        completed AS completed,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM daily_checkins
      WHERE profile_id = ?
      ORDER BY checkin_date DESC;
    `,
    [profileId.trim()]
  );

  return {
    ok: true,
    data: rows.map((row) => ({
      profileId: row.profileId,
      checkinDate: row.checkinDate,
      pushups: row.pushups,
      learningText: row.learningText,
      completed: row.completed === 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  };
}
