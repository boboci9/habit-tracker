---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
inputDocuments:
  - /Users/bogi/My Projects/Nearform/bmad_habit_tracker/_bmad-output/planning-artifacts/prd.md
  - /Users/bogi/My Projects/Nearform/bmad_habit_tracker/_bmad-output/planning-artifacts/architecture.md
workflowType: 'epics-and-stories'
status: 'complete'
completedAt: '2026-04-27'
---

# bmad_habit_tracker - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad_habit_tracker, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: A parent user can complete the first-time setup flow in one uninterrupted session by entering required setup data (family name, at least 2 child profiles, and initial habit/reward configuration).
FR2: Child users can select or customize a profile avatar.
FR3: Child users can view their current habit identity status at app entry.
FR4: Child users can use the app without creating an account in Phase 1.
FR5: Child users can log daily physical habit completion.
FR6: Child users can record one daily learning entry.
FR7: Child users can complete both daily habit actions as part of a single daily check-in routine.
FR8: Child users can view whether today's check-in is complete or incomplete.
FR9: Child users can correct or update a same-day check-in entry.
FR10: Child users can submit a daily check-in while offline.
FR11: The system can calculate and maintain each child's consecutive-day streak state.
FR12: The system can apply grace-day rules when a daily check-in is missed.
FR13: Child users can recover streak continuity when grace-day recovery conditions are met.
FR14: The system can reset streak status when grace-day limits are exceeded.
FR15: Child users can view the reason a streak was preserved, recovered, or reset in a child-accessible transparency view.
FR15a: Parent users can view the same streak-reason transparency only within local setup/settings context on-device, without requiring a parent account or separate parent dashboard.
FR16: Child users can view current grace-day availability status.
FR17: Child users can view progress toward a parent-defined reward milestone.
FR18: The system can trigger a milestone reward-unlock experience when streak criteria are met.
FR19: Child users can view the currently configured reward goal.
FR20: Child users can view a calendar-style progression of habit completion history.
FR21: Child users can receive positive reinforcement feedback after daily check-in completion.
FR22: The system can present recovery encouragement messaging after missed days.
FR45: The system can display a mascot character that visually evolves based on cumulative streak and completion progress.
FR23a: Parent users can complete reward and habit configuration during a one-time device setup flow before child onboarding begins.
FR23: Parent users can configure a reward goal for a child profile.
FR24: Parent users can define or update the milestone target used for reward unlock.
FR25: Parent users can configure daily reminder timing for a child device.
FR26: Parent users can view a weekly consistency summary that includes, per child, weekly completion percentage, current streak status, and missed-day count.
FR27: Parent users can access guidance prompts for effort-first reinforcement language.
FR28: Parent users can manage key Phase 1 settings without requiring cloud connectivity.
FR47: A parent user can define a Family Profile during device setup, including a family name and one optional family photo.
FR48: A parent user can define 2-6 child profiles within the family, each with name, age, avatar/color, and its own habit configuration.
FR49: When the app is launched, users can access a Profile Picker screen showing all defined family member profiles as tappable cards; selecting a profile enters that child's individual habit view without requiring login.
FR50: Each child profile can operate independently with its own streak, check-in history, reward goal, and grace-day state.
FR51: A parent user can add, edit, or remove child profiles from a protected settings area that requires local parent verification before profile-management actions are applied.
FR52: Each child profile can have a unique color identifier that is used consistently across calendar, habit tracker, and key/legend views.
FR53: The app can include a dedicated Family Calendar view accessible from the Profile Picker screen before selecting an individual child profile.
FR54: The Family Calendar view can display a monthly calendar grid (Monday-Sunday) where each day shows events and check-in status for all family members, color-coded by each child's assigned color.
FR55: The Family Calendar view can include a color-coded legend mapping each family member color to name.
FR56: A parent user can add, edit, and delete shared family events that appear on the calendar distinct from individual child habits.
FR57: The Family Calendar can display each child's scheduled activities on the correct day in that child's assigned color.
FR58: The Family Calendar can include a Habits/Chores tracker section below the monthly grid, showing each child's assigned daily habits per day of week with completion indicators.
FR59: The Family Calendar can include an Upcoming/Notes panel where a parent can add 3-5 short free-text notes or reminders visible on the family view.
FR60: The Family Calendar view can be fully navigable without selecting an individual child profile and serves as a family-level entry point.
FR46: The system can surface one static learning card per day from a pre-bundled content library, where each card is tagged to one of three age bands (8-9, 10-11, 12) and rendered only for the child's configured band.
FR29: The system can schedule one recurring daily reminder notification per child profile.
FR30: Child users can continue habit check-ins even if notifications are disabled or unavailable.
FR31: Parent users can update reminder timing and enable/disable reminders per child profile after initial setup.
FR32: Child and parent users can view day-level habit history records.
FR33: Child and parent users can view transparent streak rule explanations.
FR34: Parent users can initiate a streak issue report when they believe progress is incorrect.
FR35: The system can provide diagnostic context sufficient to investigate streak disputes.
FR36: The system can operate in Phase 1 without transmitting child habit data to cloud services.
FR37: The system can minimize stored child data to only what is needed for habit tracking and rewards.
FR38: The system can avoid third-party behavioral advertising and tracking capabilities in child-facing flows.
FR39: Parent users can access controls relevant to child data handling in the current phase scope.
FR40: The product can preserve a migration path for parent consent and child data controls in later cloud-enabled phases.
FR41: The product can be distributed to pilot users via pre-store channels in Phase 1.
FR42: Parent users can install and run the product on supported Android and iOS devices during pilot.
FR43: The product can defer public app-store publication capabilities to a post-pilot phase.
FR44: The product can support transition from pilot distribution to store-submission-ready release scope in Phase 2.

### NonFunctional Requirements

NFR1: App cold start on supported pilot devices must complete within 3 seconds under normal local conditions.
NFR2: Core daily check-in interactions (log pushups, log learning, submit) must complete within 1 second for 95% of attempts in offline mode.
NFR3: Streak status and calendar/progress views must render within 1 second for 95% of attempts.
NFR20: The Family Calendar view must render all family members' data for the current month within 1.5 seconds on supported pilot devices using local data only.
NFR4: Daily check-in and streak history data must persist across app restarts and device reboots with zero critical data-loss incidents in pilot.
NFR5: Crash-free session rate must remain at or above 99.5% during pilot.
NFR6: Streak/grace calculations must be deterministic; identical input history must always produce identical streak outcomes.
NFR7: Offline-first capability must support 100% of Phase 1 core flows without network dependency.
NFR8: In Phase 1, child habit data transmission off-device must remain at 0 events per production build as verified by network traffic inspection during release QA.
NFR9: In Phase 1, third-party ad-tech or behavioral tracking SDK count in child-facing flows must remain 0 as verified by dependency audit for each release.
NFR10: 100% of locally stored habit and streak records must be encrypted at rest using platform-provided secure storage APIs, as verified by implementation and QA security checklist per release.
NFR11: In Phase 1, stored child-data fields must be limited to approved minimum dataset (profile metadata, habit events, streak state, reward config) with 0 unauthorized fields in schema audit per release.
NFR12: Before enabling Phase 2 cloud sync/accounts, architecture review must confirm implemented consent capture, deletion workflow, and retention policy enforcement with 100% checklist completion.
NFR13: Core child flows must achieve WCAG 2.1 AA conformance for contrast, readability, and focus/tap operability with 0 critical and 0 high-severity accessibility defects in pre-release audit.
NFR14: At least 95% of interactive touch targets in core flows must be at least 44x44 dp, with no target below 40x40 dp, as verified by UI inspection on reference devices.
NFR15: 100% of critical status and error messages (check-in saved, streak changed, grace-day state) must provide non-color cues (text or icon) as verified by accessibility test checklist.
NFR16: Internal development builds must be runnable in Expo Go on both Android and iOS for 100% of sprint demos during Phase 1.
NFR17: Each pilot release cycle must produce one installable Android APK and one TestFlight-ready iOS build that pass smoke tests before distribution.
NFR18: Rebuilding the same tagged source commit must produce Android and iOS pilot artifacts with matching app version and no release-blocking build variance in CI logs.
NFR19: Phase 1 quality gates must exclude public App Store/Google Play submission checks, with those checks first required in Phase 2 release checklist.
NFR21: After initial family setup, app launch must open Profile Picker as default entry in at least 99% of launches on supported pilot devices, while all individual child flows continue to pass regression tests.

### Additional Requirements

- Starter template and initialization baseline are fixed: `npx create-expo-app@latest kid-habit-tracker --template default@sdk-55`.
- Mobile architecture must follow explicit feature boundaries: profiles, checkin, streak, calendar, rewards, reminders, parent-protection, learning-cards.
- Local data architecture must use deterministic event/projection patterns with migration-safe persistence and rollback-friendly schema evolution.
- Parent-protected operations boundary is mandatory for profile and settings mutations.
- Local-first privacy boundary is mandatory in Phase 1 (no off-device child habit payloads).
- Result/error envelope consistency is required across app services (`{ ok: true, data }` / `{ ok: false, error }`).
- Naming conventions are mandatory (snake_case at data boundaries, PascalCase types/components, camelCase functions/vars).
- Typed validation contracts are required for command/form boundaries using shared schemas.
- Pilot distribution support is mandatory for Expo Go development + Android APK + iOS TestFlight.
- Diagnostics support for streak disputes must be implemented via correlation-aware local diagnostic bundles.
- Requirements-to-structure mapping in architecture must be preserved to avoid feature-boundary drift during implementation.
- Phase 2 integrations (sync/accounts/school-coach) are explicitly deferred but adapter seams must be preserved in MVP.

### UX Design Requirements

No standalone UX Design document was found in planning artifacts at this time.

### FR Coverage Map

FR1: Epic 1 - parent-led first-time setup
FR2: Epic 1 - child avatar/profile identity setup
FR3: Epic 1 - child identity status at app entry
FR4: Epic 1 - accountless phase-1 usage
FR5: Epic 2 - physical habit logging
FR6: Epic 2 - daily learning entry
FR7: Epic 2 - unified daily routine completion
FR8: Epic 2 - daily completion status visibility
FR9: Epic 2 - same-day entry correction
FR10: Epic 2 - offline check-in submit
FR11: Epic 2 - streak calculation engine
FR12: Epic 2 - grace-day application
FR13: Epic 2 - streak recovery logic
FR14: Epic 2 - streak reset logic
FR15: Epic 2 - child streak transparency
FR15a: Epic 2 - parent local streak transparency
FR16: Epic 2 - grace-day availability display
FR17: Epic 3 - reward milestone progress
FR18: Epic 3 - milestone unlock trigger
FR19: Epic 3 - configured reward visibility
FR20: Epic 3 - progress calendar visualization
FR21: Epic 3 - positive reinforcement messaging
FR22: Epic 3 - recovery encouragement messaging
FR23a: Epic 1 - setup-time parent configuration
FR23: Epic 1 - per-child reward configuration
FR24: Epic 1 - milestone target management
FR25: Epic 1 - reminder timing configuration
FR26: Epic 1 - weekly consistency summary
FR27: Epic 1 - parent guidance prompts
FR28: Epic 1 - local settings management
FR29: Epic 2 - recurring daily reminder scheduling per child profile
FR30: Epic 2 - check-ins still work if notifications off
FR31: Epic 2 - per-child reminder time updates and enable/disable post-setup
FR32: Epic 5 - day-level history visibility
FR33: Epic 5 - streak rule explanation visibility
FR34: Epic 5 - streak issue reporting
FR35: Epic 5 - diagnostic context for disputes
FR36: Epic 5 - no phase-1 cloud transmission of child habit data
FR37: Epic 5 - child data minimization
FR38: Epic 5 - no behavioral ad-tech/tracking
FR39: Epic 5 - parent data-handling controls
FR40: Epic 5 - phase-2 consent/data-control migration path
FR41: Epic 6 - pre-store pilot distribution support
FR42: Epic 6 - android/ios pilot installation/run support
FR43: Epic 6 - deferral of public store publishing
FR44: Epic 6 - transition path to store-ready phase
FR45: Epic 3 - mascot progression feedback loop
FR46: Epic 3 - age-banded daily learning cards
FR47: Epic 1 - family profile definition
FR48: Epic 1 - multi-child profile definition
FR49: Epic 1 - profile picker entry flow
FR50: Epic 1 - independent child profile states
FR51: Epic 1 - parent-protected profile management
FR52: Epic 1 - persistent per-child color identity
FR53: Epic 4 - dedicated family calendar entry
FR54: Epic 4 - monthly family calendar grid
FR55: Epic 4 - color legend mapping
FR56: Epic 4 - shared family event management
FR57: Epic 4 - per-child scheduled activity display
FR58: Epic 4 - habits/chores tracker panel
FR59: Epic 4 - upcoming/notes panel
FR60: Epic 4 - family calendar as independent entry point

## Epic List

### Epic 1: Family Setup, Profiles, and Parent Controls
Parents can set up the household, create child profiles, configure core habits/rewards/reminders, and safely manage settings through parent-protected actions.
**FRs covered:** FR1, FR2, FR3, FR4, FR23a, FR23, FR24, FR25, FR26, FR27, FR28, FR47, FR48, FR49, FR50, FR51, FR52

### Epic 2: Daily Check-In and Streak Integrity
Children can complete daily habit check-ins offline, and the app enforces deterministic streak/grace/recovery logic with transparent streak state explanations.
**FRs covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR15a, FR16, FR29, FR30, FR31

### Epic 3: Motivation Loop (Rewards, Progress, Learning)
Children get immediate reinforcement, reward progression, mascot evolution, and daily learning-card content tied to age bands.
**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR45, FR46

### Epic 4: Family Calendar Coordination
Families can use a dedicated calendar to coordinate child schedules, shared events, habits/chores visibility, and notes from a family-level entry point.
**FRs covered:** FR53, FR54, FR55, FR56, FR57, FR58, FR59, FR60

### Epic 5: Transparency, Safety, and Privacy Guardrails
Parents and children can inspect history/rules, report disputes, and rely on privacy-safe local handling plus Phase-2-ready governance boundaries.
**FRs covered:** FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40

### Epic 6: Pilot Distribution and Release Lifecycle
The product can be distributed through Phase 1 pilot channels and prepared for Phase 2 store-submission readiness.
**FRs covered:** FR41, FR42, FR43, FR44

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: Family Setup, Profiles, and Parent Controls

Parents can set up the household, create child profiles, configure core habits/rewards/reminders, and safely manage settings through parent-protected actions.

### Story 1.1: Initialize Project from Approved Starter Template

As a developer,
I want to initialize the codebase from the approved starter template,
So that implementation begins on a consistent, architecture-aligned foundation.

**Implements:** Architecture Additional Requirements (starter baseline)

**Acceptance Criteria:**

**Given** the repository is ready for implementation bootstrap
**When** the approved starter command is executed
**Then** the project is created from `create-expo-app default@sdk-55`
**And** baseline dependencies and project structure are available for feature implementation.

**Given** starter initialization is complete
**When** base configuration is reviewed
**Then** Expo Router and TypeScript-ready setup are present
**And** setup output is committed as the implementation baseline.

### Story 1.2: First-Launch Family Setup Flow

As a parent,
I want to complete a guided first-launch family setup,
So that my household is ready for daily habit tracking.

**Implements:** FR1

**Acceptance Criteria:**

**Given** the app is launched for the first time
**When** the parent completes family name and required setup fields
**Then** a Family Profile is created locally
**And** setup cannot finish until required fields are valid.

**Given** setup is in progress
**When** the app is restarted
**Then** setup resumes safely without corrupting saved data
**And** no child habit data is transmitted off-device.

### Story 1.3: Child Profile Creation and Profile Picker

As a parent,
I want to create and manage 2-6 child profiles with distinct identity attributes,
So that each child has an independent habit experience.

**Implements:** FR2, FR3, FR4, FR47, FR48, FR49, FR50, FR52

**Acceptance Criteria:**

**Given** family setup is complete
**When** the parent adds child profiles with name, age, avatar, and color
**Then** each profile is stored independently
**And** each profile receives a unique color identifier.

**Given** setup has completed previously
**When** the app launches
**Then** the Profile Picker is shown by default
**And** selecting a child opens that child's habit view without login.

### Story 1.4: Parent-Protected Settings and Profile Management

As a parent,
I want protected access to profile and key settings actions,
So that children cannot accidentally modify critical household configuration.

**Implements:** FR23a, FR23, FR24, FR25, FR28, FR51

**Acceptance Criteria:**

**Given** a user attempts profile add/edit/remove from settings
**When** local parent verification succeeds
**Then** the requested profile-management action is applied
**And** failed verification blocks the action.

**Given** parent-protected mode is active
**When** reward target and reminder settings are updated
**Then** changes are saved to local persistence
**And** updates are visible in subsequent sessions.

### Story 1.5: Weekly Parent Summary and Guidance Prompts

As a parent,
I want a weekly consistency summary and reinforcement prompts,
So that I can coach effort-focused behavior effectively.

**Implements:** FR26, FR27

**Acceptance Criteria:**

**Given** at least one week of child check-in data exists
**When** the parent opens weekly summary
**Then** per-child completion percentage, streak status, and missed-day count are displayed
**And** values reflect local data accurately.

**Given** the parent views reinforcement guidance
**When** prompts are shown
**Then** prompts use effort-first language patterns
**And** prompts are available without network dependency.

## Epic 2: Daily Check-In and Streak Integrity

Children can complete daily habit check-ins offline, and the app enforces deterministic streak/grace/recovery logic with transparent streak state explanations.

### Story 2.1: Daily Check-In Capture (Offline-First)

As a child,
I want to log pushups and one daily learning item in a single flow,
So that I can complete my daily ritual quickly.

**Implements:** FR5, FR6, FR7, FR8, FR9, FR10

**Acceptance Criteria:**

**Given** the child is on today's check-in screen
**When** pushups and learning text are submitted
**Then** today's check-in is marked complete
**And** submission works while offline.

**Given** the child submitted today already
**When** they edit same-day values
**Then** the same-day entry updates successfully
**And** the update is persisted locally.

### Story 2.2: Deterministic Streak and Grace-Day Engine

As a child,
I want streak and grace-day outcomes to be fair and consistent,
So that I trust the app's progress logic.

**Implements:** FR11, FR12, FR13, FR14, FR16

**Acceptance Criteria:**

**Given** a sequence of daily check-ins and misses
**When** streak state is computed
**Then** outcomes are deterministic for identical input history
**And** grace-day usage follows configured limits.

**Given** grace conditions are met for recovery
**When** the next valid check-in is completed
**Then** streak continuity is recovered
**And** recovery state is reflected in current status.

### Story 2.3: Streak Transparency and Day-Level History

As a child or parent,
I want transparent streak explanations and day-level records,
So that I can understand why streak state changed.

**Implements:** FR15, FR15a, FR32, FR33

**Acceptance Criteria:**

**Given** a streak preserve/recover/reset event occurred
**When** transparency view is opened
**Then** the app shows rule reason and resulting state
**And** explanation text is understandable without color-only cues.

**Given** history view is opened
**When** a date is selected
**Then** day-level habit and streak context is displayed
**And** data matches persisted local records.

### Story 2.4: Reminder Scheduling and Failure Tolerance

As a parent,
I want one recurring daily reminder schedule per child profile,
So that children are prompted consistently without complex setup.

**Implements:** FR29, FR30, FR31

**Acceptance Criteria:**

**Given** reminder time is configured
**When** schedule is saved
**Then** one recurring reminder for that child is registered on-device
**And** reminder settings can be updated or disabled later per child.

**Given** notifications are denied or unavailable
**When** the child opens the app
**Then** manual check-in remains fully functional
**And** no check-in blocker is introduced.

## Epic 3: Motivation Loop (Rewards, Progress, Learning)

Children get immediate reinforcement, reward progression, mascot evolution, and daily learning-card content tied to age bands.

### Story 3.1: Reward Progress and Milestone Unlock

As a child,
I want to see reward progress and milestone unlock events,
So that daily consistency feels meaningful.

**Implements:** FR17, FR18, FR19, FR20

**Acceptance Criteria:**

**Given** a reward milestone is configured
**When** the child completes qualifying check-ins
**Then** progress toward the milestone updates visibly
**And** current reward goal remains visible in the child experience.

**Given** milestone criteria are reached
**When** unlock logic is evaluated
**Then** milestone unlock state is triggered exactly once per milestone
**And** unlock state is persisted locally.

### Story 3.2: Reinforcement Messaging and Mascot Evolution

As a child,
I want positive feedback and a mascot that evolves with consistency,
So that I stay motivated to continue the routine.

**Implements:** FR21, FR22, FR45

**Acceptance Criteria:**

**Given** a daily check-in is completed
**When** post-submit feedback is displayed
**Then** reinforcement messaging appears with success context
**And** recovery encouragement appears after missed-day scenarios.

**Given** cumulative progress thresholds are crossed
**When** mascot state is resolved
**Then** mascot visual stage updates according to defined thresholds
**And** evolution state persists between sessions.

### Story 3.3: Age-Banded Daily Learning Card Delivery

As a child,
I want daily learning cards matched to my age band,
So that content feels understandable and relevant.

**Implements:** FR46

**Acceptance Criteria:**

**Given** a child profile has age-band mapping
**When** today's learning card is requested
**Then** one card tagged for that age band is presented
**And** cards are sourced from pre-bundled local content.

**Given** content governance rules exist
**When** card metadata is loaded
**Then** only approved card entries are eligible for display
**And** unresolved/invalid content entries are excluded.

## Epic 4: Family Calendar Coordination

Families can use a dedicated calendar to coordinate child schedules, shared events, habits/chores visibility, and notes from a family-level entry point.

### Story 4.1: Family Calendar Entry and Monthly View Foundation

As a parent,
I want a family-level calendar view from Profile Picker,
So that I can coordinate household activity before opening a child profile.

**Implements:** FR53, FR54, FR55, FR60

**Acceptance Criteria:**

**Given** the user is on Profile Picker
**When** Family Calendar is selected
**Then** family calendar view opens without selecting a child
**And** this path is fully navigable independently.

**Given** calendar view is opened
**When** monthly grid is rendered
**Then** days are shown Monday-Sunday with per-child color indicators
**And** render performance meets defined monthly-view target.

### Story 4.2: Shared Events and Child Schedule Items

As a parent,
I want to manage shared events and child-specific schedule entries,
So that family planning is visible in one place.

**Implements:** FR56, FR57

**Acceptance Criteria:**

**Given** calendar edit controls are available
**When** parent adds, edits, or deletes shared events
**Then** updates are reflected on correct calendar days
**And** shared events remain visually distinct from child habits.

**Given** child schedule entries exist
**When** month view is displayed
**Then** each activity appears on correct day in assigned child color
**And** legend mapping remains consistent with profile colors.

### Story 4.3: Habits/Chores Tracker Panel in Calendar Context

As a parent,
I want a habits/chores tracker section under the calendar,
So that I can view weekly child habit assignments and completion status.

**Implements:** FR58

**Acceptance Criteria:**

**Given** family calendar is open
**When** habits/chores panel is expanded
**Then** per-child assigned habits appear by day-of-week
**And** completion indicators align with underlying check-in records.

**Given** profile color keys are defined
**When** tracker data is displayed
**Then** color usage is consistent with calendar and legend
**And** accessibility cues are present beyond color alone.

### Story 4.4: Upcoming Notes Panel and Calendar Persistence

As a parent,
I want to keep short upcoming notes/reminders in family calendar,
So that key family logistics are visible during planning.

**Implements:** FR59

**Acceptance Criteria:**

**Given** notes panel is available
**When** parent adds up to 5 short notes
**Then** notes are persisted locally and visible in family view
**And** notes can be edited or removed.

**Given** app restarts or offline mode
**When** family calendar is reopened
**Then** notes, events, and tracker state are restored accurately
**And** no critical data-loss occurs.

## Epic 5: Transparency, Safety, and Privacy Guardrails

Parents and children can inspect history/rules, report disputes, and rely on privacy-safe local handling plus Phase-2-ready governance boundaries.

### Story 5.1: Local Data Minimization and Schema Guardrails

As a parent,
I want the app to store only necessary child data,
So that privacy risk remains minimal in Phase 1.

**Implements:** FR36, FR37, FR38, NFR8, NFR9, NFR11

**Acceptance Criteria:**

**Given** local schema definitions are applied
**When** schema audit checks run
**Then** only approved minimum dataset fields are present
**And** unauthorized fields are flagged as failures.

**Given** child habit workflows are executed
**When** data persistence occurs
**Then** child habit payloads stay on-device in Phase 1
**And** no off-device transmission events are generated.

### Story 5.2: Protected Storage and Parent Access Controls

As a parent,
I want sensitive local controls secured,
So that child data and parent-only operations are not exposed.

**Implements:** FR39, NFR10

**Acceptance Criteria:**

**Given** sensitive settings or verification flags are saved
**When** persistence executes
**Then** secure storage controls are applied as defined
**And** unauthorized access attempts are blocked.

**Given** parent-only features are opened
**When** authorization context is child mode
**Then** protected actions are denied
**And** user-safe authorization feedback is shown.

### Story 5.3: Streak Dispute Reporting and Diagnostic Bundle

As a parent,
I want to report suspected streak issues with diagnostics,
So that disputes can be investigated and resolved confidently.

**Implements:** FR34, FR35

**Acceptance Criteria:**

**Given** a streak mismatch is observed
**When** parent initiates report flow
**Then** a local diagnostic bundle is generated with correlation metadata
**And** bundle excludes sensitive data not required for troubleshooting.

**Given** diagnostics are reviewed
**When** rule history is inspected
**Then** event chronology and streak reasoning are available
**And** supportability requirements for dispute investigation are met.

### Story 5.4: Phase-2 Compliance Extension Points

As a product owner,
I want consent/deletion/retention extension points scaffolded,
So that Phase 2 cloud/account features can be added safely.

**Implements:** FR40, NFR12

**Acceptance Criteria:**

**Given** architecture extension points are implemented
**When** Phase 2 enablement checklist is evaluated
**Then** consent capture, deletion workflow, and retention-policy hooks are present
**And** each hook has documented interface contracts.

**Given** school/coach integration toggle is considered
**When** go-live conditions are checked
**Then** integration remains blocked without checklist sign-off
**And** dry-run verification evidence is required.

## Epic 6: Pilot Distribution and Release Lifecycle

The product can be distributed through Phase 1 pilot channels and prepared for Phase 2 store-submission readiness.

### Story 6.1: Development and Pilot Channel Build Setup

As a developer,
I want environment and build-channel setup for dev and pilot,
So that Android and iOS pilot delivery can run consistently.

**Implements:** FR41, FR42, NFR16, NFR17

**Acceptance Criteria:**

**Given** project configuration is initialized
**When** dev and pilot environments are built
**Then** Expo Go development and pilot build paths are both functional
**And** feature flags prevent Phase 2-only capabilities in Phase 1.

**Given** Android and iOS pilot outputs are produced
**When** build artifacts are generated
**Then** one installable APK and one TestFlight-ready iOS build are produced
**And** artifacts are traceable to source commit/version.

### Story 6.2: Reproducible Build and Smoke-Test Gate

As a release owner,
I want reproducible builds and smoke-test gating,
So that pilot artifacts are dependable and verifiable.

**Implements:** NFR18

**Acceptance Criteria:**

**Given** a tagged source commit
**When** builds are rerun in CI
**Then** resulting artifacts match expected app version metadata
**And** release-blocking build variance is absent.

**Given** pilot artifacts are produced
**When** smoke tests execute
**Then** critical startup/check-in/profile-picker paths pass
**And** failed smoke tests block distribution.

### Story 6.3: Phase-2 Store Submission Readiness Scaffold

As a release owner,
I want store-submission readiness checks separated from Phase 1 gates,
So that pilot execution remains focused while preserving Phase 2 transition path.

**Implements:** FR43, FR44, NFR19, NFR21

**Acceptance Criteria:**

**Given** Phase 1 quality gates are configured
**When** release checks run
**Then** public store submission checks are excluded from Phase 1 pass criteria
**And** this exclusion is documented in release checklist.

**Given** Phase 2 planning begins
**When** readiness checklist is reviewed
**Then** explicit store-hardening and compliance packaging tasks are present
**And** transition criteria from pilot to store-ready scope are defined.
