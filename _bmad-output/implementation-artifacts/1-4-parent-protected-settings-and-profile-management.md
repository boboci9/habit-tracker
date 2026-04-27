# Story 1.4: Parent-Protected Settings and Profile Management

Status: done

## Story

As a parent,
I want protected access to profile and key settings actions,
so that children cannot accidentally modify critical household configuration.

## Acceptance Criteria

1. Given a user attempts profile add/edit/remove from settings, when local parent verification succeeds, then the requested profile-management action is applied and failed verification blocks the action.
2. Given parent-protected mode is active, when reward target and reminder settings are updated, then changes are saved to local persistence and updates are visible in subsequent sessions.

## Tasks / Subtasks

- [x] Implement parent verification boundary (AC: 1)
  - [x] Add local parent verification persistence/service functions.
  - [x] Create parent-protected settings hook with verify/unlock state.
  - [x] Ensure failed verification blocks profile-management mutations.
- [x] Implement protected profile management actions (AC: 1)
  - [x] Require verified parent mode for add/edit/remove profile actions from settings context.
  - [x] Add remove profile operation with safe lower-bound constraints.
  - [x] Add profile edit operation for selected profile.
- [x] Implement protected reward/reminder settings persistence (AC: 2)
  - [x] Extend profile persistence model for reward target and reminder time.
  - [x] Add typed update/read operations for per-profile reward/reminder settings.
  - [x] Render settings editor and persist changes under verified parent mode.
- [x] Add story validation checks (AC: 1,2)
  - [x] Add story-specific verification script for parent verification + settings persistence behavior.
  - [x] Run lint and story checks.

### Review Findings

- [x] [Review][Decision] Parent PIN policy for protected settings — keep convenience default PIN (`1234`) for MVP pilot.
- [x] [Review][Patch] Enforce AC1 protection at mutation boundary for add profile (not UI-only gate) [kid-habit-tracker/src/features/profiles/hooks/use-profile-picker.ts:110]
- [x] [Review][Patch] Make profile identity + settings save atomic to avoid partial persistence on failure [kid-habit-tracker/src/features/profiles/hooks/use-profile-picker.ts:131]
- [x] [Review][Patch] Make delete lower-bound check atomic to prevent concurrent delete race below minimum profiles [kid-habit-tracker/src/features/profiles/infrastructure/profile-storage.ts:253]
- [x] [Review][Patch] Strengthen Story 1.4 validation from grep-only checks to behavior-oriented assertions [tests/story-1-4-parent-protected-settings-check.sh:1]

## Dev Notes

### Relevant Architecture & Constraints

- Keep feature logic in `src/features/profiles` and route/UI integration in `src/app`.
- Maintain local-only persistence in Phase 1 (no off-device profile payloads).
- Preserve typed function contracts and deterministic behavior for read/write operations.
- Keep operation boundaries explicit: parent-protected mutations must never run while verification is locked.

### Current Implementation Context

- Existing setup/profile state is persisted via:
  - `src/features/profiles/infrastructure/setup-storage.ts`
  - `src/features/profiles/infrastructure/profile-storage.ts`
- Existing route/UI integration is in:
  - `src/app/index.tsx`
- Existing hooks:
  - `src/features/profiles/hooks/use-family-setup.ts`
  - `src/features/profiles/hooks/use-profile-picker.ts`

### File Structure Requirements

- Expected additions for this story likely include:
  - `src/features/profiles/hooks/use-parent-protected-settings.ts`
  - extensions in `src/features/profiles/infrastructure/profile-storage.ts`
  - extensions in `src/features/profiles/infrastructure/setup-storage.ts`
  - updates in `src/app/index.tsx`
  - `tests/story-1-4-parent-protected-settings-check.sh`

### Testing Requirements

- Add/update checks for:
  - Verification gate behavior (block on failed verify; allow on success)
  - Add/edit/remove profile behavior in protected mode
  - Reward/reminder persistence and reload visibility
- Run lint and ensure no regressions.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Parent-Protected Settings and Profile Management]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/implementation-artifacts/1-3-child-profile-creation-and-profile-picker.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `tests/story-1-4-parent-protected-settings-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Added local parent verification service (`verifyParentPin`) with default bootstrap pin and integrated verification state in parent-protected workflows.
- Added parent-protected settings hook for verify/lock state, selected-profile draft editing, and guarded save/remove operations.
- Extended child profile persistence schema and migrations with reward target and reminder time columns.
- Implemented typed settings update and protected delete profile operations in profile storage.
- Integrated parent-protected settings UI in main screen and enforced verification gate for profile add/edit/remove actions.
- Added Story 1.4 behavior-oriented validation script and executed lint + script checks successfully.
- Applied Story 1.4 code-review patch set: add mutation-boundary verification for profile create, atomic combined profile/settings save path, atomic lower-bound guarded delete path, and stronger behavior-oriented check assertions.

### File List

- _bmad-output/implementation-artifacts/1-4-parent-protected-settings-and-profile-management.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/src/app/index.tsx
- kid-habit-tracker/src/features/profiles/hooks/use-profile-picker.ts
- kid-habit-tracker/src/features/profiles/hooks/use-parent-protected-settings.ts
- kid-habit-tracker/src/features/profiles/infrastructure/profile-storage.ts
- kid-habit-tracker/src/features/profiles/infrastructure/setup-storage.ts
- tests/story-1-4-parent-protected-settings-check.sh

## Change Log

- 2026-04-27: Created Story 1.4 implementation artifact from planning context and marked ready-for-dev.
- 2026-04-27: Implemented parent-protected settings and profile-management flow with local persistence, then validated with lint and story checks.
- 2026-04-27: Resolved Story 1.4 code-review decision and patch findings; revalidated and moved to done.
