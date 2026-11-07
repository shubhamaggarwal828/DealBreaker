import React, { useEffect, useRef } from 'react';
import { GameLogEntry } from '../types/game';
import { ScrollText } from 'lucide-react';

interface GameLogProps {
  logs: GameLogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const typeStyles = {
    action: 'text-amber-300',
    payment: 'text-emerald-400 font-semibold',
    info: 'text-stone-300',
    system: 'text-sky-400 font-semibold',
    alert: 'text-red-400 font-bold',
  };

  return (
    <div className="h-full bg-stone-950/80 border border-stone-800 rounded-2xl p-2 flex flex-col overflow-hidden shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-1 text-[9px] font-black uppercase text-stone-400 tracking-wider border-b border-stone-800/80 pb-1 mb-1 flex-shrink-0">
        <ScrollText className="w-3 h-3 text-amber-400" />
        <span>Activity Log</span>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-1 text-[10px] pr-1">
        {logs.length === 0 ? (
          <div className="text-[9px] text-stone-500 italic py-2 text-center">Game started. Draw cards to begin!</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="leading-tight">
              <span className="text-[8px] text-stone-500 font-mono mr-1">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={typeStyles[log.type]}>{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
