import React, { useState } from 'react';
import { Card } from '../types/game';
import { CardView } from './CardView';
import { Trash2, AlertCircle } from 'lucide-react';

interface DiscardModalProps {
  hand: Card[];
  maxHandLimit?: number;
  onConfirmDiscard: (cardIds: string[]) => void;
}

export const DiscardModal: React.FC<DiscardModalProps> = ({
  hand,
  maxHandLimit = 7,
  onConfirmDiscard,
}) => {
  const [selectedToDiscard, setSelectedToDiscard] = useState<string[]>([]);
  const neededToDiscard = Math.max(0, hand.length - maxHandLimit);
  const remainingCount = neededToDiscard - selectedToDiscard.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-white">Hand Limit Reached</h3>
            <p className="text-xs text-slate-400">
              You have {hand.length} cards. Discard down to {maxHandLimit} cards to end your turn.
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-300 font-bold mb-3 flex items-center gap-1.5 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {remainingCount > 0
              ? `Select ${remainingCount} more card${remainingCount > 1 ? 's' : ''} to discard:`
              : 'Required cards selected! Ready to discard.'}
          </span>
        </div>

        <div className="overflow-y-auto flex-1 py-2">
          <div className="flex flex-wrap gap-2.5 justify-center">
            {hand.map((card) => {
              const isSelected = selectedToDiscard.includes(card.id);
              return (
                <div key={card.id} className="relative">
                  <CardView
                    card={card}
                    size="md"
                    selected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedToDiscard((prev) => prev.filter((id) => id !== card.id));
                      } else {
                        if (selectedToDiscard.length < neededToDiscard) {
                          setSelectedToDiscard((prev) => [...prev, card.id]);
                        }
                      }
                    }}
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-md">
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4 flex justify-end">
          <button
            disabled={remainingCount !== 0}
            onClick={() => onConfirmDiscard(selectedToDiscard)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all
              ${
                remainingCount === 0
                  ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }
            `}
          >
            <Trash2 className="w-4 h-4" />
            <span>Discard Selected Cards</span>
          </button>
        </div>
      </div>
    </div>
  );
};

