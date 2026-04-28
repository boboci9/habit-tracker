# Story 4.1: Family Calendar Entry and Monthly View Foundation

Status: done

## Story

As a parent,
I want a family-level calendar view from Profile Picker,
so that I can coordinate household activity before opening a child profile.

## Acceptance Criteria

1. Given the user is on Profile Picker, when Family Calendar is selected, then family calendar view opens without requiring child selection and is displayed as a combined dashboard alongside child check-in sections.
2. Given calendar view is opened, when monthly grid is rendered, then days are shown Monday-Sunday with per-child color indicators and render performance meets defined monthly-view target.

## Tasks / Subtasks

- [x] Define Story 4.1 calendar boundary and route entry contract (AC: 1)
  - [x] Introduce family-level calendar route entry from Profile Picker without requiring selected child profile.
  - [x] Ensure combined dashboard rendering keeps family calendar visible with child sections.
  - [x] Add guardrails so family calendar entry does not require mutating active child selection state.

- [x] Implement monthly view foundation and calendar structure (AC: 2)
  - [x] Implement month-grid builder that renders Monday-Sunday columns deterministically.
  - [x] Add day-cell layout primitives usable by upcoming stories (events, trackers, notes).
  - [x] Ensure month transitions and date normalization are stable for local device timezone behavior.

- [x] Integrate per-child color indicators and legend baseline (AC: 2)
  - [x] Read child profile color metadata from canonical profile storage.
  - [x] Render per-child color markers in month cells with consistent mapping.
  - [x] Add non-color fallback cue placeholders to preserve accessibility in upcoming stories.

- [x] Add Story 4.1 validation and quality checks (AC: 1,2)
  - [x] Add `tests/story-4-1-family-calendar-entry-monthly-view-foundation-check.sh` with structure and behavior assertions.
  - [x] Include one behavior-level execution check for Monday-Sunday month-grid generation determinism.
  - [x] Run Story 4.1 checks and `npx expo lint`.

## Dev Notes

### Previous Story Intelligence

- Story 3.3 reinforced deterministic domain-first implementation and behavior-level checks; apply the same approach for month-grid generation and calendar-route state handling.
- Epic 3 reviews favored targeted fixes at hook/domain boundaries over UI-only fixes; keep Calendar entry orchestration explicit and testable.
- Epic 3 retrospective highlighted that cross-epic process/docs actions can drift unless tied to story gates; include explicit boundary and requirement-clarity checkpoints in this story.

### Architecture & Implementation Guardrails

- Follow feature-sliced boundaries described in architecture:
  - domain rules in `domain/`
  - orchestration in `application/` or hooks
  - storage/platform adapters in `infrastructure/`
  - rendering in `ui/` or route screen
- Keep local-first behavior and deterministic date/day-key handling.
- Preserve parent/family navigation boundaries: family calendar entry must not require or implicitly set child profile context.
- Keep naming and structure conventions consistent:
  - PascalCase for components/types
  - camelCase for functions/hooks
  - snake_case at persistence boundaries

### Project Structure Notes

- Existing patterns to mirror:
  - `kid-habit-tracker/src/features/profiles/*`
  - `kid-habit-tracker/src/app/index.tsx` (Profile Picker entry context)
  - `kid-habit-tracker/src/features/checkin/*` and `src/features/rewards/*` (domain + hook + infra split)
- Expected additions/updates for Story 4.1:
  - `kid-habit-tracker/src/features/calendar/domain/*` (month-grid rules)
  - `kid-habit-tracker/src/features/calendar/hooks/*` or `application/*` (entry orchestration)
  - `kid-habit-tracker/src/features/calendar/ui/*` (family calendar view primitives)
  - `kid-habit-tracker/src/app/index.tsx` (Family Calendar entry action from Profile Picker)

### Testing Requirements

- Verify Family Calendar can open from Profile Picker without mandatory child selection and can be shown together with child check-in sections in combined dashboard mode.
- Verify deterministic month-grid generation (Monday-Sunday layout) for repeat executions on same input month.
- Verify child color indicator mapping consistency with profile metadata.
- Include one behavior-level executable assertion in the Story 4.1 check script.

### Epic 4 Preparation Notes

- Critical prep identified in Epic 3 retro for this story:
  - Family-calendar domain boundary and persistence model must be explicit before broad feature expansion.
  - Navigation entry contract for family-level calendar must be implemented without side effects on child selection.
  - Accessibility and legend constraints should be respected from the first calendar rendering baseline.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1: Family Calendar Entry and Monthly View Foundation]
- [Source: _bmad-output/planning-artifacts/prd.md#Product Scope]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 5: Parent Family Setup and Weekly Calendar Coordination]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/3-3-age-banded-daily-learning-card-delivery.md]
- [Source: _bmad-output/implementation-artifacts/epic-3-retro-2026-04-28.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added `calendar` domain month-grid builder with deterministic Monday-Sunday 42-cell rendering and stable date keys.
- Added family calendar foundation hook with per-child legend and cell indicators sourced from canonical profile metadata.
- Integrated Family Calendar entry flow from Profile Picker with combined dashboard rendering and no child-selection requirement.
- Added monthly view UI baseline (prev/next month controls, weekday header, day cells, per-child color indicators, non-color cue fallback).
- Added Story 4.1 validation script with executable month-grid determinism checks.

### Debug Log References

- `tests/story-4-1-family-calendar-entry-monthly-view-foundation-check.sh` (PASS)
- `npx expo lint` (PASS)

### File List

- _bmad-output/implementation-artifacts/4-1-family-calendar-entry-and-monthly-view-foundation.md
- kid-habit-tracker/src/features/calendar/domain/month-grid.ts
- kid-habit-tracker/src/features/calendar/hooks/use-family-calendar-foundation.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-4-1-family-calendar-entry-monthly-view-foundation-check.sh

## Change Log

- 2026-04-28: Story 4.1 initialized and set to ready-for-dev.
- 2026-04-28: Implemented Story 4.1 family calendar entry and monthly view foundation, validated via story checks and lint, and moved to review.
- 2026-04-28: Requirement clarification accepted - Family Calendar is treated as a combined dashboard shown with child check-in sections.
- 2026-04-28: CR completed with no required fixes; moved to done.
