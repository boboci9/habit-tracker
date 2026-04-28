export type LearningCardAgeBand = '8-9' | '10-11' | '12';

export type LearningCardContent = {
  id: string;
  title: string;
  body: string;
  ageBand: LearningCardAgeBand;
  approved: boolean;
  resolved: boolean;
};

export function mapAgeToLearningBand(age: number): LearningCardAgeBand {
  const normalized = Number.isFinite(age) ? Math.trunc(age) : 8;

  if (normalized <= 9) {
    return '8-9';
  }

  if (normalized <= 11) {
    return '10-11';
  }

  return '12';
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isGovernanceEligibleCard(card: LearningCardContent): boolean {
  return (
    isNonEmpty(card.id) &&
    isNonEmpty(card.title) &&
    isNonEmpty(card.body) &&
    (card.ageBand === '8-9' || card.ageBand === '10-11' || card.ageBand === '12') &&
    card.approved === true &&
    card.resolved === true
  );
}

export function filterEligibleCardsByBand(
  cards: LearningCardContent[],
  ageBand: LearningCardAgeBand
): LearningCardContent[] {
  return cards
    .filter((card) => isGovernanceEligibleCard(card) && card.ageBand === ageBand)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function selectDailyLearningCard(args: {
  profileId: string;
  dateKey: string;
  ageBand: LearningCardAgeBand;
  cards: LearningCardContent[];
}): LearningCardContent | null {
  const eligible = filterEligibleCardsByBand(args.cards, args.ageBand);
  if (eligible.length === 0) {
    return null;
  }

  const seed = `${args.profileId.trim()}:${args.dateKey.trim()}:${args.ageBand}`;
  const index = hashString(seed) % eligible.length;
  return eligible[index];
}
