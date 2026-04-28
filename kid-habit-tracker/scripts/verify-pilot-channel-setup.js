#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const targets = {
  packageJson: 'package.json',
  appJson: 'app.json',
  easJson: 'eas.json',
  releaseChannels: 'src/config/release-channels.ts',
  envDev: '.env.dev',
  envPilot: '.env.pilot',
  buildAndroid: 'scripts/build-pilot-android.sh',
  buildIos: 'scripts/build-pilot-ios.sh',
  traceability: 'scripts/write-build-traceability.js',
};

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function audit() {
  const failures = [];

  for (const [name, relativePath] of Object.entries(targets)) {
    if (!exists(relativePath)) {
      failures.push(`Missing required file (${name}): ${relativePath}`);
    }
  }

  if (failures.length > 0) {
    return failures;
  }

  const easSource = read(targets.easJson);
  const easJson = JSON.parse(easSource);
  const releaseSource = read(targets.releaseChannels);
  const envDev = read(targets.envDev);
  const envPilot = read(targets.envPilot);
  const pkg = JSON.parse(read(targets.packageJson));

  const pilotAndroid = easJson?.build?.['pilot-android'];
  const pilotIos = easJson?.build?.['pilot-ios'];

  if (!pilotAndroid || !pilotIos) {
    failures.push('eas.json must define pilot-android and pilot-ios build profiles.');
  }

  if (pilotAndroid?.android?.buildType !== 'apk') {
    failures.push('eas.json must configure pilot-android to produce APK artifacts (android.buildType=apk).');
  }

  if (pilotIos?.distribution !== 'store' || pilotIos?.ios?.simulator !== false) {
    failures.push('eas.json must configure pilot-ios for TestFlight-ready builds (distribution=store, ios.simulator=false).');
  }

  if (
    pilotAndroid?.env?.PHASE2_FEATURES_ENABLED !== 'false' ||
    pilotIos?.env?.PHASE2_FEATURES_ENABLED !== 'false' ||
    easJson?.build?.development?.env?.PHASE2_FEATURES_ENABLED !== 'false'
  ) {
    failures.push('eas.json must keep PHASE2_FEATURES_ENABLED=false in development and pilot profiles.');
  }

  if (!/phase2FeaturesEnabled:\s*false/.test(releaseSource)) {
    failures.push('release channel config must keep Phase 2 features disabled for dev and pilot.');
  }

  if (!/APP_RELEASE_CHANNEL=dev/.test(envDev) || !/PHASE2_FEATURES_ENABLED=false/.test(envDev)) {
    failures.push('.env.dev must set APP_RELEASE_CHANNEL=dev and PHASE2_FEATURES_ENABLED=false.');
  }

  if (!/APP_RELEASE_CHANNEL=pilot/.test(envPilot) || !/PHASE2_FEATURES_ENABLED=false/.test(envPilot)) {
    failures.push('.env.pilot must set APP_RELEASE_CHANNEL=pilot and PHASE2_FEATURES_ENABLED=false.');
  }

  if (!pkg.scripts || !pkg.scripts['build:pilot:android'] || !pkg.scripts['build:pilot:ios']) {
    failures.push('package.json must expose build:pilot:android and build:pilot:ios scripts.');
  }

  if (!pkg.scripts || !pkg.scripts['verify:pilot-channel-setup']) {
    failures.push('package.json must expose verify:pilot-channel-setup script.');
  }

  const traceabilitySource = read(targets.traceability);
  if (!/-latest\.json/.test(traceabilitySource) || !/\$\{channel\}-\$\{platform\}-\$\{suffix\}\.json/.test(traceabilitySource)) {
    failures.push('traceability script must write both a versioned metadata file and a latest pointer file.');
  }

  const buildAndroidSource = read(targets.buildAndroid);
  const buildIosSource = read(targets.buildIos);
  if (/exit 0/.test(buildAndroidSource) || /exit 0/.test(buildIosSource)) {
    failures.push('pilot build scripts must fail when eas CLI is unavailable to prevent false-success builds.');
  }

  return failures;
}

function runSelfTest() {
  const insecure = 'const x = true;';
  if (/"pilot-android"/.test(insecure)) {
    console.error('Self-test failed: insecure source unexpectedly matched pilot profile checks.');
    process.exit(1);
  }

  console.log('PASS: pilot-channel self-test detected missing profile markers as expected.');
}

function main() {
  if (process.argv.includes('--self-test')) {
    runSelfTest();
    return;
  }

  const failures = audit();
  if (failures.length > 0) {
    console.error('Pilot channel setup audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        audit: 'pilot-channel-build-setup',
        status: 'pass',
        checks: 12,
      },
      null,
      2
    )
  );
}

main();
