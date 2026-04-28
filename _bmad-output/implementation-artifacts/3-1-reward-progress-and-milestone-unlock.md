# Story 3.1: Reward Progress and Milestone Unlock

Status: done

## Story

As a child,
I want to see reward progress and milestone unlock events,
so that daily consistency feels meaningful.

## Acceptance Criteria

1. Given a reward milestone is configured, when the child completes qualifying check-ins, then progress toward the milestone updates visibly and current reward goal remains visible in the child experience.
2. Given milestone criteria are reached, when unlock logic is evaluated, then milestone unlock state is triggered exactly once per milestone and unlock state is persisted locally.

## Tasks / Subtasks

- [x] Define reward progress/unlock domain contract and persistence boundary (AC: 1,2)
  - [x] Introduce reward domain model under `src/features/rewards/domain` with typed state for progress and unlock metadata.
  - [x] Define milestone idempotency rule (single unlock event per milestone) for deterministic replay.
  - [x] Document and enforce qualifying-checkin criteria based on canonical local check-in records.

- [x] Implement local reward progress projection and unlock persistence (AC: 1,2)
  - [x] Add reward storage/infrastructure under `src/features/rewards/infrastructure` backed by local persistence patterns used in existing features.
  - [x] Persist unlock state with replay-safe fields (milestone key, unlocked-at date/event reference).
  - [x] Ensure state derivation remains deterministic for identical check-in history.

- [x] Integrate reward state into child flow UI (AC: 1)
  - [x] Expose reward progress + current reward goal through a dedicated rewards hook for child screen consumption.
  - [x] Render visible progress and goal label in child-facing view with non-color-only cues.
  - [x] Keep existing check-in and streak behavior unchanged while composing reward state.

- [x] Implement exactly-once milestone unlock behavior (AC: 2)
  - [x] Trigger unlock when configured threshold is crossed and prevent duplicate unlock on re-save/reload/replay.
  - [x] Surface unlock state in UI as stable persisted state, not transient-only in-memory state.
  - [x] Ensure same-day check-in updates do not double-trigger unlock.

- [x] Add Story 3.1 verification and quality checks (AC: 1,2)
  - [x] Add `tests/story-3-1-reward-progress-milestone-unlock-check.sh` with behavior-oriented assertions.
  - [x] Include one behavior-level execution check for idempotent unlock semantics.
  - [x] Run Story 3.1 checks and `npx expo lint`.

### Review Findings

- [x] [Review][Patch] Refresh reward progress immediately after each in-session check-in save/update by wiring reward hook refresh to `todayRecord.updatedAt`.
- [x] [Review][Patch] Recalculate/migrate persisted unlock history when reward target days changes using target-aware unlock rows and cross-target cleanup.

## Dev Notes

### Previous Story Intelligence

- Epic 2 established canonical `daily_checkins` ownership under check-in storage; Story 3.1 must consume that source of truth and avoid parallel write paths.
- Review findings in Epic 2 repeatedly favored boundary-first fixes and behavior-driven checks; apply this upfront for reward logic.
- Story 2.4 introduced explicit requirement-language precision (per-child and disable semantics); maintain the same precision in reward unlocking criteria.
- Epic 2 retrospective flagged Story 3.1 prep needs: reward progression contract, typed child-facing reward query boundary, and idempotency-focused behavior tests.

### Architecture & Implementation Guardrails

- Follow feature-sliced boundaries from architecture: place new code under `features/rewards` and keep route-level orchestration thin.
- Keep local-first deterministic behavior (no cloud assumptions) and use migration-safe local persistence conventions.
- Reuse existing conventions from implemented features:
  - PascalCase for types/components.
  - camelCase for functions/hooks.
  - snake_case at storage boundaries.
- Maintain explainable state transitions; unlock events must be inspectable and reproducible from persisted data.

### Project Structure Notes

- Existing implemented patterns to mirror:
  - `src/features/checkin/infrastructure/*`
  - `src/features/checkin/hooks/*`
  - `src/features/streak/domain/*`
  - `src/features/profiles/infrastructure/*`
- New story structure should add:
  - `src/features/rewards/domain/*`
  - `src/features/rewards/infrastructure/*`
  - `src/features/rewards/hooks/*`
  - UI integration in `src/app/index.tsx` (or extracted reward UI component under rewards/ui if needed).

### Testing Requirements

- Preserve behavior-first strategy from Epic 2:
  - Verify deterministic progress computation from canonical check-in history.
  - Verify unlock idempotency across replay/reload/same-day update paths.
  - Verify persisted unlock state survives app restart semantics.
- Keep Story check script aligned with prior format and include at least one executable behavior assertion, not only static grep checks.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1: Reward Progress and Milestone Unlock]
- [Source: _bmad-output/planning-artifacts/prd.md#What Makes This Special]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 1: Primary User Success Path (Child Daily Win Loop)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/2-4-reminder-scheduling-and-failure-tolerance.md]
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-04-28.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `tests/story-3-1-reward-progress-milestone-unlock-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story initialized for Epic 3 kickoff with deterministic reward-unlock guardrails and explicit idempotency requirements.
- Added reward domain contract for milestone candidate derivation and deterministic progress projection state.
- Added reward unlock persistence with exactly-once milestone insertion keyed by `(profile_id, milestone_number)`.
- Added `useRewardProgress` hook that syncs persisted unlock milestones from canonical completed check-in history.
- Integrated child-facing reward progress card in `src/app/index.tsx` showing current goal, progress, and latest unlock context.
- Added Story 3.1 behavior-oriented validation script with executable idempotency assertions.
- Updated reward hook orchestration so progress refreshes immediately in-session after check-in writes.
- Updated unlock persistence schema/logic to be target-aware and recalculate unlock history when target days changes.

### File List

- _bmad-output/implementation-artifacts/3-1-reward-progress-and-milestone-unlock.md
- kid-habit-tracker/src/features/rewards/domain/reward-progress.ts
- kid-habit-tracker/src/features/rewards/infrastructure/reward-progress-storage.ts
- kid-habit-tracker/src/features/rewards/hooks/use-reward-progress.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-3-1-reward-progress-milestone-unlock-check.sh

## Change Log

- 2026-04-28: Implemented Story 3.1 reward progress and exactly-once milestone unlock persistence, validated via story checks and lint, and moved to review.
- 2026-04-28: Resolved Story 3.1 CR findings (immediate in-session refresh and target-change recalculation), revalidated, and moved to done.
