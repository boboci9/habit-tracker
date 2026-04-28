---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-e-01-discovery
  - step-e-02-review
  - step-e-03-edit
inputDocuments:
  - /Users/bogi/My Projects/Nearform/bmad_habit_tracker/_bmad-output/planning-artifacts/product-brief-bmad_habit_tracker.md
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: mobile_app
  domain: edtech
  complexity: medium
  projectContext: greenfield
workflowType: 'prd'
workflow: 'edit'
date: '2026-04-27'
lastEdited: '2026-04-27'
editHistory:
  - date: '2026-04-27'
    changes: 'Added Family Profile and Family Calendar Phase 1 requirements (FR47-FR60), updated app entry flow, added Phase 2 printable export, and added NFR20-NFR21.'
  - date: '2026-04-27'
    changes: 'Remediated validation findings: added family-level success metrics and journey coverage for FR47-FR60, refined FR1/FR26/FR46/FR48/FR51 wording, and made NFR8-NFR19 and NFR21 explicitly measurable.'
  - date: '2026-04-27'
    changes: 'Applied quick-fix compliance updates: added child-content governance policy and a concrete Phase 2 FERPA operational readiness workflow.'
---

# Product Requirements Document - bmad_habit_tracker

**Author:** Bogi
**Date:** 2026-04-23

## Executive Summary

Kid Habit Tracker is a greenfield, mobile-first product for children aged 8-12 that builds daily consistency through one short ritual: log physical effort (pushups), record one new learning, and immediately see progress toward a parent-defined goal. The core objective is not task tracking; it is identity formation. The product is designed to reinforce the self-story: I am the kind of kid who shows up every day.

The primary problem is that children lose consistency when progress is invisible and motivation depends on repeated parent reminders. Existing options either create friction (manual charts), feel adult-centric (generic habit apps), or punish missed days too aggressively. This product addresses that gap with a low-reading, high-clarity flow that can be completed in under two minutes and repeated daily without cognitive fatigue.

The timing is intentional: launch before school-term or summer routine shifts so habits are established before environmental disruption. Success is measured by sustained completion behavior, streak continuity, and parent-observed growth in habit awareness, not by feature breadth.

### What Makes This Special

The product differentiator is gentle accountability with visible stakes. Children are motivated by a concrete reward path, while misses are handled with grace instead of shame. A 7-day consistency milestone triggers a mascot-led unlock moment that reveals a parent-defined reward, creating a direct and emotionally memorable link between daily effort and earned outcomes.

The key design insight is that behavior change in this age group is strongest when motivation combines three elements in one loop: immediate emotional feedback, visible long-term progress, and recoverable failure. The grace-day policy preserves momentum after misses, while the reward-at-risk framing keeps consequences real. This balance is the mechanism that turns check-ins into identity-building repetition.

## Project Classification

- Project Type: mobile_app
- Domain: edtech (with health-habit behavior layer)
- Complexity: medium
- Project Context: greenfield

## Success Criteria

### User Success

- Children (8-12) complete the daily loop (pushups + one learning) on at least 5 days per week by week 4.
- At least 70% of active children achieve one 7-day streak within the first 30 days.
- Children can complete a daily check-in in under 2 minutes without parent assistance after onboarding week.
- Parent-reported identity shift improves: child expresses ownership language ("I show up daily") at least once per week by month 1.
- At least 80% of pilot households complete Family Profile setup with at least 2 child profiles in a single setup session.
- At least 70% of active households use the Family Calendar view at least 3 times per week by week 4.

### Business Success

- Family pilot activation: at least 80% of onboarded households complete first check-in within 24 hours.
- Week-4 retention: at least 60% of onboarded households remain active (>= 3 check-ins/week).
- Reward-loop effectiveness: at least 70% of children who hit first 7-day streak continue for another 7+ days.
- Parent satisfaction: at least 75% of parents report the app is "worth continuing" after month 1.
- Family-calendar utility: at least 70% of parents report the Family Calendar reduces manual coordination effort by month 1.

### Technical Success

- Daily check-in flow success rate >= 98% (no blocking errors on submit/toggle).
- Crash-free sessions >= 99.5% during pilot period.
- Local data integrity: 0 critical data-loss incidents for streak/history records.
- Core interactions accessible with no critical mobile accessibility violations in audit.
- Family Calendar monthly view render success rate >= 99% across supported pilot devices.

### Measurable Outcomes

- Daily loop completion rate >= 70% across active days.
- Median time-to-check-in <= 120 seconds.
- 7-day streak attainment rate >= 70% among active children.
- Grace-day recovery rate >= 50% (children who miss one day and return next day).
- Parent perception metric: >= 70% agreement that child awareness of habit consistency improved in 30 days.
- Family setup completion rate >= 80% for households starting first-launch setup.
- Weekly Family Calendar active-use rate >= 70% of active households (>= 3 opens/week).

## Product Scope

### MVP - Minimum Viable Product

- Family Profile setup on first launch (local-only, no accounts): family name, optional family photo, and multiple child profiles.
- Profile Picker default entry after setup, with child profile cards and a Family Calendar entry point.
- Child profile/avatar selection.
- Daily pushup logging.
- Daily "new learning" entry.
- Streak tracking with 1-2 grace days.
- 7-day mascot reward unlock flow with parent-defined reward label.
- Goal calendar visualizing progress to the main reward.
- Family Calendar monthly view with per-child color coding, legend, shared family events, child schedule events, habits/chores tracker, and notes panel.
- Core states: first day, ongoing streak, grace-day warning, streak recovery/reset.
- Local storage only, no accounts, no cloud sync.

### Growth Features (Post-MVP)

- Parent dashboard for trend visibility.
- Flexible habit templates beyond pushups + learning.
- Smart reminders and adaptive nudges.
- Reward catalog and milestone ladders.
- Printable Family Calendar export (print-optimized PDF or shareable image for current month).

### App Entry Flow (Phase 1)

- On first launch: parent completes Family Profile setup (family name, child profiles, and habit configurations).
- On subsequent launches: app opens to the Profile Picker screen showing all child profile cards and a Family Calendar button.
- Selecting a child card opens that child's individual daily habit view.
- Selecting Family Calendar opens the family-level calendar view.

### Vision (Future)

- Family habit platform with identity-based progression.
- Cross-device sync and long-term longitudinal habit insights.
- Parent coaching tools and age-adaptive behavior plans.
- Optional school/coach integrations.

## User Journeys

### Journey 1: Primary User Success Path (Child Daily Win Loop)

Aarav is 9. After school, he opens the app because he wants to keep his streak alive and get closer to movie night. The home screen shows today's check-in clearly: pushups first, then one new thing learned. He logs 12 pushups, types "I learned how volcanoes erupt," and sees the streak flame animate. A progress calendar fills one more day toward the reward milestone. On day 7, the mascot triggers a special unlock animation and reveals "Movie Night Unlocked."

Emotional arc:

- Start: mildly resistant, curious about reward.
- Middle: focused because check-in is fast and clear.
- End: proud, recognized, and motivated to repeat.

What can go wrong:

- He forgets one field -> clear inline prompt and retry.
- He misses a day -> grace-day message preserves momentum.

Capability implications:

- Frictionless two-step daily check-in.
- Immediate visual streak and calendar feedback.
- Milestone unlock animation and reward reveal.

### Journey 2: Primary User Edge Case (Missed Day Recovery Without Shame)

Luca is 11 and misses a check-in during a busy weekend. The next day he opens the app expecting punishment. Instead, the mascot says he has 1 grace day left and can recover by completing today's routine. He logs pushups and his learning card. The app preserves his streak and shows that the reward is still possible, but now "at risk" if he misses again.

Emotional arc:

- Start: anxiety and avoidance.
- Middle: relief through recoverable failure.
- End: renewed commitment with realistic stakes.

What can go wrong:

- Confusion about whether streak is dead -> explicit grace-day status banner.
- Perceived unfair reset -> transparent streak rules screen.

Capability implications:

- Grace-day policy engine.
- Recovery-state messaging.
- Transparent streak rules and state explanation.

### Journey 3: Secondary User (Parent Reward Setup and Weekly Reinforcement)

Sara (parent) wants to reinforce consistency without nagging. During setup, she defines the child's reward ("new football"), confirms the 7-day milestone, and sees a simple weekly consistency view. At week's end, she uses the app conversation prompt to celebrate effort, not perfection. She notices her son starts saying, "I'm keeping my streak," without reminders.

Emotional arc:

- Start: skeptical, tired of repeated reminders.
- Middle: cautiously optimistic seeing daily adherence.
- End: confident that identity and consistency are improving.

What can go wrong:

- Reward too large or unclear -> guided reward setup guardrails.
- Parent over-controls habit -> prompt language encourages autonomy framing.

Capability implications:

- Parent-defined reward configuration.
- Lightweight weekly summary.
- Behavioral coaching prompts for parent language.

### Journey 4: Support/Troubleshooting (Streak Dispute and Data Confidence)

After a phone restart, parent and child think a streak day is missing. Parent opens help from settings and sees day-by-day check-in history, grace-day usage, and the exact rule that applied. If mismatch remains, they use in-app "Report streak issue" with attached diagnostics. Support can reproduce state from event logs and provide resolution guidance.

Emotional arc:

- Start: frustration and distrust.
- Middle: clarity from transparent history.
- End: restored trust in fairness.

What can go wrong:

- Child believes app is "cheating."
- Parent loses confidence in reward logic.

Capability implications:

- Immutable local check-in history view.
- Explainable streak calculation.
- Basic diagnostics and support escalation path.

### Journey 5: Parent Family Setup and Weekly Calendar Coordination

On first launch, Nia (parent) completes Family Profile setup by entering a family name, adding a family photo, and creating profiles for two children with unique colors. On regular days, the app opens to Profile Picker, where she can choose either a child card for individual check-ins or Family Calendar to coordinate shared events, child activities, and habit visibility across the week. She adds one shared family event, confirms one child activity item per child, and adds two short notes for upcoming logistics.

Emotional arc:

- Start: wants quick setup and clear weekly coordination in one place.
- Middle: gains confidence because profiles and calendar context are easy to scan.
- End: feels reduced planning stress and improved family routine visibility.

What can go wrong:

- Too many setup steps -> single-session setup flow with required fields first and optional fields second.
- Child/profile confusion -> stable color legend and profile-card consistency across entry points.

Capability implications:

- Family Profile creation with multiple child profiles and per-child identity attributes.
- Profile Picker as default post-setup app entry with direct child and calendar navigation.
- Family Calendar with monthly grid, legend, shared events, child activity visibility, habits tracker, and short notes.

### Journey Requirements Summary

These journeys reveal required capability groups:

1. Daily Loop Engine

- Two-step check-in (pushups + learning).
- Sub-2-minute completion UX.
- Immediate feedback and saved state reliability.

2. Motivation System

- 7-day milestone unlock.
- Mascot animation trigger framework.
- Parent-defined reward rendering.

3. Streak Integrity System

- Grace-day logic.
- Recovery and reset states.
- Transparent rule explanations.

4. Parent Enablement

- Reward setup flow.
- Lightweight weekly reinforcement summaries.
- Parent messaging prompts that reinforce identity.

5. Trust and Recovery

- Day-level event history.
- Streak dispute diagnostics.
- Support pathway for unresolved edge cases.

6. Family Profile and Calendar Coordination

- First-launch Family Profile setup with household and child definitions.
- Profile Picker default entry with direct child-card and family-calendar access.
- Family Calendar operations for shared events, child schedules, habits/chores visibility, and notes.

## Domain-Specific Requirements

### Compliance & Regulatory

- COPPA-aligned child privacy handling for ages 8-12:
  - Collect only minimum required child data.
  - Obtain verifiable parent/guardian consent for any personal data processing beyond strictly local operation.
  - Provide parent-visible data controls (view/delete child data if cloud features are introduced later).
- FERPA readiness is not required for MVP unless school integrations are added; keep architecture ready for future education-context privacy controls.
- Accessibility baseline:
  - Mobile UX must support readable text sizing, clear contrast, and keyboard/screen-reader compatibility where platform applies.

### Content Governance Policy (Child Learning Cards)

- Content review cadence: pre-release review for all new cards and monthly audit of active card set.
- Approval ownership: one designated parent-side content owner and one product owner approve additions/edits before shipment.
- Safety and quality checks: each card must pass age-band fit (8-9, 10-11, 12), neutral language, and child-safety screening checklist.
- Issue response SLA: reported content safety issues must be triaged within 24 hours and resolved (remove, replace, or revise) within 72 hours.
- Change logging: every card addition or revision must be logged with date, reviewer, reason for change, and affected age band.

### Technical Constraints

- Privacy-first local data model in MVP:
  - Store only habit events, streak state, reward config, and minimal profile metadata.
  - No third-party tracking SDKs in child-facing experience during MVP.
- Streak fairness and explainability:
  - Grace-day logic must be deterministic and transparent.
  - Child/parent can view why streak changed (or was preserved) on any day.
- Reliability:
  - Check-in flow must be resilient to app restarts/offline usage.
  - Local persistence integrity must protect against accidental streak/history loss.

### Integration Requirements

- MVP:
  - No mandatory external integrations.
  - Local notification support is optional but should use platform-native APIs if enabled.
- Post-MVP readiness:
  - Parent dashboard backend and sync service should be designed as add-on architecture, not blocking MVP launch.
  - Future school/coaching integrations must be isolated behind explicit consent and role-based access.

### Phase 2 FERPA Operational Readiness Workflow

- Before enabling any school/coach integration, the team must complete a FERPA readiness checklist with 100% completion sign-off.
- Required checklist controls:
  - Written parent consent capture and storage for education-record processing use cases.
  - Role-based access policy for school/coach viewers with least-privilege defaults.
  - Education-record access logs retained for at least 12 months and reviewable by authorized administrators.
  - Parent data-rights process for record review/export and deletion request handling with documented turnaround targets.
  - Incident-response runbook for education-record exposure events with notification and containment procedures.
- Go-live gate: school/coach integrations remain blocked until checklist sign-off and dry-run verification are both complete.

### Risk Mitigations

- Risk: child pressure or shame from streak loss.
  - Mitigation: grace-day system, recovery messaging, and effort-first language.
- Risk: privacy over-collection in child product.
  - Mitigation: strict data minimization and no behavioral ad-tech stack.
- Risk: parent distrust if streak appears unfair.
  - Mitigation: transparent streak history and rule explanation UI.
- Risk: reward system becomes extrinsic-only motivation.
  - Mitigation: pair reward milestones with identity reinforcement prompts (you showed up consistently).

## Mobile App Specific Requirements

### Project-Type Overview

The product will be implemented as a cross-platform mobile application using React Native + Expo, targeting Android and iOS from a single codebase. Android is primary for initial real-world usage, with iOS parity required for household adoption. Phase 1 distribution will use Expo Go for development, Android APK sideloading for pilot use, and iOS TestFlight for pilot use. Public App Store and Google Play submission is deferred to Phase 2.

### Technical Architecture Considerations

- Cross-platform framework:
  - React Native + Expo as the default app runtime and build system.
  - Shared UI and business logic across Android and iOS.
- Offline-first architecture:
  - Daily check-in, streak tracking, and learning-card flows must function with zero connectivity.
  - Core streak and reward state must be computed locally and persist across app restarts.
  - Local persistence must be durable and recoverable for child-facing trust.
- Notification architecture:
  - MVP includes one daily reminder notification per child profile at a parent-configured time.
  - Use Expo Notifications with platform-safe defaults.
  - Notification UX must remain simple: one schedule per child, no complex campaign logic.
- Device capability model:
  - No camera, microphone, geolocation, or biometric dependencies in MVP.
  - Primary interaction mode is touch/tap.
  - Optional haptic feedback on completion is allowed as a lightweight reinforcement pattern.
- Permission strategy:
  - Avoid requesting sensitive permissions in MVP.
  - Request only permissions strictly required for notifications (if enabled by parent/setup flow).

### Platform Requirements

- Must run on both:
  - Android phones (primary target)
  - iOS devices including iPad
- One codebase must maintain feature parity for core habit flows across both platforms.
- Responsive layout must support child-friendly interaction zones across phone and tablet form factors.

### Device Permissions & Privacy

- No personal account creation in MVP.
- No cloud data transmission in MVP.
- No third-party analytics/ad SDKs in child-facing core flow.
- Data remains on-device in Phase 1.
- If notifications are enabled, permission prompt must be contextual and parent-mediated.

### Offline Mode Requirements

- Full offline operation is mandatory for:
  - Daily pushup logging
  - Daily learning entry
  - Streak/grace-day calculations
  - Reward milestone progression and unlock state
- All state transitions must be deterministic and consistent without server dependency.
- App restart must not lose day-level progress or streak history.

### Push Strategy

- Include MVP daily reminder:
  - Message example: "Time to check your habits!"
  - Configurable per child at setup, then editable or disableable per child in settings.
- No advanced segmentation or multi-reminder orchestration in MVP.
- Reminder failures must not block manual check-in completion.

### Store Compliance Requirements

- Product store submission is deferred to Phase 2 after pilot validation.
- Child-directed compliance posture must be explicitly documented:
  - COPPA-aligned handling for under-13 audience
  - GDPR-K readiness considerations for future account/sync evolution
- Phase 1 reduced compliance risk is based on:
  - No accounts
  - No off-device data transfer
  - No ad-tech tracking
- Architecture must preserve a compliant migration path for Phase 2 cloud sync and parent accounts.

### Implementation Considerations

- Keep MVP implementation narrow to de-risk pilot reliability:
  - Focus on stable daily loop, streak fairness, and reward unlock reliability.
  - Avoid introducing optional features that trigger extra permissions/compliance complexity.
- Add explicit architecture note:
  - Phase 2 backend/account model must be designed with child privacy by default, including consent, deletion, and data minimization controls.

### Family Calendar Visual Reference

- Reference design Image_2.png is the canonical visual specification for FR53-FR59 (monthly grid, color-coded member events, habits/chores table, legend, and upcoming notes panel).

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

MVP Approach: Problem-solving + behavior-validation MVP.
Ship the smallest product that proves kids 8-12 will repeat a daily ritual and form identity-linked consistency.

Resource Requirements:

1. Mobile engineer (React Native + Expo)
2. Product/design owner (child UX + behavior loop tuning)
3. QA support (offline reliability, streak fairness, cross-device checks)

### MVP Feature Set (Phase 1)

Core User Journeys Supported:

1. Child completes daily pushup + learning check-in in under 2 minutes.
2. Child recovers from a missed day through grace logic.
3. Parent configures reward and reinforces progress weekly.
4. Parent resolves streak confusion through transparent history/rules.

Must-Have Capabilities:

1. Cross-platform app (Android + iOS, one codebase via Expo)
2. Full offline daily loop and local persistence
3. Deterministic streak + 1-2 grace-day logic
4. 7-day reward unlock animation with parent-defined reward
5. Goal calendar progression visualization
6. One configurable daily reminder notification per child profile (disableable per child)
7. Child-safe, low-reading UI with clear feedback states
8. Transparent streak history/rule explanation
9. No accounts, no cloud sync, no ad-tech, minimal permissions

Phase 1 distribution strategy:

- Expo Go for development iteration
- Direct APK sideload for Android pilot distribution
- TestFlight distribution for iPad pilot users
- Apple App Store and Google Play submission deferred to Phase 2

### Post-MVP Features

Phase 2 (Growth):

1. Parent dashboard and trends
2. Cloud sync and parent/child account model
3. Multi-child management
4. Expanded habit templates
5. Smarter reminder controls
6. Store submission hardening and compliance packaging for App Store and Google Play

Phase 3 (Expansion):

1. Identity-coaching loops and adaptive plans
2. Cross-device longitudinal insights
3. School/coach integrations with explicit consent and role controls
4. Family-level progression and advanced reward ecosystems

### Risk Mitigation Strategy

Technical Risks:

1. Risk: streak inconsistency across restarts/offline states
2. Mitigation: deterministic local event model with explainable calculations and integrity checks

Market Risks:

1. Risk: kids engage for novelty then churn
2. Mitigation: validate week-4 retention and grace-day recovery early; tune reward cadence and messaging before feature expansion

Resource Risks:

1. Risk: team capacity too small for all planned MVP details
2. Mitigation: preserve only core loop + streak fairness + reward unlock; defer dashboards/sync/integrations

Critical boundary check:

If a feature does not directly improve daily completion, streak trust, or identity reinforcement in month 1, it is not MVP.

## Functional Requirements

### Child Onboarding and Identity Setup

- FR1: A parent user can complete the first-time setup flow in one uninterrupted session by entering required setup data (family name, at least 2 child profiles, and initial habit/reward configuration).
- FR2: Child users can select or customize a profile avatar.
- FR3: Child users can view their current habit identity status at app entry.
- FR4: Child users can use the app without creating an account in Phase 1.

### Daily Habit Check-in

- FR5: Child users can log daily physical habit completion.
- FR6: Child users can record one daily learning entry.
- FR7: Child users can complete both daily habit actions as part of a single daily check-in routine.
- FR8: Child users can view whether today's check-in is complete or incomplete.
- FR9: Child users can correct or update a same-day check-in entry.
- FR10: Child users can submit a daily check-in while offline.

### Streak, Grace, and Recovery Logic

- FR11: The system can calculate and maintain each child's consecutive-day streak state.
- FR12: The system can apply grace-day rules when a daily check-in is missed.
- FR13: Child users can recover streak continuity when grace-day recovery conditions are met.
- FR14: The system can reset streak status when grace-day limits are exceeded.
- FR15: Child users can view the reason a streak was preserved, recovered, or reset in a child-accessible transparency view.
- FR15a: Parent users can view the same streak-reason transparency only within local setup/settings context on-device, without requiring a parent account or separate parent dashboard.
- FR16: Child users can view current grace-day availability status.

### Motivation, Rewards, and Progress Visibility

- FR17: Child users can view progress toward a parent-defined reward milestone.
- FR18: The system can trigger a milestone reward-unlock experience when streak criteria are met.
- FR19: Child users can view the currently configured reward goal.
- FR20: Child users can view a calendar-style progression of habit completion history.
- FR21: Child users can receive positive reinforcement feedback after daily check-in completion.
- FR22: The system can present recovery encouragement messaging after missed days.
- FR45: The system can display a mascot character that visually evolves based on cumulative streak and completion progress.

### Parent Configuration and Reinforcement

- FR23a: Parent users can complete reward and habit configuration during a one-time device setup flow before child onboarding begins.
- FR23: Parent users can configure a reward goal for a child profile.
- FR24: Parent users can define or update the milestone target used for reward unlock.
- FR25: Parent users can configure daily reminder timing for a child device.
- FR26: Parent users can view a weekly consistency summary that includes, per child, weekly completion percentage, current streak status, and missed-day count.
- FR27: Parent users can access guidance prompts for effort-first reinforcement language.
- FR28: Parent users can manage key Phase 1 settings without requiring cloud connectivity.

### Family Definition and Profile System

- FR47: A parent user can define a Family Profile during device setup, including a family name and one optional family photo.
- FR48: A parent user can define 2-6 child profiles within the family, each with name, age, avatar/color, and its own habit configuration.
- FR49: When the app is launched, users can access a Profile Picker screen showing all defined family member profiles as tappable cards; selecting a profile enters that child's individual habit view without requiring login.
- FR50: Each child profile can operate independently with its own streak, check-in history, reward goal, and grace-day state.
- FR51: A parent user can add, edit, or remove child profiles from a protected settings area that requires local parent verification before profile-management actions are applied.
- FR52: Each child profile can have a unique color identifier that is used consistently across calendar, habit tracker, and key/legend views.

### Family Calendar View

- FR53: The app can include a dedicated Family Calendar view accessible from the Profile Picker screen before selecting an individual child profile.
- FR54: The Family Calendar view can display a monthly calendar grid (Monday-Sunday) where each day shows events and check-in status for all family members, color-coded by each child's assigned color.
- FR55: The Family Calendar view can include a color-coded legend mapping each family member color to name.
- FR56: A parent user can add, edit, and delete shared family events that appear on the calendar distinct from individual child habits.
- FR57: The Family Calendar can display each child's scheduled activities on the correct day in that child's assigned color.
- FR58: The Family Calendar can include a Habits/Chores tracker section below the monthly grid, showing each child's assigned daily habits per day of week with completion indicators.
- FR59: The Family Calendar can include an Upcoming/Notes panel where a parent can add 3-5 short free-text notes or reminders visible on the family view.
- FR60: The Family Calendar view can be fully navigable without selecting an individual child profile and serves as a family-level entry point.

### Learning Content Delivery

- FR46: The system can surface one static learning card per day from a pre-bundled content library, where each card is tagged to one of three age bands (8-9, 10-11, 12) and rendered only for the child's configured band.

### Notifications and Reminders

- FR29: The system can schedule one recurring daily reminder notification per child profile.
- FR30: Child users can continue habit check-ins even if notifications are disabled or unavailable.
- FR31: Parent users can update reminder timing and enable/disable reminders per child profile after initial setup.

### History, Transparency, and Supportability

- FR32: Child and parent users can view day-level habit history records.
- FR33: Child and parent users can view transparent streak rule explanations.
- FR34: Parent users can initiate a streak issue report when they believe progress is incorrect.
- FR35: The system can provide diagnostic context sufficient to investigate streak disputes.

### Privacy, Child Safety, and Data Handling

- FR36: The system can operate in Phase 1 without transmitting child habit data to cloud services.
- FR37: The system can minimize stored child data to only what is needed for habit tracking and rewards.
- FR38: The system can avoid third-party behavioral advertising and tracking capabilities in child-facing flows.
- FR39: Parent users can access controls relevant to child data handling in the current phase scope.
- FR40: The product can preserve a migration path for parent consent and child data controls in later cloud-enabled phases.

### Pilot Distribution and Lifecycle

- FR41: The product can be distributed to pilot users via pre-store channels in Phase 1.
- FR42: Parent users can install and run the product on supported Android and iOS devices during pilot.
- FR43: The product can defer public app-store publication capabilities to a post-pilot phase.
- FR44: The product can support transition from pilot distribution to store-submission-ready release scope in Phase 2.

## Non-Functional Requirements

### Performance

- NFR1: App cold start on supported pilot devices must complete within 3 seconds under normal local conditions.
- NFR2: Core daily check-in interactions (log pushups, log learning, submit) must complete within 1 second for 95% of attempts in offline mode.
- NFR3: Streak status and calendar/progress views must render within 1 second for 95% of attempts.
- NFR20: The Family Calendar view must render all family members' data for the current month within 1.5 seconds on supported pilot devices using local data only.

### Reliability

- NFR4: Daily check-in and streak history data must persist across app restarts and device reboots with zero critical data-loss incidents in pilot.
- NFR5: Crash-free session rate must remain at or above 99.5% during pilot.
- NFR6: Streak/grace calculations must be deterministic; identical input history must always produce identical streak outcomes.
- NFR7: Offline-first capability must support 100% of Phase 1 core flows without network dependency.

### Security and Privacy

- NFR8: In Phase 1, child habit data transmission off-device must remain at 0 events per production build as verified by network traffic inspection during release QA.
- NFR9: In Phase 1, third-party ad-tech or behavioral tracking SDK count in child-facing flows must remain 0 as verified by dependency audit for each release.
- NFR10: 100% of locally stored habit and streak records must be encrypted at rest using platform-provided secure storage APIs, as verified by implementation and QA security checklist per release.
- NFR11: In Phase 1, stored child-data fields must be limited to approved minimum dataset (profile metadata, habit events, streak state, reward config) with 0 unauthorized fields in schema audit per release.
- NFR12: Before enabling Phase 2 cloud sync/accounts, architecture review must confirm implemented consent capture, deletion workflow, and retention policy enforcement with 100% checklist completion.

### Accessibility

- NFR13: Core child flows must achieve WCAG 2.1 AA conformance for contrast, readability, and focus/tap operability with 0 critical and 0 high-severity accessibility defects in pre-release audit.
- NFR14: At least 95% of interactive touch targets in core flows must be at least 44x44 dp, with no target below 40x40 dp, as verified by UI inspection on reference devices.
- NFR15: 100% of critical status and error messages (check-in saved, streak changed, grace-day state) must provide non-color cues (text or icon) as verified by accessibility test checklist.

### Distribution and Operability (Phase 1 Pilot)

- NFR16: Internal development builds must be runnable in Expo Go on both Android and iOS for 100% of sprint demos during Phase 1.
- NFR17: Each pilot release cycle must produce one installable Android APK and one TestFlight-ready iOS build that pass smoke tests before distribution.
- NFR18: Rebuilding the same tagged source commit must produce Android and iOS pilot artifacts with matching app version and no release-blocking build variance in CI logs.
- NFR19: Phase 1 quality gates must exclude public App Store/Google Play submission checks, with those checks first required in Phase 2 release checklist.
- NFR21: After initial family setup, app launch must open Profile Picker as default entry in at least 99% of launches on supported pilot devices, while all individual child flows continue to pass regression tests.
