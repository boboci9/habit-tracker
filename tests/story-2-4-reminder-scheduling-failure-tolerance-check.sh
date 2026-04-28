#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/profiles/infrastructure/reminder-notifications.ts" ]] || { echo "FAIL: reminder notification service missing"; exit 1; }
[[ -f "$ROOT/src/features/profiles/hooks/use-parent-protected-settings.ts" ]] || { echo "FAIL: parent settings hook missing"; exit 1; }
[[ -f "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" ]] || { echo "FAIL: child daily check-in hook missing"; exit 1; }
[[ -f "$ROOT/app.json" ]] || { echo "FAIL: app.json missing"; exit 1; }

grep -q 'expo-notifications' "$ROOT/app.json" || { echo "FAIL: expo-notifications plugin not configured"; exit 1; }
grep -q 'scheduleDailyReminderForProfile' "$ROOT/src/features/profiles/hooks/use-parent-protected-settings.ts" || { echo "FAIL: reminder scheduler not integrated with settings save"; exit 1; }
grep -q 'getAllScheduledNotificationsAsync' "$ROOT/src/features/profiles/infrastructure/reminder-notifications.ts" || { echo "FAIL: existing reminder cleanup missing"; exit 1; }
grep -q 'cancelScheduledNotificationAsync' "$ROOT/src/features/profiles/infrastructure/reminder-notifications.ts" || { echo "FAIL: reminder update/cancel behavior missing"; exit 1; }
grep -q 'SchedulableTriggerInputTypes.DAILY' "$ROOT/src/features/profiles/infrastructure/reminder-notifications.ts" || { echo "FAIL: recurring daily schedule trigger missing"; exit 1; }
grep -q 'Manual check-in remains available' "$ROOT/src/features/profiles/infrastructure/reminder-notifications.ts" || { echo "FAIL: non-blocking denied/unavailable messaging missing"; exit 1; }
grep -q "trimmed.toLowerCase() === 'off'" "$ROOT/src/features/profiles/hooks/use-parent-protected-settings.ts" || { echo "FAIL: reminder disable input validation missing"; exit 1; }
grep -q "reminderTime: 'OFF'" "$ROOT/src/app/index.tsx" || { echo "FAIL: parent disable reminder control missing"; exit 1; }
grep -q "HH:MM format or OFF" "$ROOT/src/features/profiles/infrastructure/reminder-notifications.ts" || { echo "FAIL: reminder OFF validation messaging missing"; exit 1; }
grep -q 'saveTodayCheckin' "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" || { echo "FAIL: child manual check-in flow missing"; exit 1; }

grep -q 'export async function scheduleDailyReminderForProfile' "$ROOT/src/features/profiles/infrastructure/reminder-notifications.ts" || { echo "FAIL: reminder scheduler export missing"; exit 1; }

echo "PASS: story 2-4 reminder scheduling and failure tolerance checks"
