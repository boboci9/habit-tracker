#!/usr/bin/env bash
set -euo pipefail

ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/config/compliance.ts" ]] || {
  echo "FAIL: compliance config file missing"
  exit 1
}

[[ -f "$ROOT/src/features/profiles/infrastructure/phase2-compliance-extension-points.ts" ]] || {
  echo "FAIL: phase2 compliance extension points file missing"
  exit 1
}

[[ -f "$ROOT/scripts/verify-phase2-compliance-extension-points.js" ]] || {
  echo "FAIL: phase2 compliance extension verification script missing"
  exit 1
}

(
  cd "$ROOT"
  node scripts/verify-phase2-compliance-extension-points.js --self-test
  node scripts/verify-phase2-compliance-extension-points.js
)

echo "PASS: story 5-4 phase2 compliance extension points checks"
