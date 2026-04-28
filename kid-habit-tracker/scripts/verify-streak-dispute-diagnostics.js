#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const targets = {
  compliance: 'src/config/compliance.ts',
  checkinHook: 'src/features/checkin/hooks/use-daily-checkin.ts',
  diagnosticStorage: 'src/features/streak/infrastructure/streak-dispute-report-storage.ts',
  appScreen: 'src/app/index.tsx',
};

function readTargets() {
  const result = {};
  for (const [key, relativePath] of Object.entries(targets)) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing required file: ${relativePath}`);
    }
    result[key] = fs.readFileSync(absolutePath, 'utf8');
  }
  return result;
}

function auditSource(source) {
  const failures = [];

  if (!/CREATE TABLE IF NOT EXISTS streak_dispute_reports/.test(source.diagnosticStorage)) {
    failures.push('streak dispute diagnostics must persist in local streak_dispute_reports storage.');
  }

  if (!/correlation_id TEXT NOT NULL/.test(source.diagnosticStorage)) {
    failures.push('diagnostic storage must include correlation metadata.');
  }

  if (!/if \(input\.authorizationContext !== 'parent'\)/.test(source.diagnosticStorage)) {
    failures.push('diagnostic bundle generation must enforce parent-only authorization context.');
  }

  if (!/profile-\$\{lengthTag\}-\$\{hex\}/.test(source.diagnosticStorage)) {
    failures.push('diagnostic storage must derive a wide deterministic profile alias to reduce collision risk.');
  }

  if (!/Unable to save streak diagnostics right now\./.test(source.diagnosticStorage)) {
    failures.push('diagnostic storage must map local persistence failures to a user-safe domain error.');
  }

  if (!/checkinChronology/.test(source.diagnosticStorage) || !/ruleHistory/.test(source.diagnosticStorage)) {
    failures.push('diagnostic bundle must include chronology and rule history payloads.');
  }

  if (/learningText|pushups/.test(source.diagnosticStorage)) {
    failures.push('diagnostic storage must not include non-required sensitive check-in detail fields.');
  }

  if (!/createStreakDisputeDiagnosticBundle/.test(source.checkinHook)) {
    failures.push('daily check-in hook must expose diagnostic bundle generation action.');
  }

  if (!/finally \{\s*setDiagnosticSaving\(false\);\s*\}/s.test(source.checkinHook)) {
    failures.push('daily check-in diagnostics action must always clear saving state via a finally block.');
  }

  if (!/Parent mode is required for this action\./.test(source.checkinHook)) {
    failures.push('daily check-in diagnostics action must fail safely outside parent mode.');
  }

  if (!/Generate dispute bundle/.test(source.appScreen)) {
    failures.push('app screen must expose parent-triggered dispute bundle action in history UI.');
  }

  if (!/diagnosticRequiredMetadataKeys/.test(source.compliance)) {
    failures.push('compliance config must define required diagnostic metadata keys.');
  }

  if (!/diagnosticDisallowedPayloadFields/.test(source.compliance)) {
    failures.push('compliance config must define disallowed diagnostic payload fields.');
  }

  return failures;
}

function runSelfTest() {
  const insecure = {
    compliance: 'export const PHASE_1_COMPLIANCE = {} as const;',
    checkinHook: 'export function useDailyCheckin(){ return {}; }',
    diagnosticStorage: "const bundle = { learningText: 'x', pushups: 1 };",
    appScreen: '<Text>No diagnostics UI</Text>',
  };

  const failures = auditSource(insecure);
  if (failures.length === 0) {
    console.error('Self-test failed: insecure source did not trigger diagnostic audit failures.');
    process.exit(1);
  }

  console.log('PASS: streak dispute diagnostics self-test detected missing controls.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const source = readTargets();
  const failures = auditSource(source);

  if (failures.length > 0) {
    console.error('Streak dispute diagnostics audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        audit: 'streak-dispute-reporting-and-diagnostic-bundle',
        status: 'pass',
        checks: 10,
      },
      null,
      2
    )
  );
}

main();
