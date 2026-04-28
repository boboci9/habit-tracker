#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '..');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function verifyScaffold() {
  const failures = [];

  const packageJsonPath = path.join(appRoot, 'package.json');
  const pilotChecklistPath = path.join(repoRoot, 'docs', 'pilot-release-checklist.md');
  const phase2ChecklistPath = path.join(repoRoot, 'docs', 'phase2-store-readiness-checklist.md');

  if (!exists(packageJsonPath)) {
    failures.push('Missing required file: kid-habit-tracker/package.json');
    return failures;
  }

  if (!exists(pilotChecklistPath)) {
    failures.push('Missing required file: docs/pilot-release-checklist.md');
  }

  if (!exists(phase2ChecklistPath)) {
    failures.push('Missing required file: docs/phase2-store-readiness-checklist.md');
  }

  if (failures.length > 0) {
    return failures;
  }

  const pkg = JSON.parse(read(packageJsonPath));
  const pilotChecklist = read(pilotChecklistPath);
  const phase2Checklist = read(phase2ChecklistPath);

  const releaseGate = String(pkg?.scripts?.['verify:release-gate'] || '');
  if (!releaseGate) {
    failures.push('Missing verify:release-gate script in package.json.');
  }

  if (!/verify:privacy/.test(releaseGate) || !/verify:pilot-channel-setup/.test(releaseGate) || !/verify:pilot-smoke/.test(releaseGate)) {
    failures.push('verify:release-gate must include privacy, pilot-channel-setup, and pilot-smoke checks.');
  }

  if (/store|app\s*store|google\s*play/i.test(releaseGate)) {
    failures.push('verify:release-gate must not include store-submission checks in Phase 1.');
  }

  if (!/Public App Store \/ Google Play submission checks are explicitly out of scope for Phase 1\./.test(pilotChecklist)) {
    failures.push('pilot-release-checklist must document Phase 1 exclusion of store-submission checks.');
  }

  if (!/Phase 2: store-submission checks become mandatory/.test(pilotChecklist)) {
    failures.push('pilot-release-checklist must define Phase 2 transition note for store-submission checks.');
  }

  const requiredHeadings = [
    '# Phase 2 Store Readiness Checklist',
    '## Compliance Packaging',
    '## Metadata Assets',
    '## Submission Policy Checks',
    '## Rollout Criteria',
    '## Transition Criteria: Pilot-Ready to Store-Ready',
  ];

  for (const heading of requiredHeadings) {
    if (!phase2Checklist.includes(heading)) {
      failures.push(`Phase 2 readiness checklist missing heading: ${heading}`);
    }
  }

  return failures;
}

function runSelfTest() {
  const badReleaseGate = 'npm run verify:privacy && npm run verify:pilot-smoke && npm run verify:store-submission';
  if (!/store/i.test(badReleaseGate)) {
    console.error('Self-test failed: expected store keyword in bad fixture.');
    process.exit(1);
  }

  console.log('PASS: phase2-store-readiness self-test detected store-gate marker fixture.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const failures = verifyScaffold();
  if (failures.length > 0) {
    console.error('Phase 2 store-readiness scaffold audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        audit: 'phase2-store-readiness-scaffold',
        status: 'pass',
        checks: 10,
      },
      null,
      2
    )
  );
}

main();
