# Story 2.3: Streak Transparency and Day-Level History

Status: done

## Story

As a child or parent,
I want transparent streak explanations and day-level records,
so that I can understand why streak state changed.

## Acceptance Criteria

1. Given a streak preserve/recover/reset event occurred, when transparency view is opened, then the app shows rule reason and resulting state and explanation text is understandable without color-only cues.
2. Given history view is opened, when a date is selected, then day-level habit and streak context is displayed and data matches persisted local records.

## Tasks / Subtasks

- [x] Add deterministic streak transparency explanation outputs for preserve/recover/reset states (AC: 1)
- [x] Add day-level check-in history query with selected-date details tied to persisted records (AC: 2)
- [x] Wire transparency and history into child flow UI without color-only dependency (AC: 1,2)
- [x] Add Story 2.3 validation checks and run lint (AC: 1,2)

## Dev Notes

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Streak Transparency and Day-Level History]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/implementation-artifacts/2-2-deterministic-streak-and-grace-day-engine.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `tests/story-2-3-streak-transparency-history-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Added explicit streak transparency explanation text (`statusReason`) to deterministic streak outputs.
- Added deterministic day-level streak timeline entries (`computeStreakTimeline`) with preserve/recover/reset reasons.
- Added persisted day-level history query (`listCheckinHistory`) from canonical local check-in records.
- Extended `useDailyCheckin` to load history/timeline data, manage selected date, and expose selected-day streak context.
- Updated child check-in UI to render transparency reason and selectable date chips with day-level habit + streak details.
- Added Story 2.3 validation script and executed story checks plus lint.
- Fixed recovered streak reason semantics to report the actual missed-day gap that triggered recovery.
- Preserved hook load/save error reporting when streak history retrieval fails.
- Removed misleading UI fallback streak labels for dates with no timeline context.
- Strengthened Story 2.3 checks to validate recovered reason gap reporting for one-day and two-day scenarios.

### File List

- _bmad-output/implementation-artifacts/2-3-streak-transparency-and-day-level-history.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/src/features/streak/domain/streak-engine.ts
- kid-habit-tracker/src/features/checkin/infrastructure/daily-checkin-storage.ts
- kid-habit-tracker/src/features/checkin/hooks/use-daily-checkin.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-2-3-streak-transparency-history-check.sh

## Change Log

- 2026-04-27: Created Story 2.3 implementation artifact and moved status to in-progress.
- 2026-04-27: Implemented streak transparency reasoning and day-level history flow, validated with story checks and lint, and moved to review.
- 2026-04-27: Resolved Story 2.3 review findings (reason-gap accuracy, error-state preservation, and non-fabricated history fallbacks), revalidated, and moved to done.
