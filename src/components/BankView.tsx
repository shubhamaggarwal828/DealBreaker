import React from 'react';
import { Card } from '../types/game';
import { CardView } from './CardView';
import { Landmark, DollarSign } from 'lucide-react';

interface BankViewProps {
  bank: Card[];
  onSelectBankCard?: (cardId: string) => void;
  selectedCardIds?: string[];
  isCompact?: boolean;
}

export const BankView: React.FC<BankViewProps> = ({
  bank,
  onSelectBankCard,
  selectedCardIds = [],
  isCompact = false,
}) => {
  const totalBankValue = bank.reduce((sum, card) => sum + card.value, 0);

  return (
    <div className="h-full bg-stone-900/90 border border-stone-800 rounded-2xl p-2 flex flex-col justify-between shadow-xl backdrop-blur-md">
      {/* Header Tray */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-1 mb-1">
        <div className="flex items-center gap-1 text-amber-400 font-black text-[11px] uppercase tracking-wider">
          <Landmark className="w-3.5 h-3.5 text-emerald-400" />
          <span>YOUR BANK</span>
        </div>
        <div className="bg-emerald-950 border border-emerald-500/50 px-2 py-0.5 rounded-full text-emerald-300 font-mono font-black text-xs shadow flex items-center gap-0.5">
          <DollarSign className="w-3 h-3 text-emerald-400" />
          <span>{totalBankValue}M CASH</span>
        </div>
      </div>

      {/* Cards stack */}
      {bank.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[90px] text-[10px] text-stone-500 font-bold border border-dashed border-stone-800 rounded-xl bg-stone-950/40">
          Deposit cash or action cards
        </div>
      ) : (
        <div className="flex-1 flex items-center -space-x-12 hover:-space-x-6 transition-all duration-300 overflow-x-auto py-1 pr-2">
          {bank.map((card) => {
            const isSelected = selectedCardIds.includes(card.id);
            return (
              <div key={card.id} className="transition-transform flex-shrink-0">
                <CardView
                  card={card}
                  size={isCompact ? 'xs' : 'sm'}
                  selected={isSelected}
                  onClick={() => onSelectBankCard && onSelectBankCard(card.id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
