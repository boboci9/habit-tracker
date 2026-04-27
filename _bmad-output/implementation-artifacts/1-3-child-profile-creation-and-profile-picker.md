# Story 1.3: Child Profile Creation and Profile Picker

Status: done

## Story

As a parent,
I want to create and manage 2-6 child profiles with distinct identity attributes,
so that each child has an independent habit experience.

## Acceptance Criteria

1. Given family setup is complete, when the parent adds child profiles with name, age, avatar, and color, then each profile is stored independently and each profile receives a unique color identifier.
2. Given setup has completed previously, when the app launches, then the Profile Picker is shown by default and selecting a child opens that child's habit view without login.

## Tasks / Subtasks

- [x] Implement child profile domain storage and constraints (AC: 1)
  - [x] Add `child_profiles` persistence model in profiles feature infrastructure.
  - [x] Enforce minimum/maximum profile count constraints (2-6) for setup/profile workflows.
  - [x] Ensure unique color assignment per child profile in persisted records.
- [x] Implement profile creation/update operations (AC: 1)
  - [x] Create typed write/read operations for adding and listing child profiles.
  - [x] Validate required fields for each child profile: name, age, avatar/color.
- [x] Implement Profile Picker default-entry flow (AC: 2)
  - [x] On startup after setup complete, render Profile Picker as default entry.
  - [x] Show tappable child cards from local profiles store.
  - [x] Add selection action that opens child-specific placeholder view without authentication.
- [x] Add story validation checks (AC: 1,2)
  - [x] Add story-specific verification script for profile persistence + picker rendering paths.
  - [x] Run lint and story checks.

### Review Findings

- [x] [Review][Patch] Keep child profiles on reset and make behavior explicit in UI copy [kid-habit-tracker/src/app/index.tsx:178]
- [x] [Review][Patch] Enforce max-profile limit atomically to prevent concurrent inserts from bypassing cap [kid-habit-tracker/src/features/profiles/infrastructure/profile-storage.ts:93]
- [x] [Review][Patch] Stabilize profile hydration callback to avoid unnecessary reloads on selection change [kid-habit-tracker/src/features/profiles/hooks/use-profile-picker.ts:29]
- [x] [Review][Patch] Replace internal action label with user-facing button copy in profile creation CTA [kid-habit-tracker/src/app/index.tsx:133]

## Dev Notes

### Relevant Architecture & Constraints

- Keep feature logic in `src/features/profiles` and route/UI integration in `src/app`.
- Maintain local-only persistence in Phase 1 (no off-device profile payloads).
- Preserve typed function contracts and deterministic behavior for read/write operations.

### Current Implementation Context

- Story 1.2 introduced setup persistence and completion gating through:
  - `src/features/profiles/infrastructure/setup-storage.ts`
  - `src/features/profiles/hooks/use-family-setup.ts`
  - `src/app/index.tsx`
- Build on this pattern: keep storage in infrastructure, orchestration in feature hooks, and UI logic in route files.

### File Structure Requirements

- Expected additions for this story likely include:
  - `src/features/profiles/infrastructure/profile-storage.ts`
  - `src/features/profiles/hooks/use-profile-picker.ts`
  - `src/app/index.tsx` (or dedicated profile-picker route) for default entry and selection behavior
- Keep naming conventions consistent:
  - PascalCase for components/types
  - camelCase for functions/variables
  - clear typed payload boundaries

### Testing Requirements

- Add/update script checks for:
  - Independent profile storage records
  - Unique color validation
  - Profile picker default render when setup complete
  - Child card selection action path
- Run lint and ensure no regressions.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Child Profile Creation and Profile Picker]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/implementation-artifacts/1-2-first-launch-family-setup-flow.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `./tests/story-1-3-profile-picker-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Implemented `child_profiles` persistence model with unique color, min/max profile constraints, typed read/write operations, and update support in `src/features/profiles/infrastructure/profile-storage.ts`.
- Implemented profile picker orchestration hook in `src/features/profiles/hooks/use-profile-picker.ts`.
- Updated `src/app/index.tsx` to render Profile Picker by default after setup completion, support profile creation, display tappable child cards, and open child-specific placeholder view on selection.
- Added and executed story validation script for profile persistence and picker behavior.
- Resolved CR Finding 1 by clearing persisted setup completion state during reset via `clearSetupComplete`.
- Resolved CR Finding 2 by upgrading story checks from shallow token checks to behavior-oriented assertions.

### Review Findings Resolution

- [x] Finding 1 (persistent reset fix): Added `clearSetupComplete()` in setup storage and invoked it in `resetSetup()` so setup completion is reset across app restarts.
- [x] Finding 2 (stronger validation): Expanded `tests/story-1-3-profile-picker-check.sh` to validate profile constraints, completed-setup default-entry branch, profile selection path, and persistent reset behavior.

### File List

- _bmad-output/implementation-artifacts/1-3-child-profile-creation-and-profile-picker.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- tests/story-1-3-profile-picker-check.sh
- kid-habit-tracker/src/features/profiles/infrastructure/profile-storage.ts
- kid-habit-tracker/src/features/profiles/hooks/use-profile-picker.ts
- kid-habit-tracker/src/app/index.tsx

## Change Log

- 2026-04-27: Implemented Story 1.3 child profile persistence and Profile Picker default-entry flow, validated with story checks and lint, and moved to review.
- 2026-04-27: Resolved CR findings for persistent reset completion and stronger behavior-oriented checks; revalidated and moved to done.
- 2026-04-27: Applied code-review patch set (atomic profile cap insert, stable picker hydration, and explicit reset/add UI copy).
