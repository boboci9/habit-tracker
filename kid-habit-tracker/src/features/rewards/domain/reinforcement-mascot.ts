export type MascotStageKey = 'seed' | 'sprout' | 'streaker' | 'champion';

export type MascotStage = {
  key: MascotStageKey;
  label: string;
  minimumCompletedCheckins: number;
};

export type ReinforcementMessage = {
  variant: 'success' | 'recovery';
  title: string;
  body: string;
};

type ReinforcementInput = {
  hasSubmittedToday: boolean;
  streakStatus: 'no-data' | 'active' | 'grace-active' | 'recovered' | 'reset';
  streakTransition: 'none' | 'maintained' | 'recovered' | 'reset';
  currentStreak: number;
  statusReason: string;
};

const MASCOT_STAGES: MascotStage[] = [
  { key: 'seed', label: 'Seed', minimumCompletedCheckins: 0 },
  { key: 'sprout', label: 'Sprout', minimumCompletedCheckins: 3 },
  { key: 'streaker', label: 'Streaker', minimumCompletedCheckins: 7 },
  { key: 'champion', label: 'Champion', minimumCompletedCheckins: 14 },
];

export function resolveMascotStage(completedCheckins: number): MascotStage {
  const normalized = Number.isFinite(completedCheckins) ? Math.max(0, Math.trunc(completedCheckins)) : 0;

  let resolved = MASCOT_STAGES[0];
  for (const stage of MASCOT_STAGES) {
    if (normalized >= stage.minimumCompletedCheckins) {
      resolved = stage;
    }
  }

  return resolved;
}

export function resolveReinforcementMessage(input: ReinforcementInput): ReinforcementMessage | null {
  if (!input.hasSubmittedToday) {
    return null;
  }

  if (input.streakStatus === 'recovered' || input.streakTransition === 'recovered') {
    return {
      variant: 'recovery',
      title: 'Great comeback!',
      body: `You bounced back after a missed day. ${input.statusReason}`,
    };
  }

  if (input.streakStatus === 'reset' || input.streakTransition === 'reset') {
    return {
      variant: 'recovery',
      title: 'Fresh start unlocked',
      body: `A new streak starts today. ${input.statusReason}`,
    };
  }

  return {
    variant: 'success',
    title: 'Nice work today!',
    body: `Current streak: ${Math.max(0, input.currentStreak)} day(s). Keep going!`,
  };
}
