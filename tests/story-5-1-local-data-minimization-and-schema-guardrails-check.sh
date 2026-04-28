#!/usr/bin/env bash
set -euo pipefail

ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/config/compliance.ts" ]] || { echo "FAIL: compliance config file missing"; exit 1; }
[[ -f "$ROOT/scripts/verify-schema.js" ]] || { echo "FAIL: schema audit script missing"; exit 1; }
[[ -f "$ROOT/scripts/verify-no-tracking.js" ]] || { echo "FAIL: no-tracking audit script missing"; exit 1; }

grep -q 'offDeviceChildHabitTransmissionAllowed: false' "$ROOT/src/config/compliance.ts" || {
  echo "FAIL: off-device transmission guardrail must be false";
  exit 1;
}

grep -q 'childFacingBehavioralTrackingSdkAllowed: false' "$ROOT/src/config/compliance.ts" || {
  echo "FAIL: behavioral tracking guardrail must be false";
  exit 1;
}

(
  cd "$ROOT"
  node scripts/verify-schema.js --self-test
  node scripts/verify-schema.js
  node scripts/verify-no-tracking.js
  node scripts/verify-runtime-no-egress.js --self-test
  node scripts/verify-runtime-no-egress.js
)

echo "PASS: story 5-1 local data minimization and schema guardrails checks"
