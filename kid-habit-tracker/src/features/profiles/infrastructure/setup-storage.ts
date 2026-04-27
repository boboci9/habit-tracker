import * as SQLite from 'expo-sqlite';

const DB_NAME = 'family-setup.db';
const KEY_DRAFT = 'setup_draft';
const KEY_COMPLETE = 'setup_complete';
const KEY_PARENT_PIN = 'parent_pin';
const SCHEMA_VERSION = 1;
const DEFAULT_PARENT_PIN = '1234';

export type SetupDraft = {
  familyName: string;
  childCount: number;
  initialRewardLabel: string;
};

const DEFAULT_DRAFT: SetupDraft = {
  familyName: '',
  childCount: 2,
  initialRewardLabel: '',
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
      CREATE TABLE IF NOT EXISTS setup_state (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
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

async function writeState(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `
      INSERT INTO setup_state (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at;
    `,
    [key, value, Date.now()]
  );
}

async function readState(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM setup_state WHERE key = ? LIMIT 1;',
    [key]
  );
  return row?.value ?? null;
}

export async function getSetupDraft(): Promise<SetupDraft> {
  const raw = await readState(KEY_DRAFT);
  if (!raw) {
    return DEFAULT_DRAFT;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SetupDraft>;
    const childCount = Number(parsed.childCount);

    return {
      familyName: typeof parsed.familyName === 'string' ? parsed.familyName : DEFAULT_DRAFT.familyName,
      childCount: Number.isFinite(childCount) && childCount >= 2 ? childCount : DEFAULT_DRAFT.childCount,
      initialRewardLabel:
        typeof parsed.initialRewardLabel === 'string'
          ? parsed.initialRewardLabel
          : DEFAULT_DRAFT.initialRewardLabel,
    };
  } catch {
    return DEFAULT_DRAFT;
  }
}

export async function saveSetupDraft(draft: SetupDraft): Promise<void> {
  await writeState(KEY_DRAFT, JSON.stringify(draft));
}

export async function isSetupComplete(): Promise<boolean> {
  const raw = await readState(KEY_COMPLETE);
  return raw === 'true';
}

export async function markSetupComplete(): Promise<void> {
  await writeState(KEY_COMPLETE, 'true');
}

export async function clearSetupComplete(): Promise<void> {
  await writeState(KEY_COMPLETE, 'false');
}

export async function clearSetupDraft(): Promise<void> {
  await writeState(KEY_DRAFT, JSON.stringify(DEFAULT_DRAFT));
}

export async function verifyParentPin(pin: string): Promise<boolean> {
  const raw = await readState(KEY_PARENT_PIN);
  const expected = raw ?? DEFAULT_PARENT_PIN;

  if (!raw) {
    await writeState(KEY_PARENT_PIN, expected);
  }

  return pin.trim() === expected;
}
