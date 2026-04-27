# Kid Habit Tracker

> A mobile-first habit tracking app for children aged 8–12, built with React Native / Expo using the BMAD AI-assisted development methodology.

---

## What This App Does

Kid Habit Tracker helps children build daily consistency through a simple two-step ritual: log physical effort (pushups) and record one new thing learned. Progress is visualized through streaks, a goal calendar, and a mascot-led reward unlock flow tied to parent-defined goals.

The core design philosophy is **identity formation over task tracking** — the app reinforces the self-story: *"I am the kind of kid who shows up every day."*

### Key Features (Phase 1 MVP)

- **Profile Picker** — multiple child profiles selectable at app launch, no login required
- **Family Setup** — parent defines family name, child profiles, avatars, colors, and habit configuration during first-launch onboarding
- **Family Calendar View** — monthly calendar showing all family members' activities and shared events, color-coded per child
- **Daily Check-in** — log pushups + one learning entry in under 2 minutes
- **Streak Tracking** — consecutive-day streaks with 1–2 grace days for missed check-ins
- **Reward Unlock Flow** — mascot-led animation reveals parent-defined reward at 7-day milestone
- **Grace-Day Recovery** — missed days handled with encouragement, not punishment
- **Offline-First** — all data stored locally on device, no account or internet required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 55) |
| Router | Expo Router v4 |
| Language | TypeScript |
| Styling | NativeWind / global CSS |
| Storage | Local device storage (AsyncStorage) |
| State | React hooks + context |
| Testing | Jest + React Native Testing Library |
| Distribution | Expo Go (dev) / TestFlight + APK sideload (pilot) |

---

## Architecture Decision: No Backend

This is an intentional Phase 1 design decision, not a limitation.

**Reasons:**
- **COPPA alignment** — no child data is transmitted off-device, eliminating under-13 compliance requirements for Phase 1
- **Offline-first reliability** — 100% of core flows work without network connectivity
- **Pilot simplicity** — families can install and run the app without accounts, servers, or connectivity requirements
- **Data minimization** — only habit and streak data needed for the core loop is stored locally

**Phase 2 migration path** — the architecture includes explicit extension points for parental consent, cloud sync, and account models. See `_bmad-output/planning-artifacts/architecture.md` for details.

---

## Getting Started

### Prerequisites

- Node.js v20 (required — v23 is not compatible with Expo SDK 55)
- npm
- Expo Go app on your phone, or Xcode for iOS Simulator

### Node Version Setup

```bash
# If using nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# Make it default for all future terminals
nvm alias default 20
```

### Install & Run

```bash
cd kid-habit-tracker
npm install --legacy-peer-deps
npx expo start
```

Then scan the QR code with Expo Go (requires free Expo account) or press `i` for iOS Simulator.

### Known Setup Notes

- `--legacy-peer-deps` is required due to mixed peer dependency versions in the Expo SDK 55 ecosystem
- A `.npmrc` file with `legacy-peer-deps=true` is included in the project to handle this automatically
- Node v20 LTS is required — v23 causes Metro bundler incompatibilities

---

## Project Structure

```
bmad_habit_tracker/
├── _bmad-output/
│   ├── planning-artifacts/
│   │   ├── product-brief-bmad_habit_tracker.md
│   │   ├── prd.md                          # 62 FRs, 21 NFRs
│   │   ├── architecture.md
│   │   ├── epics.md
│   │   ├── validation-report-2026-04-27.md
│   │   ├── ai-integration-log.md
│   │   └── Image 2.png                     # Canonical family calendar reference
│   └── implementation-artifacts/
│       ├── sprint-status.yaml
│       ├── 1-1-initialize-project-from-approved-starter-template.md
│       └── 1-2-first-launch-family-setup-flow.md
├── kid-habit-tracker/                       # Expo app
│   ├── src/
│   │   ├── app/                            # Expo Router screens
│   │   ├── components/                     # Reusable UI components
│   │   ├── constants/                      # Theme, colors
│   │   ├── hooks/                          # Custom React hooks
│   │   └── global.css
│   ├── tests/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
└── docs/
```

---

## BMAD Artifact Trail

This project was built using the **BMAD (Business-driven Mobile App Development)** AI-assisted methodology. The full artifact trail is in `_bmad-output/planning-artifacts/`:

| Artifact | Description |
|---|---|
| `product-brief` | Initial product vision and problem statement |
| `prd.md` | Full PRD — 62 Functional Requirements, 21 Non-Functional Requirements |
| `architecture.md` | Technical architecture, stack decisions, data model |
| `epics.md` | Epic breakdown with FR traceability |
| `validation-report` | PRD validation pass — all FRs covered, warnings resolved |
| `ai-integration-log.md` | Documented AI agent usage throughout the process |

### FR → Epic → Story Traceability

- FR1–FR4 → Epic 1 (Onboarding) → Story 1-2
- FR47–FR52 → Epic 1 (Family Profiles) → Story 1-2
- FR5–FR10 → Epic 2 (Daily Check-in)
- FR11–FR16 → Epic 3 (Streak Engine)
- FR17–FR22, FR45 → Epic 4 (Motivation & Rewards)
- FR23–FR28 → Epic 5 (Parent Configuration)
- FR53–FR60 → Epic 6 (Family Calendar)

---

## Running Tests

```bash
cd kid-habit-tracker
npm test
```

---

## Limitations & Known Issues

| Item | Detail |
|---|---|
| No backend | By design for Phase 1 — see Architecture Decision above |
| No Docker | Mobile app distributed via Expo/TestFlight/APK, not containerized |
| Node version | Must use Node 20 — Node 23 breaks Metro bundler |
| Expo Go compatibility | Requires Expo account for QR scan with SDK 55 |
| `legacy-peer-deps` | Required due to mixed SDK dependency versions in scaffold |

---

## Phase 2 Roadmap

- Parent dashboard and trends
- Cloud sync with parental consent model
- Expanded habit templates
- Smart reminders
- App Store / Google Play submission
- Printable Family Calendar export

---

## Author

**Bogi** — April 2026  
Built with BMAD methodology and Claude (Anthropic) as primary AI development assistant.