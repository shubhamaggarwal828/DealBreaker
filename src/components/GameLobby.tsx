import React, { useState } from 'react';
import { Player } from '../types/game';
import {
  Users,
  Copy,
  Check,
  Play,
  ArrowRight,
  Shield,
  HelpCircle,
  Volume2,
  VolumeX,
  Bot,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameLobbyProps {
  status: 'initial' | 'hosting' | 'joining';
  roomCode: string;
  players: Player[];
  myPlayerId: string;
  isHost: boolean;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onStartGame: () => void;
  onOpenRules: () => void;
  onAddBot?: () => void;
  onStartSoloBot?: (name: string, botCount: number) => void;
  onCancelJoin?: () => void;
  initialRoomCode?: string;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  status,
  roomCode,
  players,
  myPlayerId,
  isHost,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onOpenRules,
  onAddBot,
  onStartSoloBot,
  onCancelJoin,
  initialRoomCode = '',
}) => {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState(initialRoomCode);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  React.useEffect(() => {
    if (initialRoomCode) {
      setJoinCode(initialRoomCode.toUpperCase().trim());
    }
  }, [initialRoomCode]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const res = sounds.toggleSound();
    setSoundEnabled(res);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top action buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all shadow"
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
        <button
          onClick={onOpenRules}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-bold shadow"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Rules</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-card-glow mb-3">
            <span className="text-3xl">🤝</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Deal<span className="text-amber-400">Breaker</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Realtime Multiplayer Property Card Game
          </p>
        </div>

        {/* 1. INITIAL VIEW (Pick Name + Create / Join) */}
        {status === 'initial' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Your Nickname
              </label>
              <input
                type="text"
                placeholder="Enter player name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 font-bold focus:outline-none focus:border-amber-400 transition-all text-sm"
              />
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                disabled={!name.trim()}
                onClick={() => onCreateRoom(name.trim())}
                className="py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Host Game</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. DEAL7)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 font-mono text-center uppercase font-bold focus:outline-none focus:border-sky-400 text-xs"
                />
                <button
                  disabled={!name.trim() || !joinCode.trim()}
                  onClick={() => onJoinRoom(joinCode.trim(), name.trim())}
                  className="py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Solo Practice vs AI Bots */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or Play Solo vs AI Bots
                </span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => onStartSoloBot?.(name.trim() || 'Player', 1)}
                  className="py-2.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-[10px] font-bold border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>1 vs 1</span>
                  <span className="text-[8px] text-slate-400 font-normal">1 Bot</span>
                </button>
                <button
                  onClick={() => onStartSoloBot?.(name.trim() || 'Player', 2)}
                  className="py-2.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-[10px] font-bold border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>3 Players</span>
                  <span className="text-[8px] text-slate-400 font-normal">2 Bots</span>
                </button>
                <button
                  onClick={() => onStartSoloBot?.(name.trim() || 'Player', 3)}
                  className="py-2.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-[10px] font-bold border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>4 Players</span>
                  <span className="text-[8px] text-slate-400 font-normal">3 Bots</span>
                </button>
                <button
                  onClick={() => onStartSoloBot?.(name.trim() || 'Player', 4)}
                  className="py-2.5 px-1 bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 hover:text-white rounded-2xl text-[10px] font-bold border border-purple-700/80 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>5 Players</span>
                  <span className="text-[8px] text-purple-300 font-normal">4 Bots (Max)</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Realtime Multiplayer — 100% Free & No Account Needed</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. LOBBY WAITING ROOM (Host / Joined) */}
        {(status === 'hosting' || status === 'joining') && (
          <>
            {status === 'joining' && (players.length === 0 || !players.some((p) => p.id === myPlayerId)) ? (
              <div className="py-8 px-4 text-center space-y-5">
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
                  <Users className="w-6 h-6 text-amber-400 absolute" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Connecting to Table
                  </div>
                  <div className="text-3xl font-mono font-black text-amber-400 tracking-widest mb-2">
                    {roomCode}
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Connecting to the host table. Please wait a moment...
                  </p>
                </div>
                {onCancelJoin && (
                  <button
                    onClick={onCancelJoin}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all shadow"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Room Code Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Room Invite Code
                  </div>
                  <div className="text-3xl font-mono font-black text-amber-400 tracking-widest my-1">
                    {roomCode}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Game Link'}</span>
                  </button>
                </div>

                {/* Players List */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Players at Table ({players.length}/5)</span>
                    </div>
                    {isHost && players.length < 5 && (
                      <button
                        onClick={onAddBot}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 hover:text-white text-[11px] font-bold transition-all shadow active:scale-95"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>+ Add AI Bot</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {players.map((p, idx) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-bold"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-amber-400">
                            {idx + 1}
                          </div>
                          <span className="text-white">
                            {p.name} {p.id === myPlayerId && <span className="text-slate-500 text-xs">(You)</span>}
                          </span>
                        </div>
                        {p.isHost && (
                          <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                            Host
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Game Button (Host Only) */}
                {isHost ? (
                  <button
                    disabled={players.length < 2}
                    onClick={onStartGame}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95
                      ${
                        players.length >= 2
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 cursor-pointer animate-pulse'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }
                    `}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{players.length >= 2 ? 'Deal Cards & Start!' : 'Waiting for at least 2 players...'}</span>
                  </button>
                ) : (
                  <div className="text-center p-3 text-xs text-slate-400 italic">
                    Waiting for the host to deal cards...
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
