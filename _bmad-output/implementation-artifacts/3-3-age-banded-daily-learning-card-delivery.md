# Story 3.3: Age-Banded Daily Learning Card Delivery

Status: done

## Story

As a child,
I want daily learning cards matched to my age band,
so that content feels understandable and relevant.

## Acceptance Criteria

1. Given a child profile has age-band mapping, when today's learning card is requested, then one card tagged for that age band is presented and cards are sourced from pre-bundled local content.
2. Given content governance rules exist, when card metadata is loaded, then only approved card entries are eligible for display and unresolved/invalid content entries are excluded.

## Tasks / Subtasks

- [x] Define learning card domain model and age-band mapping contract (AC: 1)
  - [x] Add typed age-band mapping resolver from profile age to allowed card bands.
  - [x] Add deterministic card selection contract for one-card-per-day behavior.
  - [x] Ensure selection is deterministic for identical inputs on same date.

- [x] Implement pre-bundled local learning-card content pipeline (AC: 1,2)
  - [x] Add local card content source under `src/features/rewards` (or dedicated learning feature path if introduced) using pre-bundled app assets/data.
  - [x] Load and parse local content metadata at runtime without network dependency.
  - [x] Enforce one-card-per-day selection from pre-bundled content only.

- [x] Implement governance filtering and invalid-entry exclusion (AC: 2)
  - [x] Add metadata validation for required fields (id, age band tag, content body, approval/governance marker).
  - [x] Exclude unresolved/invalid items before selection.
  - [x] Ensure governance filtering occurs before age-band and daily-card selection logic.

- [x] Integrate daily learning card display in child flow (AC: 1)
  - [x] Expose selected card via dedicated hook/service.
  - [x] Render the selected card in child-facing UI with clear readability and fallback state.
  - [x] Keep existing check-in/reward/reinforcement/mascot behavior unchanged.

- [x] Add Story 3.3 verification and run quality checks (AC: 1,2)
  - [x] Add `tests/story-3-3-age-banded-learning-card-delivery-check.sh` with structure + behavior assertions.
  - [x] Include one behavior-level execution check for age-band selection and governance exclusion.
  - [x] Run Story 3.3 checks and `npx expo lint`.

## Dev Notes

### Previous Story Intelligence

- Story 3.1 and 3.2 extended `features/rewards` with deterministic domain + local persistence + hook integration patterns; Story 3.3 should reuse this architecture and avoid parallel ad-hoc data paths.
- Epic 3 flow now includes reward progress, reinforcement feedback, and mascot evolution in the child view. Story 3.3 should compose cleanly without regressing existing sections.
- Prior reviews favored behavior-level checks that execute real domain logic; apply that from the start for age-band and governance filtering.

### Architecture & Implementation Guardrails

- Keep local-first/no-cloud behavior: pre-bundled local content is the source of truth for learning cards.
- Preserve feature boundaries: domain rules in domain module, parsing/filtering in infrastructure, UI orchestration in hooks, rendering in `src/app/index.tsx` (or extracted child components).
- Use deterministic state transitions and replay-safe selection for the same date/profile inputs.
- Maintain accessibility and readability in child-facing card presentation.

### Project Structure Notes

- Existing patterns to mirror:
  - `src/features/rewards/domain/reward-progress.ts`
  - `src/features/rewards/domain/reinforcement-mascot.ts`
  - `src/features/rewards/hooks/*`
  - `src/features/rewards/infrastructure/*`
- Expected additions/updates for Story 3.3:
  - `src/features/rewards/domain/*` (learning card domain rules)
  - `src/features/rewards/infrastructure/*` (local card source + governance validation)
  - `src/features/rewards/hooks/*` (daily card orchestration)
  - `src/app/index.tsx` (child UI card display)

### Testing Requirements

- Verify correct age-band mapping by profile age.
- Verify one-card-per-day behavior and deterministic selection on same input date.
- Verify invalid/unapproved card entries are excluded before selection.
- Include one behavior-level executable assertion in Story 3.3 checks.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3: Age-Banded Daily Learning Card Delivery]
- [Source: _bmad-output/planning-artifacts/prd.md#Product Scope]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 1: Primary User Success Path (Child Daily Win Loop)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/3-1-reward-progress-and-milestone-unlock.md]
- [Source: _bmad-output/implementation-artifacts/3-2-reinforcement-messaging-and-mascot-evolution.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `tests/story-3-3-age-banded-learning-card-delivery-check.sh` (PASS)
- `npx expo lint` (PASS)

### Completion Notes List

- Story 3.3 initialized with deterministic age-band selection and governance-filtering guardrails.
- Prior Epic 3 implementation patterns and review learnings incorporated for safe continuation.
- Added learning-card domain rules for age-band mapping, governance filtering, and deterministic one-card-per-day selection.
- Added bundled local learning-card content source with both eligible and intentionally ineligible governance examples.
- Added `useDailyLearningCard` hook for local deterministic daily card delivery.
- Integrated daily learning card display into child flow with age-band cue and fallback handling.
- Added Story 3.3 validation script with behavior-level age-band and governance exclusion assertions.

### File List

- _bmad-output/implementation-artifacts/3-3-age-banded-daily-learning-card-delivery.md
- kid-habit-tracker/src/features/rewards/domain/learning-card.ts
- kid-habit-tracker/src/features/rewards/infrastructure/learning-card-content.ts
- kid-habit-tracker/src/features/rewards/hooks/use-daily-learning-card.ts
- kid-habit-tracker/src/app/index.tsx
- tests/story-3-3-age-banded-learning-card-delivery-check.sh

## Change Log

- 2026-04-28: Story 3.3 implementation started; status moved to in-progress.
- 2026-04-28: Implemented Story 3.3 age-banded daily learning card delivery, validated via story checks and lint, and moved to review.
- 2026-04-28: CR completed with no required fixes; moved to done.
