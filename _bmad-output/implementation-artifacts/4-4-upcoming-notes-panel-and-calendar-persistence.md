# Story 4.4: Upcoming Notes Panel and Calendar Persistence

Status: done

## Story

As a parent,
I want to keep short upcoming notes/reminders in family calendar,
so that key family logistics are visible during planning.

## Acceptance Criteria

1. Given notes panel is available, when parent adds up to 5 short notes, then notes are persisted locally and visible in family view and notes can be edited or removed.
2. Given app restarts or offline mode, when family calendar is reopened, then notes, events, and tracker state are restored accurately and no critical data-loss occurs.

## Tasks / Subtasks

- [x] Define notes domain contract and constraints (AC: 1)
  - [x] Add typed notes model with explicit max count (5), short-text limits, and local ordering behavior.
  - [x] Define validation rules for add/edit flows and deterministic note list projection.
  - [x] Define edit/remove command contracts with stable identifiers.

- [x] Implement local notes persistence and retrieval (AC: 1,2)
  - [x] Add calendar notes storage under `src/features/calendar/infrastructure` using migration-safe SQLite patterns.
  - [x] Implement add/edit/delete/list operations with max-note guardrails.
  - [x] Ensure read path restores notes reliably across app restarts and offline sessions.

- [x] Integrate upcoming notes panel in Family Calendar combined dashboard (AC: 1)
  - [x] Add notes panel UI below existing calendar/tracker sections in combined dashboard layout.
  - [x] Add parent-protected edit controls for create/update/delete notes.
  - [x] Keep existing event/schedule/tracker behavior unchanged while composing notes panel.

- [x] Validate persistence across restart/offline scenarios (AC: 2)
  - [x] Ensure notes render from persisted storage when app is reopened.
  - [x] Verify notes coexist with previously persisted events and tracker projections.
  - [x] Add explicit error handling for storage failures without corrupting existing data.

- [x] Add Story 4.4 verification and quality checks (AC: 1,2)
  - [x] Add `tests/story-4-4-upcoming-notes-panel-calendar-persistence-check.sh` with structure + behavior assertions.
  - [x] Include one behavior-level execution check for note count limit and persistence restore behavior.
  - [x] Run Story 4.4 checks and `npx expo lint`.

## Dev Notes

### Previous Story Intelligence

- Story 4.1 established Family Calendar month-grid baseline and combined dashboard pattern.
- Story 4.2 added shared event/child schedule CRUD with deterministic day projection and robust draft-preserving save behavior.
- Story 4.3 added habits/chores weekly tracker with canonical completion alignment and accessibility cues.
- Story 4.4 should compose notes persistence without regressing these existing calendar panels.

### Architecture & Implementation Guardrails

- Preserve feature-sliced structure:
  - domain rules in `domain/`
  - orchestration in hooks/application layer
  - storage adapters in `infrastructure/`
  - rendering in combined dashboard UI sections
- Keep local-first deterministic behavior and migration-safe storage changes.
- Respect parent-protected edit behavior for calendar mutations.
- Maintain naming conventions:
  - PascalCase for components/types
  - camelCase for functions/hooks
  - snake_case at persistence boundaries

### Project Structure Notes

- Existing patterns to mirror:
  - `kid-habit-tracker/src/features/calendar/domain/calendar-items.ts`
  - `kid-habit-tracker/src/features/calendar/hooks/use-family-calendar-items.ts`
  - `kid-habit-tracker/src/features/calendar/domain/habit-tracker.ts`
  - `kid-habit-tracker/src/features/calendar/hooks/use-habit-tracker-panel.ts`
  - `kid-habit-tracker/src/app/index.tsx`
- Expected additions/updates for Story 4.4:
  - `kid-habit-tracker/src/features/calendar/domain/*` (notes model/validation)
  - `kid-habit-tracker/src/features/calendar/infrastructure/*` (notes persistence)
  - `kid-habit-tracker/src/features/calendar/hooks/*` (notes orchestration)
  - `kid-habit-tracker/src/app/index.tsx` (upcoming notes panel and controls)

### Testing Requirements

- Verify up to 5 notes can be added and additional notes are rejected with clear feedback.
- Verify notes can be edited and removed with persisted state updates.
- Verify notes restore correctly after re-open while events/tracker state remain intact.
- Include one behavior-level executable assertion for note-limit + persistence behavior.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.4: Upcoming Notes Panel and Calendar Persistence]
- [Source: _bmad-output/planning-artifacts/prd.md#Product Scope]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 5: Parent Family Setup and Weekly Calendar Coordination]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/4-1-family-calendar-entry-and-monthly-view-foundation.md]
- [Source: _bmad-output/implementation-artifacts/4-2-shared-events-and-child-schedule-items.md]
- [Source: _bmad-output/implementation-artifacts/4-3-habits-chores-tracker-panel-in-calendar-context.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 4.4 prepared to add notes persistence and controls to the existing combined Family Calendar dashboard.
- Carry-forward constraints from 4.1-4.3 included to preserve behavior and avoid regressions.
- Added typed upcoming-notes domain rules with max-5 guardrails, short-text validation, and deterministic restore ordering.
- Implemented SQLite-backed notes persistence (create/read/update/delete) in the shared family setup database with migration-safe table/index creation.
- Integrated parent-protected upcoming notes panel into Family Calendar with add/edit/delete flows and clear validation feedback.
- Added Story 4.4 verification script and executed story check + Expo lint successfully.
- Applied CR follow-up to parent-gate the Upcoming Notes Edit entry point so all mutation entry points (add/edit/delete) require parent verification.

### File List

- _bmad-output/implementation-artifacts/4-4-upcoming-notes-panel-and-calendar-persistence.md
- kid-habit-tracker/src/features/calendar/domain/calendar-notes.ts
- kid-habit-tracker/src/features/calendar/infrastructure/calendar-note-storage.ts
- kid-habit-tracker/src/features/calendar/hooks/use-upcoming-calendar-notes.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-4-4-upcoming-notes-panel-calendar-persistence-check.sh

## Change Log

- 2026-04-28: Story 4.4 initialized and set to ready-for-dev.
- 2026-04-28: Implemented upcoming notes domain/storage/hook and Family Calendar panel integration with parent-protected CRUD.
- 2026-04-28: Added Story 4.4 verification script and validated with story check + Expo lint; moved to review.
- 2026-04-28: Story 4.4 finalized and moved to done after final verification pass.
- 2026-04-28: CR follow-up applied to disable Upcoming Notes Edit action when parent verification is not active; revalidated story checks + lint.
