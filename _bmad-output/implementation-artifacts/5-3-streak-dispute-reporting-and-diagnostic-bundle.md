# Story 5.3: Streak Dispute Reporting and Diagnostic Bundle

Status: done

## Story

As a parent,
I want to report suspected streak issues with diagnostics,
so that disputes can be investigated and resolved confidently.

## Acceptance Criteria

1. Given a streak mismatch is observed, when parent initiates report flow, then a local diagnostic bundle is generated with correlation metadata and bundle excludes sensitive data not required for troubleshooting.
2. Given diagnostics are reviewed, when rule history is inspected, then event chronology and streak reasoning are available and supportability requirements for dispute investigation are met.

## Tasks / Subtasks

- [x] Define dispute-report diagnostic contract and local bundle schema (AC: 1,2)
  - [x] Specify required correlation metadata fields (profile id alias/token, report id, generated-at timestamp, app/story build context).
  - [x] Specify allowed troubleshooting payload fields from streak/check-in history and explicitly disallow sensitive/non-required values.
  - [x] Add a deterministic serialization contract for local diagnostic bundles (stable key names/order where feasible).

- [x] Implement parent-initiated streak dispute report flow (AC: 1)
  - [x] Add parent-only trigger path for creating a streak dispute report from streak transparency/history context.
  - [x] Generate and persist a local-only diagnostic bundle record with correlation metadata.
  - [x] Block bundle generation in child mode with user-safe authorization messaging.

- [x] Implement chronology and reasoning projection for diagnostics review (AC: 2)
  - [x] Reuse streak engine timeline outputs to provide event chronology for reported range.
  - [x] Include streak rule reasoning text and transition context in bundle output.
  - [x] Ensure diagnostics view/export path presents chronology and reasoning without raw sensitive fields.

- [x] Add verification guardrails for diagnostics safety and supportability (AC: 1,2)
  - [x] Add story verification script(s) for local-only diagnostics generation and required metadata presence.
  - [x] Add assertions that sensitive/non-required fields are excluded from generated bundles.
  - [x] Add assertions that chronology and reasoning data are present and deterministic for fixed input history.

- [x] Preserve Epic 5 privacy boundaries and existing behavior (AC: 1,2)
  - [x] Keep all dispute diagnostics local-only in Phase 1 with no off-device transmission.
  - [x] Avoid regressions in check-in/streak/profile/reward/calendar flows.
  - [x] Maintain parent-protected mutation/access consistency established in Stories 5.1 and 5.2.

## Dev Notes

### Story Foundation

- Implements: FR34, FR35.
- Scope focus: parent-initiated dispute reporting backed by local, correlation-aware diagnostic bundles.
- Story must preserve Epic 5 privacy posture: troubleshooting support without exposing unnecessary sensitive data.

### Previous Story Intelligence

- Story 5.1 established schema minimization and no-egress/no-tracking guardrails.
- Story 5.2 hardened sensitive controls and parent/child authorization boundaries with fail-closed behavior.
- Story 5.3 should build directly on those controls: parent-only report initiation and sanitized local diagnostics.

### Architecture & Implementation Guardrails

- Keep feature-sliced boundaries (`domain`, `infrastructure`, `hooks`, `app`) and avoid cross-feature leakage.
- Reuse deterministic streak computation outputs (`computeStreakState`, `computeStreakTimeline`) for chronology/reasoning projection.
- Treat diagnostic bundle generation as local persistence operation; no remote transport adapters in this story.
- Map lower-level failures to user-safe/domain-safe errors and keep authorization checks at feature entry points.

### Project Structure Notes

- Likely implementation touchpoints:
  - `kid-habit-tracker/src/features/streak/domain/streak-engine.ts`
  - `kid-habit-tracker/src/features/checkin/hooks/use-daily-checkin.ts`
  - `kid-habit-tracker/src/features/checkin/infrastructure/daily-checkin-storage.ts`
  - `kid-habit-tracker/src/features/profiles/hooks/use-parent-protected-settings.ts`
  - `kid-habit-tracker/src/config/compliance.ts`
  - `kid-habit-tracker/scripts/verify-runtime-no-egress.js` (pattern reference)
- Expected new/updated artifacts for Story 5.3:
  - diagnostic bundle domain/infrastructure module under streak/check-in feature scope
  - story-level verification shell/script under `tests/` and `kid-habit-tracker/scripts/`

### Testing Requirements

- Verify parent-mode report generation creates local diagnostic bundle with required correlation metadata.
- Verify child-mode initiation is denied with safe feedback and no bundle creation.
- Verify generated bundle excludes disallowed sensitive/non-required fields.
- Verify chronology and streak reasoning are present and deterministic for fixed input history.
- Run Story 5.3 verification script(s), `npm run verify:privacy`, and `npx expo lint` before moving beyond review.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3: Streak Dispute Reporting and Diagnostic Bundle]
- [Source: _bmad-output/planning-artifacts/prd.md#Journey 4 - Parent Review and Dispute Handling]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional Requirements]
- [Source: _bmad-output/planning-artifacts/architecture.md#Observability and Supportability]
- [Source: _bmad-output/planning-artifacts/architecture.md#Security and Privacy]
- [Source: _bmad-output/implementation-artifacts/5-2-protected-storage-and-parent-access-controls.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- 2026-04-28: Story 5.3 created from Epic 5 context with FR34/FR35 alignment and local-first diagnostic guardrails.
- 2026-04-28: Added local streak dispute diagnostic storage with correlation metadata and profile-alias based records.
- 2026-04-28: Added parent-only diagnostic generation flow in daily check-in hook and dispute bundle UI in day-level history panel.
- 2026-04-28: Added compliance metadata for diagnostic required keys/disallowed fields and schema allowlist updates.
- 2026-04-28: Added Story 5.3 verification script and integrated diagnostics audit into `verify:privacy`; validation passed.
- 2026-04-28: CR remediation applied for diagnostics flow resilience and profile alias collision risk reduction (try/finally loading-state safety, storage error mapping, stronger deterministic aliasing).
- 2026-04-28: Follow-up CR pass on remediation scope completed with no additional findings.

### File List

- _bmad-output/implementation-artifacts/5-3-streak-dispute-reporting-and-diagnostic-bundle.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- kid-habit-tracker/src/features/streak/infrastructure/streak-dispute-report-storage.ts
- kid-habit-tracker/src/features/checkin/hooks/use-daily-checkin.ts
- kid-habit-tracker/src/app/index.tsx
- kid-habit-tracker/src/config/compliance.ts
- kid-habit-tracker/scripts/verify-streak-dispute-diagnostics.js
- kid-habit-tracker/scripts/verify-schema.js
- kid-habit-tracker/package.json
- tests/story-5-3-streak-dispute-reporting-and-diagnostic-bundle-check.sh

## Change Log

- 2026-04-28: Story 5.3 initialized and set to ready-for-dev.
- 2026-04-28: Implemented parent-only streak dispute reporting with local diagnostic bundle persistence, chronology/reasoning review panel, and verification guardrails; story moved to review.
- 2026-04-28: Applied code-review fixes for exception-safe diagnostics flow and reduced cross-profile alias collision risk; revalidated story/privacy/lint checks.
- 2026-04-28: Follow-up remediation review clean; story moved to done.
