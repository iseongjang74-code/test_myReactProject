
import React, { useEffect, useState } from 'react';
import { RefreshCw, LayoutDashboard } from 'lucide-react';
import { getGameOverCommentary } from '../services/geminiService';
import { AICommentary } from '../../../../types';

interface GameOverProps {
  score: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart }) => {
  const [commentary, setCommentary] = useState<AICommentary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommentary = async () => {
      const result = await getGameOverCommentary(score);
      setCommentary(result);
      setLoading(false);
    };
    fetchCommentary();
  }, [score]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl z-50 p-6 text-center animate-in fade-in duration-500">
      <h2 className="text-6xl font-orbitron font-bold text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
        SYSTEM FAILURE
      </h2>
      <p className="text-gray-400 mb-8 tracking-[0.2em] uppercase">Snake Core Deinitialized</p>

      <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 w-full max-w-md">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Final Analysis</p>
        <p className="text-4xl font-orbitron text-white mb-4">{score}</p>
        
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-blue-400 italic animate-pulse">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            AI 분석 중...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold tracking-tighter">
              RANK: {commentary?.rank}
            </div>
            <p className="text-lg text-gray-200 leading-relaxed font-light italic">
              "{commentary?.message}"
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="group flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(74,222,128,0.4)]"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          REBOOT SYSTEM
        </button>
      </div>
    </div>
  );
};

export default GameOver;
