export type PropertyColor =
  | 'brown'
  | 'darkblue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'orange'
  | 'pink'
  | 'lightblue'
  | 'railroad'
  | 'utility';

export type CardType = 'property' | 'wildcard' | 'action' | 'rent' | 'money';

export type ActionType =
  | 'deal_breaker'
  | 'just_say_no'
  | 'sly_deal'
  | 'forced_deal'
  | 'debt_collector'
  | 'its_my_birthday'
  | 'pass_go'
  | 'house'
  | 'hotel'
  | 'double_the_rent';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  value: number; // Value in Indian Rupees Crores (₹ Cr) when banked
  description?: string;
  
  // Property & Wildcard specifics
  mainColor?: PropertyColor;
  colors?: PropertyColor[]; // for dual wildcards or rent cards
  isMultiWildcard?: boolean; // 10-color wildcard (value 0)
  landmarkId?: string; // ID of iconic Indian monument / landmark
  cityName?: string; // Indian city name (e.g. Agra, Mumbai, Delhi, Bengaluru)
  
  // Action specifics
  actionType?: ActionType;
  
  // Rent specifics
  isWildRent?: boolean; // Rent for any color
}

export interface PropertyCardInSet {
  card: Card;
  currentColor: PropertyColor; // For wildcards that can switch colors
}

export interface PropertySet {
  id: string;
  color: PropertyColor;
  cards: PropertyCardInSet[];
  hasHouse?: boolean;
  hasHotel?: boolean;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  isBot?: boolean;
  hand: Card[];
  bank: Card[];
  propertySets: PropertySet[];
}

export interface PendingPayment {
  fromPlayerId: string;
  toPlayerId: string;
  amountOwed: number;
  reason: string;
}

export interface PendingAction {
  id: string;
  sourcePlayerId: string;
  targetPlayerId?: string;
  actionCard: Card;
  rentColor?: PropertyColor;
  rentAmount?: number;
  isDoubleRent?: boolean;
  targetSetId?: string;
  targetCardId?: string;
  offeredCardId?: string;
  // Just Say No chain
  canBeCounteredBy?: string[]; // Player IDs that can play Just Say No
  counterChain: {
    playerId: string;
    card: Card;
  }[];
  expiresAt?: number;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  text: string;
  type: 'action' | 'payment' | 'info' | 'system' | 'alert';
}

export interface ActionStatusMessage {
  title: string;
  subtitle: string;
  type: 'action' | 'payment' | 'info' | 'system' | 'alert' | 'success';
}

export interface GameState {
  roomCode: string;
  status: 'lobby' | 'playing' | 'game_over';
  players: Player[];
  currentTurnIndex: number;
  turnPhase: 'draw' | 'play' | 'discard';
  cardsPlayedThisTurn: number;
  drawPileCount: number;
  discardPile: Card[];
  pendingAction: PendingAction | null;
  pendingPayments: PendingPayment[];
  actionStatus?: ActionStatusMessage | null;
  isActionResolving?: boolean;
  winnerId: string | null;
  logs: GameLogEntry[];
}

// Client to Host network messages
export type ClientMessage =
  | { type: 'JOIN'; playerName: string }
  | { type: 'START_GAME' }
  | { type: 'PLAY_TO_BANK'; cardId: string }
  | { type: 'PLAY_TO_PROPERTY'; cardId: string; targetColor?: PropertyColor; targetSetId?: string }
  | { type: 'FLIP_WILDCARD'; cardId: string; setId: string; newColor: PropertyColor }
  | { type: 'PLAY_ACTION'; cardId: string; targetPlayerId?: string; targetSetId?: string; targetCardId?: string; offeredCardId?: string; rentColor?: PropertyColor }
  | { type: 'RESOLVE_JUST_SAY_NO'; playCard: boolean; cardId?: string }
  | { type: 'PAY_DEBT'; cardIdsFromBank: string[]; propertyPayment: { setId: string; cardId: string }[] }
  | { type: 'DISCARD_CARDS'; cardIds: string[] }
  | { type: 'END_TURN' }
  | { type: 'RESTART_GAME' };

// Host to Client network messages
export type HostMessage =
  | { type: 'SYNC_STATE'; state: GameState; yourPlayerId: string }
  | { type: 'ERROR'; message: string };
