import * as SQLite from 'expo-sqlite';

import { deriveMilestoneUnlockCandidates, RewardMilestoneUnlock } from '../domain/reward-progress';

const DB_NAME = 'family-setup.db';
const SCHEMA_VERSION = 5;

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

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
      CREATE TABLE IF NOT EXISTS reward_milestone_unlocks (
        profile_id TEXT NOT NULL,
        milestone_number INTEGER NOT NULL,
        target_days INTEGER NOT NULL DEFAULT 7,
        source_checkin_date TEXT NOT NULL,
        unlocked_at INTEGER NOT NULL,
        PRIMARY KEY (profile_id, milestone_number, target_days)
      );
    `);

    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(reward_milestone_unlocks);');
    const names = new Set(columns.map((column) => column.name));

    if (!names.has('target_days')) {
      await db.execAsync('ALTER TABLE reward_milestone_unlocks ADD COLUMN target_days INTEGER NOT NULL DEFAULT 7;');
    }

    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    const currentVersion = versionRow?.user_version ?? 0;
    if (currentVersion < SCHEMA_VERSION) {
      await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    }

    initialized = true;
  }

  return db;
}

function validateProfileId(profileId: string): string | null {
  if (profileId.trim().length === 0) {
    return 'Profile id is required.';
  }

  return null;
}

export async function listRewardMilestoneUnlocks(profileId: string, targetDays: number): Promise<ServiceResult<RewardMilestoneUnlock[]>> {
  const profileValidation = validateProfileId(profileId);
  if (profileValidation) {
    return { ok: false, error: profileValidation };
  }

  if (!Number.isFinite(targetDays) || targetDays < 1) {
    return { ok: false, error: 'Reward target days must be at least 1.' };
  }

  const db = await getDb();
  const rows = await db.getAllAsync<{
    profileId: string;
    milestoneNumber: number;
    sourceCheckinDate: string;
    unlockedAt: number;
  }>(
    `
      SELECT
        profile_id AS profileId,
        milestone_number AS milestoneNumber,
        source_checkin_date AS sourceCheckinDate,
        unlocked_at AS unlockedAt
      FROM reward_milestone_unlocks
      WHERE profile_id = ? AND target_days = ?
      ORDER BY milestone_number ASC;
    `,
    [profileId.trim(), Math.trunc(targetDays)]
  );

  return {
    ok: true,
    data: rows,
  };
}

export async function syncRewardMilestoneUnlocks(args: {
  profileId: string;
  targetDays: number;
  completedDates: string[];
}): Promise<ServiceResult<RewardMilestoneUnlock[]>> {
  const profileValidation = validateProfileId(args.profileId);
  if (profileValidation) {
    return { ok: false, error: profileValidation };
  }

  if (!Number.isFinite(args.targetDays) || args.targetDays < 1) {
    return { ok: false, error: 'Reward target days must be at least 1.' };
  }

  const db = await getDb();
  const targetDays = Math.trunc(args.targetDays);

  // If target changed for this profile, replace unlock history with recalculated milestones for the new target.
  await db.runAsync(
    `
      DELETE FROM reward_milestone_unlocks
      WHERE profile_id = ? AND target_days != ?;
    `,
    [args.profileId.trim(), targetDays]
  );

  const candidates = deriveMilestoneUnlockCandidates(args.completedDates, args.targetDays);

  for (const candidate of candidates) {
    await db.runAsync(
      `
        INSERT INTO reward_milestone_unlocks (
          profile_id,
          milestone_number,
          target_days,
          source_checkin_date,
          unlocked_at
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(profile_id, milestone_number, target_days) DO NOTHING;
      `,
      [args.profileId.trim(), candidate.milestoneNumber, targetDays, candidate.sourceCheckinDate, Date.now()]
    );
  }

  return listRewardMilestoneUnlocks(args.profileId, targetDays);
}
