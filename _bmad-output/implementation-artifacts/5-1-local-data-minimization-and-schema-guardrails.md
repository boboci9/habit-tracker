# Story 5.1: Local Data Minimization and Schema Guardrails

Status: done

## Story

As a parent,
I want the app to store only necessary child data,
so that privacy risk remains minimal in Phase 1.

## Acceptance Criteria

1. Given local schema definitions are applied, when schema audit checks run, then only approved minimum dataset fields are present and unauthorized fields are flagged as failures.
2. Given child habit workflows are executed, when data persistence occurs, then child habit payloads stay on-device in Phase 1 and no off-device transmission events are generated.

## Tasks / Subtasks

- [x] Define approved minimum dataset contract and audit rules (AC: 1)
  - [x] Create an explicit approved-field allowlist for Phase 1 child data: profile metadata, habit events, streak state, reward config.
  - [x] Define disallowed/unauthorized field categories (extra identifiers, behavioral-tracking payloads, non-required personal attributes).
  - [x] Add shared typed validation contract for schema-audit input/output with deterministic pass/fail reporting.

- [x] Implement schema verification and unauthorized-field detection (AC: 1)
  - [x] Add a schema-audit utility/script under `kid-habit-tracker/scripts/` that validates local SQLite schema objects used by current features.
  - [x] Fail audit when unauthorized columns/tables are present for child-facing data domains.
  - [x] Ensure audit output is stable and machine-readable for release QA checks.

- [x] Add off-device transmission guardrails for Phase 1 (AC: 2)
  - [x] Add a compliance configuration contract documenting that child habit payload transmission is disabled in Phase 1.
  - [x] Add a no-tracking dependency check focused on child-facing paths to enforce zero behavioral ad-tech SDKs.
  - [x] Ensure diagnostics and error telemetry (if any) exclude child habit payload content.

- [x] Integrate checks into release/verification workflow (AC: 1,2)
  - [x] Add Story 5.1 verification script in `tests/` to execute schema and transmission/tracking checks.
  - [x] Ensure script returns non-zero exit on audit violations.
  - [x] Document expected pass criteria for release QA: off-device child habit transmissions = 0, ad-tech SDK count = 0, unauthorized schema fields = 0.

- [x] Preserve existing behavior and boundaries (AC: 1,2)
  - [x] Keep all existing Phase 1 feature flows functional while adding privacy guardrails.
  - [x] Avoid regressions in profile/check-in/streak/reward/calendar local persistence.
  - [x] Maintain parent-protected operation boundaries for settings and profile mutations.

## Dev Notes

### Story Foundation

- Implements: FR36, FR37, FR38, NFR8, NFR9, NFR11.
- Privacy baseline for Phase 1: no child habit payload transmission off-device, no behavioral ad-tech SDKs, and minimal child-data schema.
- This story establishes enforceable audit guardrails for all current local persistence domains.

### Previous Story Intelligence

- Epic 4 completed with local-first SQLite persistence patterns across calendar/events/tracker/notes.
- Parent-gated mutation consistency was reinforced in 4.4 CR follow-up; preserve this security posture while implementing privacy checks.
- Existing feature storage is spread across feature-specific infrastructure files and should be audited without introducing invasive rewrites.

### Architecture & Implementation Guardrails

- Keep feature-sliced boundaries (`domain`, `infrastructure`, `hooks`, `app`) and avoid cross-feature coupling.
- Reuse existing service result envelope patterns where applicable (`{ ok: true, data }` / `{ ok: false, error }`).
- Keep persistence naming conventions at data boundaries (snake_case).
- Use deterministic, repeatable audit outputs suitable for CI/release verification.
- Do not introduce cloud sync or remote account behaviors in this story.

### Project Structure Notes

- Current local persistence sources to include in audit scope:
  - `kid-habit-tracker/src/features/checkin/infrastructure/daily-checkin-storage.ts`
  - `kid-habit-tracker/src/features/profiles/infrastructure/profile-storage.ts`
  - `kid-habit-tracker/src/features/profiles/infrastructure/setup-storage.ts`
  - `kid-habit-tracker/src/features/profiles/infrastructure/weekly-summary-storage.ts`
  - `kid-habit-tracker/src/features/rewards/infrastructure/reward-progress-storage.ts`
  - `kid-habit-tracker/src/features/rewards/infrastructure/mascot-evolution-storage.ts`
  - `kid-habit-tracker/src/features/calendar/infrastructure/calendar-item-storage.ts`
  - `kid-habit-tracker/src/features/calendar/infrastructure/calendar-note-storage.ts`
- Expected new artifacts for Story 5.1:
  - `kid-habit-tracker/scripts/verify-schema.ts` (or equivalent audit script)
  - `kid-habit-tracker/scripts/verify-no-tracking.ts` (or equivalent dependency guard)
  - `tests/story-5-1-local-data-minimization-and-schema-guardrails-check.sh`

### Testing Requirements

- Add behavior-level verification that schema audit fails on unauthorized field injection scenarios.
- Verify approved minimum dataset passes schema audit with zero unauthorized fields.
- Verify no off-device child habit payload transmission is configured for Phase 1 flows.
- Verify no behavioral ad-tech/tracking SDK is present in child-facing dependencies.
- Run Story 5.1 verification script and `npx expo lint` before story status changes beyond ready-for-dev.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1: Local Data Minimization and Schema Guardrails]
- [Source: _bmad-output/planning-artifacts/prd.md#Privacy, Child Safety, and Data Handling]
- [Source: _bmad-output/planning-artifacts/prd.md#Security and Privacy]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/implementation-artifacts/epic-4-retro-2026-04-28.md#Action Items]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story 5.1 initialized with explicit privacy/schema guardrails aligned to FR36-FR38 and NFR8-NFR11.
- Implementation guidance includes auditable schema checks, no-tracking verification, and release-ready pass/fail criteria.
- Added a Phase 1 compliance contract with explicit off-device transmission and behavioral tracking guardrails set to false.
- Implemented `verify-schema.js` to audit approved child-data schema tables/columns and fail on unauthorized fields/tables.
- Added schema self-test mode to validate unauthorized-field detection behavior by injecting a synthetic disallowed column.
- Implemented `verify-no-tracking.js` to audit dependencies and scan child-facing code for disallowed off-device network patterns.
- Implemented `verify-runtime-no-egress.js` to execute child-flow storage functions with runtime network traps and fail on outbound egress attempts.
- Added npm verification scripts and Story 5.1 test harness to enforce schema/no-tracking checks as release guardrails.
- Executed Story 5.1 check script and Expo lint successfully.
- Fixed setup-draft undefined access path by adding null-safe guards around `initialRewardLabel` reads and ordering setup state initialization before reward hook usage.

### File List

- _bmad-output/implementation-artifacts/5-1-local-data-minimization-and-schema-guardrails.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/package.json
- kid-habit-tracker/src/config/compliance.ts
- kid-habit-tracker/scripts/verify-schema.js
- kid-habit-tracker/scripts/verify-no-tracking.js
- kid-habit-tracker/scripts/verify-runtime-no-egress.js
- kid-habit-tracker/src/app/index.tsx
- kid-habit-tracker/src/features/profiles/hooks/use-family-setup.ts
- tests/story-5-1-local-data-minimization-and-schema-guardrails-check.sh

## Change Log

- 2026-04-28: Story 5.1 initialized and set to ready-for-dev.
- 2026-04-28: Started Story 5.1 implementation and moved sprint tracking status to in-progress.
- 2026-04-28: Implemented schema minimization audit, no-tracking/off-device guardrail audit, compliance config contract, and Story 5.1 verification script.
- 2026-04-28: Fixed schema parser false-positive for `checkin_date` and added audit self-test for unauthorized-column detection; validated with story check + lint and moved story to review.
- 2026-04-28: Hardened schema parsing for broader SQL variants and switched storage file coverage to recursive discovery under `src/features`.
- 2026-04-28: Added behavior-level runtime egress guard checks for child-flow modules and integrated the guard into Story 5.1 verification scripts.
- 2026-04-28: Resolved setup draft undefined crash (`initialRewardLabel`) via null-safe guard and hook-order correction; revalidated Story 5.1 checks and finalized as done.
