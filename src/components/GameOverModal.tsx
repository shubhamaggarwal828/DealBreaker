import React, { useEffect } from 'react';
import { Player } from '../types/game';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Crown } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameOverModalProps {
  winner: Player;
  isHost: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  isHost,
  onRestart,
}) => {
  useEffect(() => {
    sounds.playVictory();

    // Fire fireworks confetti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [winner.id]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl flex flex-col items-center animate-in zoom-in-90 duration-300">
        <div className="w-20 h-20 rounded-full bg-amber-400/20 text-amber-300 border-2 border-amber-400 flex items-center justify-center mb-4 shadow-card-glow animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-black text-amber-400 mb-1">
          <Crown className="w-4 h-4" /> Property Tycoon Victorious!
        </div>

        <h1 className="text-3xl font-black text-white mb-2">
          {winner.name} Wins!
        </h1>

        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Completed <strong>3 full sets of properties</strong> and conquered the board!
        </p>

        {isHost ? (
          <button
            onClick={onRestart}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again (New Match)</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Waiting for host to start a new match...
          </div>
        )}
      </div>
    </div>
  );
};

