#!/usr/bin/env bash
set -euo pipefail

ROOT="kid-habit-tracker"

[[ -f "$ROOT/scripts/verify-build-reproducibility.js" ]] || {
  echo "FAIL: verify-build-reproducibility.js missing"
  exit 1
}

[[ -f "$ROOT/scripts/verify-pilot-smoke-gate.js" ]] || {
  echo "FAIL: verify-pilot-smoke-gate.js missing"
  exit 1
}

(
  cd "$ROOT"

  node scripts/verify-build-reproducibility.js --self-test
  node scripts/verify-pilot-smoke-gate.js --self-test
  node scripts/verify-pilot-smoke-gate.js

  node scripts/write-build-traceability.js --channel=pilot --platform=android --build-profile=pilot-android >/dev/null
  node scripts/write-build-traceability.js --channel=pilot --platform=ios --build-profile=pilot-ios >/dev/null

  SOURCE_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  node scripts/verify-build-reproducibility.js --channel=pilot --source-commit="$SOURCE_COMMIT"
)

echo "PASS: story 6-2 reproducible build and smoke-test gate checks"
