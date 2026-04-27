# Story 1.2: First-Launch Family Setup Flow

Status: done

## Story

As a parent,
I want to complete a guided first-launch family setup,
so that my household is ready for daily habit tracking.

## Acceptance Criteria

1. Given the app is launched for the first time, when the parent completes family name and required setup fields, then a Family Profile is created locally and setup cannot finish until required fields are valid.
2. Given setup is in progress, when the app is restarted, then setup resumes safely without corrupting saved data and no child habit data is transmitted off-device.

## Tasks / Subtasks

- [x] Implement local setup persistence model (AC: 1,2)
  - [x] Add local storage schema/service for setup draft and completion state.
  - [x] Add read/write/update functions with safe defaults and migration-safe initialization.
- [x] Implement first-launch guided setup UI (AC: 1)
  - [x] Add setup form with required fields: family name, child count (>=2), initial reward label.
  - [x] Block completion until form validation passes.
  - [x] Persist draft state as parent edits form.
- [x] Implement restart-safe resume flow (AC: 2)
  - [x] On app load, detect setup completion status.
  - [x] If incomplete, preload and resume saved draft values.
  - [x] On completion, mark setup complete locally.
- [x] Add story validation checks (AC: 1,2)
  - [x] Add a story-specific verification script for setup gating and persistence scaffolding.
  - [x] Run lint and verification checks.

### Review Findings

- [x] [Review][Patch] Add async failure handling for setup persistence operations [kid-habit-tracker/src/app/index.tsx:95]
- [x] [Review][Patch] Prevent duplicate completion submissions with explicit submitting state [kid-habit-tracker/src/app/index.tsx:213]
- [x] [Review][Patch] Move setup orchestration logic out of route file into feature-level hook/service boundary [kid-habit-tracker/src/app/index.tsx:27]

## Dev Notes

### Scope

- Keep this story focused on first-launch setup and local persistence only.
- Do not implement full child profile management UX here (deferred to later stories).

### Technical Requirements

- Local-only persistence in Phase 1.
- No remote API calls and no off-device data transfer.
- Must survive app restart with setup draft retained.

### Architecture Compliance

- Keep feature logic in src/features/profiles and route/UI integration in src/app.
- Preserve naming conventions and typed function interfaces.

### References

- Source: _bmad-output/planning-artifacts/epics.md (Story 1.2)
- Source: _bmad-output/planning-artifacts/architecture.md (local-first and project structure constraints)

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `./tests/story-1-2-setup-check.sh` (PASS)
- `npx expo lint` (PASS after stale scaffold cleanup)

### Completion Notes List

- Implemented local SQLite-backed setup persistence service in `src/features/profiles/infrastructure/setup-storage.ts`.
- Implemented first-launch Family Setup UI with required fields, validation, draft autosave, and completion gate in `src/app/index.tsx`.
- Added restart-safe resume behavior by hydrating setup state and draft from local storage on load.
- Wired app entry to setup flow through `App.tsx`.
- Added and executed story validation script for setup gating and completion flow.
- Lint succeeded after removing stale unused router scaffold files that were left after environment reset.
- Resolved all C1 code-review patch findings: async error handling, duplicate submit protection, and feature-hook extraction.

### File List

- _bmad-output/implementation-artifacts/1-2-first-launch-family-setup-flow.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- tests/story-1-2-setup-check.sh
- kid-habit-tracker/App.tsx
- kid-habit-tracker/src/app/index.tsx
- kid-habit-tracker/src/features/profiles/infrastructure/setup-storage.ts
- kid-habit-tracker/src/features/profiles/hooks/use-family-setup.ts
- kid-habit-tracker/package.json
- kid-habit-tracker/package-lock.json
- kid-habit-tracker/eslint.config.js
- kid-habit-tracker/src/app/_layout.tsx (deleted)
- kid-habit-tracker/src/app/explore.tsx (deleted)
- kid-habit-tracker/src/components/ (deleted stale scaffold)
- kid-habit-tracker/src/constants/ (deleted stale scaffold)
- kid-habit-tracker/src/hooks/ (deleted stale scaffold)

## Change Log

- 2026-04-27: Implemented Story 1.2 local-first family setup flow with restart-safe persistence and validation, then moved story to review.
