import React, { useState } from 'react';
import { Card, Player, PropertyColor, PropertySet } from '../types/game';
import { COLOR_METAS } from '../engine/deck';
import { CardView } from './CardView';
import { isSetComplete } from '../engine/gameLogic';
import { X, Check, Target, Building2, Repeat, Coins } from 'lucide-react';

interface TargetSelectionModalProps {
  card: Card;
  me: Player;
  opponents: Player[];
  onConfirm: (params: {
    targetPlayerId?: string;
    targetSetId?: string;
    targetCardId?: string;
    offeredCardId?: string;
    rentColor?: PropertyColor;
  }) => void;
  onCancel: () => void;
}

export const TargetSelectionModal: React.FC<TargetSelectionModalProps> = ({
  card,
  me,
  opponents,
  onConfirm,
  onCancel,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [offeredCardId, setOfferedCardId] = useState<string>('');
  const [chosenRentColor, setChosenRentColor] = useState<PropertyColor | undefined>(
    card.colors ? card.colors[0] : card.mainColor
  );

  const selectedPlayer = opponents.find((p) => p.id === selectedPlayerId);

  // 1. DEAL BREAKER: Target completed set of opponent
  if (card.actionType === 'deal_breaker') {
    // Find all opponents who have at least one complete set
    const validOpponents = opponents.filter((opp) =>
      opp.propertySets.some((s) => isSetComplete(s))
    );

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
              <Target className="w-5 h-5" />
              <span>Deal Breaker: Steal a Full Set</span>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {validOpponents.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No opponent has a completed set yet to steal!
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-300">
                Choose a completed property set to steal from an opponent:
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {validOpponents.map((opp) => (
                  <div key={opp.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="font-bold text-xs text-amber-400 mb-2">{opp.name}'s Sets:</div>
                    <div className="flex flex-wrap gap-2">
                      {opp.propertySets
                        .filter((s) => isSetComplete(s))
                        .map((set) => {
                          const meta = COLOR_METAS[set.color];
                          const isSelected = selectedSetId === set.id;
                          return (
                            <button
                              key={set.id}
                              onClick={() => {
                                setSelectedPlayerId(opp.id);
                                setSelectedSetId(set.id);
                              }}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all
                                ${isSelected ? 'border-amber-400 bg-amber-400/20 ring-2 ring-amber-400' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}
                              `}
                            >
                              <div
                                style={{ backgroundColor: meta.colorHex }}
                                className="w-3.5 h-3.5 rounded-full"
                              />
                              <span className="font-extrabold text-xs text-white">
                                {meta.name} Set ({set.cards.length} cards)
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedSetId}
                  onClick={() =>
                    onConfirm({
                      targetPlayerId: selectedPlayerId,
                      targetSetId: selectedSetId,
                    })
                  }
                  className={`px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all
                    ${selectedSetId ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                  `}
                >
                  Steal Set!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. SLY DEAL: Steal single property (not part of full set)
  if (card.actionType === 'sly_deal') {
    const validOpponents = opponents.filter((opp) =>
      opp.propertySets.some((s) => !isSetComplete(s) && s.cards.length > 0)
    );

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-orange-500 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-orange-400 font-black text-lg">
              <Target className="w-5 h-5" />
              <span>Sly Deal: Steal a Property</span>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="text-xs text-slate-300">
              Select 1 property card from an opponent (cannot be from a full set):
            </div>

            {validOpponents.map((opp) => (
              <div key={opp.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="font-bold text-xs text-orange-400 mb-2">{opp.name}:</div>
                <div className="flex flex-wrap gap-2">
                  {opp.propertySets
                    .filter((s) => !isSetComplete(s))
                    .flatMap((s) =>
                      s.cards.map((entry) => {
                        const isSelected = selectedCardId === entry.card.id;
                        return (
                          <div
                            key={entry.card.id}
                            onClick={() => {
                              setSelectedPlayerId(opp.id);
                              setSelectedSetId(s.id);
                              setSelectedCardId(entry.card.id);
                            }}
                            className="cursor-pointer"
                          >
                            <CardView
                              card={entry.card}
                              activeColor={entry.currentColor}
                              size="sm"
                              selected={isSelected}
                            />
                          </div>
                        );
                      })
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              disabled={!selectedCardId}
              onClick={() =>
                onConfirm({
                  targetPlayerId: selectedPlayerId,
                  targetSetId: selectedSetId,
                  targetCardId: selectedCardId,
                })
              }
              className={`px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all
                ${selectedCardId ? 'bg-orange-500 hover:bg-orange-400 text-slate-950 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
              `}
            >
              Steal Card!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. DEBT COLLECTOR: Pick 1 player
  if (card.actionType === 'debt_collector') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-yellow-400 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-yellow-400 font-black text-lg">
              <Coins className="w-5 h-5" />
              <span>Debt Collector (₹5 Cr)</span>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs text-slate-300 mb-3">
            Choose which player must pay you ₹5 Cr:
          </div>

          <div className="space-y-2 mb-4">
            {opponents.map((opp) => {
              const isSelected = selectedPlayerId === opp.id;
              const bankTotal = opp.bank.reduce((sum, c) => sum + c.value, 0);
              return (
                <button
                  key={opp.id}
                  onClick={() => setSelectedPlayerId(opp.id)}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all
                    ${isSelected ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}
                  `}
                >
                  <span className="font-extrabold text-sm text-white">{opp.name}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Bank: ₹{bankTotal} Cr
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              disabled={!selectedPlayerId}
              onClick={() => onConfirm({ targetPlayerId: selectedPlayerId })}
              className={`px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all
                ${selectedPlayerId ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
              `}
            >
              Collect ₹5 Cr!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. RENT CARD (Color Picker + Wild Rent Target)
  if (card.type === 'rent') {
    // Determine which colors player actually owns properties in
    const ownedColors = Array.from(new Set(me.propertySets.map((s) => s.color)));

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-indigo-400 font-black text-lg">
              <Coins className="w-5 h-5" />
              <span>Charge Rent</span>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Color selection */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">Select Property Color:</div>
              <div className="flex flex-wrap gap-2">
                {(card.isWildRent ? ownedColors : card.colors || []).map((col) => {
                  const meta = COLOR_METAS[col];
                  const isSelected = chosenRentColor === col;
                  const ownsThisColor = ownedColors.includes(col);

                  return (
                    <button
                      key={col}
                      disabled={!ownsThisColor}
                      onClick={() => setChosenRentColor(col)}
                      style={{ backgroundColor: meta.colorHex }}
                      className={`px-3 py-2 rounded-xl font-black text-xs text-white shadow transition-all uppercase flex items-center gap-1.5
                        ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : 'opacity-85 hover:opacity-100'}
                        ${!ownsThisColor ? 'opacity-30 cursor-not-allowed' : ''}
                      `}
                    >
                      <span>{meta.name}</span>
                      {!ownsThisColor && <span className="text-[9px] lowercase font-normal">(0 owned)</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Wild Rent: pick target player */}
            {card.isWildRent && (
              <div>
                <div className="text-xs font-bold text-slate-300 mb-2">Target Player:</div>
                <div className="space-y-1.5">
                  {opponents.map((opp) => (
                    <button
                      key={opp.id}
                      onClick={() => setSelectedPlayerId(opp.id)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all
                        ${selectedPlayerId === opp.id ? 'border-purple-400 bg-purple-400/20' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}
                      `}
                    >
                      <span className="text-white">{opp.name}</span>
                      <span className="text-emerald-400 font-mono">
                        Bank: ₹{opp.bank.reduce((sum, c) => sum + c.value, 0)} Cr
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={!chosenRentColor || (card.isWildRent && !selectedPlayerId)}
                onClick={() =>
                  onConfirm({
                    rentColor: chosenRentColor,
                    targetPlayerId: selectedPlayerId,
                  })
                }
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                Collect Rent!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
