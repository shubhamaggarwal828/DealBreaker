import React from 'react';
import { PropertySet, PropertyColor } from '../types/game';
import { COLOR_METAS } from '../engine/deck';
import { CardView } from './CardView';
import { Crown, Home, Building2, RefreshCw } from 'lucide-react';
import { isSetComplete } from '../engine/gameLogic';

interface PropertyAreaProps {
  propertySets: PropertySet[];
  isMyTurn?: boolean;
  onFlipWildcard?: (cardId: string, setId: string, newColor: PropertyColor) => void;
  onSelectSet?: (set: PropertySet) => void;
  onSelectCard?: (set: PropertySet, cardId: string) => void;
  selectableSetId?: string;
  selectableCardId?: string;
  isCompact?: boolean;
}

export const PropertyArea: React.FC<PropertyAreaProps> = ({
  propertySets,
  isMyTurn = false,
  onFlipWildcard,
  onSelectSet,
  onSelectCard,
  selectableSetId,
  selectableCardId,
  isCompact = false,
}) => {
  if (propertySets.length === 0) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-emerald-800/40 rounded-xl text-emerald-400/60 font-semibold bg-emerald-950/20 px-3
          ${isCompact ? 'h-14 text-[10px]' : 'h-20 text-xs'}
        `}
      >
        No properties placed yet
      </div>
    );
  }

  return (
    <div className="flex flex-nowrap gap-2 items-center overflow-x-auto py-0.5 max-w-full">
      {propertySets.map((set) => {
        const meta = COLOR_METAS[set.color];
        const complete = isSetComplete(set);

        return (
          <div
            key={set.id}
            onClick={() => onSelectSet && onSelectSet(set)}
            className={`flex-shrink-0 flex flex-col bg-stone-900/90 backdrop-blur-sm rounded-xl p-1.5 border transition-all duration-200 relative shadow-md
              ${complete ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-stone-700/80 hover:border-stone-500'}
              ${selectableSetId === set.id ? 'ring-3 ring-emerald-400 scale-102' : ''}
              ${onSelectSet ? 'cursor-pointer hover:scale-102' : ''}
            `}
          >
            {/* Set Header Ribbon */}
            <div className="flex items-center justify-between gap-1.5 mb-1 px-0.5">
              <div className="flex items-center gap-1">
                <div
                  style={{ backgroundColor: meta.colorHex }}
                  className="w-2.5 h-2.5 rounded-full border border-white/60 shadow flex-shrink-0"
                />
                <span className="text-[10px] font-black text-stone-100 uppercase tracking-tight truncate max-w-[65px]">
                  {meta.name}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Complete Set Badge */}
                {complete && (
                  <span className="flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 px-1.5 py-0.2 rounded-full font-black text-[8px] uppercase tracking-wider shadow">
                    <Crown className="w-2.5 h-2.5 fill-current" /> Complete
                  </span>
                )}

                {/* House/Hotel Badges */}
                {set.hasHouse && (
                  <span className="bg-emerald-600 text-white px-1 py-0.2 rounded text-[8px] font-black flex items-center gap-0.5 shadow" title="House (+ $3M rent)">
                    <Home className="w-2 h-2" /> +3M
                  </span>
                )}
                {set.hasHotel && (
                  <span className="bg-red-600 text-white px-1 py-0.2 rounded text-[8px] font-black flex items-center gap-0.5 shadow" title="Hotel (+ $4M rent)">
                    <Building2 className="w-2 h-2" /> +4M
                  </span>
                )}

                <span className="text-[9px] text-stone-300 font-mono font-black bg-stone-800 px-1 py-0.2 rounded border border-stone-700">
                  {set.cards.length}/{meta.setSize}
                </span>
              </div>
            </div>

            {/* Overlapping Card Fan */}
            <div className={`flex transition-all duration-200 pt-0.5 ${isCompact ? '-space-x-10 hover:-space-x-7' : '-space-x-12 hover:-space-x-7'}`}>
              {set.cards.map((entry) => {
                const isSelected = selectableCardId === entry.card.id;
                const canFlip =
                  isMyTurn &&
                  onFlipWildcard &&
                  (entry.card.type === 'wildcard' || entry.card.isMultiWildcard);

                return (
                  <div key={entry.card.id} className="relative group transition-transform flex-shrink-0">
                    <CardView
                      card={entry.card}
                      activeColor={entry.currentColor}
                      size={isCompact ? 'xs' : 'sm'}
                      selected={isSelected}
                      onClick={() => onSelectCard && onSelectCard(set, entry.card.id)}
                    />

                    {/* Wildcard Switch Color Pill */}
                    {canFlip && (
                      <div className="absolute -top-2.5 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex gap-0.5">
                        {entry.card.colors?.map((c) => {
                          if (c === entry.currentColor) return null;
                          return (
                            <button
                              key={c}
                              onClick={(e) => {
                                e.stopPropagation();
                                onFlipWildcard(entry.card.id, set.id, c);
                              }}
                              className="px-1.5 py-0.2 rounded-full bg-stone-900 border border-amber-400 text-amber-300 shadow-lg hover:scale-105 flex items-center gap-0.5 text-[8px] font-black uppercase"
                              title={`Switch to ${COLOR_METAS[c].name}`}
                            >
                              <RefreshCw className="w-2 h-2" />
                              {COLOR_METAS[c].name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
