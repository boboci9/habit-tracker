import * as SQLite from 'expo-sqlite';

import { MascotStage } from '../domain/reinforcement-mascot';

const DB_NAME = 'family-setup.db';
const SCHEMA_VERSION = 6;

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type MascotEvolutionState = {
  profileId: string;
  stageKey: MascotStage['key'];
  stageLabel: string;
  sourceCompletedCheckins: number;
  updatedAt: number;
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
      CREATE TABLE IF NOT EXISTS mascot_evolution_state (
        profile_id TEXT PRIMARY KEY NOT NULL,
        stage_key TEXT NOT NULL,
        stage_label TEXT NOT NULL,
        source_completed_checkins INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
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

function validateProfileId(profileId: string): string | null {
  if (profileId.trim().length === 0) {
    return 'Profile id is required.';
  }

  return null;
}

export async function syncMascotEvolutionState(args: {
  profileId: string;
  stage: MascotStage;
  sourceCompletedCheckins: number;
}): Promise<ServiceResult<MascotEvolutionState>> {
  const profileValidation = validateProfileId(args.profileId);
  if (profileValidation) {
    return { ok: false, error: profileValidation };
  }

  const sourceCompletedCheckins = Number.isFinite(args.sourceCompletedCheckins)
    ? Math.max(0, Math.trunc(args.sourceCompletedCheckins))
    : 0;

  const db = await getDb();

  await db.runAsync(
    `
      INSERT INTO mascot_evolution_state (
        profile_id,
        stage_key,
        stage_label,
        source_completed_checkins,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(profile_id) DO UPDATE SET
        stage_key = excluded.stage_key,
        stage_label = excluded.stage_label,
        source_completed_checkins = excluded.source_completed_checkins,
        updated_at = excluded.updated_at;
    `,
    [args.profileId.trim(), args.stage.key, args.stage.label, sourceCompletedCheckins, Date.now()]
  );

  const row = await db.getFirstAsync<MascotEvolutionState>(
    `
      SELECT
        profile_id AS profileId,
        stage_key AS stageKey,
        stage_label AS stageLabel,
        source_completed_checkins AS sourceCompletedCheckins,
        updated_at AS updatedAt
      FROM mascot_evolution_state
      WHERE profile_id = ?
      LIMIT 1;
    `,
    [args.profileId.trim()]
  );

  if (!row) {
    return { ok: false, error: 'Unable to load persisted mascot evolution state.' };
  }

  return { ok: true, data: row };
}
