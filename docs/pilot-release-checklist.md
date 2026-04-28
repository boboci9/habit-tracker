# Pilot Release Checklist (Phase 1)

This checklist defines the required release gate order for pilot distribution and the blocker semantics for each gate.

## Scope

- Applies to Phase 1 pilot distribution only.
- Covers Android APK and iOS TestFlight-ready pilot paths.
- Public App Store / Google Play submission checks are explicitly out of scope for Phase 1.

## Required Gate Order

Run the following gates in order from repository root:

1. `npm --prefix kid-habit-tracker run verify:privacy`
2. `npm --prefix kid-habit-tracker run verify:pilot-channel-setup`
3. `npm --prefix kid-habit-tracker run verify:pilot-smoke`
4. `npm --prefix kid-habit-tracker run verify:release-gate`
5. `bash tests/story-6-2-reproducible-build-and-smoke-test-gate-check.sh`

For artifact-producing pilot build scripts:

1. `npm run verify:privacy`
2. `node scripts/verify-pilot-channel-setup.js`
3. `node scripts/verify-pilot-smoke-gate.js`
4. `node scripts/write-build-traceability.js --channel=pilot --platform=<android|ios> --build-profile=<pilot-android|pilot-ios>`
5. `eas build --platform <android|ios> --profile <pilot-android|pilot-ios> --non-interactive`

## Blocker Semantics (Fail-Closed)

- Any failing gate is release-blocking and must terminate with non-zero exit code.
- Missing prerequisite files are release-blocking.
- Missing EAS CLI is release-blocking for artifact-producing scripts.
- Smoke-gate failure is release-blocking and prevents distribution readiness.
- Reproducibility variance (version/profile/channel/commit mismatch) is release-blocking.
- No gate may silently downgrade to success when checks fail.

## Reproducibility Requirements (Story 6.2)

- Re-run builds for the same tagged source commit.
- Verify metadata parity across Android and iOS artifacts:
  - `appVersion`
  - `sourceCommit`
  - `channel`
  - `buildProfile`
- Treat any parity mismatch as release-blocking variance.

## Distribution Readiness Evidence

Capture and retain:

- Output from `verify:release-gate`.
- Output from `tests/story-6-2-reproducible-build-and-smoke-test-gate-check.sh`.
- Generated metadata under `kid-habit-tracker/build-artifacts/metadata/`.
- Commit SHA and app version associated with the release candidate.

## Phase Boundary Note

- Phase 1: pilot-only channels (Expo Go dev, Android APK, iOS TestFlight).
- Phase 2: store-submission checks become mandatory and are tracked separately in Story 6.3 scope.
- Phase 2 readiness checklist source of truth: `docs/phase2-store-readiness-checklist.md`.
