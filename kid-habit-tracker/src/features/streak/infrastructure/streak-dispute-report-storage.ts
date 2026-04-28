import * as SQLite from 'expo-sqlite';

import { ServiceResult } from '../../checkin/infrastructure/daily-checkin-storage';
import { StreakState, StreakTimelineEntry } from '../domain/streak-engine';

const DB_NAME = 'family-setup.db';

export type AuthorizationContext = 'parent' | 'child';

export type StreakDisputeChronologyEntry = {
  checkinDate: string;
  completed: boolean;
};

export type StreakDisputeRuleHistoryEntry = {
  checkinDate: string;
  currentStreak: number;
  graceDaysUsed: number;
  graceDaysRemaining: number;
  transition: string;
  status: string;
  reason: string;
};

export type StreakDisputeDiagnosticBundle = {
  reportId: string;
  correlationId: string;
  generatedAt: string;
  profileAlias: string;
  todayDate: string;
  streakSnapshot: {
    currentStreak: number;
    graceDaysRemaining: number;
    status: string;
    reason: string;
  };
  checkinChronology: StreakDisputeChronologyEntry[];
  ruleHistory: StreakDisputeRuleHistoryEntry[];
};

type CreateBundleInput = {
  profileId: string;
  authorizationContext: AuthorizationContext;
  todayDate: string;
  chronology: StreakDisputeChronologyEntry[];
  timelineEntries: StreakTimelineEntry[];
  streakState: StreakState;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initialized = false;

function normalizeDateKey(value: string): string {
  return value.trim();
}

function compareByDateAsc<T extends { checkinDate: string }>(a: T, b: T): number {
  if (a.checkinDate < b.checkinDate) {
    return -1;
  }
  if (a.checkinDate > b.checkinDate) {
    return 1;
  }
  return 0;
}

function createProfileAlias(profileId: string): string {
  // Use a wide deterministic alias to minimize cross-profile collision risk while avoiding raw ids.
  let fnvOffsetBasis = BigInt('0xcbf29ce484222325');
  const fnvPrime = BigInt('0x100000001b3');
  const mask64 = BigInt('0xffffffffffffffff');

  for (let i = 0; i < profileId.length; i += 1) {
    fnvOffsetBasis ^= BigInt(profileId.charCodeAt(i));
    fnvOffsetBasis = (fnvOffsetBasis * fnvPrime) & mask64;
  }

  const hex = fnvOffsetBasis.toString(16).padStart(16, '0');
  const lengthTag = `${profileId.length}`.padStart(3, '0');
  return `profile-${lengthTag}-${hex}`;
}

function createReportId(): string {
  const suffix = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `diag_${Date.now()}_${suffix}`;
}

async function ensureInitialized(db: SQLite.SQLiteDatabase): Promise<void> {
  if (initialized) {
    return;
  }

  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS streak_dispute_reports (
      report_id TEXT PRIMARY KEY,
      profile_alias TEXT NOT NULL,
      correlation_id TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      bundle_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  initialized = true;
}

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  const db = await dbPromise;
  await ensureInitialized(db);
  return db;
}

export async function createStreakDisputeDiagnosticBundle(
  input: CreateBundleInput
): Promise<ServiceResult<StreakDisputeDiagnosticBundle>> {
  const profileId = input.profileId.trim();
  if (profileId.length === 0) {
    return { ok: false, error: 'Profile id is required.' };
  }

  if (input.authorizationContext !== 'parent') {
    return { ok: false, error: 'Parent mode is required for this action.' };
  }

  const profileAlias = createProfileAlias(profileId);
  const reportId = createReportId();
  const correlationId = `streak-dispute:${profileAlias}:${reportId}`;
  const generatedAt = new Date().toISOString();

  const checkinChronology = input.chronology
    .map((entry) => ({
      checkinDate: normalizeDateKey(entry.checkinDate),
      completed: !!entry.completed,
    }))
    .sort(compareByDateAsc);

  const ruleHistory = input.timelineEntries
    .map((entry) => ({
      checkinDate: normalizeDateKey(entry.checkinDate),
      currentStreak: entry.currentStreak,
      graceDaysUsed: entry.graceDaysUsed,
      graceDaysRemaining: entry.graceDaysRemaining,
      transition: entry.transition,
      status: entry.status,
      reason: entry.reason,
    }))
    .sort(compareByDateAsc);

  const bundle: StreakDisputeDiagnosticBundle = {
    reportId,
    correlationId,
    generatedAt,
    profileAlias,
    todayDate: normalizeDateKey(input.todayDate),
    streakSnapshot: {
      currentStreak: input.streakState.currentStreak,
      graceDaysRemaining: input.streakState.graceDaysRemaining,
      status: input.streakState.status,
      reason: input.streakState.statusReason,
    },
    checkinChronology,
    ruleHistory,
  };

  try {
    const db = await getDb();
    await db.runAsync(
      `
        INSERT INTO streak_dispute_reports (
          report_id,
          profile_alias,
          correlation_id,
          generated_at,
          bundle_json,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?);
      `,
      [
        bundle.reportId,
        bundle.profileAlias,
        bundle.correlationId,
        bundle.generatedAt,
        JSON.stringify(bundle),
        Date.now(),
      ]
    );
  } catch {
    return { ok: false, error: 'Unable to save streak diagnostics right now.' };
  }

  return {
    ok: true,
    data: bundle,
  };
}

export async function getLatestStreakDisputeDiagnosticBundle(
  profileId: string
): Promise<ServiceResult<StreakDisputeDiagnosticBundle | null>> {
  const trimmedProfileId = profileId.trim();
  if (trimmedProfileId.length === 0) {
    return { ok: false, error: 'Profile id is required.' };
  }

  const profileAlias = createProfileAlias(trimmedProfileId);
  let row: { bundleJson: string } | null = null;

  try {
    const db = await getDb();
    row = await db.getFirstAsync<{ bundleJson: string }>(
      `
        SELECT bundle_json AS bundleJson
        FROM streak_dispute_reports
        WHERE profile_alias = ?
        ORDER BY created_at DESC
        LIMIT 1;
      `,
      [profileAlias]
    );
  } catch {
    return { ok: false, error: 'Unable to load streak diagnostics right now.' };
  }

  if (!row) {
    return { ok: true, data: null };
  }

  try {
    const parsed = JSON.parse(row.bundleJson) as StreakDisputeDiagnosticBundle;
    return { ok: true, data: parsed };
  } catch {
    return { ok: false, error: 'Unable to decode the latest diagnostic bundle.' };
  }
}
