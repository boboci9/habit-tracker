#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let ts;
try {
  ts = require('typescript');
} catch {
  console.error('Missing dependency: typescript is required for Phase 2 compliance extension verification.');
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..');

const targets = {
  compliance: 'src/config/compliance.ts',
  extensions: 'src/features/profiles/infrastructure/phase2-compliance-extension-points.ts',
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

  if (!/export interface ConsentCaptureHook/.test(source.extensions)) {
    failures.push('Consent capture hook interface contract is missing.');
  }

  if (!/export interface DeletionWorkflowHook/.test(source.extensions)) {
    failures.push('Deletion workflow hook interface contract is missing.');
  }

  if (!/export interface RetentionPolicyHook/.test(source.extensions)) {
    failures.push('Retention policy hook interface contract is missing.');
  }

  if (!/phase2ConsentCaptureHook/.test(source.extensions) || !/not-enabled/.test(source.extensions)) {
    failures.push('Phase 1-safe no-op consent hook is missing or not marked not-enabled.');
  }

  if (!/phase2DeletionWorkflowHook/.test(source.extensions) || !/not-enabled/.test(source.extensions)) {
    failures.push('Phase 1-safe no-op deletion hook is missing or not marked not-enabled.');
  }

  if (!/phase2RetentionPolicyHook/.test(source.extensions) || !/not-enabled/.test(source.extensions)) {
    failures.push('Phase 1-safe no-op retention hook is missing or not marked not-enabled.');
  }

  if (!/export function evaluateSchoolCoachIntegrationGate/.test(source.extensions)) {
    failures.push('School/coach integration gate evaluator is missing.');
  }

  if (!/if \(!PHASE_1_COMPLIANCE\.phase2SchoolCoachIntegrationDefaultEnabled\)/.test(source.extensions)) {
    failures.push('Gate evaluator must hard-block school/coach integration while Phase 1 default is active.');
  }

  if (!/Checklist sign-off evidence is required/.test(source.extensions)) {
    failures.push('Gate evaluator must require checklist sign-off evidence.');
  }

  if (!/Dry-run verification evidence is required/.test(source.extensions)) {
    failures.push('Gate evaluator must require dry-run verification evidence.');
  }

  if (!/signedBy\.trim\(\)\.length > 0/.test(source.extensions) || !/signedAt\.trim\(\)\.length > 0/.test(source.extensions)) {
    failures.push('Gate evaluator must require non-empty signedBy and signedAt evidence fields.');
  }

  if (!/artifactId\.trim\(\)\.length > 0/.test(source.extensions) || !/executedAt\.trim\(\)\.length > 0/.test(source.extensions)) {
    failures.push('Gate evaluator must require non-empty artifactId and executedAt evidence fields.');
  }

  if (!/phase2SchoolCoachIntegrationDefaultEnabled:\s*false/.test(source.compliance)) {
    failures.push('Compliance config must default school/coach integration to disabled.');
  }

  if (!/phase2RequiredChecklistControls/.test(source.compliance)) {
    failures.push('Compliance config must define required Phase 2 checklist controls.');
  }

  return failures;
}

function resolveModulePath(fromFile, specifier) {
  const resolvedBase = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    resolvedBase,
    `${resolvedBase}.ts`,
    `${resolvedBase}.tsx`,
    path.join(resolvedBase, 'index.ts'),
    path.join(resolvedBase, 'index.tsx'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to resolve local module: ${specifier} from ${fromFile}`);
}

function createTsLoader() {
  const cache = new Map();

  function loadTsModule(filePath) {
    if (cache.has(filePath)) {
      return cache.get(filePath).exports;
    }

    const source = fs.readFileSync(filePath, 'utf8');
    const transpiled = ts.transpileModule(source, {
      fileName: filePath,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }).outputText;

    const module = { exports: {} };
    cache.set(filePath, module);

    const localRequire = (specifier) => {
      if (specifier.startsWith('.')) {
        return loadTsModule(resolveModulePath(filePath, specifier));
      }

      return require(specifier);
    };

    const sandbox = {
      module,
      exports: module.exports,
      require: localRequire,
      __filename: filePath,
      __dirname: path.dirname(filePath),
      console,
      process,
      globalThis,
      Date,
    };

    vm.runInNewContext(transpiled, sandbox, { filename: filePath });
    return module.exports;
  }

  return loadTsModule;
}

function auditGateSemantics() {
  const failures = [];
  try {
    const loadTsModule = createTsLoader();
    const modulePath = path.join(repoRoot, targets.extensions);
    const extensionModule = loadTsModule(modulePath);

    if (typeof extensionModule.evaluateSchoolCoachIntegrationGate !== 'function') {
      failures.push('Gate evaluator export is not callable during runtime semantic verification.');
      return failures;
    }

    const decision = extensionModule.evaluateSchoolCoachIntegrationGate({
      requestedEnabled: true,
      checklistSignOff: {
        completed: true,
        signedBy: 'qa-owner',
        signedAt: '2026-04-28T00:00:00Z',
      },
      dryRunVerification: {
        completed: true,
        artifactId: 'dry-run-001',
        executedAt: '2026-04-28T01:00:00Z',
      },
    });

    if (!decision || typeof decision !== 'object') {
      failures.push('Gate evaluator did not return a decision object for semantic verification.');
      return failures;
    }

    if (decision.enabled !== false) {
      failures.push('Gate evaluator must return enabled=false when Phase 1 default hard-block is active.');
    }
  } catch (error) {
    failures.push(`Unable to run runtime gate semantic verification: ${error.message}`);
  }

  return failures;
}

function runSelfTest() {
  const insecure = {
    compliance: 'export const PHASE_1_COMPLIANCE = {} as const;',
    extensions: 'export const placeholder = true;',
  };

  const failures = auditSource(insecure);
  if (failures.length === 0) {
    console.error('Self-test failed: insecure source did not trigger Phase 2 compliance extension failures.');
    process.exit(1);
  }

  console.log('PASS: phase2 compliance extension self-test detected missing extension contracts and gate controls.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const source = readTargets();
  const failures = [...auditSource(source), ...auditGateSemantics()];

  if (failures.length > 0) {
    console.error('Phase 2 compliance extension audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        audit: 'phase2-compliance-extension-points',
        status: 'pass',
        checks: 15,
      },
      null,
      2
    )
  );
}

main();
