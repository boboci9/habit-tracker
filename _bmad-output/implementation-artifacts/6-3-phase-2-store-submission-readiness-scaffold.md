# Story 6.3: Phase-2 Store Submission Readiness Scaffold

Status: done

## Story

As a release owner,
I want store-submission readiness checks separated from Phase 1 gates,
so that pilot execution remains focused while preserving the Phase 2 transition path.

## Acceptance Criteria

1. Given Phase 1 quality gates are configured, when release checks run, then public store submission checks are excluded from Phase 1 pass criteria and this exclusion is documented in release checklist.
2. Given Phase 2 planning begins, when readiness checklist is reviewed, then explicit store-hardening and compliance packaging tasks are present and transition criteria from pilot to store-ready scope are defined.

## Tasks / Subtasks

- [x] Separate Phase 1 release gates from store-submission scope (AC: 1)
  - [x] Preserve current Phase 1 gate chain for privacy, pilot-channel, smoke, and reproducibility checks.
  - [x] Ensure no App Store / Google Play submission validators are required for Phase 1 pass.
  - [x] Add fail-closed checks that reject accidental inclusion of Phase 2-only store gates in Phase 1 run paths.

- [x] Add explicit Phase 2 store-readiness scaffold checks (AC: 2)
  - [x] Introduce a dedicated Phase 2 readiness checklist artifact for store-hardening and compliance packaging.
  - [x] Define required checklist sections: compliance packaging, metadata assets, submission policy checks, and rollout criteria.
  - [x] Define transition criteria from pilot-ready to store-ready state with explicit acceptance signals.

- [x] Wire scripts/documentation for clear phase-boundary behavior (AC: 1,2)
  - [x] Add script-level validation for Phase 1 exclusion policy and Phase 2 checklist presence.
  - [x] Update release checklist docs to reference both Phase 1 gate sequence and Phase 2 readiness scaffold.
  - [x] Keep script outputs deterministic and actionable for release owners.

- [x] Add story verification harness and blocker semantics (AC: 1,2)
  - [x] Add Story 6.3 check script in tests to validate scope separation and checklist structure.
  - [x] Ensure missing Phase 2 checklist sections fail the Story 6.3 verifier.
  - [x] Ensure Phase 1 path remains unblocked by store-submission checks.

- [x] Validate against existing quality gates without regressions (AC: 1,2)
  - [x] Re-run release gate (`verify:release-gate`) to ensure unchanged Phase 1 behavior.
  - [x] Re-run privacy verification and lint before review transition.
  - [x] Keep changes isolated to release pipeline/readiness docs and verification scripts.

## Dev Notes

### Story Foundation

- Implements: FR43, FR44, NFR19, NFR21.
- Scope focus: formalize Phase 2 store-submission readiness scaffolding while preserving lean, pilot-focused Phase 1 gate behavior.
- This story should prepare a clear migration path from pilot release confidence to store-submission readiness without changing child-domain feature behavior.

### Previous Story Intelligence

- Story 6.1 established pilot channel/build contracts and fail-closed guardrails.
- Story 6.2 added reproducibility and smoke-test release gates, plus release checklist blocker semantics.
- 6.3 should preserve all existing gate behavior while introducing clearly separated Phase 2 readiness artifacts/checks.

### Architecture & Implementation Guardrails

- Keep strict phase boundaries: Phase 1 gates are pilot-only and must not require store submission checks.
- Keep deterministic gate behavior and fail-closed semantics for missing/invalid readiness artifacts.
- Preserve environment segmentation (`dev`, `pilot`) and avoid introducing Phase 2 feature enablement in runtime behavior.
- Keep release readiness additions scoped to scripts/docs/tests; avoid product flow regressions.

### Project Structure Notes

- Likely touchpoints:
  - kid-habit-tracker/package.json
  - kid-habit-tracker/scripts/
  - tests/
  - docs/pilot-release-checklist.md
  - docs/
- Existing foundations to consume:
  - kid-habit-tracker/scripts/verify-pilot-channel-setup.js
  - kid-habit-tracker/scripts/verify-pilot-smoke-gate.js
  - kid-habit-tracker/scripts/verify-build-reproducibility.js
  - tests/story-6-2-reproducible-build-and-smoke-test-gate-check.sh
  - docs/pilot-release-checklist.md

### Testing Requirements

- Verify Phase 1 release gate execution does not require store-submission checks.
- Verify Phase 2 readiness checklist includes explicit store-hardening and compliance packaging sections.
- Verify Story 6.3 checker fails on missing Phase 2 readiness sections.
- Verify existing `verify:release-gate`, `verify:privacy`, and lint remain green.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.3: Phase-2 Store Submission Readiness Scaffold]
- [Source: _bmad-output/planning-artifacts/prd.md#Pilot Distribution and Lifecycle]
- [Source: _bmad-output/planning-artifacts/prd.md#Distribution and Operability (Phase 1 Pilot)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/implementation-artifacts/6-2-reproducible-build-and-smoke-test-gate.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- 2026-04-28: Story 6.3 initialized from Epic 6 context with explicit phase-boundary and store-readiness scaffold requirements.
- 2026-04-28: Began implementation with Phase 2 readiness checklist, phase-boundary verifier, package script wiring, and Story 6.3 check harness; validation gates remain green.
- 2026-04-28: Implementation slice validated clean and story advanced to review for follow-up CR.
- 2026-04-28: Follow-up CR pass found no additional issues; story verification, release gate, privacy suite, and lint remain green; story moved to done.

### File List

- _bmad-output/implementation-artifacts/6-3-phase-2-store-submission-readiness-scaffold.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/package.json
- kid-habit-tracker/scripts/verify-phase2-store-readiness-scaffold.js
- tests/story-6-3-phase-2-store-submission-readiness-scaffold-check.sh
- docs/pilot-release-checklist.md
- docs/phase2-store-readiness-checklist.md

## Change Log

- 2026-04-28: Story 6.3 initialized and set to ready-for-dev.
- 2026-04-28: Story moved to in-progress and implementation started for phase-boundary verifier, Phase 2 readiness checklist scaffold, and Story 6.3 validation harness.
- 2026-04-28: Story advanced to review after green Story 6.3 checks and baseline verification gates.
- 2026-04-28: Completed follow-up CR pass with no findings and advanced story to done.
