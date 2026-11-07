import { Card, PropertyColor, ActionType } from '../types/game';

export interface ColorMeta {
  name: string;
  setSize: number;
  rentTiers: number[]; // Rent at 1, 2, 3, 4 cards
  colorHex: string;
  bgHex: string;
  textColor: string;
}

export const COLOR_METAS: Record<PropertyColor, ColorMeta> = {
  brown: {
    name: 'Brown',
    setSize: 2,
    rentTiers: [1, 2],
    colorHex: '#8B4513',
    bgHex: 'bg-[#8B4513]',
    textColor: 'text-white',
  },
  darkblue: {
    name: 'Dark Blue',
    setSize: 2,
    rentTiers: [3, 8],
    colorHex: '#0038A8',
    bgHex: 'bg-[#0038A8]',
    textColor: 'text-white',
  },
  green: {
    name: 'Green',
    setSize: 3,
    rentTiers: [2, 4, 7],
    colorHex: '#1E7921',
    bgHex: 'bg-[#1E7921]',
    textColor: 'text-white',
  },
  yellow: {
    name: 'Yellow',
    setSize: 3,
    rentTiers: [2, 4, 6],
    colorHex: '#EAB308',
    bgHex: 'bg-yellow-500',
    textColor: 'text-slate-900',
  },
  red: {
    name: 'Red',
    setSize: 3,
    rentTiers: [2, 3, 6],
    colorHex: '#D91E1E',
    bgHex: 'bg-[#D91E1E]',
    textColor: 'text-white',
  },
  orange: {
    name: 'Orange',
    setSize: 3,
    rentTiers: [1, 3, 5],
    colorHex: '#F97316',
    bgHex: 'bg-orange-500',
    textColor: 'text-slate-900',
  },
  pink: {
    name: 'Pink',
    setSize: 3,
    rentTiers: [1, 2, 4],
    colorHex: '#EC4899',
    bgHex: 'bg-pink-500',
    textColor: 'text-white',
  },
  lightblue: {
    name: 'Light Blue',
    setSize: 3,
    rentTiers: [1, 2, 3],
    colorHex: '#38BDF8',
    bgHex: 'bg-sky-400',
    textColor: 'text-slate-900',
  },
  railroad: {
    name: 'Railroad',
    setSize: 4,
    rentTiers: [1, 2, 3, 4],
    colorHex: '#334155',
    bgHex: 'bg-slate-700',
    textColor: 'text-white',
  },
  utility: {
    name: 'Utility',
    setSize: 2,
    rentTiers: [1, 2],
    colorHex: '#64748B',
    bgHex: 'bg-slate-500',
    textColor: 'text-white',
  },
};

export function calculateBaseRent(color: PropertyColor, cardCount: number): number {
  const meta = COLOR_METAS[color];
  if (!meta || cardCount <= 0) return 0;
  const count = Math.min(cardCount, meta.setSize);
  return meta.rentTiers[count - 1] || 0;
}

export function createFullDeck(): Card[] {
  const cards: Card[] = [];
  let idCounter = 1;
  const uid = (prefix: string) => `${prefix}_${idCounter++}`;

  // 1. STANDARD PROPERTIES (28 cards)
  const standardProps: { name: string; color: PropertyColor; value: number }[] = [
    // Brown (2)
    { name: 'Baltic Avenue', color: 'brown', value: 1 },
    { name: 'Mediterranean Avenue', color: 'brown', value: 1 },
    // Dark Blue (2)
    { name: 'Boardwalk', color: 'darkblue', value: 4 },
    { name: 'Park Place', color: 'darkblue', value: 4 },
    // Green (3)
    { name: 'North Carolina Avenue', color: 'green', value: 4 },
    { name: 'Pacific Avenue', color: 'green', value: 4 },
    { name: 'Pennsylvania Avenue', color: 'green', value: 4 },
    // Yellow (3)
    { name: 'Atlantic Avenue', color: 'yellow', value: 3 },
    { name: 'Ventnor Avenue', color: 'yellow', value: 3 },
    { name: 'Marvin Gardens', color: 'yellow', value: 3 },
    // Red (3)
    { name: 'Kentucky Avenue', color: 'red', value: 3 },
    { name: 'Indiana Avenue', color: 'red', value: 3 },
    { name: 'Illinois Avenue', color: 'red', value: 3 },
    // Orange (3)
    { name: 'New York Avenue', color: 'orange', value: 2 },
    { name: 'St. James Place', color: 'orange', value: 2 },
    { name: 'Tennessee Avenue', color: 'orange', value: 2 },
    // Pink (3)
    { name: 'St. Charles Place', color: 'pink', value: 2 },
    { name: 'Virginia Avenue', color: 'pink', value: 2 },
    { name: 'States Avenue', color: 'pink', value: 2 },
    // Light Blue (3)
    { name: 'Connecticut Avenue', color: 'lightblue', value: 1 },
    { name: 'Oriental Avenue', color: 'lightblue', value: 1 },
    { name: 'Vermont Avenue', color: 'lightblue', value: 1 },
    // Railroads (4)
    { name: 'Reading Railroad', color: 'railroad', value: 2 },
    { name: 'Pennsylvania Railroad', color: 'railroad', value: 2 },
    { name: 'B. & O. Railroad', color: 'railroad', value: 2 },
    { name: 'Short Line Railroad', color: 'railroad', value: 2 },
    // Utilities (2)
    { name: 'Electric Company', color: 'utility', value: 2 },
    { name: 'Water Works', color: 'utility', value: 2 },
  ];

  standardProps.forEach((prop) => {
    cards.push({
      id: uid('prop'),
      name: prop.name,
      type: 'property',
      value: prop.value,
      mainColor: prop.color,
      description: `Property card. Part of ${COLOR_METAS[prop.color].name} set (${COLOR_METAS[prop.color].setSize} needed).`,
    });
  });

  // 2. PROPERTY WILDCARDS (11 cards)
  // Multi-color wildcards (2)
  for (let i = 0; i < 2; i++) {
    cards.push({
      id: uid('wild_multi'),
      name: 'Multi-Color Property Wildcard',
      type: 'wildcard',
      value: 0,
      isMultiWildcard: true,
      description: 'Can be used as any property color. Cannot be banked. Move freely on your turn.',
    });
  }

  // Dual-color wildcards (9)
  const dualWilds: { colors: [PropertyColor, PropertyColor]; count: number; value: number }[] = [
    { colors: ['darkblue', 'green'], count: 1, value: 4 },
    { colors: ['green', 'railroad'], count: 1, value: 4 },
    { colors: ['lightblue', 'brown'], count: 1, value: 1 },
    { colors: ['lightblue', 'railroad'], count: 1, value: 4 },
    { colors: ['pink', 'orange'], count: 2, value: 2 },
    { colors: ['red', 'yellow'], count: 2, value: 3 },
    { colors: ['railroad', 'utility'], count: 1, value: 2 },
  ];

  dualWilds.forEach(({ colors, count, value }) => {
    for (let i = 0; i < count; i++) {
      cards.push({
        id: uid('wild_dual'),
        name: `${COLOR_METAS[colors[0]].name} & ${COLOR_METAS[colors[1]].name} Wildcard`,
        type: 'wildcard',
        value,
        colors,
        mainColor: colors[0],
        description: `Can be switched between ${COLOR_METAS[colors[0]].name} and ${COLOR_METAS[colors[1]].name} on your turn.`,
      });
    }
  });

  // 3. ACTION CARDS (34 cards)
  const actions: { name: string; actionType: ActionType; value: number; count: number; desc: string }[] = [
    {
      name: 'Deal Breaker',
      actionType: 'deal_breaker',
      value: 5,
      count: 2,
      desc: 'Steal a complete property set from any player, including any House or Hotel!',
    },
    {
      name: 'Just Say No',
      actionType: 'just_say_no',
      value: 4,
      count: 3,
      desc: 'Cancel any action card played against you! Can be played at any time.',
    },
    {
      name: 'Sly Deal',
      actionType: 'sly_deal',
      value: 3,
      count: 3,
      desc: 'Steal any single property from another player (cannot be from a full set).',
    },
    {
      name: 'Forced Deal',
      actionType: 'forced_deal',
      value: 3,
      count: 3,
      desc: 'Swap one of your properties for another player’s property (cannot be from a full set).',
    },
    {
      name: 'Debt Collector',
      actionType: 'debt_collector',
      value: 5,
      count: 3,
      desc: 'Demand $5M from any ONE player.',
    },
    {
      name: "It's My Birthday",
      actionType: 'its_my_birthday',
      value: 2,
      count: 3,
      desc: 'All players must pay you $2M as a birthday gift!',
    },
    {
      name: 'Pass Go',
      actionType: 'pass_go',
      value: 1,
      count: 10,
      desc: 'Draw 2 extra cards from the draw pile.',
    },
    {
      name: 'House',
      actionType: 'house',
      value: 3,
      count: 3,
      desc: 'Add to any completed property set (except Railroads & Utilities) to increase rent by $3M.',
    },
    {
      name: 'Hotel',
      actionType: 'hotel',
      value: 4,
      count: 2,
      desc: 'Add to any completed property set with a House to increase rent by an additional $4M.',
    },
    {
      name: 'Double The Rent',
      actionType: 'double_the_rent',
      value: 1,
      count: 2,
      desc: 'Play together with a Rent card to double the rent owed!',
    },
  ];

  actions.forEach((act) => {
    for (let i = 0; i < act.count; i++) {
      cards.push({
        id: uid('act'),
        name: act.name,
        type: 'action',
        value: act.value,
        actionType: act.actionType,
        description: act.desc,
      });
    }
  });

  // 4. RENT CARDS (13 cards)
  const rentCards: { colors: [PropertyColor, PropertyColor]; count: number; value: number }[] = [
    { colors: ['darkblue', 'green'], count: 2, value: 1 },
    { colors: ['red', 'yellow'], count: 2, value: 1 },
    { colors: ['pink', 'orange'], count: 2, value: 1 },
    { colors: ['lightblue', 'brown'], count: 2, value: 1 },
    { colors: ['railroad', 'utility'], count: 2, value: 1 },
  ];

  rentCards.forEach(({ colors, count, value }) => {
    for (let i = 0; i < count; i++) {
      cards.push({
        id: uid('rent'),
        name: `${COLOR_METAS[colors[0]].name} & ${COLOR_METAS[colors[1]].name} Rent`,
        type: 'rent',
        value,
        colors,
        description: `All players pay you rent for either ${COLOR_METAS[colors[0]].name} or ${COLOR_METAS[colors[1]].name} properties you own.`,
      });
    }
  });

  // Wild Rent (3 cards)
  for (let i = 0; i < 3; i++) {
    cards.push({
      id: uid('rent_wild'),
      name: 'Wild Rent (Any Color)',
      type: 'rent',
      value: 3,
      isWildRent: true,
      description: 'Force ONE player to pay you rent for ANY color property you own.',
    });
  }

  // 5. MONEY CARDS (20 cards)
  const moneyCards: { value: number; count: number }[] = [
    { value: 1, count: 6 },
    { value: 2, count: 5 },
    { value: 3, count: 3 },
    { value: 4, count: 3 },
    { value: 5, count: 2 },
    { value: 10, count: 1 },
  ];

  moneyCards.forEach(({ value, count }) => {
    for (let i = 0; i < count; i++) {
      cards.push({
        id: uid('money'),
        name: `$${value}M Cash`,
        type: 'money',
        value,
        description: `Deposit in your bank to pay rents and debts. Worth $${value}M.`,
      });
    }
  });

  return cards;
}

export function shuffleDeck<T>(deck: T[]): T[] {
  const array = [...deck];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
