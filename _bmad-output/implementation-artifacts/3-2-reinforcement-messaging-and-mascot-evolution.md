# Story 3.2: Reinforcement Messaging and Mascot Evolution

Status: done

## Story

As a child,
I want positive feedback and a mascot that evolves with consistency,
so that I stay motivated to continue the routine.

## Acceptance Criteria

1. Given a daily check-in is completed, when post-submit feedback is displayed, then reinforcement messaging appears with success context and recovery encouragement appears after missed-day scenarios.
2. Given cumulative progress thresholds are crossed, when mascot state is resolved, then mascot visual stage updates according to defined thresholds and evolution state persists between sessions.

## Tasks / Subtasks

- [x] Define reinforcement and mascot domain contracts (AC: 1,2)
  - [x] Add reinforcement message resolver with explicit success and recovery branches driven by streak/recovery state.
  - [x] Define mascot stage thresholds and deterministic stage computation inputs.
  - [x] Ensure domain outputs are pure and replay-safe for identical state inputs.

- [x] Implement mascot evolution persistence and retrieval (AC: 2)
  - [x] Add mascot storage under `src/features/rewards/infrastructure` with migration-safe local persistence.
  - [x] Persist per-profile mascot stage snapshots and last-transition metadata.
  - [x] Keep persisted mascot state aligned with canonical check-in/reward progression inputs.

- [x] Integrate reinforcement + mascot state into child UI flow (AC: 1,2)
  - [x] Add reinforcement feedback section in child-facing screen after/save state area.
  - [x] Render mascot stage in child flow with non-color-only cues and clear stage labels.
  - [x] Keep existing check-in/streak/reward behavior intact while composing new display elements.

- [x] Wire recovery encouragement to missed-day outcomes (AC: 1)
  - [x] Use streak status/reason to select encouragement messaging specifically for recovered/reset edge states.
  - [x] Avoid generic message fallback when recovery context is available.
  - [x] Confirm same-day check-in updates do not cause contradictory reinforcement messages.

- [x] Add Story 3.2 verification and run quality checks (AC: 1,2)
  - [x] Add `tests/story-3-2-reinforcement-messaging-mascot-evolution-check.sh` with structure + behavior assertions.
  - [x] Include one behavior-level execution check for deterministic mascot stage resolution.
  - [x] Run Story 3.2 checks and `npx expo lint`.

## Dev Notes

### Previous Story Intelligence

- Story 3.1 established rewards feature boundaries (`domain` + `infrastructure` + `hooks`) and deterministic local projection behavior; Story 3.2 should extend these patterns instead of creating parallel pipelines.
- Story 3.1 CR fixes enforced immediate in-session refresh and target-aware recalculation. Story 3.2 should preserve this refresh model for mascot/reinforcement surfaces.
- Epic 2 and Story 3.1 reviews repeatedly favored behavior-level tests over static checks. Start with executable behavior checks for mascot stage transitions.

### Architecture & Implementation Guardrails

- Follow feature-sliced module boundaries in architecture: keep new logic under `features/rewards` and consume existing `checkin`/`streak` state through typed hooks.
- Preserve local-first operation and deterministic state derivation with no cloud dependency assumptions.
- Reuse established naming and boundary conventions:
  - PascalCase for types/components.
  - camelCase for functions/hooks.
  - snake_case at persistence boundaries.
- Keep reinforcement/motivational text rendering accessible and not dependent on color alone.

### Project Structure Notes

- Existing patterns to extend:
  - `src/features/rewards/domain/reward-progress.ts`
  - `src/features/rewards/infrastructure/reward-progress-storage.ts`
  - `src/features/rewards/hooks/use-reward-progress.ts`
  - `src/features/checkin/hooks/use-daily-checkin.ts`
- Expected additions/updates for Story 3.2:
  - `src/features/rewards/domain/*` (reinforcement + mascot stage logic)
  - `src/features/rewards/infrastructure/*` (mascot persistence)
  - `src/features/rewards/hooks/*` (combined reinforcement/mascot orchestration)
  - `src/app/index.tsx` (child UI integration)

### Testing Requirements

- Validate success vs recovery encouragement message selection against real streak outcomes.
- Validate deterministic mascot stage resolution for repeated identical input histories.
- Validate persisted mascot stage is restored consistently across reload conditions.
- Use at least one behavior-level execution assertion in Story 3.2 checks.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2: Reinforcement Messaging and Mascot Evolution]
- [Source: _bmad-output/planning-artifacts/prd.md#What Makes This Special]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 2: Primary User Edge Case (Missed Day Recovery Without Shame)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/3-1-reward-progress-and-milestone-unlock.md]
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-04-28.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `tests/story-3-2-reinforcement-messaging-mascot-evolution-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Story 3.2 initialized from Epic 3 plan with comprehensive implementation guardrails.
- Prior-story and retrospective intelligence incorporated for reinforcement and mascot implementation safety.
- Added reward domain logic for deterministic reinforcement message selection and mascot stage resolution thresholds.
- Added mascot evolution persistence with per-profile upsert state in local SQLite.
- Added `useReinforcementMascot` hook to combine reinforcement feedback and persisted mascot state.
- Integrated reinforcement feedback and mascot evolution sections into child-facing UI without altering existing check-in/streak/reward logic.
- Added Story 3.2 validation script with behavior-level mascot and message assertions.

### File List

- _bmad-output/implementation-artifacts/3-2-reinforcement-messaging-and-mascot-evolution.md
- kid-habit-tracker/src/features/rewards/domain/reinforcement-mascot.ts
- kid-habit-tracker/src/features/rewards/infrastructure/mascot-evolution-storage.ts
- kid-habit-tracker/src/features/rewards/hooks/use-reinforcement-mascot.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-3-2-reinforcement-messaging-mascot-evolution-check.sh

## Change Log

- 2026-04-28: Implemented Story 3.2 reinforcement messaging and mascot evolution persistence, validated via story checks and lint, and moved to review.
- 2026-04-28: CR completed with no required fixes; moved to done.
