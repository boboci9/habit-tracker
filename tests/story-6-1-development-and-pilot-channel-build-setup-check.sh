#!/usr/bin/env bash
set -euo pipefail

ROOT="kid-habit-tracker"

[[ -f "$ROOT/eas.json" ]] || {
  echo "FAIL: eas.json missing"
  exit 1
}

[[ -f "$ROOT/src/config/release-channels.ts" ]] || {
  echo "FAIL: release channel config missing"
  exit 1
}

[[ -f "$ROOT/scripts/build-pilot-android.sh" ]] || {
  echo "FAIL: build-pilot-android.sh missing"
  exit 1
}

[[ -f "$ROOT/scripts/build-pilot-ios.sh" ]] || {
  echo "FAIL: build-pilot-ios.sh missing"
  exit 1
}

[[ -f "$ROOT/scripts/write-build-traceability.js" ]] || {
  echo "FAIL: write-build-traceability.js missing"
  exit 1
}

[[ -f "$ROOT/scripts/verify-pilot-channel-setup.js" ]] || {
  echo "FAIL: verify-pilot-channel-setup.js missing"
  exit 1
}

(
  cd "$ROOT"
  node scripts/verify-pilot-channel-setup.js --self-test
  node scripts/verify-pilot-channel-setup.js
  node scripts/write-build-traceability.js --channel=pilot --platform=android --build-profile=pilot-android >/dev/null
)

echo "PASS: story 6-1 development and pilot channel build setup checks"
