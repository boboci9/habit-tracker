#!/usr/bin/env bash
set -euo pipefail

ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/profiles/infrastructure/setup-storage.ts" ]] || {
  echo "FAIL: setup-storage file missing"
  exit 1
}

[[ -f "$ROOT/src/features/profiles/hooks/use-parent-protected-settings.ts" ]] || {
  echo "FAIL: parent-protected settings hook missing"
  exit 1
}

[[ -f "$ROOT/src/config/compliance.ts" ]] || {
  echo "FAIL: compliance config file missing"
  exit 1
}

[[ -f "$ROOT/scripts/verify-protected-storage-access.js" ]] || {
  echo "FAIL: protected storage verification script missing"
  exit 1
}

(
  cd "$ROOT"
  node scripts/verify-protected-storage-access.js --self-test
  node scripts/verify-protected-storage-access.js
)

echo "PASS: story 5-2 protected storage and parent access controls checks"
