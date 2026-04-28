#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const storageDiscoveryRoot = 'src/features';

const approvedSchema = {
  daily_checkins: [
    'profile_id',
    'checkin_date',
    'pushups',
    'learning_text',
    'completed',
    'created_at',
    'updated_at',
  ],
  child_profiles: [
    'id',
    'name',
    'age',
    'avatar',
    'color',
    'reward_target_days',
    'reminder_time',
    'created_at',
    'updated_at',
  ],
  setup_state: ['key', 'value', 'updated_at'],
  reward_milestone_unlocks: [
    'profile_id',
    'milestone_number',
    'target_days',
    'source_checkin_date',
    'unlocked_at',
  ],
  mascot_evolution_state: [
    'profile_id',
    'stage_key',
    'stage_label',
    'source_completed_checkins',
    'updated_at',
  ],
  calendar_items: [
    'id',
    'item_type',
    'title',
    'date_key',
    'profile_id',
    'created_at',
    'updated_at',
  ],
  calendar_notes: ['id', 'note_text', 'date_key', 'created_at', 'updated_at'],
  streak_dispute_reports: [
    'report_id',
    'profile_alias',
    'correlation_id',
    'generated_at',
    'bundle_json',
    'created_at',
  ],
};

function parseCreateTables(content) {
  const tables = new Map();
  const createTableRegex =
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*\(([\s\S]*?)\)\s*;/gi;

  let match;
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const tableBody = match[2];
    const columns = new Set();

    for (const rawLine of tableBody.split('\n')) {
      const line = rawLine.trim().replace(/,$/, '');
      if (!line) {
        continue;
      }

      const upper = line.toUpperCase();
      if (
        /^PRIMARY\s+KEY\b/.test(upper) ||
        /^FOREIGN\s+KEY\b/.test(upper) ||
        /^UNIQUE\b/.test(upper) ||
        /^CHECK\b/.test(upper) ||
        /^CONSTRAINT\b/.test(upper)
      ) {
        continue;
      }

      const firstToken = line.split(/\s+/)[0].replace(/[`"']/g, '');
      if (firstToken.length > 0) {
        columns.add(firstToken);
      }
    }

    tables.set(tableName, columns);
  }

  return tables;
}

function parseAlterAddColumns(content) {
  const alterRegex =
    /ALTER\s+TABLE\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?([a-zA-Z0-9_]+)[`"\]]?/gi;
  const alterAdds = new Map();

  let match;
  while ((match = alterRegex.exec(content)) !== null) {
    const tableName = match[1];
    const columnName = match[2];
    if (!alterAdds.has(tableName)) {
      alterAdds.set(tableName, new Set());
    }
    alterAdds.get(tableName).add(columnName);
  }

  return alterAdds;
}

function auditSchema(discovered) {
  const failures = [];
  const approvedTableNames = new Set(Object.keys(approvedSchema));

  for (const tableName of discovered.keys()) {
    if (!approvedTableNames.has(tableName)) {
      failures.push(`Unauthorized table detected: ${tableName}`);
    }
  }

  for (const [tableName, expectedColumns] of Object.entries(approvedSchema)) {
    if (!discovered.has(tableName)) {
      failures.push(`Missing required table: ${tableName}`);
      continue;
    }

    const actualColumns = discovered.get(tableName);
    const expectedSet = new Set(expectedColumns);

    for (const column of actualColumns) {
      if (!expectedSet.has(column)) {
        failures.push(`Unauthorized column detected: ${tableName}.${column}`);
      }
    }

    for (const expected of expectedSet) {
      if (!actualColumns.has(expected)) {
        failures.push(`Missing required column: ${tableName}.${expected}`);
      }
    }
  }

  return failures;
}

function listStorageFilesRecursive(dirPath) {
  const files = [];
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listStorageFilesRecursive(full));
      continue;
    }

    if (/infrastructure\/.+-storage\.ts$/.test(full.replace(/\\/g, '/'))) {
      files.push(full);
    }
  }

  return files;
}

function getStorageFiles() {
  const root = path.join(repoRoot, storageDiscoveryRoot);
  const files = listStorageFilesRecursive(root)
    .map((filePath) => path.relative(repoRoot, filePath).replace(/\\/g, '/'))
    .sort();

  if (files.length === 0) {
    throw new Error(`No storage files discovered under ${storageDiscoveryRoot}.`);
  }

  return files;
}

function collectDiscoveredSchema() {
  const discovered = new Map();
  const storageFiles = getStorageFiles();

  for (const relativeFile of storageFiles) {
    const filePath = path.join(repoRoot, relativeFile);
    const content = fs.readFileSync(filePath, 'utf8');

    const tables = parseCreateTables(content);
    const alterAdds = parseAlterAddColumns(content);

    for (const [tableName, createColumns] of tables.entries()) {
      if (!discovered.has(tableName)) {
        discovered.set(tableName, new Set());
      }

      const target = discovered.get(tableName);
      for (const col of createColumns) {
        target.add(col);
      }

      const alters = alterAdds.get(tableName);
      if (alters) {
        for (const col of alters) {
          target.add(col);
        }
      }
    }
  }

  return discovered;
}

function runSelfTest() {
  const discovered = collectDiscoveredSchema();
  const injected = new Map(discovered);
  const dailyCheckinsColumns = new Set(injected.get('daily_checkins') || []);
  dailyCheckinsColumns.add('extra_debug_payload');
  injected.set('daily_checkins', dailyCheckinsColumns);

  const failures = auditSchema(injected);
  const hasUnauthorizedColumnFailure = failures.some((failure) =>
    failure.includes('Unauthorized column detected: daily_checkins.extra_debug_payload')
  );

  if (!hasUnauthorizedColumnFailure) {
    console.error('Self-test failed: schema audit did not reject injected unauthorized column.');
    process.exit(1);
  }

  console.log('PASS: schema self-test rejected injected unauthorized column.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const discovered = collectDiscoveredSchema();

  const failures = auditSchema(discovered);

  const discoveredPrintable = {};
  for (const [tableName, columns] of discovered.entries()) {
    discoveredPrintable[tableName] = Array.from(columns).sort();
  }

  console.log(
    JSON.stringify(
      {
        audit: 'schema-minimization',
        approvedTableCount: Object.keys(approvedSchema).length,
        discoveredTableCount: Object.keys(discoveredPrintable).length,
        discovered: discoveredPrintable,
      },
      null,
      2
    )
  );

  if (failures.length > 0) {
    console.error('\nSchema audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('\nPASS: schema audit found only approved minimum dataset tables/columns.');
}

main();
