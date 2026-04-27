#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" ]] || { echo "FAIL: profile storage missing"; exit 1; }
[[ -f "$ROOT/src/features/profiles/hooks/use-profile-picker.ts" ]] || { echo "FAIL: profile picker hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }
[[ -f "$ROOT/src/features/profiles/hooks/use-family-setup.ts" ]] || { echo "FAIL: family setup hook missing"; exit 1; }
[[ -f "$ROOT/src/features/profiles/infrastructure/setup-storage.ts" ]] || { echo "FAIL: setup storage missing"; exit 1; }

# Profile storage behavior checks (AC1 constraints and identity)
grep -q "const MIN_PROFILES = 2;" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: min profile constraint missing"; exit 1; }
grep -q "const MAX_PROFILES = 6;" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: max profile constraint missing"; exit 1; }
grep -q "color TEXT NOT NULL UNIQUE" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: unique profile color constraint missing"; exit 1; }
grep -q "throw new Error('Maximum profile limit reached (6).');" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: max profile guard missing"; exit 1; }

# Default entry behavior check (AC2): completed setup branches to profile picker
grep -q "if (complete)" "$ROOT/src/app/index.tsx" || { echo "FAIL: complete setup branch missing"; exit 1; }
grep -q "<Text style={styles.title}>Profile Picker</Text>" "$ROOT/src/app/index.tsx" || { echo "FAIL: profile picker default entry missing"; exit 1; }

# Picker interaction behavior: selecting child updates selected profile path
grep -q "onPress={() => selectChildProfile(item.id)}" "$ROOT/src/app/index.tsx" || { echo "FAIL: child selection handler missing"; exit 1; }
grep -q "selectedProfile && isProfileReady" "$ROOT/src/app/index.tsx" || { echo "FAIL: selected profile placeholder branch missing"; exit 1; }

# Reset behavior: persistent setup completion must be cleared
grep -q "export async function clearSetupComplete" "$ROOT/src/features/profiles/infrastructure/setup-storage.ts" || { echo "FAIL: clear setup completion helper missing"; exit 1; }
grep -q "await clearSetupComplete();" "$ROOT/src/features/profiles/hooks/use-family-setup.ts" || { echo "FAIL: reset does not clear persisted completion"; exit 1; }

echo "PASS: story 1-3 profile picker checks"
