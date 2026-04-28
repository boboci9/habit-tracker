# Story 6.1: Development and Pilot Channel Build Setup

Status: done

## Story

As a developer,
I want environment and build-channel setup for dev and pilot,
so that Android and iOS pilot delivery can run consistently.

## Acceptance Criteria

1. Given project configuration is initialized, when dev and pilot environments are built, then Expo Go development and pilot build paths are both functional and feature flags prevent Phase 2-only capabilities in Phase 1.
2. Given Android and iOS pilot outputs are produced, when build artifacts are generated, then one installable APK and one TestFlight-ready iOS build are produced and artifacts are traceable to source commit/version.

## Tasks / Subtasks

- [x] Define environment segmentation and release-channel contracts (AC: 1)
  - [x] Establish explicit `dev` and `pilot` environment configuration boundaries.
  - [x] Define release-channel metadata contract (channel, commit, app version, build profile).
  - [x] Document how Phase 2-only features remain disabled via feature-flag controls in Phase 1 channels.

- [x] Implement pilot build-channel scaffolding for Android and iOS (AC: 1,2)
  - [x] Add/update build channel configuration for Expo Go dev path and pilot release paths.
  - [x] Add deterministic build scripts for pilot Android APK and pilot iOS/TestFlight artifacts.
  - [x] Ensure build scripts are runnable from canonical project root commands.

- [x] Add artifact traceability capture for pilot outputs (AC: 2)
  - [x] Persist/emit source commit identifier and app version in generated artifact metadata output.
  - [x] Add release-checklist references for artifact naming and provenance consistency.
  - [x] Ensure outputs are deterministic and reviewable for handoff.

- [x] Add verification checks for channel readiness and feature-flag safety (AC: 1,2)
  - [x] Add story verification script(s) for required environment/build config presence.
  - [x] Add checks that Phase 2-only feature flags remain disabled in pilot channel configuration.
  - [x] Ensure script exits non-zero on missing channel config or traceability fields.

- [x] Preserve existing privacy/safety quality gates during release setup (AC: 1,2)
  - [x] Keep Epic 5 privacy verification chain as required release precondition.
  - [x] Avoid regressions to app startup/profile-picker/check-in baseline flows.
  - [x] Keep release setup changes isolated from domain behavior logic.

## Dev Notes

### Story Foundation

- Implements: FR41, FR42, NFR16, NFR17.
- Scope focus: stand up reliable dev/pilot release channels and artifact traceability without enabling Phase 2 store-publication scope.
- Story should establish release engineering foundations for Epic 6.2 reproducibility and smoke-test gates.

### Previous Story Intelligence

- Epic 5 closed clean with strong guardrail discipline (fail-closed controls + semantic verification).
- Epic 5 retrospective recommends preserving deterministic verification and explicit release gate chaining for Epic 6.
- 6.1 should consume those guardrails directly in release setup scripts and checks.

### Architecture & Implementation Guardrails

- Preserve strict environment segmentation (`dev`, `pilot`) and keep Phase 2-only feature toggles disabled.
- Use deterministic script outputs for artifact metadata and release traceability.
- Keep release setup scoped to configuration/build pipeline paths; avoid feature-domain side effects.
- Maintain existing privacy verification chain (`verify:privacy`) as a required dependency for pilot release readiness.

### Project Structure Notes

- Likely touchpoints:
  - `kid-habit-tracker/package.json`
  - `kid-habit-tracker/app.json`
  - `kid-habit-tracker/eas.json`
  - `kid-habit-tracker/scripts/`
  - `tests/`
- Architecture references mention environment files and pilot scripts (`.env.pilot`, pilot release checklist, build-pilot scripts) which should be aligned if implemented.
- Expected new/updated artifacts for Story 6.1:
  - pilot channel build scripts/config
  - story-level verification script in `tests/`
  - traceability metadata capture/check output

### Testing Requirements

- Verify Expo Go dev path remains functional after channel setup updates.
- Verify pilot Android APK and iOS/TestFlight build command paths are present and script-validated.
- Verify Phase 2-only flags remain disabled in pilot context.
- Verify traceability metadata includes commit + version + channel/build profile fields.
- Run Story 6.1 verification script(s), `npm run verify:privacy`, and `npx expo lint` before moving beyond review.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.1: Development and Pilot Channel Build Setup]
- [Source: _bmad-output/planning-artifacts/prd.md#Pilot Distribution and Lifecycle]
- [Source: _bmad-output/planning-artifacts/prd.md#Distribution and Operability (Phase 1 Pilot)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Technology Stack (Build/runtime base + pilot release tracks)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Build Process Structure]
- [Source: _bmad-output/implementation-artifacts/epic-5-retro-2026-04-28.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- 2026-04-28: Story 6.1 created from Epic 6 context with FR41/FR42/NFR16/NFR17 alignment and release-channel guardrail carry-over from Epic 5.
- 2026-04-28: Added pilot channel configuration (`eas.json`, env files) with explicit Phase 2 feature disablement in dev/pilot paths.
- 2026-04-28: Added pilot build scripts for Android APK and iOS/TestFlight paths with privacy verification preconditions.
- 2026-04-28: Added traceability metadata emitter for channel/platform/build profile, app version, and source commit.
- 2026-04-28: Added pilot-channel verification script and story-level check harness; validated with story check, privacy suite, and Expo lint.
- 2026-04-28: CR fixes applied: pilot build scripts now fail when EAS is unavailable, verifier enforces pilot profile artifact semantics, and traceability output now emits versioned metadata files plus latest pointer.

### File List

- _bmad-output/implementation-artifacts/6-1-development-and-pilot-channel-build-setup.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/eas.json
- kid-habit-tracker/.env.dev
- kid-habit-tracker/.env.pilot
- kid-habit-tracker/src/config/release-channels.ts
- kid-habit-tracker/scripts/build-pilot-android.sh
- kid-habit-tracker/scripts/build-pilot-ios.sh
- kid-habit-tracker/scripts/write-build-traceability.js
- kid-habit-tracker/scripts/verify-pilot-channel-setup.js
- kid-habit-tracker/package.json
- tests/story-6-1-development-and-pilot-channel-build-setup-check.sh

## Change Log

- 2026-04-28: Story 6.1 initialized and set to ready-for-dev.
- 2026-04-28: Implemented pilot channel build setup, traceability output, and verification guardrails; story moved to review.
- 2026-04-28: Applied code-review fixes for artifact-production failure behavior, stronger EAS profile validation, and non-overwriting traceability metadata; revalidated checks.
- 2026-04-28: Follow-up CR pass found no additional issues; story verification, privacy verification, and lint remain green; story moved to done.
