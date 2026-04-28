# Story 2.2: Deterministic Streak and Grace-Day Engine

Status: done

## Story

As a child,
I want streak and grace-day outcomes to be fair and consistent,
so that I trust the app's progress logic.

## Acceptance Criteria

1. Given a sequence of daily check-ins and misses, when streak state is computed, then outcomes are deterministic for identical input history and grace-day usage follows configured limits.
2. Given grace conditions are met for recovery, when the next valid check-in is completed, then streak continuity is recovered and recovery state is reflected in current status.

## Tasks / Subtasks

- [x] Implement deterministic streak/grace engine domain logic (AC: 1,2)
- [x] Integrate engine with local check-in history (AC: 1)
- [x] Expose current streak and grace/recovery status in child flow (AC: 2)
- [x] Add Story 2.2 validation checks and run lint (AC: 1,2)

### Review Findings

- [x] [Review][Patch] Fix grace-day accounting to accumulate against limit instead of overwriting per recoverable gap.
- [x] [Review][Patch] Enforce valid `todayDate` input handling in streak engine for deterministic date arithmetic.
- [x] [Review][Patch] Upgrade behavior-level test to execute real `computeStreakState` implementation and assert deterministic/recovery/reset outcomes.
- [x] [Review][Patch] Add async stale-state guards in daily check-in hook to prevent profile-switch race overwrites.

## Dev Notes

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2: Deterministic Streak and Grace-Day Engine]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/implementation-artifacts/2-1-daily-check-in-capture-offline-first.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `tests/story-2-2-streak-grace-engine-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Added deterministic streak/grace domain engine in `src/features/streak/domain/streak-engine.ts`.
- Added completed-checkin history query in canonical check-in storage via `listCompletedCheckinDates`.
- Integrated streak/grace computation into `useDailyCheckin` so state recomputes on load and after saves.
- Exposed current streak, grace usage/remaining, and transition status in child check-in UI.
- Added Story 2.2 check script with behavior-level gap assertions for recovery/reset boundaries.
- Fixed grace-day accumulation semantics and valid date-key handling in streak engine.
- Added profile-switch async race guards in daily check-in hook.
- Upgraded Story 2.2 behavior test to compile and execute the actual streak engine.
- Ran story checks and lint successfully.

### File List

- _bmad-output/implementation-artifacts/2-2-deterministic-streak-and-grace-day-engine.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/src/features/streak/domain/streak-engine.ts
- kid-habit-tracker/src/features/checkin/infrastructure/daily-checkin-storage.ts
- kid-habit-tracker/src/features/checkin/hooks/use-daily-checkin.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-2-2-streak-grace-engine-check.sh

## Change Log

- 2026-04-27: Implemented deterministic streak and grace-day engine with child status integration, validated via story checks and lint, and moved to review.
- 2026-04-27: Applied Story 2.2 CR patch set (grace accumulation, date validation, behavior-level engine execution test, stale-state guards), revalidated, and moved to done.
