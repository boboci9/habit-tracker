#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const metadataDir = path.join(repoRoot, 'build-artifacts', 'metadata');

function getArg(name, fallback = '') {
  const prefixed = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefixed));
  if (!found) {
    return fallback;
  }
  return found.slice(prefixed.length);
}

function expectedVersion() {
  const appJsonPath = path.join(repoRoot, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  return appJson?.expo?.version || '0.0.0';
}

function currentCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: repoRoot, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

function listVersionedMetadataFiles(channel) {
  if (!fs.existsSync(metadataDir)) {
    return [];
  }

  const pattern = new RegExp(`^${channel}-(android|ios)-\\d{8}T\\d{6}Z-[A-Za-z0-9._-]+\\.json$`);
  return fs
    .readdirSync(metadataDir)
    .filter((name) => pattern.test(name))
    .map((name) => path.join(metadataDir, name));
}

function loadRecords(channel, sourceCommit) {
  const files = listVersionedMetadataFiles(channel);
  const records = [];

  for (const filePath of files) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (parsed?.sourceCommit === sourceCommit) {
        records.push({
          filePath,
          channel: parsed.channel,
          platform: parsed.platform,
          buildProfile: parsed.buildProfile,
          appVersion: parsed.appVersion,
          sourceCommit: parsed.sourceCommit,
          generatedAt: parsed.generatedAt,
        });
      }
    } catch {
      // Ignore malformed metadata files; valid files are still evaluated.
    }
  }

  return records;
}

function evaluateRecords(records, options) {
  const failures = [];
  const requiredPlatforms = ['android', 'ios'];
  const expectedProfiles = {
    android: 'pilot-android',
    ios: 'pilot-ios',
  };

  if (!Array.isArray(records) || records.length === 0) {
    failures.push('No build metadata records found for the source commit.');
    return failures;
  }

  for (const platform of requiredPlatforms) {
    const platformRecords = records.filter((record) => record.platform === platform);
    if (platformRecords.length === 0) {
      failures.push(`Missing ${platform} metadata for source commit ${options.sourceCommit}.`);
      continue;
    }

    const versions = new Set(platformRecords.map((record) => record.appVersion));
    if (versions.size !== 1) {
      failures.push(`Build variance detected for ${platform}: multiple appVersion values present.`);
    }

    for (const record of platformRecords) {
      if (record.channel !== options.channel) {
        failures.push(`Metadata channel mismatch for ${platform}: expected ${options.channel}, found ${record.channel}.`);
      }
      if (record.appVersion !== options.expectedAppVersion) {
        failures.push(
          `App version mismatch for ${platform}: expected ${options.expectedAppVersion}, found ${record.appVersion}.`
        );
      }
      if (record.buildProfile !== expectedProfiles[platform]) {
        failures.push(
          `Build profile mismatch for ${platform}: expected ${expectedProfiles[platform]}, found ${record.buildProfile}.`
        );
      }
      if (record.sourceCommit !== options.sourceCommit) {
        failures.push(
          `Source commit mismatch for ${platform}: expected ${options.sourceCommit}, found ${record.sourceCommit}.`
        );
      }
    }
  }

  return failures;
}

function runSelfTest() {
  const good = [
    {
      channel: 'pilot',
      platform: 'android',
      buildProfile: 'pilot-android',
      appVersion: '1.0.0',
      sourceCommit: 'abc1234',
    },
    {
      channel: 'pilot',
      platform: 'ios',
      buildProfile: 'pilot-ios',
      appVersion: '1.0.0',
      sourceCommit: 'abc1234',
    },
  ];

  const bad = [
    ...good,
    {
      channel: 'pilot',
      platform: 'ios',
      buildProfile: 'pilot-ios',
      appVersion: '1.0.1',
      sourceCommit: 'abc1234',
    },
  ];

  const goodFailures = evaluateRecords(good, {
    channel: 'pilot',
    expectedAppVersion: '1.0.0',
    sourceCommit: 'abc1234',
  });
  const badFailures = evaluateRecords(bad, {
    channel: 'pilot',
    expectedAppVersion: '1.0.0',
    sourceCommit: 'abc1234',
  });

  if (goodFailures.length !== 0 || badFailures.length === 0) {
    console.error('Self-test failed for verify-build-reproducibility checks.');
    process.exit(1);
  }

  console.log('PASS: reproducibility self-test detected build variance conditions as expected.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const channel = getArg('--channel', 'pilot');
  const sourceCommit = getArg('--source-commit', currentCommit());
  const expectedAppVersion = getArg('--expected-app-version', expectedVersion());

  const records = loadRecords(channel, sourceCommit);
  const failures = evaluateRecords(records, {
    channel,
    sourceCommit,
    expectedAppVersion,
  });

  if (failures.length > 0) {
    console.error('Build reproducibility audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        audit: 'pilot-build-reproducibility',
        status: 'pass',
        checks: 9,
        channel,
        sourceCommit,
        expectedAppVersion,
        recordsEvaluated: records.length,
      },
      null,
      2
    )
  );
}

main();
