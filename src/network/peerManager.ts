import mqtt, { MqttClient } from 'mqtt';
import { Card, ClientMessage, GameState, HostMessage, Player, PendingAction, PropertyColor } from '../types/game';
import {
  initGame,
  playToBank,
  playToProperty,
  flipWildcard,
  calculateTotalRent,
  executeDebtPayment,
  checkWin,
  isSetComplete,
} from '../engine/gameLogic';
import { createFullDeck, shuffleDeck, COLOR_METAS } from '../engine/deck';

function makeId(prefix = 'p'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 8)}`;
}

// Enterprise public MQTT cloud broker over secure WebSockets (TLS)
// 100% reliable real-time messaging across any device, network, 4G/5G, or firewall
const CLOUD_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';

export class PeerNetworkManager {
  private mqttClient: MqttClient | null = null;
  private localChannel: BroadcastChannel | null = null; // Instant local tab/window sync

  public myPlayerId: string = '';
  public myPlayerName: string = '';
  public isHost: boolean = false;
  public roomCode: string = '';

  // Host-only secret storage
  private hostDrawDeck: Card[] = [];

  // State callback
  private onStateUpdate?: (state: GameState) => void;
  private onError?: (err: string) => void;

  public currentState: GameState | null = null;

  constructor(
    onStateUpdate?: (state: GameState) => void,
    onError?: (err: string) => void
  ) {
    this.onStateUpdate = onStateUpdate;
    this.onError = onError;
    this.myPlayerId = makeId('ply');
  }

  // Generate clean 5-character code
  public static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // 1. HOST CREATES ROOM
  public async createRoom(roomCode: string, hostName: string): Promise<string> {
    this.isHost = true;
    this.roomCode = roomCode.toUpperCase().trim();
    this.myPlayerName = hostName || 'Host';

    // Set up local broadcast channel for instant local tab sync
    this.setupLocalChannel();

    return new Promise((resolve) => {
      // Initialize lobby state immediately
      const hostPlayer: Player = {
        id: this.myPlayerId,
        name: this.myPlayerName,
        isHost: true,
        isConnected: true,
        hand: [],
        bank: [],
        propertySets: [],
      };

      this.currentState = {
        roomCode: this.roomCode,
        status: 'lobby',
        players: [hostPlayer],
        currentTurnIndex: 0,
        turnPhase: 'draw',
        cardsPlayedThisTurn: 0,
        drawPileCount: 106,
        discardPile: [],
        pendingAction: null,
        pendingPayments: [],
        winnerId: null,
        logs: [
          {
            id: makeId('log'),
            timestamp: Date.now(),
            text: `Room ${this.roomCode} created. Waiting for players...`,
            type: 'system',
          },
        ],
      };

      this.notifyState();

      let isDone = false;
      const done = () => {
        if (!isDone) {
          isDone = true;
          resolve(this.roomCode);
        }
      };

      try {
        if (this.mqttClient) {
          try { this.mqttClient.end(true); } catch (_) {}
        }

        const clientId = `dealbreaker_host_${this.roomCode}_${makeId('c')}`;
        this.mqttClient = mqtt.connect(CLOUD_BROKER_URL, {
          clientId,
          keepalive: 30,
          clean: true,
          reconnectPeriod: 2000,
        });

        const hostTopic = `dealbreaker/rooms/${this.roomCode}/host`;

        this.mqttClient.on('connect', () => {
          console.log(`[Host] Connected to cloud broker for room ${this.roomCode}`);
          this.mqttClient?.subscribe(hostTopic, () => {
            console.log(`[Host] Subscribed to ${hostTopic}`);
            done();
          });
        });

        this.mqttClient.on('message', (_topic, payload) => {
          try {
            const msg = JSON.parse(payload.toString());
            this.handleIncomingHostMessage(msg);
          } catch (e) {
            console.warn('[Host] Invalid broker message payload:', e);
          }
        });

        this.mqttClient.on('error', (err) => {
          console.warn('[Host] Cloud broker warning:', err.message);
        });

        // Safety timeout: don't block host UI if broker takes > 2s
        setTimeout(() => {
          done();
        }, 2000);
      } catch (e) {
        console.warn('[Host] Broker connection error:', e);
        done();
      }
    });
  }

  // 2. CLIENT JOINS ROOM
  public async joinRoom(roomCode: string, playerName: string): Promise<void> {
    this.isHost = false;
    this.roomCode = roomCode.toUpperCase().trim();
    this.myPlayerName = playerName || 'Player';

    // Set up local broadcast channel
    this.setupLocalChannel();

    // Broadcast JOIN over local channel immediately (for multi-tab/incognito)
    this.sendLocal({
      type: 'CLIENT_MSG',
      playerId: this.myPlayerId,
      msg: { type: 'JOIN', playerName: this.myPlayerName },
    });

    return new Promise((resolve, reject) => {
      let isResolved = false;
      let pingInterval: ReturnType<typeof setInterval> | null = null;
      let overallTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (pingInterval) clearInterval(pingInterval);
        if (overallTimeoutTimer) clearTimeout(overallTimeoutTimer);
      };

      const completeSuccess = () => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve();
        }
      };

      const failWithError = (msg: string) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(new Error(msg));
        }
      };

      // If local channel already receives state, resolve
      const origOnState = this.onStateUpdate;
      this.onStateUpdate = (state) => {
        origOnState?.(state);
        if (state && state.players && state.players.length > 0) {
          const inLobby = state.players.some(
            (p) => p.id === this.myPlayerId || p.name === this.myPlayerName
          );
          if (inLobby) {
            completeSuccess();
          }
        }
      };

      // Overall timeout after 12 seconds
      overallTimeoutTimer = setTimeout(() => {
        failWithError(
          `Unable to connect to table ${this.roomCode}. Please ensure the host is online and check the room code.`
        );
      }, 12000);

      try {
        if (this.mqttClient) {
          try { this.mqttClient.end(true); } catch (_) {}
        }

        const clientId = `dealbreaker_cli_${this.myPlayerId}_${makeId('c')}`;
        this.mqttClient = mqtt.connect(CLOUD_BROKER_URL, {
          clientId,
          keepalive: 30,
          clean: true,
          reconnectPeriod: 2000,
        });

        const publicTopic = `dealbreaker/rooms/${this.roomCode}/state`;
        const playerTopic = `dealbreaker/rooms/${this.roomCode}/player/${this.myPlayerId}`;
        const hostTopic = `dealbreaker/rooms/${this.roomCode}/host`;

        const sendJoin = () => {
          if (isResolved || !this.mqttClient || !this.mqttClient.connected) return;
          console.log(`[Client] Sending JOIN request to host for room ${this.roomCode}...`);
          this.mqttClient.publish(
            hostTopic,
            JSON.stringify({
              type: 'JOIN',
              playerName: this.myPlayerName,
              playerId: this.myPlayerId,
            })
          );
        };

        this.mqttClient.on('connect', () => {
          console.log(`[Client] Connected to cloud broker for room ${this.roomCode}`);
          this.mqttClient?.subscribe([publicTopic, playerTopic], () => {
            console.log('[Client] Subscribed to room topics. Sending JOIN...');
            sendJoin();
            // Retry sending join every 1.5s until confirmed on table
            pingInterval = setInterval(() => {
              const inLobby = this.currentState?.players.some(
                (p) => p.id === this.myPlayerId || p.name === this.myPlayerName
              );
              if (!inLobby) {
                sendJoin();
              }
            }, 1500);
          });
        });

        this.mqttClient.on('message', (_topic, payload) => {
          try {
            const msg = JSON.parse(payload.toString());
            this.handleHostMessage(msg as HostMessage);

            if (msg.type === 'SYNC_STATE' && msg.state) {
              const inLobby = msg.state.players.some(
                (p: Player) => p.id === this.myPlayerId || p.name === this.myPlayerName
              );
              if (inLobby) {
                completeSuccess();
              }
            }
          } catch (e) {
            console.warn('[Client] Invalid broker message payload:', e);
          }
        });

        this.mqttClient.on('error', (err) => {
          console.warn('[Client] Cloud broker notice:', err.message);
        });
      } catch (e) {
        console.warn('[Client] Cloud broker init notice:', e);
        failWithError(`Connection error: ${(e as Error).message}`);
      }
    });
  }

  // Cleanly disconnect and release all resources
  public disconnect() {
    if (this.mqttClient) {
      try {
        if (this.isHost && this.roomCode) {
          this.mqttClient.publish(
            `dealbreaker/rooms/${this.roomCode}/state`,
            JSON.stringify({
              type: 'ERROR',
              message: 'Host has closed the table.',
            })
          );
        }
        this.mqttClient.end(true);
      } catch (_) {}
      this.mqttClient = null;
    }

    if (this.localChannel) {
      try { this.localChannel.close(); } catch (_) {}
      this.localChannel = null;
    }
    this.currentState = null;
    this.isHost = false;
  }

  // Local BroadcastChannel for instant multi-window sync on the same computer
  private setupLocalChannel() {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;

    try {
      this.localChannel = new BroadcastChannel(`dealbreaker_${this.roomCode}`);

      this.localChannel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (this.isHost) {
          // Host receives client messages
          if (data.type === 'CLIENT_MSG' && data.msg) {
            this.handleLocalClientMessage(data.playerId, data.msg as ClientMessage);
          }
        } else {
          // Client receives host state broadcasts
          if (data.type === 'SYNC_STATE' && data.state) {
            this.currentState = data.state;
            this.notifyState();
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported or error:', e);
    }
  }

  private sendLocal(data: unknown) {
    try {
      this.localChannel?.postMessage(data);
    } catch (e) {
      // Ignore
    }
  }

  // HOST: Process incoming client message via cloud broker
  private handleIncomingHostMessage(msg: any) {
    if (!this.currentState) return;

    if (msg.type === 'JOIN') {
      const existingPlayer = this.currentState.players.find(
        (p) => p.name === msg.playerName || (msg.playerId && p.id === msg.playerId)
      );
      const playerId = existingPlayer ? existingPlayer.id : (msg.playerId || makeId('ply'));

      if (this.currentState.status === 'lobby' && !existingPlayer) {
        const newPlayer: Player = {
          id: playerId,
          name: msg.playerName,
          isHost: false,
          isConnected: true,
          hand: [],
          bank: [],
          propertySets: [],
        };
        this.currentState = {
          ...this.currentState,
          players: [...this.currentState.players, newPlayer],
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `👋 ${msg.playerName} joined the table!`,
              type: 'info',
            },
          ],
        };
      } else if (existingPlayer) {
        this.currentState = {
          ...this.currentState,
          players: this.currentState.players.map((p) =>
            p.id === playerId ? { ...p, isConnected: true } : p
          ),
        };
      }

      this.broadcastState();
      return;
    }

    if (msg.type === 'LEAVE') {
      if (this.currentState.status === 'lobby') {
        this.currentState = {
          ...this.currentState,
          players: this.currentState.players.filter((p) => p.id !== msg.playerId),
        };
      } else {
        this.currentState = {
          ...this.currentState,
          players: this.currentState.players.map((p) =>
            p.id === msg.playerId ? { ...p, isConnected: false } : p
          ),
        };
      }
      this.broadcastState();
      return;
    }

    this.handleGameAction(msg);
  }

  // HOST: Process client messages via local channel
  private handleLocalClientMessage(senderPlayerId: string, msg: ClientMessage) {
    if (!this.currentState) return;

    if (msg.type === 'JOIN') {
      const existing = this.currentState.players.find(
        (p) => p.id === senderPlayerId || p.name === msg.playerName
      );

      if (this.currentState.status === 'lobby' && !existing) {
        const newPlayer: Player = {
          id: senderPlayerId,
          name: msg.playerName,
          isHost: false,
          isConnected: true,
          hand: [],
          bank: [],
          propertySets: [],
        };
        this.currentState = {
          ...this.currentState,
          players: [...this.currentState.players, newPlayer],
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `👋 ${msg.playerName} joined the table!`,
              type: 'info',
            },
          ],
        };
      }

      this.broadcastState();
      return;
    }

    this.handleGameAction(msg);
  }

  // HOST: Add Bot (in Lobby OR during Live Match)
  public addBot(botName?: string) {
    if (!this.isHost || !this.currentState) return;
    if (this.currentState.players.length >= 5) return;

    const defaultNames = ['Bot Alex', 'Bot Charlie', 'Bot Morgan', 'Bot Taylor', 'Bot Jordan'];
    const botIndex = this.currentState.players.filter((p) => p.isBot).length;
    const chosenName = botName || defaultNames[botIndex % defaultNames.length];
    const botId = `bot_${makeId('b')}`;

    if (this.currentState.status === 'playing') {
      // Deal 5 cards from draw deck
      if (this.hostDrawDeck.length < 5 && this.currentState.discardPile.length > 0) {
        this.hostDrawDeck = [...this.hostDrawDeck, ...shuffleDeck(this.currentState.discardPile)];
        this.currentState.discardPile = [];
      }
      const initialHand = this.hostDrawDeck.splice(0, 5);

      const botPlayer: Player = {
        id: botId,
        name: chosenName,
        isHost: false,
        isConnected: true,
        isBot: true,
        hand: initialHand,
        bank: [],
        propertySets: [],
      };

      this.currentState = {
        ...this.currentState,
        players: [...this.currentState.players, botPlayer],
        drawPileCount: this.hostDrawDeck.length,
        logs: [
          ...this.currentState.logs,
          {
            id: makeId('log'),
            timestamp: Date.now(),
            text: `🤖 ${chosenName} joined the live game! (5 cards dealt)`,
            type: 'alert',
          },
        ],
      };
    } else {
      // Lobby mode
      const botPlayer: Player = {
        id: botId,
        name: chosenName,
        isHost: false,
        isConnected: true,
        isBot: true,
        hand: [],
        bank: [],
        propertySets: [],
      };

      this.currentState = {
        ...this.currentState,
        players: [...this.currentState.players, botPlayer],
        logs: [
          ...this.currentState.logs,
          {
            id: makeId('log'),
            timestamp: Date.now(),
            text: `🤖 ${chosenName} joined the table as an AI player!`,
            type: 'info',
          },
        ],
      };
    }

    this.broadcastState();
  }

  // 1-Click Quick Play Solo vs Bots (100% Instant & Offline)
  public async startSoloBotGame(playerName: string, botCount = 2): Promise<void> {
    this.disconnect();

    this.isHost = true;
    this.roomCode = PeerNetworkManager.generateRoomCode();
    this.myPlayerName = playerName || 'Player';
    this.myPlayerId = makeId('ply');

    const humanPlayer: Player = {
      id: this.myPlayerId,
      name: this.myPlayerName,
      isHost: true,
      isConnected: true,
      hand: [],
      bank: [],
      propertySets: [],
    };

    const botNames = ['Bot Alex', 'Bot Charlie', 'Bot Morgan', 'Bot Taylor'];
    const count = Math.min(Math.max(1, botCount), 4);
    const botPlayers: Player[] = [];
    for (let i = 0; i < count; i++) {
      botPlayers.push({
        id: `bot_${makeId('b')}`,
        name: botNames[i],
        isHost: false,
        isConnected: true,
        isBot: true,
        hand: [],
        bank: [],
        propertySets: [],
      });
    }

    this.currentState = {
      roomCode: this.roomCode,
      status: 'lobby',
      players: [humanPlayer, ...botPlayers],
      currentTurnIndex: 0,
      turnPhase: 'draw',
      cardsPlayedThisTurn: 0,
      drawPileCount: 106,
      discardPile: [],
      pendingAction: null,
      pendingPayments: [],
      winnerId: null,
      logs: [
        {
          id: makeId('log'),
          timestamp: Date.now(),
          text: `Solo Bot Match ready with ${count} AI opponents!`,
          type: 'system',
        },
      ],
    };

    // Immediately deal and start!
    this.startGame();
  }

  // HOST: Start Game
  public startGame() {
    if (!this.isHost || !this.currentState) return;

    this.hostDrawDeck = shuffleDeck(createFullDeck());

    // Deal 5 cards to each player
    const dealtPlayers: Player[] = this.currentState.players.map((p) => {
      const hand = this.hostDrawDeck.splice(0, 5);
      return {
        ...p,
        hand,
        bank: [],
        propertySets: [],
      };
    });

    this.currentState = {
      ...this.currentState,
      status: 'playing',
      players: dealtPlayers,
      currentTurnIndex: 0,
      turnPhase: 'play',
      cardsPlayedThisTurn: 0,
      drawPileCount: this.hostDrawDeck.length,
      discardPile: [],
      pendingAction: null,
      pendingPayments: [],
      winnerId: null,
      logs: [
        {
          id: makeId('log'),
          timestamp: Date.now(),
          text: `Game started! 5 cards dealt to each player.`,
          type: 'alert',
        },
      ],
    };

    this.drawCardsForActivePlayer();
  }

  // HOST: Draw cards at start of turn
  private drawCardsForActivePlayer() {
    if (!this.currentState || this.currentState.status !== 'playing') return;

    const activePlayer = this.currentState.players[this.currentState.currentTurnIndex];
    if (!activePlayer) return;

    const drawCount = activePlayer.hand.length === 0 ? 5 : 2;

    if (this.hostDrawDeck.length < drawCount && this.currentState.discardPile.length > 0) {
      this.hostDrawDeck = [...this.hostDrawDeck, ...shuffleDeck(this.currentState.discardPile)];
      this.currentState.discardPile = [];
    }

    const drawnCards = this.hostDrawDeck.splice(0, drawCount);

    const updatedPlayers = this.currentState.players.map((p, idx) =>
      idx === this.currentState!.currentTurnIndex
        ? { ...p, hand: [...p.hand, ...drawnCards] }
        : p
    );

    this.currentState = {
      ...this.currentState,
      players: updatedPlayers,
      drawPileCount: this.hostDrawDeck.length,
      turnPhase: 'play',
      cardsPlayedThisTurn: 0,
      logs: [
        ...this.currentState.logs,
        {
          id: makeId('log'),
          timestamp: Date.now(),
          text: `${activePlayer.name}'s turn. Drew ${drawnCards.length} cards.`,
          type: 'info',
        },
      ],
    };

    this.broadcastState();

    if (activePlayer.isBot) {
      setTimeout(() => this.runBotTurn(activePlayer.id), 1200);
    }
  }

  // HOST: Run Smart AI Bot Turn
  private runBotTurn(botId: string) {
    if (!this.currentState || this.currentState.status !== 'playing') return;

    // NEVER run bot turn while an action is pending or debts are being settled!
    if (
      this.currentState.pendingAction ||
      this.currentState.pendingPayments.length > 0 ||
      this.currentState.isActionResolving
    ) {
      return;
    }

    const bot = this.currentState.players.find((p) => p.id === botId);
    if (!bot || !bot.isBot) return;

    if (this.currentState.players[this.currentState.currentTurnIndex]?.id !== botId) return;

    // Discard down to 7 if needed
    if (this.currentState.turnPhase === 'discard') {
      const extraCount = bot.hand.length - 7;
      if (extraCount > 0) {
        const sortedHand = [...bot.hand].sort((a, b) => a.value - b.value);
        const toDiscard = sortedHand.slice(0, extraCount).map((c) => c.id);
        this.handleGameAction({ type: 'DISCARD_CARDS', cardIds: toDiscard });
      }
      return;
    }

    if (this.currentState.cardsPlayedThisTurn < 3 && bot.hand.length > 0) {
      const opponents = this.currentState.players.filter((p) => p.id !== bot.id);

      // 1. DEAL BREAKER: Steal completed set if any opponent has one!
      const dealBreaker = bot.hand.find((c) => c.actionType === 'deal_breaker');
      if (dealBreaker) {
        for (const opp of opponents) {
          const completedSet = opp.propertySets.find((s) => isSetComplete(s));
          if (completedSet) {
            this.handleGameAction({
              type: 'PLAY_ACTION',
              cardId: dealBreaker.id,
              targetPlayerId: opp.id,
              targetSetId: completedSet.id,
            });
            // PAUSE TURN: Wait for defense and resolution!
            return;
          }
        }
      }

      // 2. SLY DEAL: Steal an incomplete property card
      const slyDeal = bot.hand.find((c) => c.actionType === 'sly_deal');
      if (slyDeal) {
        for (const opp of opponents) {
          const incompleteSet = opp.propertySets.find((s) => !isSetComplete(s) && s.cards.length > 0);
          if (incompleteSet) {
            const targetCard = incompleteSet.cards[0];
            this.handleGameAction({
              type: 'PLAY_ACTION',
              cardId: slyDeal.id,
              targetPlayerId: opp.id,
              targetSetId: incompleteSet.id,
              targetCardId: targetCard.card.id,
            });
            // PAUSE TURN: Wait for defense and resolution!
            return;
          }
        }
      }

      // 3. RENT: Charge rent if bot owns properties matching a rent card!
      const rentCard = bot.hand.find((c) => c.type === 'rent');
      if (rentCard) {
        const ownedColors = Array.from(new Set(bot.propertySets.map((s) => s.color)));
        let chosenColor: PropertyColor | undefined;

        if (rentCard.isWildRent && ownedColors.length > 0) {
          chosenColor = ownedColors[0];
        } else if (rentCard.colors) {
          chosenColor = rentCard.colors.find((c) => ownedColors.includes(c));
        }

        if (chosenColor) {
          const targetOpp = opponents.reduce((richest, opp) => {
            const oppBank = opp.bank.reduce((sum, c) => sum + c.value, 0);
            const richestBank = richest.bank.reduce((sum, c) => sum + c.value, 0);
            return oppBank > richestBank ? opp : richest;
          }, opponents[0]);

          this.handleGameAction({
            type: 'PLAY_ACTION',
            cardId: rentCard.id,
            rentColor: chosenColor,
            targetPlayerId: rentCard.isWildRent ? targetOpp.id : undefined,
          });
          // PAUSE TURN: Wait for rent payments to settle!
          return;
        }
      }

      // 4. DEBT COLLECTOR: Target richest opponent!
      const debtCollector = bot.hand.find((c) => c.actionType === 'debt_collector');
      if (debtCollector && opponents.length > 0) {
        const targetOpp = opponents.reduce((richest, opp) => {
          const oppBank = opp.bank.reduce((sum, c) => sum + c.value, 0);
          const richestBank = richest.bank.reduce((sum, c) => sum + c.value, 0);
          return oppBank > richestBank ? opp : richest;
        }, opponents[0]);

        this.handleGameAction({
          type: 'PLAY_ACTION',
          cardId: debtCollector.id,
          targetPlayerId: targetOpp.id,
        });
        // PAUSE TURN: Wait for compliance!
        return;
      }

      // 5. BIRTHDAY: Demand ₹2 Cr from all
      const bday = bot.hand.find((c) => c.actionType === 'its_my_birthday');
      if (bday) {
        this.handleGameAction({ type: 'PLAY_ACTION', cardId: bday.id });
        // PAUSE TURN: Wait for all payments to settle!
        return;
      }

      // 6. PASS GO: Draw 2 extra cards
      const passGo = bot.hand.find((c) => c.actionType === 'pass_go');
      if (passGo) {
        this.handleGameAction({ type: 'PLAY_ACTION', cardId: passGo.id });
        setTimeout(() => this.runBotTurn(botId), 1500);
        return;
      }

      // 7. HOUSE / HOTEL: Upgrade complete set!
      const houseCard = bot.hand.find((c) => c.actionType === 'house');
      if (houseCard) {
        const targetSet = bot.propertySets.find(
          (s) => isSetComplete(s) && !s.hasHouse && s.color !== 'railroad' && s.color !== 'utility'
        );
        if (targetSet) {
          this.handleGameAction({
            type: 'PLAY_TO_PROPERTY',
            cardId: houseCard.id,
            targetSetId: targetSet.id,
          });
          setTimeout(() => this.runBotTurn(botId), 1400);
          return;
        }
      }

      // 8. PROPERTY / WILDCARD: Lay down onto table
      const propCard = bot.hand.find((c) => c.type === 'property' || c.type === 'wildcard');
      if (propCard) {
        this.handleGameAction({
          type: 'PLAY_TO_PROPERTY',
          cardId: propCard.id,
          targetColor: propCard.mainColor || (propCard.colors ? propCard.colors[0] : undefined),
        });
        setTimeout(() => this.runBotTurn(botId), 1400);
        return;
      }

      // 9. MONEY: Deposit into bank
      const moneyCard = bot.hand.find((c) => c.type === 'money');
      if (moneyCard) {
        this.handleGameAction({ type: 'PLAY_TO_BANK', cardId: moneyCard.id });
        setTimeout(() => this.runBotTurn(botId), 1300);
        return;
      }

      // 10. ACTION AS MONEY: Deposit extra action cards into bank
      const actionAsMoney = bot.hand.find((c) => c.value > 0);
      if (actionAsMoney && bot.hand.length > 2) {
        this.handleGameAction({ type: 'PLAY_TO_BANK', cardId: actionAsMoney.id });
        setTimeout(() => this.runBotTurn(botId), 1300);
        return;
      }
    }

    this.finishTurn();
  }

  // Graceful resolution pause banner
  private setResolutionPause(
    title: string,
    subtitle: string,
    type: 'action' | 'payment' | 'info' | 'system' | 'alert' | 'success',
    callback: () => void,
    delayMs = 2400
  ) {
    if (!this.currentState) return;
    this.currentState = {
      ...this.currentState,
      actionStatus: { title, subtitle, type },
      isActionResolving: true,
    };
    this.broadcastState();

    setTimeout(() => {
      if (!this.currentState) return;
      this.currentState = {
        ...this.currentState,
        actionStatus: null,
        isActionResolving: false,
      };
      this.broadcastState();
      callback();
    }, delayMs);
  }

  // Resume active player after an action completes compliance
  private resumeActivePlayerAfterAction() {
    if (!this.currentState || this.currentState.status !== 'playing') return;
    this.currentState = checkWin(this.currentState);
    if (this.currentState.status === 'game_over') {
      this.broadcastState();
      return;
    }

    const activePlayer = this.currentState.players[this.currentState.currentTurnIndex];
    if (!activePlayer) return;

    if (this.currentState.cardsPlayedThisTurn >= 3 || activePlayer.hand.length === 0) {
      this.finishTurn();
    } else if (activePlayer.isBot) {
      setTimeout(() => this.runBotTurn(activePlayer.id), 1200);
    } else {
      this.broadcastState();
    }
  }

  private triggerBotDefenseIfApplicable(target: Player) {
    if (target.isBot) {
      // 2.0s thinking delay so human spectators see the attack and the defense!
      setTimeout(() => {
        if (!this.currentState || !this.currentState.pendingAction) return;
        const noCard = target.hand.find((c) => c.actionType === 'just_say_no');
        this.resolveJustSayNo(!!noCard, noCard?.id);
      }, 2000);
    }
  }

  // Auto-settle debts for AI Bots
  private processBotPayments() {
    if (!this.currentState) return;
    const botPayment = this.currentState.pendingPayments.find((p) => {
      const debtor = this.currentState!.players.find((ply) => ply.id === p.fromPlayerId);
      return debtor && debtor.isBot;
    });

    if (botPayment) {
      const debtor = this.currentState.players.find((ply) => ply.id === botPayment.fromPlayerId)!;
      // 1.5s delay so everyone sees who is paying!
      setTimeout(() => {
        if (!this.currentState) return;
        let remaining = botPayment.amountOwed;
        const bankIds: string[] = [];
        for (const card of debtor.bank) {
          if (remaining > 0) {
            bankIds.push(card.id);
            remaining -= card.value;
          }
        }

        const propPayments: { setId: string; cardId: string }[] = [];
        if (remaining > 0) {
          for (const set of debtor.propertySets) {
            if (!isSetComplete(set)) {
              for (const entry of set.cards) {
                if (remaining > 0) {
                  propPayments.push({ setId: set.id, cardId: entry.card.id });
                  remaining -= entry.card.value;
                }
              }
            }
          }
        }

        if (remaining > 0) {
          for (const set of debtor.propertySets) {
            if (isSetComplete(set)) {
              for (const entry of set.cards) {
                if (remaining > 0) {
                  propPayments.push({ setId: set.id, cardId: entry.card.id });
                  remaining -= entry.card.value;
                }
              }
            }
          }
        }

        this.currentState = executeDebtPayment(
          this.currentState,
          debtor.id,
          bankIds,
          propPayments
        );

        if (this.currentState.pendingPayments.length === 0) {
          const turnPlayer = this.currentState.players[this.currentState.currentTurnIndex];
          this.setResolutionPause(
            '💰 All Payments Settled!',
            `All players complied with the payment to ${turnPlayer?.name || 'the player'}.`,
            'success',
            () => {
              this.resumeActivePlayerAfterAction();
            },
            2400
          );
        } else {
          this.broadcastState();
          this.processBotPayments();
        }
      }, 1500);
    }
  }

  // DISPATCH ACTION (Host or Client)
  public dispatchAction(msg: ClientMessage) {
    if (this.isHost) {
      this.handleGameAction(msg);
    } else {
      // Send to host via Cloud Broker
      if (this.mqttClient && this.mqttClient.connected) {
        const hostTopic = `dealbreaker/rooms/${this.roomCode}/host`;
        this.mqttClient.publish(
          hostTopic,
          JSON.stringify({
            ...msg,
            playerId: this.myPlayerId,
          })
        );
      }
      // Also send via local channel
      this.sendLocal({
        type: 'CLIENT_MSG',
        playerId: this.myPlayerId,
        msg,
      });
    }
  }

  // HOST: Process Game Actions
  private handleGameAction(msg: ClientMessage) {
    if (!this.currentState || this.currentState.status !== 'playing') return;

    const activePlayer = this.currentState.players[this.currentState.currentTurnIndex];

    switch (msg.type) {
      case 'PLAY_TO_BANK': {
        this.currentState = playToBank(this.currentState, activePlayer.id, msg.cardId);
        this.checkAutoEndTurn();
        this.broadcastState();
        break;
      }

      case 'PLAY_TO_PROPERTY': {
        this.currentState = playToProperty(
          this.currentState,
          activePlayer.id,
          msg.cardId,
          msg.targetColor,
          msg.targetSetId
        );
        this.checkAutoEndTurn();
        this.broadcastState();
        break;
      }

      case 'FLIP_WILDCARD': {
        this.currentState = flipWildcard(
          this.currentState,
          activePlayer.id,
          msg.cardId,
          msg.setId,
          msg.newColor
        );
        this.broadcastState();
        break;
      }

      case 'PLAY_ACTION': {
        this.executeActionCard(msg);
        break;
      }

      case 'RESOLVE_JUST_SAY_NO': {
        this.resolveJustSayNo(msg.playCard, msg.cardId);
        break;
      }

      case 'PAY_DEBT': {
        const targetPayment = this.currentState.pendingPayments.find(
          (p) => p.fromPlayerId === activePlayer.id
        ) || this.currentState.pendingPayments[0];

        if (targetPayment) {
          this.currentState = executeDebtPayment(
            this.currentState,
            targetPayment.fromPlayerId,
            msg.cardIdsFromBank,
            msg.propertyPayment
          );
        }

        if (this.currentState.pendingPayments.length === 0) {
          const turnPlayer = this.currentState.players[this.currentState.currentTurnIndex];
          this.setResolutionPause(
            '💰 All Payments Settled!',
            `All players complied with payments to ${turnPlayer?.name || 'the player'}.`,
            'success',
            () => {
              this.resumeActivePlayerAfterAction();
            },
            2400
          );
        } else {
          this.broadcastState();
          this.processBotPayments();
        }
        break;
      }

      case 'DISCARD_CARDS': {
        const player = this.currentState.players[this.currentState.currentTurnIndex];
        const discarded = player.hand.filter((c) => msg.cardIds.includes(c.id));
        const newHand = player.hand.filter((c) => !msg.cardIds.includes(c.id));

        this.currentState.discardPile.push(...discarded);

        this.currentState = {
          ...this.currentState,
          players: this.currentState.players.map((p, idx) =>
            idx === this.currentState!.currentTurnIndex ? { ...p, hand: newHand } : p
          ),
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `${player.name} discarded ${discarded.length} cards to meet hand limit.`,
              type: 'info',
            },
          ],
        };

        this.advanceToNextTurn();
        break;
      }

      case 'END_TURN': {
        this.finishTurn();
        break;
      }

      case 'RESTART_GAME': {
        this.startGame();
        break;
      }
    }
  }

  // HOST: Execute Action Card logic
  private executeActionCard(msg: Extract<ClientMessage, { type: 'PLAY_ACTION' }>) {
    if (!this.currentState) return;
    const activePlayer = this.currentState.players[this.currentState.currentTurnIndex];
    const cardIndex = activePlayer.hand.findIndex((c) => c.id === msg.cardId);
    if (cardIndex === -1) return;
    const card = activePlayer.hand[cardIndex];

    const newHand = [...activePlayer.hand];
    newHand.splice(cardIndex, 1);
    this.currentState.discardPile.push(card);

    let updatedPlayers = this.currentState.players.map((p, idx) =>
      idx === this.currentState!.currentTurnIndex ? { ...p, hand: newHand } : p
    );

    this.currentState = {
      ...this.currentState,
      players: updatedPlayers,
      cardsPlayedThisTurn: this.currentState.cardsPlayedThisTurn + 1,
    };

    // 1. Pass Go
    if (card.actionType === 'pass_go') {
      const drawn = this.hostDrawDeck.splice(0, 2);
      this.currentState = {
        ...this.currentState,
        players: this.currentState.players.map((p, idx) =>
          idx === this.currentState!.currentTurnIndex
            ? { ...p, hand: [...p.hand, ...drawn] }
            : p
        ),
        drawPileCount: this.hostDrawDeck.length,
        logs: [
          ...this.currentState.logs,
          {
            id: makeId('log'),
            timestamp: Date.now(),
            text: `${activePlayer.name} played Pass Go and drew 2 cards!`,
            type: 'action',
          },
        ],
      };
      this.checkAutoEndTurn();
      this.broadcastState();
      return;
    }

    // 2. It's My Birthday
    if (card.actionType === 'its_my_birthday') {
      const otherPlayers = this.currentState.players.filter((p) => p.id !== activePlayer.id);
      const payments = otherPlayers.map((p) => ({
        fromPlayerId: p.id,
        toPlayerId: activePlayer.id,
        amountOwed: 2,
        reason: "It's My Birthday (₹2 Cr)",
      }));

      this.currentState = {
        ...this.currentState,
        pendingPayments: [...this.currentState.pendingPayments, ...payments],
        isActionResolving: true,
        actionStatus: {
          title: "🎂 It's My Birthday!",
          subtitle: `${activePlayer.name} demands ₹2 Cr from all players. Settling debts...`,
          type: 'alert',
        },
        logs: [
          ...this.currentState.logs,
          {
            id: makeId('log'),
            timestamp: Date.now(),
            text: `🎂 ${activePlayer.name} played "It's My Birthday"! All players must pay ₹2 Cr.`,
            type: 'alert',
          },
        ],
      };
      this.broadcastState();
      this.processBotPayments();
      return;
    }

    // 3. Debt Collector
    if (card.actionType === 'debt_collector' && msg.targetPlayerId) {
      const target = this.currentState.players.find((p) => p.id === msg.targetPlayerId);
      if (target) {
        this.currentState = {
          ...this.currentState,
          pendingAction: {
            id: makeId('act'),
            sourcePlayerId: activePlayer.id,
            targetPlayerId: target.id,
            actionCard: card,
            canBeCounteredBy: [target.id],
            counterChain: [],
          },
          isActionResolving: true,
          actionStatus: {
            title: '💸 Debt Collector!',
            subtitle: `${activePlayer.name} demands ₹5 Cr from ${target.name}. Waiting for defense...`,
            type: 'action',
          },
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `${activePlayer.name} targeted ${target.name} with Debt Collector (₹5 Cr)!`,
              type: 'action',
            },
          ],
        };
        this.broadcastState();
        this.triggerBotDefenseIfApplicable(target);
        return;
      }
    }

    // 4. Rent Cards
    if (card.type === 'rent') {
      const chosenColor = msg.rentColor;
      if (!chosenColor) return;

      const ownedSet = activePlayer.propertySets.find((s) => s.color === chosenColor);
      if (!ownedSet) return;

      const rentAmount = calculateTotalRent(ownedSet, false);

      if (card.isWildRent && msg.targetPlayerId) {
        const target = this.currentState.players.find((p) => p.id === msg.targetPlayerId);
        if (target) {
          this.currentState = {
            ...this.currentState,
            pendingAction: {
              id: makeId('act'),
              sourcePlayerId: activePlayer.id,
              targetPlayerId: target.id,
              actionCard: card,
              rentColor: chosenColor,
              rentAmount,
              canBeCounteredBy: [target.id],
              counterChain: [],
            },
            isActionResolving: true,
            actionStatus: {
              title: '🏠 Wild Rent!',
              subtitle: `${activePlayer.name} charged Wild Rent (₹${rentAmount} Cr) on ${target.name}. Waiting for defense...`,
              type: 'action',
            },
            logs: [
              ...this.currentState.logs,
              {
                id: makeId('log'),
                timestamp: Date.now(),
                text: `${activePlayer.name} played Wild Rent on ${COLOR_METAS[chosenColor].name} (₹${rentAmount} Cr) targeting ${target.name}!`,
                type: 'action',
              },
            ],
          };
          this.broadcastState();
          this.triggerBotDefenseIfApplicable(target);
          return;
        }
      } else {
        const otherPlayers = this.currentState.players.filter((p) => p.id !== activePlayer.id);
        const payments = otherPlayers.map((p) => ({
          fromPlayerId: p.id,
          toPlayerId: activePlayer.id,
          amountOwed: rentAmount,
          reason: `Rent for ${COLOR_METAS[chosenColor].name} (₹${rentAmount} Cr)`,
        }));

        this.currentState = {
          ...this.currentState,
          pendingPayments: [...this.currentState.pendingPayments, ...payments],
          isActionResolving: true,
          actionStatus: {
            title: `🏠 Rent on ${COLOR_METAS[chosenColor].name}!`,
            subtitle: `${activePlayer.name} charged ₹${rentAmount} Cr rent to all players. Settling debts...`,
            type: 'payment',
          },
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `🏠 ${activePlayer.name} charged Rent on ${COLOR_METAS[chosenColor].name} (₹${rentAmount} Cr) to all players!`,
              type: 'action',
            },
          ],
        };
        this.broadcastState();
        this.processBotPayments();
        return;
      }
    }

    // 5. Deal Breaker
    if (card.actionType === 'deal_breaker' && msg.targetPlayerId && msg.targetSetId) {
      const target = this.currentState.players.find((p) => p.id === msg.targetPlayerId);
      if (target) {
        this.currentState = {
          ...this.currentState,
          pendingAction: {
            id: makeId('act'),
            sourcePlayerId: activePlayer.id,
            targetPlayerId: target.id,
            targetSetId: msg.targetSetId,
            actionCard: card,
            canBeCounteredBy: [target.id],
            counterChain: [],
          },
          isActionResolving: true,
          actionStatus: {
            title: '🚨 DEAL BREAKER!',
            subtitle: `${activePlayer.name} is seizing ${target.name}'s completed set! Waiting for defense...`,
            type: 'alert',
          },
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `🚨 ${activePlayer.name} played DEAL BREAKER on ${target.name}'s completed set!`,
              type: 'alert',
            },
          ],
        };
        this.broadcastState();
        this.triggerBotDefenseIfApplicable(target);
        return;
      }
    }

    // 6. Sly Deal
    if (card.actionType === 'sly_deal' && msg.targetPlayerId && msg.targetSetId && msg.targetCardId) {
      const target = this.currentState.players.find((p) => p.id === msg.targetPlayerId);
      if (target) {
        this.currentState = {
          ...this.currentState,
          pendingAction: {
            id: makeId('act'),
            sourcePlayerId: activePlayer.id,
            targetPlayerId: target.id,
            targetSetId: msg.targetSetId,
            targetCardId: msg.targetCardId,
            actionCard: card,
            canBeCounteredBy: [target.id],
            counterChain: [],
          },
          isActionResolving: true,
          actionStatus: {
            title: '🕵️ Sly Deal!',
            subtitle: `${activePlayer.name} is stealing a property from ${target.name}! Waiting for defense...`,
            type: 'action',
          },
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `🕵️ ${activePlayer.name} played Sly Deal targeting a property of ${target.name}!`,
              type: 'action',
            },
          ],
        };
        this.broadcastState();
        this.triggerBotDefenseIfApplicable(target);
        return;
      }
    }

    this.checkAutoEndTurn();
    this.broadcastState();
  }

  // HOST: Resolve Just Say No
  private resolveJustSayNo(playedNo: boolean, cardId?: string) {
    if (!this.currentState || !this.currentState.pendingAction) return;

    const action = this.currentState.pendingAction;
    const targetPlayer = this.currentState.players.find((p) => p.id === action.targetPlayerId);

    if (playedNo && targetPlayer && cardId) {
      const cardIdx = targetPlayer.hand.findIndex((c) => c.id === cardId);
      if (cardIdx !== -1) {
        const noCard = targetPlayer.hand[cardIdx];
        const newHand = [...targetPlayer.hand];
        newHand.splice(cardIdx, 1);
        this.currentState.discardPile.push(noCard);

        this.currentState = {
          ...this.currentState,
          players: this.currentState.players.map((p) =>
            p.id === targetPlayer.id ? { ...p, hand: newHand } : p
          ),
          pendingAction: null,
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `🛡️ ${targetPlayer.name} played "JUST SAY NO"! The action was blocked!`,
              type: 'alert',
            },
          ],
        };

        this.setResolutionPause(
          '🛡️ Just Say No!',
          `${targetPlayer.name} blocked ${action.actionCard.name} with Just Say No!`,
          'alert',
          () => {
            this.resumeActivePlayerAfterAction();
          },
          2400
        );
        return;
      }
    }

    this.executeConfirmedAction(action);
  }

  // HOST: Execute action that wasn't blocked
  private executeConfirmedAction(action: PendingAction) {
    if (!this.currentState) return;

    const source = this.currentState.players.find((p) => p.id === action.sourcePlayerId);
    const target = this.currentState.players.find((p) => p.id === action.targetPlayerId);
    if (!source || !target) {
      this.currentState.pendingAction = null;
      this.broadcastState();
      return;
    }

    // Deal Breaker
    if (action.actionCard.actionType === 'deal_breaker' && action.targetSetId) {
      const setIdx = target.propertySets.findIndex((s) => s.id === action.targetSetId);
      if (setIdx !== -1) {
        const stolenSet = target.propertySets[setIdx];
        const newTargetSets = [...target.propertySets];
        newTargetSets.splice(setIdx, 1);

        const newSourceSets = [...source.propertySets, stolenSet];

        this.currentState = {
          ...this.currentState,
          players: this.currentState.players.map((p) => {
            if (p.id === source.id) return { ...p, propertySets: newSourceSets };
            if (p.id === target.id) return { ...p, propertySets: newTargetSets };
            return p;
          }),
          pendingAction: null,
          logs: [
            ...this.currentState.logs,
            {
              id: makeId('log'),
              timestamp: Date.now(),
              text: `💥 Deal Breaker resolved! ${source.name} stole ${target.name}'s ${COLOR_METAS[stolenSet.color].name} set!`,
              type: 'alert',
            },
          ],
        };

        this.setResolutionPause(
          '🚨 Deal Breaker Executed!',
          `${source.name} seized ${target.name}'s completed ${COLOR_METAS[stolenSet.color].name} set!`,
          'alert',
          () => {
            this.resumeActivePlayerAfterAction();
          },
          2600
        );
        return;
      }
    }

    // Sly Deal
    else if (action.actionCard.actionType === 'sly_deal' && action.targetSetId && action.targetCardId) {
      const setIdx = target.propertySets.findIndex((s) => s.id === action.targetSetId);
      if (setIdx !== -1) {
        const set = target.propertySets[setIdx];
        const cardIdx = set.cards.findIndex((c) => c.card.id === action.targetCardId);
        if (cardIdx !== -1) {
          const stolenCardEntry = set.cards[cardIdx];
          const updatedCards = [...set.cards];
          updatedCards.splice(cardIdx, 1);

          let newTargetSets = [...target.propertySets];
          if (updatedCards.length === 0) {
            newTargetSets.splice(setIdx, 1);
          } else {
            newTargetSets[setIdx] = { ...set, cards: updatedCards };
          }

          let newSourceSets = [...source.propertySets];
          const existingSetIdx = newSourceSets.findIndex(
            (s) => s.color === stolenCardEntry.currentColor && !isSetComplete(s)
          );
          if (existingSetIdx !== -1) {
            newSourceSets[existingSetIdx] = {
              ...newSourceSets[existingSetIdx],
              cards: [...newSourceSets[existingSetIdx].cards, stolenCardEntry],
            };
          } else {
            newSourceSets.push({
              id: makeId('set'),
              color: stolenCardEntry.currentColor,
              cards: [stolenCardEntry],
            });
          }

          this.currentState = {
            ...this.currentState,
            players: this.currentState.players.map((p) => {
              if (p.id === source.id) return { ...p, propertySets: newSourceSets };
              if (p.id === target.id) return { ...p, propertySets: newTargetSets };
              return p;
            }),
            pendingAction: null,
            logs: [
              ...this.currentState.logs,
              {
                id: makeId('log'),
                timestamp: Date.now(),
                text: `🕵️ ${source.name} stole ${stolenCardEntry.card.name} from ${target.name}!`,
                type: 'action',
              },
            ],
          };

          this.setResolutionPause(
            '🕵️ Sly Deal Executed!',
            `${source.name} stole ${stolenCardEntry.card.name} from ${target.name}!`,
            'action',
            () => {
              this.resumeActivePlayerAfterAction();
            },
            2400
          );
          return;
        }
      }
    }

    // Debt Collector
    else if (action.actionCard.actionType === 'debt_collector') {
      this.currentState = {
        ...this.currentState,
        pendingAction: null,
        pendingPayments: [
          ...this.currentState.pendingPayments,
          {
            fromPlayerId: target.id,
            toPlayerId: source.id,
            amountOwed: 5,
            reason: 'Debt Collector (₹5 Cr)',
          },
        ],
        isActionResolving: true,
        actionStatus: {
          title: '💸 Debt Due',
          subtitle: `${target.name} must pay ₹5 Cr to ${source.name}.`,
          type: 'payment',
        },
      };
      this.broadcastState();
      this.processBotPayments();
      return;
    }

    // Wild Rent
    else if (action.actionCard.isWildRent && action.rentAmount && action.rentColor) {
      this.currentState = {
        ...this.currentState,
        pendingAction: null,
        pendingPayments: [
          ...this.currentState.pendingPayments,
          {
            fromPlayerId: target.id,
            toPlayerId: source.id,
            amountOwed: action.rentAmount,
            reason: `Wild Rent on ${COLOR_METAS[action.rentColor as PropertyColor].name} (₹${action.rentAmount} Cr)`,
          },
        ],
        isActionResolving: true,
        actionStatus: {
          title: '💸 Wild Rent Due',
          subtitle: `${target.name} must pay ₹${action.rentAmount} Cr to ${source.name}.`,
          type: 'payment',
        },
      };
      this.broadcastState();
      this.processBotPayments();
      return;
    }

    this.currentState = checkWin(this.currentState);
    this.checkAutoEndTurn();
    this.broadcastState();
    this.processBotPayments();
  }

  private checkAutoEndTurn() {
    if (this.currentState && this.currentState.cardsPlayedThisTurn >= 3) {
      this.finishTurn();
    }
  }

  private finishTurn() {
    if (!this.currentState) return;
    const player = this.currentState.players[this.currentState.currentTurnIndex];

    if (player.hand.length > 7) {
      this.currentState = {
        ...this.currentState,
        turnPhase: 'discard',
        logs: [
          ...this.currentState.logs,
          {
            id: makeId('log'),
            timestamp: Date.now(),
            text: `${player.name} has ${player.hand.length} cards in hand. Must discard down to 7.`,
            type: 'info',
          },
        ],
      };
      this.broadcastState();
      return;
    }

    this.advanceToNextTurn();
  }

  private advanceToNextTurn() {
    if (!this.currentState) return;

    const nextIndex = (this.currentState.currentTurnIndex + 1) % this.currentState.players.length;
    this.currentState = {
      ...this.currentState,
      currentTurnIndex: nextIndex,
      turnPhase: 'play',
      cardsPlayedThisTurn: 0,
    };

    this.drawCardsForActivePlayer();
  }

  // CLIENT: Handle incoming host message
  private handleHostMessage(msg: HostMessage) {
    if (msg.type === 'SYNC_STATE' && msg.state) {
      const myId = msg.yourPlayerId || this.myPlayerId;
      const myNewPlayer = msg.state.players.find((p) => p.id === myId);
      const myOldPlayer = this.currentState?.players.find((p) => p.id === myId);

      // If new state comes from public broadcast (where all hands are masked with dummy cards)
      // but client already holds its authentic hand, preserve authentic hand cards!
      if (
        myOldPlayer &&
        myNewPlayer &&
        myOldPlayer.hand.length > 0 &&
        myNewPlayer.hand.length === myOldPlayer.hand.length &&
        myNewPlayer.hand.every((c) => c.name === 'Card' && c.value === 0)
      ) {
        msg.state = {
          ...msg.state,
          players: msg.state.players.map((p) =>
            p.id === myId ? { ...p, hand: myOldPlayer.hand } : p
          ),
        };
      }

      this.currentState = msg.state;
      if (msg.yourPlayerId) {
        this.myPlayerId = msg.yourPlayerId;
      }
      this.notifyState();
    } else if (msg.type === 'ERROR') {
      if (this.onError) this.onError(msg.message);
    }
  }

  // Broadcast state to all players (WebRTC + Local Channel)
  private broadcastState() {
    if (!this.currentState) return;

    // Send to host local listener
    this.notifyState();

    // Send via local channel
    this.sendLocal({
      type: 'SYNC_STATE',
      state: this.currentState,
    });

    // Send via Cloud Broker
    if (this.mqttClient && this.mqttClient.connected) {
      // 1. Send personalized, sanitized state to each remote player
      for (const p of this.currentState.players) {
        if (p.id !== this.myPlayerId && !p.isBot) {
          const playerTopic = `dealbreaker/rooms/${this.roomCode}/player/${p.id}`;
          const sanitized = this.sanitizeStateForPlayer(this.currentState, p.id);
          this.mqttClient.publish(
            playerTopic,
            JSON.stringify({
              type: 'SYNC_STATE',
              state: sanitized,
              yourPlayerId: p.id,
            })
          );
        }
      }

      // 2. Also publish public sanitized state
      const publicTopic = `dealbreaker/rooms/${this.roomCode}/state`;
      this.mqttClient.publish(
        publicTopic,
        JSON.stringify({
          type: 'SYNC_STATE',
          state: this.sanitizeStateForPlayer(this.currentState, ''),
        })
      );
    }
  }

  // Protect private hands so opponents cannot peek
  private sanitizeStateForPlayer(state: GameState, forPlayerId: string): GameState {
    return {
      ...state,
      players: state.players.map((p) => {
        if (p.id === forPlayerId) {
          return p;
        }
        return {
          ...p,
          hand: p.hand.map((c) => ({
            id: c.id,
            name: 'Card',
            type: 'money',
            value: 0,
          })),
        };
      }),
    };
  }

  private notifyState() {
    if (this.onStateUpdate && this.currentState) {
      const sanitized = this.sanitizeStateForPlayer(this.currentState, this.myPlayerId);
      this.onStateUpdate(sanitized);
    }
  }
}
