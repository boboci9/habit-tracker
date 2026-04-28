# Story 6.2: Reproducible Build and Smoke-Test Gate

Status: done

## Story

As a release owner,
I want reproducible builds and smoke-test gating,
so that pilot artifacts are dependable and verifiable.

## Acceptance Criteria

1. Given a tagged source commit, when builds are rerun in CI, then resulting artifacts match expected app version metadata and release-blocking build variance is absent.
2. Given pilot artifacts are produced, when smoke tests execute, then critical startup/check-in/profile-picker paths pass and failed smoke tests block distribution.

## Tasks / Subtasks

- [x] Define reproducibility contract and variance rules (AC: 1)
  - [x] Define required reproducibility inputs for tagged-build reruns (tag, channel, profile, platform).
  - [x] Define deterministic metadata fields used for parity checks (app version, commit, build profile, channel).
  - [x] Define explicit release-blocking variance conditions and failure messages.

- [x] Implement reproducible build verification flow for pilot artifacts (AC: 1)
  - [x] Add CI-oriented script(s) to compare metadata across reruns of the same tagged commit.
  - [x] Validate Android APK and iOS pilot outputs against expected app version metadata.
  - [x] Ensure non-zero exits on variance detection and emit actionable diagnostics.

- [x] Add smoke-test gate for pilot distribution readiness (AC: 2)
  - [x] Add automated smoke checks for startup, profile picker default entry, and critical check-in path.
  - [x] Integrate smoke-test gate so failures block distribution-ready status.
  - [x] Ensure smoke outputs are deterministic and reviewable for release sign-off.

- [x] Wire release gate orchestration for reproducibility plus smoke checks (AC: 1,2)
  - [x] Add canonical package scripts for CI/local execution of reproducibility and smoke gates.
  - [x] Chain existing privacy verification as required precondition before release readiness.
  - [x] Keep release gate logic isolated from child-domain feature behavior.

- [x] Add story-level verification harness and documentation updates (AC: 1,2)
  - [x] Add Story 6.2 check script under tests with fail-closed assertions.
  - [x] Update release-checklist docs with gate sequence and blocker semantics.
  - [x] Ensure all new checks fail closed when prerequisites are missing.

## Dev Notes

### Story Foundation

- Implements: NFR18.
- Scope focus: add deterministic reproducibility checks for tagged builds and a smoke-test blocker gate for pilot artifact distribution.
- Story should convert 6.1 channel/build scaffolding into repeatable release confidence gates for CI and operator execution.

### Previous Story Intelligence

- Story 6.1 established pilot build scripts, release-channel contracts, and traceability outputs for channel/platform/profile/version/commit.
- Story 6.1 CR remediation reinforced fail-closed script behavior, semantic profile verification, and non-overwriting traceability history.
- 6.2 should reuse these guardrails directly and avoid introducing permissive or skip-on-missing behavior in release gates.

### Architecture & Implementation Guardrails

- Preserve strict environment segmentation (dev, pilot) and keep Phase 2-only feature toggles disabled.
- Reproducibility checks must operate on tagged commits and compare deterministic metadata fields.
- Smoke-test gate failures must block distribution readiness without ambiguity.
- Maintain privacy guardrail chain (verify:privacy) as a required dependency in pilot release gate orchestration.
- Keep changes scoped to release/test pipeline scripts and checks; avoid domain behavior regressions.

### Project Structure Notes

- Likely touchpoints:
  - kid-habit-tracker/package.json
  - kid-habit-tracker/scripts/
  - tests/
  - _bmad-output/implementation-artifacts/
- Existing 6.1 foundation to consume:
  - kid-habit-tracker/scripts/build-pilot-android.sh
  - kid-habit-tracker/scripts/build-pilot-ios.sh
  - kid-habit-tracker/scripts/write-build-traceability.js
  - kid-habit-tracker/scripts/verify-pilot-channel-setup.js
  - tests/story-6-1-development-and-pilot-channel-build-setup-check.sh

### Testing Requirements

- Verify rerunning a tagged commit produces metadata parity for Android and iOS pilot artifacts (version + commit + profile/channel contract).
- Verify smoke checks cover startup, profile picker entry, and core check-in path.
- Verify smoke failures and reproducibility variance failures block distribution with non-zero exit status.
- Verify privacy chain remains required before release-ready gate pass.
- Run Story 6.2 verification script(s), npm run verify:privacy, and npx expo lint before moving beyond review.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2: Reproducible Build and Smoke-Test Gate]
- [Source: _bmad-output/planning-artifacts/prd.md#Distribution and Operability (Phase 1 Pilot)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/implementation-artifacts/6-1-development-and-pilot-channel-build-setup.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- 2026-04-28: Story 6.2 created from Epic 6 context with NFR18 focus and explicit carry-over of 6.1 fail-closed/semantic verification guardrails.
- 2026-04-28: Began 6.2 implementation with reproducibility verifier, smoke-gate verifier, release-gate script wiring, and Story 6.2 check harness; validated with story checks plus privacy/lint gates.
- 2026-04-28: Added Phase 1 pilot release checklist documentation with explicit gate order and fail-closed blocker semantics; revalidated story checks and release gates; moved story to review.
- 2026-04-28: Follow-up CR pass found no additional issues; Story 6.2 gates remain green and story moved to done.

### File List

- _bmad-output/implementation-artifacts/6-2-reproducible-build-and-smoke-test-gate.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/package.json
- kid-habit-tracker/scripts/build-pilot-android.sh
- kid-habit-tracker/scripts/build-pilot-ios.sh
- kid-habit-tracker/scripts/verify-build-reproducibility.js
- kid-habit-tracker/scripts/verify-pilot-smoke-gate.js
- tests/story-6-2-reproducible-build-and-smoke-test-gate-check.sh
- docs/pilot-release-checklist.md

## Change Log

- 2026-04-28: Story 6.2 initialized and set to ready-for-dev.
- 2026-04-28: Story moved to in-progress and implementation started for reproducibility verification, smoke-gate checks, release-gate orchestration, and Story 6.2 check harness.
- 2026-04-28: Completed release-checklist documentation subtask and advanced story to review after green validation gates.
- 2026-04-28: Completed follow-up CR pass with no findings and advanced story to done.
