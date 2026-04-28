#!/usr/bin/env bash
set -euo pipefail

ROOT="kid-habit-tracker"

[[ -f "docs/pilot-release-checklist.md" ]] || {
  echo "FAIL: docs/pilot-release-checklist.md missing"
  exit 1
}

[[ -f "docs/phase2-store-readiness-checklist.md" ]] || {
  echo "FAIL: docs/phase2-store-readiness-checklist.md missing"
  exit 1
}

[[ -f "$ROOT/scripts/verify-phase2-store-readiness-scaffold.js" ]] || {
  echo "FAIL: verify-phase2-store-readiness-scaffold.js missing"
  exit 1
}

(
  cd "$ROOT"
  node scripts/verify-phase2-store-readiness-scaffold.js --self-test
  node scripts/verify-phase2-store-readiness-scaffold.js
  npm run verify:release-gate >/dev/null
)

echo "PASS: story 6-3 phase-2 store submission readiness scaffold checks"
