import React from 'react';
import { Card } from '../types/game';
import { CardView } from './CardView';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface CenterPlayPileProps {
  drawPileCount: number;
  discardPile: Card[];
  cardsPlayedThisTurn: number;
  isMyTurn: boolean;
  onEndTurn: () => void;
  canEndTurn: boolean;
}

export const CenterPlayPile: React.FC<CenterPlayPileProps> = ({
  drawPileCount,
  discardPile,
  cardsPlayedThisTurn,
  isMyTurn,
  onEndTurn,
  canEndTurn,
}) => {
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  return (
    <div className="h-full flex items-center justify-center gap-3 sm:gap-4 px-3 py-1.5 rounded-2xl bg-stone-900/70 border border-stone-800/80 shadow-xl backdrop-blur-md">
      {/* 1. Draw Pile */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="relative w-[82px] h-[116px] rounded-xl bg-gradient-to-br from-red-950 via-stone-900 to-red-950 border border-amber-400/80 shadow-xl flex flex-col items-center justify-center text-center p-1 group">
          {/* 3D Stack depth */}
          <div className="absolute -top-1 -left-1 w-[82px] h-[116px] rounded-xl bg-stone-800 border border-stone-700 -z-10 shadow" />
          <div className="absolute -top-2 -left-2 w-[82px] h-[116px] rounded-xl bg-stone-900 border border-stone-800 -z-20 shadow-md" />

          {/* Ornate back pattern */}
          <div className="w-full h-full rounded-lg border border-amber-400/30 flex flex-col items-center justify-center p-1 bg-gradient-to-b from-red-900/40 to-black/60">
            <Sparkles className="w-4 h-4 text-amber-400 mb-0.5 animate-pulse" />
            <div className="text-[8px] font-black uppercase text-amber-300 tracking-wider">
              DEAL
            </div>
            <div className="text-[9px] font-black uppercase text-white tracking-widest">
              BREAKER
            </div>
            <div className="mt-1 text-sm font-black font-mono text-amber-400 bg-black/60 px-1.5 py-0.2 rounded-full border border-amber-500/40">
              {drawPileCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Discard Pile */}
      <div className="flex flex-col items-center flex-shrink-0">
        {topDiscard ? (
          <div className="relative">
            <CardView card={topDiscard} size="sm" />
            <div className="absolute -bottom-1.5 inset-x-0 mx-auto w-max px-1.5 py-0.2 rounded-full bg-stone-950 border border-stone-700 text-[8px] font-black text-amber-300 shadow">
              Discard ({discardPile.length})
            </div>
          </div>
        ) : (
          <div className="w-[82px] h-[116px] rounded-xl border border-dashed border-stone-700 flex flex-col items-center justify-center text-stone-500 text-[9px] font-black uppercase tracking-wider bg-stone-950/30 text-center p-1">
            Discard Pile
          </div>
        )}
      </div>

      {/* 3. Turn Controls & Plays Tokens */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <div className="bg-stone-950/90 border border-stone-800 px-3 py-1.5 rounded-xl flex flex-col items-center shadow">
          <div className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1">
            Plays Left
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((idx) => {
              const used = idx < cardsPlayedThisTurn;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full flex items-center justify-center font-black text-[8px] border transition-all duration-300
                    ${
                      used
                        ? 'bg-stone-800 border-stone-700 text-stone-600 scale-90'
                        : 'bg-gradient-to-br from-amber-300 to-yellow-500 border-amber-200 text-stone-950 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse'
                    }
                  `}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
          <span className="text-[9px] font-mono text-stone-300 mt-1 font-bold">
            {3 - cardsPlayedThisTurn} / 3 plays
          </span>
        </div>

        {isMyTurn && (
          <button
            disabled={!canEndTurn}
            onClick={onEndTurn}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1 transition-all uppercase tracking-wider w-full justify-center
              ${
                canEndTurn
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 hover:from-amber-300 hover:to-yellow-200 border border-amber-200 shadow-card-glow active:scale-95'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
              }
            `}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>End Turn</span>
          </button>
        )}
      </div>
    </div>
  );
};
