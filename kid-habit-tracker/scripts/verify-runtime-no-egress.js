#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let ts;
try {
  ts = require('typescript');
} catch {
  console.error('Missing dependency: typescript is required for runtime egress verification.');
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..');

const childFlowModules = [
  {
    file: 'src/features/checkin/infrastructure/daily-checkin-storage.ts',
    calls: [
      ['initializeDailyCheckinStorage', []],
      ['getTodayCheckin', ['child_1']],
      ['upsertTodayCheckin', [{ profileId: 'child_1', pushups: 10, learningText: 'letters' }]],
      ['listCompletedCheckinDates', ['child_1']],
      ['listCheckinHistory', ['child_1']],
    ],
  },
  {
    file: 'src/features/profiles/infrastructure/setup-storage.ts',
    calls: [
      ['getSetupDraft', []],
      ['saveSetupDraft', [{ familyName: 'A', childCount: 2, initialRewardLabel: 'Sticker' }]],
      ['isSetupComplete', []],
      ['markSetupComplete', []],
      ['clearSetupComplete', []],
      ['clearSetupDraft', []],
      ['verifyParentPin', ['1234']],
    ],
  },
  {
    file: 'src/features/profiles/infrastructure/profile-storage.ts',
    calls: [
      ['listChildProfiles', []],
      ['addChildProfile', [{ name: 'A', age: 8, avatar: 'cat', color: 'blue' }]],
      ['updateChildProfile', ['child_1', { name: 'A', age: 9, avatar: 'cat', color: 'blue' }]],
      ['updateChildProfileSettings', ['child_1', { rewardTargetDays: 7, reminderTime: '18:00' }]],
      [
        'updateChildProfileWithSettings',
        [
          'child_1',
          { name: 'A', age: 9, avatar: 'cat', color: 'blue' },
          { rewardTargetDays: 7, reminderTime: '18:00' },
        ],
      ],
      ['deleteChildProfile', ['child_1']],
      ['getProfileCountStatus', [2]],
    ],
  },
  {
    file: 'src/features/profiles/infrastructure/weekly-summary-storage.ts',
    calls: [['listWeeklyParentSummary', ['2026-04-28']]],
  },
  {
    file: 'src/features/rewards/infrastructure/reward-progress-storage.ts',
    calls: [
      ['listRewardMilestoneUnlocks', ['child_1', 7]],
      ['syncRewardMilestoneUnlocks', [{ profileId: 'child_1', targetDays: 7, completedDates: ['2026-04-27'] }]],
    ],
  },
  {
    file: 'src/features/rewards/infrastructure/mascot-evolution-storage.ts',
    calls: [
      [
        'syncMascotEvolutionState',
        [{ profileId: 'child_1', stage: { key: 'seed', label: 'Seed' }, sourceCompletedCheckins: 2 }],
      ],
    ],
  },
  {
    file: 'src/features/calendar/infrastructure/calendar-item-storage.ts',
    calls: [
      ['listCalendarItemsForRange', ['2026-04-20', '2026-04-28']],
      ['addCalendarItem', [{ type: 'shared_event', title: 'Family Event', dateKey: '2026-04-28' }]],
      ['updateCalendarItem', ['cal_1', { type: 'shared_event', title: 'Updated', dateKey: '2026-04-28' }]],
      ['deleteCalendarItem', ['cal_1']],
    ],
  },
  {
    file: 'src/features/calendar/infrastructure/calendar-note-storage.ts',
    calls: [
      ['listCalendarNotes', []],
      ['addCalendarNote', [{ noteText: 'Remember library', dateKey: '2026-04-28' }]],
      ['updateCalendarNote', ['note_1', { noteText: 'Updated note', dateKey: '2026-04-29' }]],
      ['deleteCalendarNote', ['note_1']],
    ],
  },
];

function createNetworkTrap(attempts) {
  function block(kind, detail) {
    const entry = { kind, detail: String(detail || '') };
    attempts.push(entry);
    throw new Error(`Network egress blocked (${kind}): ${entry.detail}`);
  }

  const FetchTrap = (...args) => block('fetch', args[0]);

  class XMLHttpRequestTrap {
    open(method, url) {
      block('XMLHttpRequest.open', `${method} ${url}`);
    }
  }

  class WebSocketTrap {
    constructor(url) {
      block('WebSocket', url);
    }
  }

  return {
    fetch: FetchTrap,
    XMLHttpRequest: XMLHttpRequestTrap,
    WebSocket: WebSocketTrap,
    axios: (...args) => block('axios', args[0]),
  };
}

function createDbMock() {
  return {
    async execAsync() {},
    async runAsync() {
      return { changes: 1 };
    },
    async getAllAsync(query) {
      const sql = String(query);

      if (sql.includes('PRAGMA table_info(daily_checkins)')) {
        return [
          { name: 'profile_id' },
          { name: 'checkin_date' },
          { name: 'pushups' },
          { name: 'learning_text' },
          { name: 'completed' },
          { name: 'created_at' },
          { name: 'updated_at' },
        ];
      }

      if (sql.includes('PRAGMA table_info(child_profiles)')) {
        return [
          { name: 'id' },
          { name: 'name' },
          { name: 'age' },
          { name: 'avatar' },
          { name: 'color' },
          { name: 'reward_target_days' },
          { name: 'reminder_time' },
          { name: 'created_at' },
          { name: 'updated_at' },
        ];
      }

      if (sql.includes('FROM child_profiles')) {
        return [
          {
            id: 'child_1',
            name: 'A',
            age: 8,
            avatar: 'cat',
            color: 'blue',
            rewardTargetDays: 7,
            reminderTime: '18:00',
          },
        ];
      }

      if (sql.includes('FROM daily_checkins')) {
        return [
          {
            profileId: 'child_1',
            checkinDate: '2026-04-28',
            pushups: 10,
            learningText: 'letters',
            completed: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];
      }

      return [];
    },
    async getFirstAsync(query) {
      const sql = String(query);

      if (sql.includes('PRAGMA user_version')) {
        return { user_version: 0 };
      }

      if (sql.includes('SELECT id FROM child_profiles WHERE id')) {
        return { id: 'child_1' };
      }

      if (sql.includes('SELECT id FROM calendar_items WHERE id')) {
        return { id: 'cal_1' };
      }

      if (sql.includes('SELECT id FROM calendar_notes WHERE id')) {
        return { id: 'note_1' };
      }

      if (sql.includes('SELECT COUNT(*) AS noteCount FROM calendar_notes')) {
        return { noteCount: 0 };
      }

      if (sql.includes('FROM daily_checkins')) {
        return {
          profileId: 'child_1',
          checkinDate: '2026-04-28',
          pushups: 10,
          learningText: 'letters',
          completed: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }

      if (sql.includes('FROM mascot_evolution_state')) {
        return {
          profileId: 'child_1',
          stageKey: 'seed',
          stageLabel: 'Seed',
          sourceCompletedCheckins: 2,
          updatedAt: Date.now(),
        };
      }

      return null;
    },
  };
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

function createTsLoader(runtime) {
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
      if (specifier === 'expo-sqlite') {
        return { openDatabaseAsync: async () => runtime.dbMock };
      }

      if (specifier === 'expo-secure-store') {
        return {
          isAvailableAsync: async () => true,
          getItemAsync: async () => runtime.secureStore.get('parent_pin_secure') ?? null,
          setItemAsync: async (key, value) => {
            runtime.secureStore.set(String(key), String(value));
          },
          deleteItemAsync: async (key) => {
            runtime.secureStore.delete(String(key));
          },
        };
      }

      if (specifier.startsWith('.')) {
        const resolved = resolveModulePath(filePath, specifier);
        return loadTsModule(resolved);
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
      globalThis: runtime.globalScope,
      fetch: runtime.networkTrap.fetch,
      XMLHttpRequest: runtime.networkTrap.XMLHttpRequest,
      WebSocket: runtime.networkTrap.WebSocket,
      axios: runtime.networkTrap.axios,
      Date,
      Math,
      JSON,
      Promise,
      setTimeout,
      clearTimeout,
    };

    vm.runInNewContext(transpiled, sandbox, { filename: filePath });
    return module.exports;
  }

  return { loadTsModule };
}

function runSelfTest(networkTrap) {
  let blocked = false;
  try {
    networkTrap.fetch('https://example.com/egress-self-test');
  } catch {
    blocked = true;
  }

  if (!blocked) {
    throw new Error('Self-test failed: fetch trap did not block egress.');
  }
}

async function main() {
  const attempts = [];
  const networkTrap = createNetworkTrap(attempts);
  const dbMock = createDbMock();
  const secureStore = new Map();
  const globalScope = { ...globalThis, ...networkTrap };

  const runtime = { attempts, networkTrap, dbMock, secureStore, globalScope };
  const { loadTsModule } = createTsLoader(runtime);

  if (process.argv.includes('--self-test')) {
    runSelfTest(networkTrap);
    console.log('PASS: runtime egress self-test blocked synthetic network call.');
    return;
  }

  const warnings = [];
  let callCount = 0;

  for (const mod of childFlowModules) {
    const absoluteFile = path.join(repoRoot, mod.file);
    const exports = loadTsModule(absoluteFile);

    for (const [fnName, args] of mod.calls) {
      const fn = exports[fnName];
      if (typeof fn !== 'function') {
        warnings.push(`Skipped missing function ${fnName} in ${mod.file}`);
        continue;
      }

      try {
        const result = fn(...args);
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('Network egress blocked')) {
          console.error(`Runtime network violation while running ${mod.file}#${fnName}: ${message}`);
          process.exit(1);
        }
        warnings.push(`Non-network error tolerated for ${mod.file}#${fnName}: ${message}`);
      }

      callCount += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        audit: 'runtime-no-off-device-egress',
        modulesScanned: childFlowModules.length,
        functionCallsExecuted: callCount,
        networkAttemptCount: attempts.length,
        warnings,
      },
      null,
      2
    )
  );

  if (attempts.length > 0) {
    console.error('\nRuntime egress audit failed: network API usage was attempted during child-flow execution.');
    for (const attempt of attempts) {
      console.error(`- ${attempt.kind}: ${attempt.detail}`);
    }
    process.exit(1);
  }

  console.log('\nPASS: runtime egress audit detected no off-device network usage during child-flow execution.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
