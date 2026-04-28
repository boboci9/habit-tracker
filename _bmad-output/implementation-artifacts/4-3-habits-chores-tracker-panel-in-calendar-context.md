# Story 4.3: Habits/Chores Tracker Panel in Calendar Context

Status: done

## Story

As a parent,
I want a habits/chores tracker section under the calendar,
so that I can view weekly child habit assignments and completion status.

## Acceptance Criteria

1. Given family calendar is open, when habits/chores panel is expanded, then per-child assigned habits appear by day-of-week and completion indicators align with underlying check-in records.
2. Given profile color keys are defined, when tracker data is displayed, then color usage is consistent with calendar and legend and accessibility cues are present beyond color alone.

## Tasks / Subtasks

- [x] Define habits/chores tracker domain contracts (AC: 1,2)
  - [x] Add typed tracker row model for weekly day-of-week assignments per child.
  - [x] Define completion projection contract from canonical check-in records.
  - [x] Define display-state contract for assigned/not-assigned/completed states with non-color cues.

- [x] Implement tracker projection and data orchestration (AC: 1)
  - [x] Add tracker hook/application orchestration under `src/features/calendar` to project weekly view by child.
  - [x] Reuse canonical profile and check-in sources for consistent completion status.
  - [x] Ensure deterministic weekly projection for identical inputs and active week.

- [x] Integrate tracker panel UI under Family Calendar combined dashboard (AC: 1,2)
  - [x] Add collapsible habits/chores panel below calendar with per-child rows and day-of-week columns.
  - [x] Render completion indicators aligned to check-in records and weekly date boundaries.
  - [x] Keep shared event/schedule rendering unchanged while composing tracker panel.

- [x] Enforce legend and accessibility consistency (AC: 2)
  - [x] Apply canonical profile color mapping in tracker rows to match calendar legend.
  - [x] Include non-color indicators (text/icons/tags) for completion state readability.
  - [x] Ensure color + cue consistency across month navigation and profile set changes.

- [x] Add Story 4.3 verification and quality checks (AC: 1,2)
  - [x] Add `tests/story-4-3-habits-chores-tracker-panel-calendar-context-check.sh` with structure and behavior assertions.
  - [x] Include one behavior-level execution check for weekly completion projection alignment.
  - [x] Run Story 4.3 checks and `npx expo lint`.

## Dev Notes

### Previous Story Intelligence

- Story 4.1 established the Family Calendar month-grid baseline and combined dashboard layout.
- Story 4.2 introduced shared event/child schedule CRUD with canonical color mapping and draft-preserving save behavior.
- Story 4.3 should extend existing calendar composition patterns without regressing 4.1/4.2 interactions.

### Architecture & Implementation Guardrails

- Keep feature-sliced boundaries:
  - domain rules in `domain/`
  - orchestration in hooks/application layer
  - storage/platform adapters in `infrastructure/`
  - rendering in route/UI sections
- Use canonical check-in records as source of truth for completion indicators.
- Preserve deterministic local-first behavior and day-key/week-key projection contracts.
- Maintain naming conventions:
  - PascalCase for components/types
  - camelCase for functions/hooks
  - snake_case at storage boundaries

### Project Structure Notes

- Existing patterns to mirror:
  - `kid-habit-tracker/src/features/calendar/domain/month-grid.ts`
  - `kid-habit-tracker/src/features/calendar/domain/calendar-items.ts`
  - `kid-habit-tracker/src/features/calendar/hooks/use-family-calendar-foundation.ts`
  - `kid-habit-tracker/src/features/calendar/hooks/use-family-calendar-items.ts`
  - `kid-habit-tracker/src/features/checkin/*`
  - `kid-habit-tracker/src/app/index.tsx`
- Expected additions/updates for Story 4.3:
  - `kid-habit-tracker/src/features/calendar/domain/*` (tracker projection rules)
  - `kid-habit-tracker/src/features/calendar/hooks/*` (weekly tracker orchestration)
  - `kid-habit-tracker/src/app/index.tsx` (tracker panel rendering in combined dashboard)

### Testing Requirements

- Verify per-child day-of-week assignments are displayed when tracker panel is expanded.
- Verify completion indicators align with canonical check-in records for the projected week.
- Verify color mapping remains consistent with calendar legend and includes non-color accessibility cues.
- Include one behavior-level executable assertion for deterministic weekly completion projection.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3: Habits/Chores Tracker Panel in Calendar Context]
- [Source: _bmad-output/planning-artifacts/prd.md#Product Scope]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 5: Parent Family Setup and Weekly Calendar Coordination]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/4-1-family-calendar-entry-and-monthly-view-foundation.md]
- [Source: _bmad-output/implementation-artifacts/4-2-shared-events-and-child-schedule-items.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added weekly habit tracker domain projection contract for per-child day-of-week status cues aligned to check-in completion.
- Added habit tracker panel hook that reads canonical check-in history per child and projects deterministic weekly rows.
- Integrated collapsible habits/chores tracker panel into Family Calendar combined dashboard beneath existing calendar sections.
- Added color-consistent row identity and non-color completion cues (Done/Open) for accessibility continuity.
- Added Story 4.3 validation script and verified lint clean.

### Debug Log References

- `tests/story-4-3-habits-chores-tracker-panel-calendar-context-check.sh` (PASS)
- `npx expo lint` (PASS)

### File List

- _bmad-output/implementation-artifacts/4-3-habits-chores-tracker-panel-in-calendar-context.md
- kid-habit-tracker/src/features/calendar/domain/habit-tracker.ts
- kid-habit-tracker/src/features/calendar/hooks/use-habit-tracker-panel.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-4-3-habits-chores-tracker-panel-calendar-context-check.sh

## Change Log

- 2026-04-28: Story 4.3 initialized and set to ready-for-dev.
- 2026-04-28: Implemented Story 4.3 habits/chores tracker panel in calendar context, validated via story checks and lint, and moved to review.
- 2026-04-28: CR clarification accepted for v1 - week containing the 1st is intentional for monthly-overview pilot; v2 note added for current/selected week behavior.
- 2026-04-28: CR completed with no required code changes; moved to done.
