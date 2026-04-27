#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/profiles/hooks/use-parent-protected-settings.ts" ]] || { echo "FAIL: parent-protected settings hook missing"; exit 1; }
[[ -f "$ROOT/src/features/profiles/infrastructure/setup-storage.ts" ]] || { echo "FAIL: setup storage missing"; exit 1; }
[[ -f "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" ]] || { echo "FAIL: profile storage missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q "export async function verifyParentPin" "$ROOT/src/features/profiles/infrastructure/setup-storage.ts" || { echo "FAIL: parent verification storage function missing"; exit 1; }
grep -q "reward_target_days" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: reward target persistence missing"; exit 1; }
grep -q "reminder_time" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: reminder persistence missing"; exit 1; }
grep -q "export async function deleteChildProfile" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: protected remove profile operation missing"; exit 1; }
grep -q "async (parentVerified: boolean) =>" "$ROOT/src/features/profiles/hooks/use-profile-picker.ts" || { echo "FAIL: add profile mutation boundary verification argument missing"; exit 1; }
grep -q "if (!parentVerified)" "$ROOT/src/features/profiles/hooks/use-profile-picker.ts" || { echo "FAIL: add profile mutation boundary does not enforce verification"; exit 1; }
grep -q "updateChildProfileWithSettings" "$ROOT/src/features/profiles/hooks/use-profile-picker.ts" || { echo "FAIL: atomic profile+settings save path missing"; exit 1; }
grep -q "export async function updateChildProfileWithSettings" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: combined profile/settings storage update missing"; exit 1; }
grep -q "DELETE FROM child_profiles" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: delete mutation missing"; exit 1; }
grep -E -q "COUNT\(\*\) FROM child_profiles\) >" "$ROOT/src/features/profiles/infrastructure/profile-storage.ts" || { echo "FAIL: atomic lower-bound delete guard missing"; exit 1; }

grep -q "Parent-protected settings" "$ROOT/src/app/index.tsx" || { echo "FAIL: parent-protected settings UI missing"; exit 1; }
grep -q "Parent verification is required to add profiles" "$ROOT/src/app/index.tsx" || { echo "FAIL: add profile verification gate missing"; exit 1; }
grep -q "addChildProfile(parentVerified)" "$ROOT/src/app/index.tsx" || { echo "FAIL: add profile action does not forward verification state"; exit 1; }
grep -q "Save selected profile" "$ROOT/src/app/index.tsx" || { echo "FAIL: protected profile save action missing"; exit 1; }
grep -q "Remove selected profile" "$ROOT/src/app/index.tsx" || { echo "FAIL: protected profile remove action missing"; exit 1; }

echo "PASS: story 1-4 parent-protected settings checks"
