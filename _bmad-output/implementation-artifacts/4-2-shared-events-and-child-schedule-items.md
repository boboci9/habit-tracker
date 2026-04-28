# Story 4.2: Shared Events and Child Schedule Items

Status: done

## Story

As a parent,
I want to manage shared events and child-specific schedule entries,
so that family planning is visible in one place.

## Acceptance Criteria

1. Given calendar edit controls are available, when parent adds, edits, or deletes shared events, then updates are reflected on correct calendar days and shared events remain visually distinct from child habits.
2. Given child schedule entries exist, when month view is displayed, then each activity appears on correct day in assigned child color and legend mapping remains consistent with profile colors.

## Tasks / Subtasks

- [x] Define event and child-schedule domain contracts (AC: 1,2)
  - [x] Add typed domain models for shared events and child schedule entries, including local day-key normalization.
  - [x] Define visual distinction contract (shared event vs child schedule vs future habit markers).
  - [x] Add deterministic projection rules for month-cell overlays from persisted records.

- [x] Implement local persistence for shared events and child schedule entries (AC: 1,2)
  - [x] Add calendar storage module under `src/features/calendar/infrastructure` for CRUD of shared events and child-specific schedule items.
  - [x] Ensure records map to correct calendar day keys and preserve profile-id/color mapping boundaries.
  - [x] Ensure migration-safe schema updates compatible with existing local-first SQLite patterns.

- [x] Integrate edit controls and combined dashboard rendering (AC: 1,2)
  - [x] Add parent edit controls for add/edit/delete shared events in the Family Calendar combined dashboard.
  - [x] Add child schedule rendering in month cells with assigned child color indicators tied to profile metadata.
  - [x] Ensure shared events are visually distinct from child schedule markers and prepared for future habit overlays.

- [x] Preserve legend consistency and color mapping guarantees (AC: 2)
  - [x] Reuse canonical profile color metadata for all child schedule markers.
  - [x] Keep legend-to-cell mapping consistent across month navigation and data mutations.
  - [x] Add non-color cue placeholder patterns for accessibility continuity.

- [x] Add Story 4.2 validation and quality checks (AC: 1,2)
  - [x] Add `tests/story-4-2-shared-events-child-schedule-items-check.sh` with structure and behavior assertions.
  - [x] Include one behavior-level execution check for day-key projection and profile-color mapping consistency.
  - [x] Run Story 4.2 checks and `npx expo lint`.

## Dev Notes

### Previous Story Intelligence

- Story 4.1 established the Family Calendar month-grid foundation and combined dashboard behavior; Story 4.2 must extend this baseline rather than introducing parallel calendar surfaces.
- Story 4.1 uses canonical profile metadata for legend and indicators; Story 4.2 should keep one source of truth for profile-color mapping.
- Prior epics showed behavior-level checks catch deterministic and state-boundary issues earlier than static checks.

### Architecture & Implementation Guardrails

- Follow feature-sliced boundaries:
  - domain rules in `domain/`
  - command/query orchestration in `application/` or hooks
  - persistence adapters in `infrastructure/`
  - rendering and edit controls in `ui/` or route screen
- Preserve local-first behavior and deterministic day-key mapping (`YYYY-MM-DD`) for calendar records.
- Keep combined dashboard intent: Family Calendar features coexist with existing child check-in sections.
- Maintain naming conventions:
  - PascalCase for components/types
  - camelCase for functions/hooks
  - snake_case at storage boundaries

### Project Structure Notes

- Existing patterns to mirror:
  - `kid-habit-tracker/src/features/calendar/domain/month-grid.ts`
  - `kid-habit-tracker/src/features/calendar/hooks/use-family-calendar-foundation.ts`
  - `kid-habit-tracker/src/features/profiles/infrastructure/profile-storage.ts`
  - `kid-habit-tracker/src/app/index.tsx`
- Expected additions/updates for Story 4.2:
  - `kid-habit-tracker/src/features/calendar/domain/*` (event/schedule models and projection rules)
  - `kid-habit-tracker/src/features/calendar/infrastructure/*` (local event + child schedule persistence)
  - `kid-habit-tracker/src/features/calendar/hooks/*` (calendar data orchestration)
  - `kid-habit-tracker/src/app/index.tsx` (combined dashboard edit controls and rendering)

### Testing Requirements

- Verify add/edit/delete shared event flows update the correct calendar day.
- Verify child schedule entries render on correct day and use assigned child profile color.
- Verify shared events remain visually distinct from child schedule entries.
- Include one behavior-level executable assertion for deterministic day-key projection and color mapping continuity.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2: Shared Events and Child Schedule Items]
- [Source: _bmad-output/planning-artifacts/prd.md#Product Scope]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 5: Parent Family Setup and Weekly Calendar Coordination]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/4-1-family-calendar-entry-and-monthly-view-foundation.md]
- [Source: _bmad-output/implementation-artifacts/epic-3-retro-2026-04-28.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added calendar item domain models and projection logic for shared events and child schedule entries with deterministic day-key grouping.
- Added local SQLite-backed calendar item CRUD storage and month-range query support.
- Added family calendar items hook for month-scoped load/add/edit/delete orchestration.
- Integrated parent edit controls in the combined Family Calendar dashboard for shared events and child schedules.
- Updated month-cell rendering to show shared-event badges and child schedule markers with canonical profile colors.
- Added Story 4.2 behavior-level validation script and verified lint clean.
- Patched save flow to preserve calendar draft values when add/update fails, resetting form only on successful save.

### Debug Log References

- `tests/story-4-2-shared-events-child-schedule-items-check.sh` (PASS)
- `npx expo lint` (PASS)

### File List

- _bmad-output/implementation-artifacts/4-2-shared-events-and-child-schedule-items.md
- kid-habit-tracker/src/features/calendar/domain/calendar-items.ts
- kid-habit-tracker/src/features/calendar/infrastructure/calendar-item-storage.ts
- kid-habit-tracker/src/features/calendar/hooks/use-family-calendar-items.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-4-2-shared-events-child-schedule-items-check.sh

## Change Log

- 2026-04-28: Story 4.2 initialized and set to ready-for-dev.
- 2026-04-28: Implemented Story 4.2 shared events and child schedule items, validated via story checks and lint, and moved to review.
- 2026-04-28: CR patch applied - preserve draft on failed save for calendar add/edit controls.
- 2026-04-28: CR completed with no remaining required fixes; moved to done.
