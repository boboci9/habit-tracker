#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f eas.json ]]; then
  echo "FAIL: eas.json is required for pilot builds"
  exit 1
fi

npm run verify:privacy
node scripts/verify-pilot-channel-setup.js
node scripts/verify-pilot-smoke-gate.js
node scripts/write-build-traceability.js --channel=pilot --platform=ios --build-profile=pilot-ios

if ! command -v eas >/dev/null 2>&1; then
  echo "FAIL: eas CLI is not installed locally. Install with: npm i -g eas-cli"
  echo "FAIL: Pilot iOS artifact cannot be produced without eas build execution."
  echo "HINT: eas build --platform ios --profile pilot-ios --non-interactive"
  exit 1
fi

eas build --platform ios --profile pilot-ios --non-interactive
