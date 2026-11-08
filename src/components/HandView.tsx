import React from 'react';
import { Card, PropertyColor } from '../types/game';
import { CardView } from './CardView';
import { Landmark, Building2, Zap, X } from 'lucide-react';
import { COLOR_METAS } from '../engine/deck';

interface HandViewProps {
  hand: Card[];
  selectedCard: Card | null;
  onSelectCard: (card: Card | null) => void;
  onPlayToBank: (card: Card) => void;
  onPlayToProperty: (card: Card, targetColor?: PropertyColor) => void;
  onPlayAction: (card: Card) => void;
  isMyTurn: boolean;
  movesRemaining: number;
  isActionResolving?: boolean;
}

export const HandView: React.FC<HandViewProps> = ({
  hand,
  selectedCard,
  onSelectCard,
  onPlayToBank,
  onPlayToProperty,
  onPlayAction,
  isMyTurn,
  movesRemaining,
  isActionResolving = false,
}) => {
  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Waiting Status Pill when an action or debt is resolving */}
      {isActionResolving && isMyTurn && (
        <div className="absolute -top-10 z-40 bg-amber-500/90 text-stone-950 font-black text-xs px-3 py-1 rounded-full shadow-lg border border-yellow-200 animate-pulse flex items-center gap-1.5">
          <span>⏳</span>
          <span>Awaiting Action Compliance / Payments...</span>
        </div>
      )}

      {/* Floating Action Ribbon when card is selected */}
      {selectedCard && isMyTurn && movesRemaining > 0 && !isActionResolving && (
        <div className="absolute -top-12 z-50 bg-stone-900/95 backdrop-blur-md border border-amber-400 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="text-[11px] font-black text-amber-300 pr-2 border-r border-stone-700 uppercase tracking-tight truncate max-w-[120px]">
            {selectedCard.name}
          </div>

          {/* 1. Deposit to Bank */}
          {selectedCard.value > 0 && (
            <button
              onClick={() => onPlayToBank(selectedCard)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg font-black text-[11px] shadow transition-all active:scale-95"
            >
              <Landmark className="w-3 h-3" />
              <span>Deposit (₹{selectedCard.value} Cr)</span>
            </button>
          )}

          {/* 2. Lay to Properties */}
          {(selectedCard.type === 'property' || selectedCard.type === 'wildcard') && (
            <>
              {selectedCard.colors && selectedCard.colors.length > 0 ? (
                <div className="flex items-center gap-1">
                  {selectedCard.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => onPlayToProperty(selectedCard, c)}
                      style={{ backgroundColor: COLOR_METAS[c].colorHex }}
                      className="px-2.5 py-1.5 rounded-lg font-black text-[11px] text-white shadow hover:scale-105 active:scale-95 transition-all uppercase"
                    >
                      As {COLOR_METAS[c].name}
                    </button>
                  ))}
                </div>
              ) : selectedCard.isMultiWildcard ? (
                <button
                  onClick={() => onPlayToProperty(selectedCard)}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 text-white rounded-lg font-black text-[11px] shadow hover:scale-105 active:scale-95 transition-all uppercase"
                >
                  Lay Wildcard
                </button>
              ) : (
                <button
                  onClick={() => onPlayToProperty(selectedCard, selectedCard.mainColor)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black text-[11px] shadow transition-all active:scale-95"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Lay Property</span>
                </button>
              )}
            </>
          )}

          {/* 3. House / Hotel */}
          {(selectedCard.actionType === 'house' || selectedCard.actionType === 'hotel') && (
            <button
              onClick={() => onPlayToProperty(selectedCard)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black text-[11px] shadow transition-all active:scale-95"
            >
              <Building2 className="w-3 h-3" />
              <span>Add to Full Set</span>
            </button>
          )}

          {/* 4. Play Action / Rent */}
          {(selectedCard.type === 'action' || selectedCard.type === 'rent') &&
            selectedCard.actionType !== 'house' &&
            selectedCard.actionType !== 'hotel' && (
              <button
                onClick={() => onPlayAction(selectedCard)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 rounded-lg font-black text-[11px] shadow transition-all active:scale-95 uppercase tracking-wide"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>Play Action</span>
              </button>
            )}

          {/* Cancel button */}
          <button
            onClick={() => onSelectCard(null)}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors ml-0.5"
            title="Deselect"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cards Fan Carousel */}
      <div className="w-full flex items-center justify-center -space-x-8 sm:-space-x-7 md:-space-x-5 hover:-space-x-2 transition-all duration-300 py-1 overflow-x-auto px-4 max-w-full">
        {hand.length === 0 ? (
          <div className="text-xs text-stone-500 font-bold italic py-4">Your hand is empty</div>
        ) : (
          hand.map((card) => {
            const isSelected = selectedCard?.id === card.id;

            return (
              <div
                key={card.id}
                className={`transform transition-all duration-200 flex-shrink-0
                  ${isSelected ? '-translate-y-3 z-30' : 'hover:-translate-y-2 hover:z-20'}
                `}
              >
                <CardView
                  card={card}
                  selected={isSelected}
                  onClick={() => onSelectCard(isSelected ? null : card)}
                  size="md"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
