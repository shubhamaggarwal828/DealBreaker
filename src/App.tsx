import React, { useState, useEffect, useRef } from 'react';
import { Card, GameState, Player, PropertyColor, PropertySet } from './types/game';
import { PeerNetworkManager } from './network/peerManager';
import { GameLobby } from './components/GameLobby';
import { CardView } from './components/CardView';
import { PropertyArea } from './components/PropertyArea';
import { BankView } from './components/BankView';
import { OpponentArea } from './components/OpponentArea';
import { HandView } from './components/HandView';
import { CenterPlayPile } from './components/CenterPlayPile';
import { ActionModal } from './components/ActionModal';
import { TargetSelectionModal } from './components/TargetSelectionModal';
import { DiscardModal } from './components/DiscardModal';
import { RuleBookModal } from './components/RuleBookModal';
import { GameOverModal } from './components/GameOverModal';
import { GameLog } from './components/GameLog';
import { sounds } from './utils/audio';
import { Crown, HelpCircle, Volume2, VolumeX, AlertCircle, Bot } from 'lucide-react';
import { getCompletedSetCount } from './engine/gameLogic';

export const App: React.FC = () => {
  const [lobbyStatus, setLobbyStatus] = useState<'initial' | 'hosting' | 'joining'>('initial');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedHandCard, setSelectedHandCard] = useState<Card | null>(null);
  const [targetingActionCard, setTargetingActionCard] = useState<Card | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const peerManagerRef = useRef<PeerNetworkManager | null>(null);
  const prevTurnIndexRef = useRef<number>(-1);

  // Initialize network manager
  useEffect(() => {
    const manager = new PeerNetworkManager(
      (newState) => {
        setGameState(newState);

        // Sound triggers on turn change
        if (
          newState.status === 'playing' &&
          newState.currentTurnIndex !== prevTurnIndexRef.current
        ) {
          prevTurnIndexRef.current = newState.currentTurnIndex;
          const active = newState.players[newState.currentTurnIndex];
          if (active && active.id === manager.myPlayerId) {
            sounds.playTurnPing();
          }
        }
      },
      (error) => {
        setErrorMessage(error);
        setTimeout(() => setErrorMessage(null), 5000);
      }
    );

    peerManagerRef.current = manager;

    // Check URL parameters for quick join (?room=CODE)
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      // Room prefilled if user lands on link
    }
  }, []);

  // 1. Host Game
  const handleCreateRoom = async (hostName: string) => {
    if (!peerManagerRef.current) return;
    try {
      const code = PeerNetworkManager.generateRoomCode();
      await peerManagerRef.current.createRoom(code, hostName);
      setLobbyStatus('hosting');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to create room.');
    }
  };

  // 2. Join Game
  const handleJoinRoom = async (code: string, playerName: string) => {
    if (!peerManagerRef.current) return;
    try {
      setLobbyStatus('joining');
      await peerManagerRef.current.joinRoom(code, playerName);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to join room.');
      setLobbyStatus('initial');
    }
  };

  // 3. Start Game
  const handleStartGame = () => {
    if (peerManagerRef.current && peerManagerRef.current.isHost) {
      sounds.playCardDeal();
      peerManagerRef.current.startGame();
    }
  };

  // Add AI Bot
  const handleAddBot = () => {
    if (peerManagerRef.current && peerManagerRef.current.isHost) {
      peerManagerRef.current.addBot();
    }
  };

  // 1-Click Solo Game vs AI Bots
  const handleStartSoloBot = async (playerName: string, botCount: number) => {
    if (!peerManagerRef.current) return;
    try {
      sounds.playCardDeal();
      setLobbyStatus('hosting');
      await peerManagerRef.current.startSoloBotGame(playerName, botCount);
    } catch (err: unknown) {
      console.error('Bot game error:', err);
      setErrorMessage((err as Error).message || 'Failed to start bot game.');
    }
  };

  // 4. Play Card to Bank
  const handlePlayToBank = (card: Card) => {
    if (!peerManagerRef.current) return;
    sounds.playMoneyBanked();
    peerManagerRef.current.dispatchAction({
      type: 'PLAY_TO_BANK',
      cardId: card.id,
    });
    setSelectedHandCard(null);
  };

  // 5. Play Card to Property
  const handlePlayToProperty = (card: Card, targetColor?: PropertyColor) => {
    if (!peerManagerRef.current) return;
    sounds.playCardPlace();
    peerManagerRef.current.dispatchAction({
      type: 'PLAY_TO_PROPERTY',
      cardId: card.id,
      targetColor,
    });
    setSelectedHandCard(null);
  };

  // 6. Flip Wildcard
  const handleFlipWildcard = (cardId: string, setId: string, newColor: PropertyColor) => {
    if (!peerManagerRef.current) return;
    sounds.playCardPlace();
    peerManagerRef.current.dispatchAction({
      type: 'FLIP_WILDCARD',
      cardId,
      setId,
      newColor,
    });
  };

  // 7. Play Action Card
  const handlePlayAction = (card: Card) => {
    // Actions that require target modal
    const needsTarget =
      card.actionType === 'deal_breaker' ||
      card.actionType === 'sly_deal' ||
      card.actionType === 'forced_deal' ||
      card.actionType === 'debt_collector' ||
      card.type === 'rent';

    if (needsTarget) {
      setTargetingActionCard(card);
    } else {
      // Pass Go, Birthday, etc.
      if (card.actionType === 'its_my_birthday') sounds.playRent();
      else sounds.playCardPlace();

      peerManagerRef.current?.dispatchAction({
        type: 'PLAY_ACTION',
        cardId: card.id,
      });
      setSelectedHandCard(null);
    }
  };

  // Confirm target selection
  const handleConfirmTargetAction = (params: {
    targetPlayerId?: string;
    targetSetId?: string;
    targetCardId?: string;
    offeredCardId?: string;
    rentColor?: PropertyColor;
  }) => {
    if (!peerManagerRef.current || !targetingActionCard) return;

    if (targetingActionCard.actionType === 'deal_breaker') sounds.playDealBreaker();
    else if (targetingActionCard.type === 'rent') sounds.playRent();
    else sounds.playCardPlace();

    peerManagerRef.current.dispatchAction({
      type: 'PLAY_ACTION',
      cardId: targetingActionCard.id,
      ...params,
    });

    setTargetingActionCard(null);
    setSelectedHandCard(null);
  };

  // 8. Resolve Just Say No
  const handleResolveJustSayNo = (playCard: boolean, cardId?: string) => {
    if (playCard) sounds.playJustSayNo();
    peerManagerRef.current?.dispatchAction({
      type: 'RESOLVE_JUST_SAY_NO',
      playCard,
      cardId,
    });
  };

  // 9. Pay Debt
  const handlePayDebt = (
    cardIdsFromBank: string[],
    propertyPayments: { setId: string; cardId: string }[]
  ) => {
    sounds.playMoneyBanked();
    peerManagerRef.current?.dispatchAction({
      type: 'PAY_DEBT',
      cardIdsFromBank,
      propertyPayment: propertyPayments,
    });
  };

  // 10. Discard Cards
  const handleDiscardCards = (cardIds: string[]) => {
    sounds.playCardPlace();
    peerManagerRef.current?.dispatchAction({
      type: 'DISCARD_CARDS',
      cardIds,
    });
  };

  // 11. End Turn
  const handleEndTurn = () => {
    sounds.playCardDeal();
    peerManagerRef.current?.dispatchAction({
      type: 'END_TURN',
    });
    setSelectedHandCard(null);
  };

  // 12. Restart Game
  const handleRestartGame = () => {
    peerManagerRef.current?.dispatchAction({
      type: 'RESTART_GAME',
    });
  };

  // Toggle Sound
  const toggleSound = () => {
    const res = sounds.toggleSound();
    setSoundEnabled(res);
  };

  // RENDER: LOBBY
  if (!gameState || gameState.status === 'lobby') {
    return (
      <>
        <GameLobby
          status={lobbyStatus}
          roomCode={gameState?.roomCode || peerManagerRef.current?.roomCode || ''}
          players={gameState?.players || []}
          myPlayerId={peerManagerRef.current?.myPlayerId || ''}
          isHost={peerManagerRef.current?.isHost || false}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartGame={handleStartGame}
          onOpenRules={() => setRulesOpen(true)}
          onAddBot={handleAddBot}
          onStartSoloBot={handleStartSoloBot}
        />
        {rulesOpen && <RuleBookModal onClose={() => setRulesOpen(false)} />}
      </>
    );
  }

  // RENDER: GAMEPLAY
  const myPlayerId = peerManagerRef.current?.myPlayerId || '';
  const me = gameState.players.find((p) => p.id === myPlayerId);
  const opponents = gameState.players.filter((p) => p.id !== myPlayerId);
  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isMyTurn = activePlayer?.id === myPlayerId;
  const movesRemaining = Math.max(0, 3 - gameState.cardsPlayedThisTurn);
  const myCompletedSets = me ? getCompletedSetCount(me) : 0;
  const winner = gameState.winnerId
    ? gameState.players.find((p) => p.id === gameState.winnerId)
    : null;

  return (
    <div className="h-screen max-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d472b] via-[#08301d] to-[#04170e] text-stone-100 flex flex-col justify-between overflow-hidden select-none relative">
      {/* Toast Notification Error */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ACTION COMPLIANCE & STATUS BANNER */}
      {gameState.actionStatus && (
        <div className="fixed top-12 sm:top-14 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92%] animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <div
            className={`px-4 py-2 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center gap-3 text-center justify-center
              ${
                gameState.actionStatus.type === 'alert'
                  ? 'bg-red-950/95 border-red-500/80 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.5)] ring-2 ring-red-400/40'
                  : gameState.actionStatus.type === 'payment'
                  ? 'bg-amber-950/95 border-amber-500/80 text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/40'
                  : gameState.actionStatus.type === 'success'
                  ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/40'
                  : 'bg-stone-900/95 border-amber-400/80 text-stone-100 shadow-2xl ring-2 ring-amber-400/30'
              }
            `}
          >
            <div className="flex flex-col items-center">
              <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-amber-300 drop-shadow">
                {gameState.actionStatus.title}
              </span>
              <span className="text-[11px] font-semibold opacity-90 mt-0.5">
                {gameState.actionStatus.subtitle}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <header className="h-10 sm:h-11 px-3 py-1 bg-stone-950/90 border-b border-amber-500/30 flex items-center justify-between z-20 backdrop-blur-md shadow-md flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 font-black text-amber-400 text-base sm:text-lg tracking-wider uppercase">
            <span>🤝</span>
            <span>DEALBREAKER</span>
          </div>
          <span className="bg-stone-900 text-amber-200/90 font-mono text-[11px] px-2.5 py-0.5 rounded-full border border-amber-500/30 shadow-inner">
            Table: <strong>{gameState.roomCode}</strong>
          </span>
        </div>

        {/* Turn Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-md
              ${
                isMyTurn
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 border-amber-200 shadow-card-glow animate-pulse'
                  : 'bg-stone-900 text-stone-300 border-stone-800'
              }
            `}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            <span>{isMyTurn ? 'YOUR TURN TO PLAY' : `${activePlayer?.name}'s Turn`}</span>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1.5">
          {peerManagerRef.current?.isHost && gameState.players.length < 5 && (
            <button
              onClick={handleAddBot}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 hover:text-white text-[11px] font-bold transition-all shadow active:scale-95"
              title="Add an AI Bot to the live match"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>+ Add Bot</span>
            </button>
          )}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white shadow"
            title="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            )}
          </button>
          <button
            onClick={() => setRulesOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] font-bold text-stone-300 hover:text-white shadow"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules</span>
          </button>
        </div>
      </header>

      {/* MAIN GAME BOARD (Single-Page Viewport) */}
      <main className="flex-1 min-h-0 px-2 py-1 max-w-7xl mx-auto w-full flex flex-col justify-between gap-1.5 overflow-hidden">
        {/* 1. OPPONENT SECTION */}
        <section className="flex-shrink-0 min-h-0 overflow-hidden">
          <OpponentArea
            opponents={opponents}
            currentTurnIndex={gameState.currentTurnIndex}
            playersList={gameState.players}
          />
        </section>

        {/* 2. CENTER TABLE: BANK + DECK + DISCARD + ACTIVITY LOG */}
        <section className="flex-shrink-0 min-h-0 grid grid-cols-12 gap-2 items-stretch h-[142px]">
          {/* Left: Your Bank Display */}
          <div className="col-span-4 sm:col-span-3 h-full min-h-0 overflow-hidden">
            {me && <BankView bank={me.bank} />}
          </div>

          {/* Center: Play Pile & Deck */}
          <div className="col-span-5 sm:col-span-6 flex justify-center items-center h-full min-h-0">
            <CenterPlayPile
              drawPileCount={gameState.drawPileCount}
              discardPile={gameState.discardPile}
              cardsPlayedThisTurn={gameState.cardsPlayedThisTurn}
              isMyTurn={isMyTurn}
              onEndTurn={handleEndTurn}
              canEndTurn={isMyTurn && gameState.turnPhase === 'play'}
            />
          </div>

          {/* Right: Realtime Game Activity Log */}
          <div className="col-span-3 sm:col-span-3 h-full min-h-0 overflow-hidden">
            <GameLog logs={gameState.logs} />
          </div>
        </section>

        {/* 3. PLAYER'S PERSONAL PROPERTY SETS */}
        <section className="flex-shrink-0 min-h-0 bg-stone-950/70 border border-stone-800/80 rounded-2xl p-1.5 shadow-lg backdrop-blur-md flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-1 px-1 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Your Properties
              </span>
              <span className="text-[9px] bg-stone-900 text-stone-400 px-2 py-0.2 rounded-full font-mono font-bold border border-stone-800 hidden sm:inline-block">
                (Collect 3 full sets to win!)
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-400/20 border border-amber-400/50 px-2 py-0.5 rounded-full shadow">
              <Crown className="w-3 h-3 fill-current text-amber-400" />
              <span>{myCompletedSets} / 3 Complete</span>
            </div>
          </div>

          <div className="min-h-0 overflow-x-auto flex items-center">
            {me && (
              <PropertyArea
                propertySets={me.propertySets}
                isMyTurn={isMyTurn}
                onFlipWildcard={handleFlipWildcard}
              />
            )}
          </div>
        </section>
      </main>

      {/* 4. PLAYER'S HAND (Docked at Bottom) */}
      <footer className="flex-shrink-0 bg-stone-950/95 backdrop-blur-md border-t border-amber-900/40 pt-1 pb-1 px-2 z-30 flex flex-col items-center justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        {me && (
          <HandView
            hand={me.hand}
            selectedCard={selectedHandCard}
            onSelectCard={setSelectedHandCard}
            onPlayToBank={handlePlayToBank}
            onPlayToProperty={handlePlayToProperty}
            onPlayAction={handlePlayAction}
            isMyTurn={isMyTurn}
            movesRemaining={movesRemaining}
            isActionResolving={!!gameState.isActionResolving || !!gameState.pendingAction || gameState.pendingPayments.length > 0}
          />
        )}
      </footer>

      {/* MODALS */}
      {/* 1. Action Targeting Modal (Deal Breaker, Sly Deal, Rent, Debt Collector) */}
      {targetingActionCard && me && (
        <TargetSelectionModal
          card={targetingActionCard}
          me={me}
          opponents={opponents}
          onConfirm={handleConfirmTargetAction}
          onCancel={() => setTargetingActionCard(null)}
        />
      )}

      {/* 2. Interactive Just Say No & Debt Payment Prompts */}
      <ActionModal
        myPlayerId={myPlayerId}
        players={gameState.players}
        pendingAction={gameState.pendingAction}
        pendingPayments={gameState.pendingPayments}
        onResolveJustSayNo={handleResolveJustSayNo}
        onPayDebt={handlePayDebt}
      />

      {/* 3. Discard Limit Modal (if > 7 cards at turn end) */}
      {isMyTurn && gameState.turnPhase === 'discard' && me && (
        <DiscardModal
          hand={me.hand}
          maxHandLimit={7}
          onConfirmDiscard={handleDiscardCards}
        />
      )}

      {/* 4. Rulebook Modal */}
      {rulesOpen && <RuleBookModal onClose={() => setRulesOpen(false)} />}

      {/* 5. Game Over Celebration Modal */}
      {gameState.status === 'game_over' && winner && (
        <GameOverModal
          winner={winner}
          isHost={peerManagerRef.current?.isHost || false}
          onRestart={handleRestartGame}
        />
      )}
    </div>
  );
};

export default App;
