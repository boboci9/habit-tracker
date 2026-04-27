# Story 1.5: Weekly Parent Summary and Guidance Prompts

Status: done

## Story

As a parent,
I want a weekly consistency summary and reinforcement prompts,
so that I can coach effort-focused behavior effectively.

## Acceptance Criteria

1. Given at least one week of child check-in data exists, when the parent opens weekly summary, then per-child completion percentage, streak status, and missed-day count are displayed and values reflect local data accurately.
2. Given the parent views reinforcement guidance, when prompts are shown, then prompts use effort-first language patterns and prompts are available without network dependency.

## Tasks / Subtasks

- [x] Implement weekly summary local persistence + read model (AC: 1)
  - [x] Add weekly summary storage schema and typed read/write operations.
  - [x] Ensure per-child completion %, streak status, missed-day count are persisted and retrievable.
- [x] Implement parent weekly summary presentation (AC: 1)
  - [x] Render weekly summary section in parent-protected area.
  - [x] Show per-child values (completion %, streak status, missed days).
- [x] Implement effort-first guidance prompts (AC: 2)
  - [x] Add offline prompt source with effort-first phrasing.
  - [x] Render guidance prompts in parent-protected area.
- [x] Add story validation checks (AC: 1,2)
  - [x] Add story-specific check script for weekly summary + prompts.
  - [x] Run lint and story check script.

### Review Findings

- [x] [Review][Decision] Weekly summary data source policy — derive weekly summary from canonical local check-in/streak records.
- [x] [Review][Patch] Enforce parent-protected boundary for weekly summary and guidance visibility (not only save action) [kid-habit-tracker/src/app/index.tsx:338]
- [x] [Review][Patch] Clear stale weekly summary error state after successful reloads [kid-habit-tracker/src/features/profiles/hooks/use-weekly-parent-summary.ts:36]
- [x] [Review][Patch] Make weekly save action deterministic by persisting current completion value directly (avoid recompute drift from missed-day ratio) [kid-habit-tracker/src/app/index.tsx:364]
- [x] [Review][Patch] Strengthen Story 1.5 validation beyond static grep checks with behavior-oriented assertions [tests/story-1-5-weekly-parent-summary-check.sh:1]

## Dev Notes

### Relevant Architecture & Constraints

- Keep feature logic in `src/features/profiles` and route/UI integration in `src/app`.
- Maintain local-only persistence in Phase 1 (no network dependency).
- Preserve typed function contracts and deterministic behavior for read/write operations.
- Keep parent-only weekly summary interactions within parent-protected area.

### Current Implementation Context

- Existing profile/settings persistence in:
  - `src/features/profiles/infrastructure/profile-storage.ts`
  - `src/features/profiles/infrastructure/setup-storage.ts`
- Existing parent-protected flow in:
  - `src/features/profiles/hooks/use-parent-protected-settings.ts`
  - `src/app/index.tsx`

### File Structure Requirements

- Expected additions/updates for this story:
  - `src/features/profiles/infrastructure/weekly-summary-storage.ts`
  - `src/features/profiles/hooks/use-weekly-parent-summary.ts`
  - `src/app/index.tsx`
  - `tests/story-1-5-weekly-parent-summary-check.sh`

### Testing Requirements

- Add/update checks for:
  - Weekly summary data model availability and read/write operations
  - Parent weekly summary rendering in protected context
  - Offline effort-first prompt availability and rendering
- Run lint and ensure no regressions.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Weekly Parent Summary and Guidance Prompts]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/implementation-artifacts/1-4-parent-protected-settings-and-profile-management.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `tests/story-1-5-weekly-parent-summary-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Added canonical local daily check-in persistence in `daily_checkins` and derived weekly per-child summary values from local records.
- Added weekly parent summary hook for current-week loading, deterministic local check-in recording, stale-error clearing, and offline effort-first prompts.
- Integrated weekly summary and reinforcement prompt presentation so visibility is fully parent-verified.
- Added and ran story-specific validation script plus lint checks.

### File List

- _bmad-output/implementation-artifacts/1-5-weekly-parent-summary-and-guidance-prompts.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/src/app/index.tsx
- kid-habit-tracker/src/features/profiles/infrastructure/weekly-summary-storage.ts
- kid-habit-tracker/src/features/profiles/hooks/use-weekly-parent-summary.ts
- tests/story-1-5-weekly-parent-summary-check.sh

## Change Log

- 2026-04-27: Created Story 1.5 implementation artifact and started development.
- 2026-04-27: Implemented weekly parent summary + effort-first guidance prompts with local persistence and validation; moved to review.
- 2026-04-27: Applied review patch set (canonical derivation, visibility boundary, stale-error clear, strengthened checks) and moved to done.
