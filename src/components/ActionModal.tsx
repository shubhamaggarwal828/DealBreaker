import React, { useState, useEffect } from 'react';
import {
  Card,
  Player,
  PropertyColor,
  PropertySet,
  PendingPayment,
  PendingAction,
} from '../types/game';
import { COLOR_METAS } from '../engine/deck';
import { CardView } from './CardView';
import { ShieldAlert, Zap, Coins, Check, X, AlertTriangle } from 'lucide-react';
import { isSetComplete } from '../engine/gameLogic';

interface ActionModalProps {
  myPlayerId: string;
  players: Player[];
  pendingAction: PendingAction | null;
  pendingPayments: PendingPayment[];
  onResolveJustSayNo: (playCard: boolean, cardId?: string) => void;
  onPayDebt: (cardIdsFromBank: string[], propertyPayments: { setId: string; cardId: string }[]) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  myPlayerId,
  players,
  pendingAction,
  pendingPayments,
  onResolveJustSayNo,
  onPayDebt,
}) => {
  const me = players.find((p) => p.id === myPlayerId);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [selectedPropIds, setSelectedPropIds] = useState<{ setId: string; cardId: string }[]>([]);

  // 1. JUST SAY NO PROMPT
  const isTargetOfAction = pendingAction && pendingAction.targetPlayerId === myPlayerId;
  const justSayNoCards = me?.hand.filter(
    (c) => c.type === 'action' && c.actionType === 'just_say_no'
  ) || [];

  // Countdown timer for Just Say No
  const [countdown, setCountdown] = useState(8);
  useEffect(() => {
    if (isTargetOfAction) {
      setCountdown(8);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onResolveJustSayNo(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pendingAction?.id, isTargetOfAction]);

  // 2. PENDING PAYMENT PROMPT
  const myPayment = pendingPayments.find((p) => p.fromPlayerId === myPlayerId);
  const creditor = myPayment ? players.find((p) => p.id === myPayment.toPlayerId) : null;

  // Calculate current selected total
  const selectedBankTotal = selectedBankIds.reduce((sum, id) => {
    const card = me?.bank.find((c) => c.id === id);
    return sum + (card?.value || 0);
  }, 0);

  const selectedPropTotal = selectedPropIds.reduce((sum, item) => {
    const set = me?.propertySets.find((s) => s.id === item.setId);
    const card = set?.cards.find((c) => c.card.id === item.cardId)?.card;
    return sum + (card?.value || 0);
  }, 0);

  const currentPaymentTotal = selectedBankTotal + selectedPropTotal;

  // Check if player has anything at all to pay
  const totalAssetsOnTable =
    (me?.bank.reduce((sum, c) => sum + c.value, 0) || 0) +
    (me?.propertySets.reduce(
      (sum, s) => sum + s.cards.reduce((cSum, c) => cSum + c.card.value, 0),
      0
    ) || 0);

  const canSubmitPayment =
    myPayment &&
    (currentPaymentTotal >= myPayment.amountOwed ||
      (totalAssetsOnTable < myPayment.amountOwed && currentPaymentTotal === totalAssetsOnTable));

  // --- RENDER JUST SAY NO MODAL ---
  if (isTargetOfAction && pendingAction) {
    const attacker = players.find((p) => p.id === pendingAction.sourcePlayerId);

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-red-500 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4 animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white mb-1">
            Incoming Attack!
          </h2>
          <p className="text-slate-300 text-sm mb-4">
            <strong className="text-amber-400">{attacker?.name}</strong> played{' '}
            <strong className="text-red-400 uppercase">{pendingAction.actionCard.name}</strong> against you!
          </p>

          <div className="my-2">
            <CardView card={pendingAction.actionCard} size="md" />
          </div>

          <div className="text-xs text-slate-400 my-3">
            Auto-resolving in <span className="text-amber-400 font-mono font-bold text-sm">{countdown}s</span>
          </div>

          <div className="flex gap-3 w-full mt-2">
            {justSayNoCards.length > 0 ? (
              <button
                onClick={() => onResolveJustSayNo(true, justSayNoCards[0].id)}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Play "Just Say No"!</span>
              </button>
            ) : (
              <div className="flex-1 py-2 text-xs text-slate-500 italic">
                (No Just Say No cards in hand)
              </div>
            )}

            <button
              onClick={() => onResolveJustSayNo(false)}
              className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-sm transition-all"
            >
              Accept Action
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER DEBT PAYMENT MODAL ---
  if (myPayment && me) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Coins className="w-6 h-6" />
              <div>
                <h3 className="font-black text-lg text-white">Payment Due</h3>
                <p className="text-xs text-slate-400">{myPayment.reason}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Amount Owed</div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                ${myPayment.amountOwed}M
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 mb-2">
            Pay <strong className="text-emerald-400">{creditor?.name}</strong> using cards from your <strong>Bank</strong> or <strong>Properties</strong>. (No change given!)
          </div>

          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {/* 1. Pick from Bank */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Bank (${selectedBankTotal}M selected)
              </div>
              {me.bank.length === 0 ? (
                <div className="text-xs text-slate-600 italic">No cash in bank</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {me.bank.map((card) => {
                    const isSelected = selectedBankIds.includes(card.id);
                    return (
                      <CardView
                        key={card.id}
                        card={card}
                        size="sm"
                        selected={isSelected}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedBankIds((prev) => prev.filter((id) => id !== card.id));
                          } else {
                            setSelectedBankIds((prev) => [...prev, card.id]);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Pick from Properties */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Properties (${selectedPropTotal}M selected)
              </div>
              {me.propertySets.length === 0 ? (
                <div className="text-xs text-slate-600 italic">No properties on table</div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {me.propertySets.map((set) => (
                    <div key={set.id} className="flex gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                      {set.cards.map((entry) => {
                        const isSelected = selectedPropIds.some(
                          (item) => item.setId === set.id && item.cardId === entry.card.id
                        );
                        return (
                          <CardView
                            key={entry.card.id}
                            card={entry.card}
                            activeColor={entry.currentColor}
                            size="sm"
                            selected={isSelected}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedPropIds((prev) =>
                                  prev.filter(
                                    (item) => !(item.setId === set.id && item.cardId === entry.card.id)
                                  )
                                );
                              } else {
                                setSelectedPropIds((prev) => [
                                  ...prev,
                                  { setId: set.id, cardId: entry.card.id },
                                ]);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Total Selected:</div>
              <div
                className={`text-xl font-black font-mono ${
                  currentPaymentTotal >= myPayment.amountOwed ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                ${currentPaymentTotal}M / ${myPayment.amountOwed}M
              </div>
            </div>

            <button
              disabled={!canSubmitPayment}
              onClick={() => {
                onPayDebt(selectedBankIds, selectedPropIds);
                setSelectedBankIds([]);
                setSelectedPropIds([]);
              }}
              className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg transition-all
                ${
                  canSubmitPayment
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              <Check className="w-4 h-4" />
              <span>Confirm Payment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

