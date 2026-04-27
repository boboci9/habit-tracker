#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"
[[ -f "$ROOT/src/features/profiles/infrastructure/setup-storage.ts" ]] || { echo "FAIL: setup-storage service missing"; exit 1; }
[[ -f "$ROOT/src/features/profiles/hooks/use-family-setup.ts" ]] || { echo "FAIL: setup hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }
grep -q "Family Setup" "$ROOT/src/app/index.tsx" || { echo "FAIL: family setup UI marker missing"; exit 1; }
grep -q "completeSetup" "$ROOT/src/app/index.tsx" || { echo "FAIL: completion flow missing"; exit 1; }
echo "PASS: story 1-2 setup checks"
