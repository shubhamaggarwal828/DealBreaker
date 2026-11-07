import React from 'react';
import { X, Trophy, DollarSign, Building2, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { COLOR_METAS } from '../engine/deck';
import { PropertyColor } from '../types/game';

interface RuleBookModalProps {
  onClose: () => void;
}

export const RuleBookModal: React.FC<RuleBookModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-6 h-6" />
            <h2 className="text-xl font-black text-white">How to Play Business Deal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* Winning Condition */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
            <h3 className="font-black text-base text-amber-300 flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5" /> The Winning Goal
            </h3>
            <p>
              Be the <strong>first player to collect 3 complete property sets</strong> of different colors in front of you on the table!
            </p>
          </div>

          {/* Turn Flow */}
          <div>
            <h3 className="font-black text-base text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-400" /> On Your Turn
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>
                <strong>Draw 2 cards</strong> from the draw pile (or draw 5 if your hand is completely empty!).
              </li>
              <li>
                <strong>Play up to 3 cards</strong> from your hand onto the table:
                <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-slate-400">
                  <li><strong>Deposit into Bank:</strong> Money cards or Action cards (used as cash).</li>
                  <li><strong>Lay down Properties:</strong> Place properties or wildcards into color sets.</li>
                  <li><strong>Play Action Cards:</strong> Charge rent, steal sets, draw extra cards!</li>
                </ul>
              </li>
              <li>
                <strong>End your turn:</strong> If you hold more than 7 cards, you must discard down to 7.
              </li>
            </ol>
          </div>

          {/* Golden Rules */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Paying Rents & Debts
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>You can <strong>ONLY pay debts from cards on your table</strong> (your Bank or Properties).</li>
              <li>You <strong>NEVER pay from your hand</strong>.</li>
              <li><strong>NO CHANGE IS GIVEN!</strong> If you owe $2M and pay with a $5M bill, you don't get $3M back.</li>
              <li>If you have $0 on your table, you pay nothing (you don't go into negative debt).</li>
            </ul>
          </div>

          {/* Action Cards Guide */}
          <div>
            <h3 className="font-black text-base text-white flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" /> Power Action Cards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-amber-400">Deal Breaker ($5M):</span>
                <p className="text-slate-400 mt-0.5">Steal an entire completed property set from an opponent (including Houses/Hotels)!</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-red-400">Just Say No ($4M):</span>
                <p className="text-slate-400 mt-0.5">Cancel any action card played against you! Can be played at any time.</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-orange-400">Sly Deal ($3M):</span>
                <p className="text-slate-400 mt-0.5">Steal 1 single property card from an opponent (cannot be from a full set).</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-yellow-400">Debt Collector ($5M):</span>
                <p className="text-slate-400 mt-0.5">Force any 1 player to pay you $5M from their bank or properties.</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-pink-400">It's My Birthday ($2M):</span>
                <p className="text-slate-400 mt-0.5">Every player at the table must pay you $2M!</p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="font-extrabold text-blue-400">Pass Go ($1M):</span>
                <p className="text-slate-400 mt-0.5">Draw 2 extra cards from the deck.</p>
              </div>
            </div>
          </div>

          {/* Property Sets & Sizes */}
          <div>
            <h3 className="font-black text-base text-white flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-purple-400" /> Property Colors & Set Sizes
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {(Object.keys(COLOR_METAS) as PropertyColor[]).map((col) => {
                const meta = COLOR_METAS[col];
                return (
                  <div
                    key={col}
                    style={{ borderColor: meta.colorHex }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border"
                  >
                    <div style={{ backgroundColor: meta.colorHex }} className="w-3 h-3 rounded-full" />
                    <span className="font-bold text-white">{meta.name}:</span>
                    <span className="text-slate-400 font-mono">{meta.setSize} cards</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

