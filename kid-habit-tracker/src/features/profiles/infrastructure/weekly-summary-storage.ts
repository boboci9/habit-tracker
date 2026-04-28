import * as SQLite from 'expo-sqlite';

import { initializeDailyCheckinStorage } from '../../checkin/infrastructure/daily-checkin-storage';

const DB_NAME = 'family-setup.db';

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
    await initializeDailyCheckinStorage();
    await db.execAsync('PRAGMA journal_mode = WAL;');

    initialized = true;
  }

  return db;
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
