import * as SQLite from 'expo-sqlite';

const DB_NAME = 'family-setup.db';
const SCHEMA_VERSION = 3;
const MIN_PROFILES = 2;
const MAX_PROFILES = 6;
const DEFAULT_REWARD_TARGET_DAYS = 7;
const DEFAULT_REMINDER_TIME = '18:00';

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  color: string;
  rewardTargetDays: number;
  reminderTime: string;
};

export type ChildProfileInput = {
  name: string;
  age: number;
  avatar: string;
  color: string;
};

export type ChildProfileSettingsInput = {
  rewardTargetDays: number;
  reminderTime: string;
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
      CREATE TABLE IF NOT EXISTS child_profiles (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        avatar TEXT NOT NULL,
        color TEXT NOT NULL UNIQUE,
        reward_target_days INTEGER NOT NULL DEFAULT 7,
        reminder_time TEXT NOT NULL DEFAULT '18:00',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    const currentVersion = versionRow?.user_version ?? 0;
    if (currentVersion < 3) {
      const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(child_profiles);');
      const columnNames = new Set(columns.map((column) => column.name));

      if (!columnNames.has('reward_target_days')) {
        await db.execAsync(
          `ALTER TABLE child_profiles ADD COLUMN reward_target_days INTEGER NOT NULL DEFAULT ${DEFAULT_REWARD_TARGET_DAYS};`
        );
      }

      if (!columnNames.has('reminder_time')) {
        await db.execAsync(
          `ALTER TABLE child_profiles ADD COLUMN reminder_time TEXT NOT NULL DEFAULT '${DEFAULT_REMINDER_TIME}';`
        );
      }
    }

    if (currentVersion < SCHEMA_VERSION) {
      await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    }

    initialized = true;
  }

  return db;
}

function validateSettingsInput(input: ChildProfileSettingsInput): void {
  if (!Number.isFinite(input.rewardTargetDays) || input.rewardTargetDays < 1 || input.rewardTargetDays > 60) {
    throw new Error('Reward target must be between 1 and 60 days.');
  }

  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(input.reminderTime.trim())) {
    throw new Error('Reminder time must use HH:MM format.');
  }
}

function validateProfileInput(input: ChildProfileInput): void {
  if (input.name.trim().length === 0) {
    throw new Error('Name is required.');
  }
  if (!Number.isFinite(input.age) || input.age < 4 || input.age > 17) {
    throw new Error('Age must be between 4 and 17.');
  }
  if (input.avatar.trim().length === 0) {
    throw new Error('Avatar is required.');
  }
  if (input.color.trim().length === 0) {
    throw new Error('Color is required.');
  }
}

export async function listChildProfiles(): Promise<ChildProfile[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ChildProfile>(
    `
      SELECT
        id,
        name,
        age,
        avatar,
        color,
        reward_target_days AS rewardTargetDays,
        reminder_time AS reminderTime
      FROM child_profiles
      ORDER BY created_at ASC;
    `
  );
  return rows;
}

export async function addChildProfile(input: ChildProfileInput): Promise<ChildProfile> {
  validateProfileInput(input);

  const db = await getDb();
  const id = `child_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();

  const colorExists = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM child_profiles WHERE color = ? LIMIT 1;',
    [input.color]
  );
  if (colorExists?.id) {
    throw new Error('Color must be unique per child profile.');
  }

  try {
    const insertResult = await db.runAsync(
      `
        INSERT INTO child_profiles (
          id,
          name,
          age,
          avatar,
          color,
          reward_target_days,
          reminder_time,
          created_at,
          updated_at
        )
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
        WHERE (SELECT COUNT(*) FROM child_profiles) < ?;
      `,
      [
        id,
        input.name.trim(),
        Math.trunc(input.age),
        input.avatar.trim(),
        input.color.trim(),
        DEFAULT_REWARD_TARGET_DAYS,
        DEFAULT_REMINDER_TIME,
        now,
        now,
        MAX_PROFILES,
      ]
    );

    if ((insertResult.changes ?? 0) === 0) {
      throw new Error('Maximum profile limit reached (6).');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed: child_profiles.color')) {
      throw new Error('Color must be unique per child profile.');
    }
    throw error;
  }

  return {
    id,
    name: input.name.trim(),
    age: Math.trunc(input.age),
    avatar: input.avatar.trim(),
    color: input.color.trim(),
    rewardTargetDays: DEFAULT_REWARD_TARGET_DAYS,
    reminderTime: DEFAULT_REMINDER_TIME,
  };
}

export async function updateChildProfile(profileId: string, input: ChildProfileInput): Promise<void> {
  validateProfileInput(input);

  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM child_profiles WHERE id = ? LIMIT 1;',
    [profileId]
  );
  if (!existing?.id) {
    throw new Error('Profile not found.');
  }

  const colorExists = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM child_profiles WHERE color = ? AND id != ? LIMIT 1;',
    [input.color, profileId]
  );
  if (colorExists?.id) {
    throw new Error('Color must be unique per child profile.');
  }

  await db.runAsync(
    `
      UPDATE child_profiles
      SET name = ?, age = ?, avatar = ?, color = ?, updated_at = ?
      WHERE id = ?;
    `,
    [input.name.trim(), Math.trunc(input.age), input.avatar.trim(), input.color.trim(), Date.now(), profileId]
  );
}

export async function updateChildProfileSettings(
  profileId: string,
  input: ChildProfileSettingsInput
): Promise<void> {
  validateSettingsInput(input);

  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM child_profiles WHERE id = ? LIMIT 1;',
    [profileId]
  );
  if (!existing?.id) {
    throw new Error('Profile not found.');
  }

  await db.runAsync(
    `
      UPDATE child_profiles
      SET reward_target_days = ?, reminder_time = ?, updated_at = ?
      WHERE id = ?;
    `,
    [Math.trunc(input.rewardTargetDays), input.reminderTime.trim(), Date.now(), profileId]
  );
}

export async function updateChildProfileWithSettings(
  profileId: string,
  profileInput: ChildProfileInput,
  settingsInput: ChildProfileSettingsInput
): Promise<void> {
  validateProfileInput(profileInput);
  validateSettingsInput(settingsInput);

  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM child_profiles WHERE id = ? LIMIT 1;',
    [profileId]
  );
  if (!existing?.id) {
    throw new Error('Profile not found.');
  }

  const colorExists = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM child_profiles WHERE color = ? AND id != ? LIMIT 1;',
    [profileInput.color, profileId]
  );
  if (colorExists?.id) {
    throw new Error('Color must be unique per child profile.');
  }

  await db.runAsync(
    `
      UPDATE child_profiles
      SET
        name = ?,
        age = ?,
        avatar = ?,
        color = ?,
        reward_target_days = ?,
        reminder_time = ?,
        updated_at = ?
      WHERE id = ?;
    `,
    [
      profileInput.name.trim(),
      Math.trunc(profileInput.age),
      profileInput.avatar.trim(),
      profileInput.color.trim(),
      Math.trunc(settingsInput.rewardTargetDays),
      settingsInput.reminderTime.trim(),
      Date.now(),
      profileId,
    ]
  );
}

export async function deleteChildProfile(profileId: string): Promise<void> {
  const db = await getDb();
  const deleteResult = await db.runAsync(
    `
      DELETE FROM child_profiles
      WHERE id = ? AND (SELECT COUNT(*) FROM child_profiles) > ?;
    `,
    [profileId, MIN_PROFILES]
  );

  if ((deleteResult.changes ?? 0) > 0) {
    return;
  }

  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM child_profiles WHERE id = ? LIMIT 1;',
    [profileId]
  );
  if (!existing?.id) {
    throw new Error('Profile not found.');
  }

  throw new Error(`At least ${MIN_PROFILES} child profiles are required.`);
}

export function getProfileCountStatus(profileCount: number) {
  return {
    minReached: profileCount >= MIN_PROFILES,
    maxReached: profileCount >= MAX_PROFILES,
    min: MIN_PROFILES,
    max: MAX_PROFILES,
  };
}
