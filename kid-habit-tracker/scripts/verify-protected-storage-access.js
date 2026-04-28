#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const targets = {
  compliance: 'src/config/compliance.ts',
  setupStorage: 'src/features/profiles/infrastructure/setup-storage.ts',
  parentHook: 'src/features/profiles/hooks/use-parent-protected-settings.ts',
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

  if (!/import\s+\*\s+as\s+SecureStore\s+from\s+'expo-secure-store';/.test(source.setupStorage)) {
    failures.push('setup-storage must import expo-secure-store for sensitive parent PIN storage.');
  }

  if (/readState\((LEGACY_)?KEY_PARENT_PIN\)/.test(source.setupStorage)) {
    failures.push('setup-storage must not read parent PIN from setup_state (plain SQLite state table).');
  }

  if (/writeState\((LEGACY_)?KEY_PARENT_PIN\s*,/.test(source.setupStorage)) {
    failures.push('setup-storage must not write parent PIN into setup_state (plain SQLite state table).');
  }

  if (!/DELETE FROM setup_state WHERE key = \?/.test(source.setupStorage)) {
    failures.push('setup-storage must scrub legacy parent PIN rows from setup_state.');
  }

  if (!/SELECT value FROM setup_state WHERE key = \? LIMIT 1;/.test(source.setupStorage)) {
    failures.push('setup-storage must read legacy parent PIN value before attempting migration.');
  }

  if (!/writeParentPinToSecureStorage\(legacyPin\)/.test(source.setupStorage)) {
    failures.push('setup-storage must migrate legacy parent PIN value into secure storage before deletion.');
  }

  if (!/Only delete legacy plain-text parent PIN after successful secure-store migration\./.test(source.setupStorage)) {
    failures.push('setup-storage must explicitly guarantee deletion occurs only after successful migration.');
  }

  if (!/authorizationContext: AuthorizationContext = 'parent'/.test(source.setupStorage)) {
    failures.push('verifyParentPin must require authorization context and default to parent mode.');
  }

  if (!/if \(authorizationContext !== 'parent'\) \{\s*return false;\s*\}/s.test(source.setupStorage)) {
    failures.push('verifyParentPin must explicitly deny non-parent authorization contexts.');
  }

  if (/if \(!available\) \{\s*return null;\s*\}/s.test(source.setupStorage)) {
    failures.push('setup-storage must fail closed when secure storage is unavailable (no null fallback).');
  }

  if (!/sensitiveLocalControlKeys:\s*\['parent_pin_secure'\]/.test(source.compliance)) {
    failures.push('compliance config must list secure sensitive keys inventory.');
  }

  if (!/disallowedPlainSetupStateKeys:\s*\['parent_pin'\]/.test(source.compliance)) {
    failures.push('compliance config must list disallowed plain setup_state keys.');
  }

  if (!/const authorizationContext: AuthorizationContext = verified \? 'parent' : 'child';/.test(source.parentHook)) {
    failures.push('parent-protected settings hook must compute explicit parent/child authorization context.');
  }

  if (!/Parent mode is required for this action\./.test(source.parentHook)) {
    failures.push('parent-protected settings hook must return user-safe feedback when child mode attempts protected actions.');
  }

  return failures;
}

function runSelfTest() {
  const insecure = {
    compliance: 'export const PHASE_1_COMPLIANCE = {} as const;',
    setupStorage: "const KEY_PARENT_PIN='parent_pin';\nasync function verifyParentPin(pin){const raw=await readState(KEY_PARENT_PIN);return pin===raw;}\n",
    parentHook: 'export function useParentProtectedSettings(){ return {}; }',
  };

  const failures = auditSource(insecure);
  if (failures.length === 0) {
    console.error('Self-test failed: insecure source did not trigger protected-storage audit failures.');
    process.exit(1);
  }

  console.log('PASS: protected-storage self-test detected insecure parent-control persistence and missing access guards.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const source = readTargets();
  const failures = auditSource(source);

  if (failures.length > 0) {
    console.error('Protected storage/access audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        audit: 'protected-storage-and-parent-access-controls',
        status: 'pass',
        checks: 10,
      },
      null,
      2
    )
  );
}

main();
