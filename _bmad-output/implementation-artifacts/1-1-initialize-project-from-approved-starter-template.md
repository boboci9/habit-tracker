# Story 1.1: Initialize Project from Approved Starter Template

Status: done

## Story

As a developer,
I want to initialize the codebase from the approved starter template,
so that implementation begins on a consistent, architecture-aligned foundation.

## Acceptance Criteria

1. Given the repository is ready for implementation bootstrap, when the approved starter command is executed, then the project is created from create-expo-app default@sdk-55 and baseline dependencies and project structure are available for feature implementation.
2. Given starter initialization is complete, when base configuration is reviewed, then Expo Router and TypeScript-ready setup are present and setup output is committed as the implementation baseline.

## Tasks / Subtasks

- [x] Initialize starter project (AC: 1)
  - [x] From repo root, run: npx create-expo-app@latest kid-habit-tracker --template default@sdk-55
  - [x] Ensure app is created in local working directory expected by this repository workflow.
  - [x] Verify dependency installation completes without fatal errors.
- [x] Validate baseline stack and routing readiness (AC: 2)
  - [x] Confirm Expo Router is available and app folder routing scaffold exists.
  - [x] Confirm TypeScript setup is present (tsconfig and TS-ready app scaffold).
  - [x] Confirm starter output aligns with architecture project boundaries and naming constraints before any feature coding.
- [x] Establish baseline commit for future traceability (AC: 2)
  - [x] Commit only bootstrap-related files.
  - [x] Record baseline command and resulting SDK/template line in commit message or notes.

## Dev Notes

### Story Scope Guardrails

- This story only establishes the architecture-approved starter baseline.
- Do not implement feature logic, domain models, streak engine, or calendar flows in this story.
- Keep modifications minimal and foundation-only to preserve clean diff history.

### Technical Requirements

- Approved bootstrap command is fixed and mandatory: npx create-expo-app@latest kid-habit-tracker --template default@sdk-55.
- During SDK 55 transition, omitting --template may create SDK 54; keep explicit template flag.
- Baseline must be Expo Router-capable and TypeScript-ready.
- Project must remain compatible with pilot distribution path (Expo Go development, later APK/TestFlight flow).

### Architecture Compliance

- Preserve feature-boundary intent from architecture: profiles, checkin, streak, calendar, rewards, reminders, parent-protection, learning-cards.
- Follow service envelope convention in future implementation planning: { ok: true, data } / { ok: false, error }.
- Follow naming convention baseline from architecture:
  - snake_case at data boundaries
  - PascalCase for types/components
  - camelCase for variables/functions/hooks
  - kebab-case route segments
- Keep starter output compatible with feature-sliced module direction and command/query separation.

### File Structure Requirements

- Story output and implementation should align with architecture structure direction:
  - routing under app/
  - domain/application/infrastructure/ui layering under src/features/
  - shared cross-feature utilities under src/shared/
- Avoid introducing ad-hoc folder structures that conflict with planned architecture.

### Testing Requirements

- For this bootstrap story, verification is baseline-level:
  - Project initializes successfully.
  - Expo start command can run.
  - Router and TypeScript readiness are confirmed.
- Deeper feature/unit/integration testing starts from subsequent implementation stories.

### Latest Technical Information

- Expo docs (updated 2026-04-20) explicitly support the selected command and template.
- Expo Router docs (updated 2026-03-01) recommend this template for Router-ready setup.
- Practical note from docs: if Expo Go compatibility needs SDK 54 temporarily, that is an environment choice; this project architecture explicitly selects SDK 55 starter baseline.

### UX and Product Context

- No standalone UX design artifact currently exists in planning outputs.
- For this story, that is acceptable because scope is infrastructure bootstrap only.
- Do not infer UI behavior beyond establishing routing-capable baseline.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Initialize Project from Approved Starter Template]
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements]
- [Source: _bmad-output/planning-artifacts/architecture.md#Selected Starter: create-expo-app default (SDK 55 line)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- [Source: https://docs.expo.dev/more/create-expo/]
- [Source: https://docs.expo.dev/router/introduction/]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Bootstrap command: `npx create-expo-app@latest kid-habit-tracker --template default@sdk-55 --yes`
- Validation checks: `./tests/story-1-1-bootstrap-check.sh`, `npm run lint`
- Baseline commit: `981f196`

### Completion Notes List

- Implemented Expo SDK 55 default starter scaffold in `kid-habit-tracker/`.
- Confirmed Expo Router dependency and route scaffold (`src/app`) exist.
- Confirmed TypeScript baseline (`tsconfig.json`) exists.
- Added executable bootstrap verification test script at `tests/story-1-1-bootstrap-check.sh`.
- Completed bootstrap-only baseline commit: `chore(bootstrap): initialize Expo SDK55 starter baseline` (`981f196`).
- Story acceptance criteria validated via bootstrap checks and lint execution.

### File List

- _bmad-output/implementation-artifacts/1-1-initialize-project-from-approved-starter-template.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- tests/story-1-1-bootstrap-check.sh
- kid-habit-tracker/.gitignore
- kid-habit-tracker/.vscode/extensions.json
- kid-habit-tracker/.vscode/settings.json
- kid-habit-tracker/README.md
- kid-habit-tracker/app.json
- kid-habit-tracker/assets/expo.icon/Assets/expo-symbol 2.svg
- kid-habit-tracker/assets/expo.icon/Assets/grid.png
- kid-habit-tracker/assets/expo.icon/icon.json
- kid-habit-tracker/assets/images/android-icon-background.png
- kid-habit-tracker/assets/images/android-icon-foreground.png
- kid-habit-tracker/assets/images/android-icon-monochrome.png
- kid-habit-tracker/assets/images/expo-badge-white.png
- kid-habit-tracker/assets/images/expo-badge.png
- kid-habit-tracker/assets/images/expo-logo.png
- kid-habit-tracker/assets/images/favicon.png
- kid-habit-tracker/assets/images/icon.png
- kid-habit-tracker/assets/images/logo-glow.png
- kid-habit-tracker/assets/images/react-logo.png
- kid-habit-tracker/assets/images/react-logo@2x.png
- kid-habit-tracker/assets/images/react-logo@3x.png
- kid-habit-tracker/assets/images/splash-icon.png
- kid-habit-tracker/assets/images/tabIcons/explore.png
- kid-habit-tracker/assets/images/tabIcons/explore@2x.png
- kid-habit-tracker/assets/images/tabIcons/explore@3x.png
- kid-habit-tracker/assets/images/tabIcons/home.png
- kid-habit-tracker/assets/images/tabIcons/home@2x.png
- kid-habit-tracker/assets/images/tabIcons/home@3x.png
- kid-habit-tracker/assets/images/tutorial-web.png
- kid-habit-tracker/eslint.config.js
- kid-habit-tracker/package-lock.json
- kid-habit-tracker/package.json
- kid-habit-tracker/scripts/reset-project.js
- kid-habit-tracker/src/app/_layout.tsx
- kid-habit-tracker/src/app/explore.tsx
- kid-habit-tracker/src/app/index.tsx
- kid-habit-tracker/src/components/animated-icon.module.css
- kid-habit-tracker/src/components/animated-icon.tsx
- kid-habit-tracker/src/components/animated-icon.web.tsx
- kid-habit-tracker/src/components/app-tabs.tsx
- kid-habit-tracker/src/components/app-tabs.web.tsx
- kid-habit-tracker/src/components/external-link.tsx
- kid-habit-tracker/src/components/hint-row.tsx
- kid-habit-tracker/src/components/themed-text.tsx
- kid-habit-tracker/src/components/themed-view.tsx
- kid-habit-tracker/src/components/ui/collapsible.tsx
- kid-habit-tracker/src/components/web-badge.tsx
- kid-habit-tracker/src/constants/theme.ts
- kid-habit-tracker/src/global.css
- kid-habit-tracker/src/hooks/use-color-scheme.ts
- kid-habit-tracker/src/hooks/use-color-scheme.web.ts
- kid-habit-tracker/src/hooks/use-theme.ts
- kid-habit-tracker/tsconfig.json

## Change Log

- 2026-04-27: Implemented story 1.1 bootstrap using Expo SDK55 default template, added verification checks, and created bootstrap-only baseline commit `981f196`.
