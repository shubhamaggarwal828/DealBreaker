import { Card, PropertyColor, ActionType } from '../types/game';

export interface ColorMeta {
  name: string;
  city: string;
  setSize: number;
  rentTiers: number[]; // Rent at 1, 2, 3, 4 cards
  colorHex: string;
  bgHex: string;
  textColor: string;
}

export const COLOR_METAS: Record<PropertyColor, ColorMeta> = {
  brown: {
    name: 'Brown',
    city: 'Agra & Delhi',
    setSize: 2,
    rentTiers: [1, 2],
    colorHex: '#8B4513',
    bgHex: 'bg-[#8B4513]',
    textColor: 'text-white',
  },
  darkblue: {
    name: 'Dark Blue',
    city: 'Mumbai',
    setSize: 2,
    rentTiers: [3, 8],
    colorHex: '#0038A8',
    bgHex: 'bg-[#0038A8]',
    textColor: 'text-white',
  },
  green: {
    name: 'Green',
    city: 'Bengaluru',
    setSize: 3,
    rentTiers: [2, 4, 7],
    colorHex: '#1E7921',
    bgHex: 'bg-[#1E7921]',
    textColor: 'text-white',
  },
  yellow: {
    name: 'Yellow',
    city: 'Jaipur',
    setSize: 3,
    rentTiers: [2, 4, 6],
    colorHex: '#EAB308',
    bgHex: 'bg-yellow-500',
    textColor: 'text-slate-900',
  },
  red: {
    name: 'Red',
    city: 'Kolkata',
    setSize: 3,
    rentTiers: [2, 3, 6],
    colorHex: '#D91E1E',
    bgHex: 'bg-[#D91E1E]',
    textColor: 'text-white',
  },
  orange: {
    name: 'Orange',
    city: 'Hyderabad',
    setSize: 3,
    rentTiers: [1, 3, 5],
    colorHex: '#F97316',
    bgHex: 'bg-orange-500',
    textColor: 'text-slate-900',
  },
  pink: {
    name: 'Pink',
    city: 'Goa',
    setSize: 3,
    rentTiers: [1, 2, 4],
    colorHex: '#EC4899',
    bgHex: 'bg-pink-500',
    textColor: 'text-white',
  },
  lightblue: {
    name: 'Light Blue',
    city: 'Chennai',
    setSize: 3,
    rentTiers: [1, 2, 3],
    colorHex: '#38BDF8',
    bgHex: 'bg-sky-400',
    textColor: 'text-slate-900',
  },
  railroad: {
    name: 'Indian Railways',
    city: 'Express Lines',
    setSize: 4,
    rentTiers: [1, 2, 3, 4],
    colorHex: '#334155',
    bgHex: 'bg-slate-700',
    textColor: 'text-white',
  },
  utility: {
    name: 'Clean Energy',
    city: 'Power Grid',
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

  // 1. STANDARD PROPERTIES (28 cards) - Iconic Indian Landmarks & Cities
  const standardProps: { name: string; color: PropertyColor; value: number; landmarkId: string; cityName: string }[] = [
    // Brown (2) - Agra & Delhi
    { name: 'Taj Mahal', color: 'brown', value: 1, landmarkId: 'taj_mahal', cityName: 'Agra' },
    { name: 'Red Fort', color: 'brown', value: 1, landmarkId: 'red_fort', cityName: 'Delhi' },
    // Dark Blue (2) - Mumbai
    { name: 'Gateway of India', color: 'darkblue', value: 4, landmarkId: 'gateway_of_india', cityName: 'Mumbai' },
    { name: 'Marine Drive', color: 'darkblue', value: 4, landmarkId: 'marine_drive', cityName: 'Mumbai' },
    // Green (3) - Bengaluru
    { name: 'Vidhana Soudha', color: 'green', value: 4, landmarkId: 'vidhana_soudha', cityName: 'Bengaluru' },
    { name: 'Cubbon Park', color: 'green', value: 4, landmarkId: 'cubbon_park', cityName: 'Bengaluru' },
    { name: 'MG Road', color: 'green', value: 4, landmarkId: 'mg_road', cityName: 'Bengaluru' },
    // Yellow (3) - Jaipur
    { name: 'Hawa Mahal', color: 'yellow', value: 3, landmarkId: 'hawa_mahal', cityName: 'Jaipur' },
    { name: 'Amber Fort', color: 'yellow', value: 3, landmarkId: 'amber_fort', cityName: 'Jaipur' },
    { name: 'City Palace', color: 'yellow', value: 3, landmarkId: 'city_palace', cityName: 'Jaipur' },
    // Red (3) - Kolkata
    { name: 'Victoria Memorial', color: 'red', value: 3, landmarkId: 'victoria_memorial', cityName: 'Kolkata' },
    { name: 'Howrah Bridge', color: 'red', value: 3, landmarkId: 'howrah_bridge', cityName: 'Kolkata' },
    { name: 'Park Street', color: 'red', value: 3, landmarkId: 'park_street', cityName: 'Kolkata' },
    // Orange (3) - Hyderabad
    { name: 'Charminar', color: 'orange', value: 2, landmarkId: 'charminar', cityName: 'Hyderabad' },
    { name: 'Golconda Fort', color: 'orange', value: 2, landmarkId: 'golconda_fort', cityName: 'Hyderabad' },
    { name: 'HITEC City', color: 'orange', value: 2, landmarkId: 'hitec_city', cityName: 'Hyderabad' },
    // Pink (3) - Goa
    { name: 'Calangute Beach', color: 'pink', value: 2, landmarkId: 'calangute_beach', cityName: 'Goa' },
    { name: 'Basilica of Bom Jesus', color: 'pink', value: 2, landmarkId: 'basilica_bom_jesus', cityName: 'Goa' },
    { name: 'Fort Aguada', color: 'pink', value: 2, landmarkId: 'fort_aguada', cityName: 'Goa' },
    // Light Blue (3) - Chennai
    { name: 'Marina Beach', color: 'lightblue', value: 1, landmarkId: 'marina_beach', cityName: 'Chennai' },
    { name: 'Kapaleeshwarar Temple', color: 'lightblue', value: 1, landmarkId: 'kapaleeshwarar_temple', cityName: 'Chennai' },
    { name: 'Shore Temple', color: 'lightblue', value: 1, landmarkId: 'shore_temple', cityName: 'Mahabalipuram' },
    // Railroads (4) - Indian Railways Express Lines
    { name: 'Vande Bharat Express', color: 'railroad', value: 2, landmarkId: 'vande_bharat', cityName: 'Indian Railways' },
    { name: 'Rajdhani Express', color: 'railroad', value: 2, landmarkId: 'rajdhani_express', cityName: 'Indian Railways' },
    { name: 'Shatabdi Express', color: 'railroad', value: 2, landmarkId: 'shatabdi_express', cityName: 'Indian Railways' },
    { name: 'Duronto Express', color: 'railroad', value: 2, landmarkId: 'duronto_express', cityName: 'Indian Railways' },
    // Utilities (2) - Clean Energy & Power
    { name: 'Bhadla Solar Park', color: 'utility', value: 2, landmarkId: 'bhadla_solar', cityName: 'Clean Energy' },
    { name: 'Tehri Hydro Dam', color: 'utility', value: 2, landmarkId: 'tehri_dam', cityName: 'Clean Energy' },
  ];

  standardProps.forEach((prop) => {
    cards.push({
      id: uid('prop'),
      name: prop.name,
      type: 'property',
      value: prop.value,
      mainColor: prop.color,
      landmarkId: prop.landmarkId,
      cityName: prop.cityName,
      description: `Property card in ${prop.cityName}. Part of ${COLOR_METAS[prop.color].name} set (${COLOR_METAS[prop.color].setSize} needed).`,
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
      desc: 'Demand ₹5 Cr from any ONE player.',
    },
    {
      name: "It's My Birthday",
      actionType: 'its_my_birthday',
      value: 2,
      count: 3,
      desc: 'All players must pay you ₹2 Cr as a birthday gift!',
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
      desc: 'Add to any completed property set (except Railroads & Utilities) to increase rent by ₹3 Cr.',
    },
    {
      name: 'Hotel',
      actionType: 'hotel',
      value: 4,
      count: 2,
      desc: 'Add to any completed property set with a House to increase rent by an additional ₹4 Cr.',
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

  // 5. MONEY CARDS (20 cards) - Indian Rupees Crores (₹ Cr)
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
        name: `₹${value} Cr Cash`,
        type: 'money',
        value,
        description: `Deposit in your bank to pay rents and debts. Worth ₹${value} Cr.`,
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
