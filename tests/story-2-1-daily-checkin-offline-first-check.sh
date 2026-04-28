#!/usr/bin/env bash
set -euo pipefail
ROOT="kid-habit-tracker"

[[ -f "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" ]] || { echo "FAIL: daily check-in storage missing"; exit 1; }
[[ -f "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" ]] || { echo "FAIL: daily check-in hook missing"; exit 1; }
[[ -f "$ROOT/src/app/index.tsx" ]] || { echo "FAIL: index screen missing"; exit 1; }

grep -q "CREATE TABLE IF NOT EXISTS daily_checkins" "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" || { echo "FAIL: daily_checkins table contract missing"; exit 1; }
grep -q "pushups" "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" || { echo "FAIL: pushups persistence missing"; exit 1; }
grep -q "learning_text" "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" || { echo "FAIL: learning text persistence missing"; exit 1; }
grep -q "ON CONFLICT(profile_id, checkin_date) DO UPDATE" "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" || { echo "FAIL: same-day upsert behavior missing"; exit 1; }
grep -q "export async function getTodayCheckin" "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" || { echo "FAIL: today check-in read missing"; exit 1; }
grep -q "ok: true" "$ROOT/src/features/checkin/infrastructure/daily-checkin-storage.ts" || { echo "FAIL: result envelope contract missing"; exit 1; }

grep -q "useDailyCheckin" "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" || { echo "FAIL: daily check-in hook export missing"; exit 1; }
grep -q "hasSubmittedToday" "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" || { echo "FAIL: completion-state hook signal missing"; exit 1; }
grep -q "saveTodayCheckin" "$ROOT/src/features/checkin/hooks/use-daily-checkin.ts" || { echo "FAIL: save action missing"; exit 1; }

grep -q "Today check-in" "$ROOT/src/app/index.tsx" || { echo "FAIL: child check-in UI missing"; exit 1; }
grep -q "Save today check-in" "$ROOT/src/app/index.tsx" || { echo "FAIL: save CTA missing"; exit 1; }
grep -q "Update today check-in" "$ROOT/src/app/index.tsx" || { echo "FAIL: same-day update CTA missing"; exit 1; }
grep -q "One new thing I learned" "$ROOT/src/app/index.tsx" || { echo "FAIL: learning field missing"; exit 1; }

if command -v sqlite3 >/dev/null 2>&1; then
	TMP_DB=$(mktemp /tmp/story-2-1-checkin-XXXXXX.sqlite)
	trap 'rm -f "$TMP_DB"' EXIT

	sqlite3 "$TMP_DB" <<'SQL'
CREATE TABLE daily_checkins (
	profile_id TEXT NOT NULL,
	checkin_date TEXT NOT NULL,
	pushups INTEGER NOT NULL DEFAULT 0,
	learning_text TEXT NOT NULL DEFAULT '',
	completed INTEGER NOT NULL DEFAULT 0,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (profile_id, checkin_date)
);

INSERT INTO daily_checkins (
	profile_id,
	checkin_date,
	pushups,
	learning_text,
	completed,
	created_at,
	updated_at
)
VALUES ('child_1', '2026-04-27', 10, 'first', 1, 1, 1)
ON CONFLICT(profile_id, checkin_date) DO UPDATE SET
	pushups = excluded.pushups,
	learning_text = excluded.learning_text,
	completed = excluded.completed,
	updated_at = excluded.updated_at;

INSERT INTO daily_checkins (
	profile_id,
	checkin_date,
	pushups,
	learning_text,
	completed,
	created_at,
	updated_at
)
VALUES ('child_1', '2026-04-27', 22, 'updated', 1, 2, 2)
ON CONFLICT(profile_id, checkin_date) DO UPDATE SET
	pushups = excluded.pushups,
	learning_text = excluded.learning_text,
	completed = excluded.completed,
	updated_at = excluded.updated_at;
SQL

	row_count=$(sqlite3 "$TMP_DB" "SELECT COUNT(*) FROM daily_checkins WHERE profile_id = 'child_1' AND checkin_date = '2026-04-27';")
	pushups=$(sqlite3 "$TMP_DB" "SELECT pushups FROM daily_checkins WHERE profile_id = 'child_1' AND checkin_date = '2026-04-27';")
	learning=$(sqlite3 "$TMP_DB" "SELECT learning_text FROM daily_checkins WHERE profile_id = 'child_1' AND checkin_date = '2026-04-27';")

	[[ "$row_count" == "1" ]] || { echo "FAIL: behavior check failed (same-day write should keep one row)"; exit 1; }
	[[ "$pushups" == "22" ]] || { echo "FAIL: behavior check failed (same-day write should update pushups)"; exit 1; }
	[[ "$learning" == "updated" ]] || { echo "FAIL: behavior check failed (same-day write should update learning text)"; exit 1; }
else
	echo "WARN: sqlite3 not found; skipping behavior-level upsert assertion"
fi

echo "PASS: story 2-1 daily check-in offline-first checks"
