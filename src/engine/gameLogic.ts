import {
  Card,
  GameState,
  Player,
  PropertyColor,
  PropertySet,
  PendingPayment,
  PendingAction,
  GameLogEntry,
} from '../types/game';
import { createFullDeck, shuffleDeck, COLOR_METAS, calculateBaseRent } from './deck';

function makeId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

export function isSetComplete(set: PropertySet): boolean {
  const meta = COLOR_METAS[set.color];
  if (!meta) return false;
  return set.cards.length >= meta.setSize;
}

export function getCompletedSetCount(player: Player): number {
  const completedColors = new Set<PropertyColor>();
  for (const set of player.propertySets) {
    if (isSetComplete(set)) {
      completedColors.add(set.color);
    }
  }
  return completedColors.size;
}

export function checkWin(state: GameState): GameState {
  for (const player of state.players) {
    if (getCompletedSetCount(player) >= 3) {
      return {
        ...state,
        status: 'game_over',
        winnerId: player.id,
        logs: [
          ...state.logs,
          {
            id: makeId('log'),
            timestamp: Date.now(),
            text: `🏆 ${player.name} has collected 3 FULL PROPERTY SETS and won the game! 🎉`,
            type: 'alert',
          },
        ],
      };
    }
  }
  return state;
}

export function initGame(playerInfos: { id: string; name: string; isHost: boolean }[], roomCode: string): GameState {
  const fullDeck = shuffleDeck(createFullDeck());
  
  // Deal 5 cards to each player
  const players: Player[] = playerInfos.map((p) => {
    const hand = fullDeck.splice(0, 5);
    return {
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isConnected: true,
      hand,
      bank: [],
      propertySets: [],
    };
  });

  const state: GameState = {
    roomCode,
    status: 'playing',
    players,
    currentTurnIndex: 0,
    turnPhase: 'draw',
    cardsPlayedThisTurn: 0,
    drawPileCount: fullDeck.length,
    discardPile: [],
    pendingAction: null,
    pendingPayments: [],
    winnerId: null,
    logs: [
      {
        id: makeId('log'),
        timestamp: Date.now(),
        text: `Game started! 5 cards dealt to each player. First turn: ${players[0].name}.`,
        type: 'system',
      },
    ],
  };

  // Automatically trigger draw for first player
  return handleDrawTurn(state, fullDeck);
}

export function handleDrawTurn(state: GameState, remainingDeck?: Card[]): GameState {
  if (state.status !== 'playing') return state;

  const activePlayer = state.players[state.currentTurnIndex];
  if (!activePlayer) return state;

  // Deck handling
  let deck = remainingDeck;
  if (!deck) {
    // If we need to pull from draw pile
    // In our simplified state, host retains draw deck in memory or we rebuild from discard if empty
    deck = [];
  }

  // Draw 2 cards (or 5 if hand is completely empty!)
  const drawCount = activePlayer.hand.length === 0 ? 5 : 2;
  
  // We will handle actual card drawing in the Host loop which maintains the full draw pile
  return {
    ...state,
    turnPhase: 'play',
    cardsPlayedThisTurn: 0,
    logs: [
      ...state.logs,
      {
        id: makeId('log'),
        timestamp: Date.now(),
        text: `${activePlayer.name}'s turn. Drew ${drawCount} cards. (3 plays available)`,
        type: 'info',
      },
    ],
  };
}

export function playToBank(state: GameState, playerId: string, cardId: string): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return state;
  const card = player.hand[cardIndex];

  // Cannot bank multi-wildcard (value 0)
  if (card.value <= 0) return state;

  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);
  const newBank = [...player.bank, card];

  const updatedPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, hand: newHand, bank: newBank } : p
  );

  const updatedState: GameState = {
    ...state,
    players: updatedPlayers,
    cardsPlayedThisTurn: state.cardsPlayedThisTurn + 1,
    logs: [
      ...state.logs,
      {
        id: makeId('log'),
        timestamp: Date.now(),
        text: `${player.name} banked ${card.name} (+₹${card.value} Cr to bank).`,
        type: 'action',
      },
    ],
  };

  return checkWin(updatedState);
}

export function playToProperty(
  state: GameState,
  playerId: string,
  cardId: string,
  targetColor?: PropertyColor,
  targetSetId?: string
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const cardIndex = player.hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return state;
  const card = player.hand[cardIndex];

  // Must be property, wildcard, house, or hotel
  const isProp = card.type === 'property' || card.type === 'wildcard';
  const isHouse = card.type === 'action' && card.actionType === 'house';
  const isHotel = card.type === 'action' && card.actionType === 'hotel';

  if (!isProp && !isHouse && !isHotel) return state;

  let newPropertySets = [...player.propertySets];

  // Handling House / Hotel
  if (isHouse) {
    if (!targetSetId) return state;
    const targetSetIndex = newPropertySets.findIndex((s) => s.id === targetSetId);
    if (targetSetIndex === -1) return state;
    const targetSet = newPropertySets[targetSetIndex];
    if (targetSet.color === 'railroad' || targetSet.color === 'utility') return state;
    if (!isSetComplete(targetSet) || targetSet.hasHouse) return state;

    newPropertySets[targetSetIndex] = { ...targetSet, hasHouse: true };
  } else if (isHotel) {
    if (!targetSetId) return state;
    const targetSetIndex = newPropertySets.findIndex((s) => s.id === targetSetId);
    if (targetSetIndex === -1) return state;
    const targetSet = newPropertySets[targetSetIndex];
    if (!targetSet.hasHouse || targetSet.hasHotel) return state;

    newPropertySets[targetSetIndex] = { ...targetSet, hasHotel: true };
  } else {
    // Normal property or wildcard
    let colorToUse: PropertyColor | undefined = targetColor;
    if (!colorToUse) {
      if (card.mainColor) colorToUse = card.mainColor;
      else if (card.colors && card.colors.length > 0) colorToUse = card.colors[0];
      else colorToUse = 'brown'; // fallback for multi-wildcard
    }

    // Find an existing incomplete set of this color, or targetSetId
    let setIndex = -1;
    if (targetSetId) {
      setIndex = newPropertySets.findIndex((s) => s.id === targetSetId);
    } else {
      setIndex = newPropertySets.findIndex((s) => s.color === colorToUse && !isSetComplete(s));
    }

    if (setIndex !== -1 && newPropertySets[setIndex].color === colorToUse) {
      // Add to existing set
      const currentSet = newPropertySets[setIndex];
      newPropertySets[setIndex] = {
        ...currentSet,
        cards: [...currentSet.cards, { card, currentColor: colorToUse }],
      };
    } else {
      // Create new set of this color
      newPropertySets.push({
        id: makeId('set'),
        color: colorToUse,
        cards: [{ card, currentColor: colorToUse }],
      });
    }
  }

  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);

  const updatedPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, hand: newHand, propertySets: newPropertySets } : p
  );

  const updatedState: GameState = {
    ...state,
    players: updatedPlayers,
    cardsPlayedThisTurn: state.cardsPlayedThisTurn + 1,
    logs: [
      ...state.logs,
      {
        id: makeId('log'),
        timestamp: Date.now(),
        text: `${player.name} played ${card.name} to properties.`,
        type: 'action',
      },
    ],
  };

  return checkWin(updatedState);
}

export function flipWildcard(
  state: GameState,
  playerId: string,
  cardId: string,
  setId: string,
  newColor: PropertyColor
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const setIndex = player.propertySets.findIndex((s) => s.id === setId);
  if (setIndex === -1) return state;
  const currentSet = player.propertySets[setIndex];

  const cardIndex = currentSet.cards.findIndex((c) => c.card.id === cardId);
  if (cardIndex === -1) return state;
  const targetCardEntry = currentSet.cards[cardIndex];

  // Validate that the wildcard actually supports newColor
  if (
    !targetCardEntry.card.isMultiWildcard &&
    (!targetCardEntry.card.colors || !targetCardEntry.card.colors.includes(newColor))
  ) {
    return state;
  }

  // Remove from old set
  const updatedOldSetCards = [...currentSet.cards];
  updatedOldSetCards.splice(cardIndex, 1);

  let newPropertySets = [...player.propertySets];
  if (updatedOldSetCards.length === 0) {
    newPropertySets.splice(setIndex, 1);
  } else {
    newPropertySets[setIndex] = { ...currentSet, cards: updatedOldSetCards };
  }

  // Add to target color set (existing or new)
  const targetSetIndex = newPropertySets.findIndex((s) => s.color === newColor && !isSetComplete(s));
  if (targetSetIndex !== -1) {
    newPropertySets[targetSetIndex] = {
      ...newPropertySets[targetSetIndex],
      cards: [...newPropertySets[targetSetIndex].cards, { card: targetCardEntry.card, currentColor: newColor }],
    };
  } else {
    newPropertySets.push({
      id: makeId('set'),
      color: newColor,
      cards: [{ card: targetCardEntry.card, currentColor: newColor }],
    });
  }

  const updatedPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, propertySets: newPropertySets } : p
  );

  return checkWin({
    ...state,
    players: updatedPlayers,
    logs: [
      ...state.logs,
      {
        id: makeId('log'),
        timestamp: Date.now(),
        text: `${player.name} moved wildcard to ${COLOR_METAS[newColor].name}.`,
        type: 'action',
      },
    ],
  });
}

export function calculateTotalRent(set: PropertySet, isDoubleRent = false): number {
  let rent = calculateBaseRent(set.color, set.cards.length);
  if (set.hasHouse) rent += 3;
  if (set.hasHotel) rent += 4;
  if (isDoubleRent) rent *= 2;
  return rent;
}

export function executeDebtPayment(
  state: GameState,
  fromPlayerId: string,
  cardIdsFromBank: string[],
  propertyPayments: { setId: string; cardId: string }[]
): GameState {
  const paymentIndex = state.pendingPayments.findIndex((p) => p.fromPlayerId === fromPlayerId);
  if (paymentIndex === -1) return state;
  const payment = state.pendingPayments[paymentIndex];

  const debtor = state.players.find((p) => p.id === fromPlayerId);
  const creditor = state.players.find((p) => p.id === payment.toPlayerId);
  if (!debtor || !creditor) return state;

  // Transfer bank cards
  const transferredBankCards: Card[] = [];
  const remainingDebtorBank = debtor.bank.filter((c) => {
    if (cardIdsFromBank.includes(c.id)) {
      transferredBankCards.push(c);
      return false;
    }
    return true;
  });

  // Transfer property cards
  const transferredProps: { card: Card; color: PropertyColor }[] = [];
  let remainingDebtorProps = [...debtor.propertySets];

  for (const item of propertyPayments) {
    const sIdx = remainingDebtorProps.findIndex((s) => s.id === item.setId);
    if (sIdx !== -1) {
      const s = remainingDebtorProps[sIdx];
      const cIdx = s.cards.findIndex((c) => c.card.id === item.cardId);
      if (cIdx !== -1) {
        transferredProps.push({ card: s.cards[cIdx].card, color: s.cards[cIdx].currentColor });
        const updatedCards = [...s.cards];
        updatedCards.splice(cIdx, 1);
        if (updatedCards.length === 0) {
          remainingDebtorProps.splice(sIdx, 1);
        } else {
          remainingDebtorProps[sIdx] = { ...s, cards: updatedCards };
        }
      }
    }
  }

  // Creditor receives cards
  const updatedCreditorBank = [...creditor.bank, ...transferredBankCards];
  let updatedCreditorProps = [...creditor.propertySets];

  for (const { card, color } of transferredProps) {
    const sIdx = updatedCreditorProps.findIndex((s) => s.color === color && !isSetComplete(s));
    if (sIdx !== -1) {
      updatedCreditorProps[sIdx] = {
        ...updatedCreditorProps[sIdx],
        cards: [...updatedCreditorProps[sIdx].cards, { card, currentColor: color }],
      };
    } else {
      updatedCreditorProps.push({
        id: makeId('set'),
        color,
        cards: [{ card, currentColor: color }],
      });
    }
  }

  const updatedPayments = [...state.pendingPayments];
  updatedPayments.splice(paymentIndex, 1);

  const updatedPlayers = state.players.map((p) => {
    if (p.id === fromPlayerId) {
      return { ...p, bank: remainingDebtorBank, propertySets: remainingDebtorProps };
    }
    if (p.id === payment.toPlayerId) {
      return { ...p, bank: updatedCreditorBank, propertySets: updatedCreditorProps };
    }
    return p;
  });

  const updatedState: GameState = {
    ...state,
    players: updatedPlayers,
    pendingPayments: updatedPayments,
    logs: [
      ...state.logs,
      {
        id: makeId('log'),
        timestamp: Date.now(),
        text: `${debtor.name} paid debt to ${creditor.name} (${transferredBankCards.length} cash + ${transferredProps.length} props).`,
        type: 'payment',
      },
    ],
  };

  return checkWin(updatedState);
}

