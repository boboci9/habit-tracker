# Story 2.1: Daily Check-In Capture (Offline-First)

Status: done

## Story

As a child,
I want to log pushups and one daily learning item in a single flow,
so that I can complete my daily ritual quickly.

## Acceptance Criteria

1. Given the child is on today's check-in screen, when pushups and learning text are submitted, then today's check-in is marked complete and submission works while offline.
2. Given the child submitted today already, when they edit same-day values, then the same-day entry updates successfully and the update is persisted locally.

## Tasks / Subtasks

- [x] Implement canonical daily check-in data model and commands (AC: 1,2)
  - [x] Reconcile Story 1.5 `daily_checkins` usage with Epic 2 canonical ownership; keep one source of truth.
  - [x] Add typed create-or-update command for same-day check-in writes.
  - [x] Ensure same-day updates overwrite safely without creating duplicate day records.
- [x] Implement offline-first check-in read/write flow (AC: 1)
  - [x] Add or extend check-in hook/service to load today's state from local persistence only.
  - [x] Persist check-in submission without network dependency.
  - [x] Return deterministic success/error envelopes at feature boundary.
- [x] Implement child check-in UI interaction (AC: 1,2)
  - [x] Add child-facing check-in form for pushups and one learning entry.
  - [x] Render today's completion state clearly (complete/incomplete).
  - [x] Support editing same-day values and re-saving.
- [x] Add validation and guardrails (AC: 1,2)
  - [x] Validate pushups as non-negative numeric input.
  - [x] Validate learning entry as required non-empty text.
  - [x] Ensure invalid inputs cannot be submitted.
- [x] Add story verification checks (AC: 1,2)
  - [x] Add `tests/story-2-1-daily-checkin-offline-first-check.sh` with behavior-oriented assertions.
  - [x] Run story checks and lint.

### Review Findings

- [x] [Review][Patch] Remove parent weekly-summary completion write path that bypassed required child pushups+learning submission.
- [x] [Review][Patch] Unify `daily_checkins` table ownership under check-in storage module and make weekly summary storage read-only against canonical records.
- [x] [Review][Patch] Add behavior-level test assertion for same-day upsert semantics (single-row overwrite behavior).

## Dev Notes

### Relevant Architecture & Constraints

- Keep feature logic under `src/features/checkin` and route/UI integration in `src/app`.
- Maintain Phase 1 local-only behavior: no network calls for check-in create/update.
- Preserve deterministic local persistence and typed contracts.
- Use consistent boundary envelopes (`{ ok: true, data }` / `{ ok: false, error }`) for new service operations.
- Follow naming conventions: snake_case at data boundary, PascalCase types/components, camelCase functions/variables.

### Continuity From Epic 1

- Story 1.5 introduced `daily_checkins` for weekly summary derivation in `src/features/profiles/infrastructure/weekly-summary-storage.ts`.
- Epic 2 kickoff must avoid parallel check-in representations; unify canonical ownership before expanding streak logic.
- Keep behavior-oriented checks as default (Epic 1 retrospective action item).

### Current Implementation Context

- Existing setup/profile entry and parent boundary live in:
  - `src/app/index.tsx`
  - `src/features/profiles/hooks/use-profile-picker.ts`
  - `src/features/profiles/hooks/use-parent-protected-settings.ts`
- Existing weekly summary derivation uses local check-in records in:
  - `src/features/profiles/infrastructure/weekly-summary-storage.ts`
  - `src/features/profiles/hooks/use-weekly-parent-summary.ts`

### File Structure Requirements

- Expected additions/updates for this story:
  - `src/features/checkin/infrastructure/*` (check-in storage/contracts)
  - `src/features/checkin/hooks/*` (today check-in orchestration)
  - `src/app/index.tsx` or a dedicated child-checkin route under `src/app`
  - `tests/story-2-1-daily-checkin-offline-first-check.sh`

### Testing Requirements

- Add/update checks for:
  - Offline-local write/read for today's check-in
  - Same-day update persistence behavior
  - Validation and completion-state behavior
- Run lint and story checks.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1: Daily Check-In Capture (Offline-First)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/epic-1-retro-2026-04-27.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `tests/story-2-1-daily-checkin-offline-first-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Added canonical check-in storage and migration-safe schema evolution in `src/features/checkin/infrastructure/daily-checkin-storage.ts`.
- Added `useDailyCheckin` hook to load, validate, save, and same-day update local check-ins in `src/features/checkin/hooks/use-daily-checkin.ts`.
- Integrated child-facing check-in UI in selected profile view with completion state, pushups and learning input validation, and update-capable save action in `src/app/index.tsx`.
- Added Story 2.1 verification script `tests/story-2-1-daily-checkin-offline-first-check.sh`.
- Removed parent-side weekly summary completion write action to preserve Story 2.1 completion integrity boundaries.
- Consolidated `daily_checkins` schema ownership to the check-in module and updated weekly summary module to read-only integration.
- Added runnable SQLite behavior assertion in Story 2.1 checks for same-day update semantics.
- Ran story checks and lint successfully.

### File List

- _bmad-output/implementation-artifacts/2-1-daily-check-in-capture-offline-first.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/src/app/index.tsx
- kid-habit-tracker/src/features/checkin/infrastructure/daily-checkin-storage.ts
- kid-habit-tracker/src/features/checkin/hooks/use-daily-checkin.ts
- tests/story-2-1-daily-checkin-offline-first-check.sh
- tests/story-1-5-weekly-parent-summary-check.sh

## Change Log

- 2026-04-27: Implemented Story 2.1 offline-first daily check-in capture with same-day edit persistence, child check-in UI integration, and validation checks; moved to review.
- 2026-04-27: Applied CR patch set (completion integrity boundary, single ownership for `daily_checkins`, behavior-level upsert assertion), revalidated, and moved to done.
