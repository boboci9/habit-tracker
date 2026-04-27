import * as SQLite from 'expo-sqlite';

const DB_NAME = 'family-setup.db';
const SCHEMA_VERSION = 1;

export type DailyCheckinInput = {
  profileId: string;
  checkinDate: string;
};

export type WeeklySummaryRow = {
  profileId: string;
  childName: string;
  childColor: string;
  weekStart: string;
  completionPercentage: number;
  streakStatus: string;
  missedDayCount: number;
};

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
      CREATE TABLE IF NOT EXISTS daily_checkins (
        profile_id TEXT NOT NULL,
        checkin_date TEXT NOT NULL,
        completed INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (profile_id, checkin_date)
      );
    `);

    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    const currentVersion = versionRow?.user_version ?? 0;
    if (currentVersion < SCHEMA_VERSION) {
      await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    }

    initialized = true;
  }

  return db;
}

function validateDailyCheckinInput(input: DailyCheckinInput): void {
  if (input.profileId.trim().length === 0) {
    throw new Error('Profile id is required.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.checkinDate.trim())) {
    throw new Error('Check-in date must use YYYY-MM-DD format.');
  }
}

function getWeekEndDate(weekStart: string): string {
  const [year, month, day] = weekStart.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  start.setDate(start.getDate() + 6);
  const endYear = start.getFullYear();
  const endMonth = `${start.getMonth() + 1}`.padStart(2, '0');
  const endDay = `${start.getDate()}`.padStart(2, '0');
  return `${endYear}-${endMonth}-${endDay}`;
}

export async function recordDailyCheckin(input: DailyCheckinInput): Promise<void> {
  validateDailyCheckinInput(input);

  const db = await getDb();

  await db.runAsync(
    `
      INSERT INTO daily_checkins (
        profile_id,
        checkin_date,
        completed,
        created_at
      )
      VALUES (?, ?, 1, ?)
      ON CONFLICT(profile_id, checkin_date) DO UPDATE SET
        completed = excluded.completed,
        created_at = excluded.created_at;
    `,
    [
      input.profileId.trim(),
      input.checkinDate.trim(),
      Date.now(),
    ]
  );
}

export async function listWeeklyParentSummary(weekStart: string): Promise<WeeklySummaryRow[]> {
  const db = await getDb();
  const normalizedWeek = weekStart.trim();
  const weekEnd = getWeekEndDate(normalizedWeek);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedWeek)) {
    throw new Error('Week start must use YYYY-MM-DD format.');
  }

  const rows = await db.getAllAsync<WeeklySummaryRow>(
    `
      SELECT
        p.id AS profileId,
        p.name AS childName,
        p.color AS childColor,
        ? AS weekStart,
        CAST(ROUND((COALESCE(SUM(c.completed), 0) * 100.0) / 7.0) AS INTEGER) AS completionPercentage,
        CASE
          WHEN COALESCE(SUM(c.completed), 0) >= 7 THEN 'Perfect week'
          WHEN COALESCE(SUM(c.completed), 0) >= 5 THEN 'Strong consistency'
          WHEN COALESCE(SUM(c.completed), 0) > 0 THEN 'Building streak'
          ELSE 'No check-ins yet'
        END AS streakStatus,
        CAST(7 - COALESCE(SUM(c.completed), 0) AS INTEGER) AS missedDayCount
      FROM child_profiles p
      LEFT JOIN daily_checkins c
        ON c.profile_id = p.id
       AND c.checkin_date BETWEEN ? AND ?
      ORDER BY p.created_at ASC;
    `,
    [normalizedWeek, normalizedWeek, weekEnd]
  );

  return rows;
}
