#!/usr/bin/env bash
set -euo pipefail

ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/streak/infrastructure/streak-dispute-report-storage.ts" ]] || {
  echo "FAIL: streak dispute report storage file missing"
  exit 1
}

[[ -f "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" ]] || {
  echo "FAIL: daily check-in hook missing"
  exit 1
}

[[ -f "$ROOT/src/app/index.tsx" ]] || {
  echo "FAIL: app screen file missing"
  exit 1
}

[[ -f "$ROOT/src/config/compliance.ts" ]] || {
  echo "FAIL: compliance config file missing"
  exit 1
}

[[ -f "$ROOT/scripts/verify-streak-dispute-diagnostics.js" ]] || {
  echo "FAIL: streak dispute diagnostics verification script missing"
  exit 1
}

(
  cd "$ROOT"
  node scripts/verify-streak-dispute-diagnostics.js --self-test
  node scripts/verify-streak-dispute-diagnostics.js
)

echo "PASS: story 5-3 streak dispute reporting and diagnostic bundle checks"
