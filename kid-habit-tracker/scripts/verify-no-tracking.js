#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const disallowedDependencyPatterns = [
  /(^|[-_])ad(s|mob|tech)?($|[-_])/i,
  /analytics/i,
  /tracking/i,
  /segment/i,
  /mixpanel/i,
  /amplitude/i,
  /appsflyer/i,
  /adjust/i,
  /branch\.io/i,
  /firebase-analytics/i,
];

const childFacingSourceRoots = [
  'src/app',
  'src/features/checkin',
  'src/features/streak',
  'src/features/rewards',
  'src/features/calendar',
  'src/features/profiles',
];

const disallowedNetworkPatterns = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\baxios\b/,
  /https?:\/\//,
];

function listFilesRecursive(dirPath) {
  const result = [];
  if (!fs.existsSync(dirPath)) {
    return result;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      result.push(...listFilesRecursive(full));
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      result.push(full);
    }
  }

  return result;
}

function main() {
  const failures = [];

  const packageJsonPath = path.join(repoRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencyBuckets = [
    ...(Object.keys(packageJson.dependencies || {}).map((name) => ({ bucket: 'dependencies', name }))),
    ...(Object.keys(packageJson.devDependencies || {}).map((name) => ({ bucket: 'devDependencies', name }))),
  ];

  for (const dep of dependencyBuckets) {
    for (const pattern of disallowedDependencyPatterns) {
      if (pattern.test(dep.name)) {
        failures.push(`Disallowed tracking/ad-tech dependency found in ${dep.bucket}: ${dep.name}`);
        break;
      }
    }
  }

  for (const relRoot of childFacingSourceRoots) {
    const absRoot = path.join(repoRoot, relRoot);
    const files = listFilesRecursive(absRoot);

    for (const filePath of files) {
      const source = fs.readFileSync(filePath, 'utf8');
      for (const pattern of disallowedNetworkPatterns) {
        if (pattern.test(source)) {
          failures.push(
            `Potential off-device transmission pattern found in ${path.relative(repoRoot, filePath)} via ${pattern}`
          );
          break;
        }
      }
    }
  }

  const complianceConfigPath = path.join(repoRoot, 'src/config/compliance.ts');
  if (!fs.existsSync(complianceConfigPath)) {
    failures.push('Missing compliance config contract: src/config/compliance.ts');
  } else {
    const complianceSource = fs.readFileSync(complianceConfigPath, 'utf8');
    if (!/offDeviceChildHabitTransmissionAllowed:\s*false/.test(complianceSource)) {
      failures.push('Compliance config must set offDeviceChildHabitTransmissionAllowed to false for Phase 1.');
    }
    if (!/childFacingBehavioralTrackingSdkAllowed:\s*false/.test(complianceSource)) {
      failures.push('Compliance config must set childFacingBehavioralTrackingSdkAllowed to false for Phase 1.');
    }
  }

  console.log(
    JSON.stringify(
      {
        audit: 'no-tracking-and-off-device-transmission',
        dependencyCount: dependencyBuckets.length,
        scannedRoots: childFacingSourceRoots,
      },
      null,
      2
    )
  );

  if (failures.length > 0) {
    console.error('\nNo-tracking audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('\nPASS: no behavioral tracking SDKs or child-flow network transmission patterns detected.');
}

main();
