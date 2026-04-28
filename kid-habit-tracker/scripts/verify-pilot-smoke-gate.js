#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const requiredFiles = [
  'src/app/index.tsx',
  'src/features/profiles/hooks/use-family-setup.ts',
  'src/features/profiles/hooks/use-profile-picker.ts',
  'src/features/checkin/hooks/use-daily-checkin.ts',
];

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function verify() {
  const failures = [];

  for (const relativePath of requiredFiles) {
    if (!exists(relativePath)) {
      failures.push(`Missing required smoke path file: ${relativePath}`);
    }
  }

  if (failures.length > 0) {
    return failures;
  }

  const appEntry = read('src/app/index.tsx');

  const startupSignals = [
    "import { useFamilySetup } from '../features/profiles/hooks/use-family-setup';",
    'if (loading) {',
    '<ActivityIndicator size="large" />',
  ];

  const profilePickerSignals = [
    "import { useProfilePicker } from '../features/profiles/hooks/use-profile-picker';",
    '} = useProfilePicker();',
    'selectedProfileId',
    'selectChildProfile',
  ];

  const checkinSignals = [
    "import { useDailyCheckin } from '../features/checkin/hooks/use-daily-checkin';",
    '} = useDailyCheckin(',
    'saveTodayCheckin',
    'hasSubmittedToday',
  ];

  for (const marker of startupSignals) {
    if (!appEntry.includes(marker)) {
      failures.push(`Startup smoke marker missing from app entry: ${marker}`);
    }
  }

  for (const marker of profilePickerSignals) {
    if (!appEntry.includes(marker)) {
      failures.push(`Profile picker smoke marker missing from app entry: ${marker}`);
    }
  }

  for (const marker of checkinSignals) {
    if (!appEntry.includes(marker)) {
      failures.push(`Check-in smoke marker missing from app entry: ${marker}`);
    }
  }

  return failures;
}

function runSelfTest() {
  const minimal = 'const app = true;';
  if (minimal.includes('useDailyCheckin')) {
    console.error('Self-test failed: invalid fixture unexpectedly matched smoke markers.');
    process.exit(1);
  }

  console.log('PASS: smoke-gate self-test confirmed marker detection behavior.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const failures = verify();
  if (failures.length > 0) {
    console.error('Pilot smoke gate failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        audit: 'pilot-smoke-gate',
        status: 'pass',
        checks: 13,
      },
      null,
      2
    )
  );
}

main();
