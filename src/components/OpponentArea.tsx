import React, { useState } from 'react';
import { Player, PropertySet, PropertyColor } from '../types/game';
import { COLOR_METAS } from '../engine/deck';
import { User, Crown, Landmark, Bot, Home, Building2, Sparkles, Check } from 'lucide-react';
import { getCompletedSetCount, isSetComplete, calculateTotalRent } from '../engine/gameLogic';

interface OpponentAreaProps {
  opponents: Player[];
  currentTurnIndex: number;
  playersList: Player[];
  onSelectOpponent?: (player: Player) => void;
  onSelectSet?: (targetPlayer: Player, set: PropertySet) => void;
  onSelectCard?: (targetPlayer: Player, set: PropertySet, cardId: string) => void;
  selectedPlayerId?: string;
  selectedSetId?: string;
  selectedCardId?: string;
}

// Sleek compact Property Set Stack (No horizontal scrolling!)
const OpponentSetStack: React.FC<{
  set: PropertySet;
  player: Player;
  onSelectSet?: (targetPlayer: Player, set: PropertySet) => void;
  onSelectCard?: (targetPlayer: Player, set: PropertySet, cardId: string) => void;
  isSelectedSet?: boolean;
  selectedCardId?: string;
}> = ({ set, player, onSelectSet, onSelectCard, isSelectedSet, selectedCardId }) => {
  const meta = COLOR_METAS[set.color];
  const complete = isSetComplete(set);
  const cardCount = set.cards.length;
  const hasWildcard = set.cards.some(
    (c) => c.card.type === 'wildcard' || c.card.isMultiWildcard
  );
  const rentVal = calculateTotalRent(set, false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectSet) {
      onSelectSet(player, set);
    } else if (onSelectCard && set.cards.length > 0) {
      onSelectCard(player, set, set.cards[0].card.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group flex-shrink-0 cursor-pointer select-none transition-all duration-200
        ${isSelectedSet ? 'scale-105 -translate-y-1' : 'hover:-translate-y-1 hover:z-20'}
      `}
      title={`${meta.name} Set: ${cardCount}/${meta.setSize} cards. Click to inspect/target.`}
    >
      {/* 3D Stack Base Layer (if >= 2 cards) */}
      {cardCount >= 2 && (
        <div
          className="absolute -top-1 -left-1 w-9 sm:w-10 h-14 rounded-lg bg-stone-800 border border-stone-700 shadow-sm pointer-events-none"
          style={{ zIndex: 1 }}
        />
      )}
      {/* 3D Stack 2nd Layer (if >= 3 cards) */}
      {cardCount >= 3 && (
        <div
          className="absolute -top-2 -left-2 w-9 sm:w-10 h-14 rounded-lg bg-stone-900 border border-stone-800 shadow-md pointer-events-none"
          style={{ zIndex: 0 }}
        />
      )}

      {/* Main Front Stack Card */}
      <div
        className={`relative z-10 w-9 sm:w-10 h-14 rounded-lg overflow-hidden flex flex-col justify-between shadow-md border transition-all
          ${
            complete
              ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.5)] bg-stone-900'
              : 'border-stone-700 bg-stone-900/95 hover:border-stone-500'
          }
          ${isSelectedSet ? 'ring-3 ring-emerald-400 border-emerald-400' : ''}
        `}
      >
        {/* Set Color Cap Banner */}
        <div
          style={{ backgroundColor: meta.colorHex }}
          className={`py-0.5 px-0.5 text-center flex items-center justify-between shadow-sm ${meta.textColor}`}
        >
          {complete ? (
            <Crown className="w-2.5 h-2.5 fill-current text-yellow-300 mx-auto" />
          ) : (
            <span className="text-[7px] font-black leading-none uppercase truncate w-full text-center">
              {cardCount}/{meta.setSize}
            </span>
          )}
        </div>

        {/* Stack Body */}
        <div className="flex-1 flex flex-col items-center justify-center p-0.5 bg-[#FAF7F0] text-stone-900 relative">
          {hasWildcard && (
            <div className="absolute top-0.5 left-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
            </div>
          )}

          {/* House / Hotel Indicators */}
          {set.hasHouse && (
            <div className="absolute top-0.5 right-0.5 bg-emerald-600 text-white rounded p-0.2 shadow">
              <Home className="w-2 h-2" />
            </div>
          )}
          {set.hasHotel && (
            <div className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded p-0.2 shadow">
              <Building2 className="w-2 h-2" />
            </div>
          )}

          {/* Center Stack Graphic */}
          <div className="font-mono font-black text-[9px] text-stone-900 tracking-tighter">
            ₹{rentVal} Cr
          </div>
          <div className="text-[6px] font-bold text-stone-500 uppercase tracking-tight">
            rent
          </div>
        </div>

        {/* Bottom Label */}
        <div className="bg-stone-950 py-0.2 px-0.5 text-center border-t border-stone-800">
          <span
            style={{ color: meta.colorHex }}
            className="text-[6.5px] font-black uppercase tracking-tight truncate block"
          >
            {meta.city ? meta.city.split('/')[0].split('&')[0].trim() : meta.name}
          </span>
        </div>
      </div>

      {/* Hover Floating Details Popover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover:flex flex-col bg-stone-950/95 border border-stone-700 rounded-xl p-2.5 shadow-2xl min-w-[150px] max-w-[200px] pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-stone-800 pb-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div
              style={{ backgroundColor: meta.colorHex }}
              className="w-2.5 h-2.5 rounded-full border border-white/60"
            />
            <span className="font-black text-xs text-white uppercase">{meta.name}</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-stone-400">
            {cardCount}/{meta.setSize}
          </span>
        </div>

        <div className="space-y-1 text-[10px]">
          {set.cards.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between text-stone-300">
              <span className="truncate pr-1">
                {entry.card.type === 'wildcard'
                  ? '★ Wildcard'
                  : entry.card.isMultiWildcard
                  ? '★ 10-Color Wild'
                  : entry.card.name}
              </span>
              <span className="text-amber-400 font-mono font-bold">₹{entry.card.value} Cr</span>
            </div>
          ))}
        </div>

        <div className="mt-1.5 pt-1 border-t border-stone-800 flex justify-between items-center text-[9px]">
          <span className="text-stone-400">Current Rent:</span>
          <span className="text-emerald-400 font-black font-mono">₹{rentVal} Cr</span>
        </div>
      </div>
    </div>
  );
};

export const OpponentArea: React.FC<OpponentAreaProps> = ({
  opponents,
  currentTurnIndex,
  playersList,
  onSelectOpponent,
  onSelectSet,
  onSelectCard,
  selectedPlayerId,
  selectedSetId,
  selectedCardId,
}) => {
  const activePlayer = playersList[currentTurnIndex];

  // 1 OPPONENT LAYOUT: Full-width horizontal dashboard
  if (opponents.length === 1) {
    const opp = opponents[0];
    const isTurn = activePlayer?.id === opp.id;
    const completedCount = getCompletedSetCount(opp);
    const bankTotal = opp.bank.reduce((sum, c) => sum + c.value, 0);
    const isSelected = selectedPlayerId === opp.id;

    return (
      <div
        onClick={() => onSelectOpponent && onSelectOpponent(opp)}
        className={`bg-stone-900/90 backdrop-blur-md rounded-2xl p-2 border transition-all duration-200 flex flex-col sm:flex-row items-center gap-3 shadow-xl w-full
          ${isTurn ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.35)]' : 'border-stone-800'}
          ${isSelected ? 'ring-3 ring-emerald-400' : ''}
        `}
      >
        {/* Left Stats Block */}
        <div className="flex sm:flex-col justify-between items-center sm:items-start gap-2 sm:w-48 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-stone-800 pb-1 sm:pb-0 sm:pr-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md border flex-shrink-0
                ${isTurn ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 border-amber-200' : 'bg-stone-800 text-stone-200 border-stone-700'}
              `}
            >
              {opp.isBot ? <Bot className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-stone-100">
                <span className="truncate max-w-[90px]">{opp.name}</span>
                {opp.isBot && (
                  <span className="text-[8px] bg-purple-950 text-purple-300 border border-purple-700 px-1 py-0.2 rounded font-extrabold uppercase">
                    AI
                  </span>
                )}
                {isTurn && (
                  <span className="text-[8px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded-full font-black animate-pulse shadow">
                    TURN
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[9px] text-stone-400">
                <span className="text-stone-300 font-bold">🂠 {opp.hand.length} in hand</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                  <Landmark className="w-2.5 h-2.5" /> ₹{bankTotal} Cr
                </span>
              </div>
            </div>
          </div>

          {/* Sets count badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border font-black text-[10px] shadow-sm flex-shrink-0
              ${completedCount >= 2 ? 'bg-amber-400/20 text-amber-300 border-amber-400 animate-pulse' : 'bg-stone-950 text-stone-300 border-stone-800'}
            `}
          >
            <Crown className="w-3 h-3 fill-current text-amber-400" />
            <span>{completedCount}/3 Sets Complete</span>
          </div>
        </div>

        {/* Right Property Sets Flow: Compact Stacks with zero scroll */}
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap py-1">
          {opp.propertySets.length === 0 ? (
            <div className="text-[10px] text-stone-500 italic py-2">No properties placed yet</div>
          ) : (
            opp.propertySets.map((set) => (
              <OpponentSetStack
                key={set.id}
                set={set}
                player={opp}
                onSelectSet={onSelectSet}
                onSelectCard={onSelectCard}
                isSelectedSet={selectedSetId === set.id}
                selectedCardId={selectedCardId}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // MULTIPLE OPPONENTS (2-4 players): Zero-Scroll Grid / Flex Row
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
      {opponents.map((opp) => {
        const isTurn = activePlayer?.id === opp.id;
        const completedCount = getCompletedSetCount(opp);
        const bankTotal = opp.bank.reduce((sum, c) => sum + c.value, 0);
        const isSelected = selectedPlayerId === opp.id;

        return (
          <div
            key={opp.id}
            onClick={() => onSelectOpponent && onSelectOpponent(opp)}
            className={`bg-stone-900/90 backdrop-blur-md rounded-2xl p-2 border transition-all duration-200 flex flex-col justify-between shadow-xl min-w-0
              ${isTurn ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.35)]' : 'border-stone-800 hover:border-stone-700'}
              ${isSelected ? 'ring-3 ring-emerald-400' : ''}
              ${onSelectOpponent ? 'cursor-pointer' : ''}
            `}
          >
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-1 mb-1.5 flex-shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shadow border flex-shrink-0
                    ${isTurn ? 'bg-amber-400 text-stone-950 border-amber-200' : 'bg-stone-800 text-stone-200 border-stone-700'}
                  `}
                >
                  {opp.isBot ? <Bot className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-black text-xs text-stone-100">
                    <span className="truncate max-w-[70px] sm:max-w-[85px]">{opp.name}</span>
                    {opp.isBot && (
                      <span className="text-[7px] bg-purple-950 text-purple-300 border border-purple-700 px-1 py-0.2 rounded font-extrabold uppercase">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] text-stone-400">
                    <span>🂠 {opp.hand.length}</span>
                    <span className="text-emerald-400 font-mono font-bold">₹{bankTotal} Cr</span>
                  </div>
                </div>
              </div>

              {/* Sets Badge */}
              <div
                className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded border font-black text-[9px] shadow-sm flex-shrink-0
                  ${completedCount >= 2 ? 'bg-amber-400/20 text-amber-300 border-amber-400 animate-pulse' : 'bg-stone-950 text-stone-300 border-stone-800'}
                `}
              >
                <Crown className="w-2.5 h-2.5 fill-current text-amber-400" />
                <span>{completedCount}/3</span>
              </div>
            </div>

            {/* Property Sets View: Compact Stacks fitting inside the box with ZERO scrollbar */}
            <div className="flex items-center gap-1.5 flex-wrap min-h-[58px] py-0.5">
              {opp.propertySets.length === 0 ? (
                <div className="text-[9px] text-stone-500 italic py-2 text-center w-full">
                  No properties
                </div>
              ) : (
                opp.propertySets.map((set) => (
                  <OpponentSetStack
                    key={set.id}
                    set={set}
                    player={opp}
                    onSelectSet={onSelectSet}
                    onSelectCard={onSelectCard}
                    isSelectedSet={selectedSetId === set.id}
                    selectedCardId={selectedCardId}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
