
import React from 'react';
import { Trophy, Zap, Layers } from 'lucide-react';

interface HUDProps {
  score: number;
  highScore: number;
  level: number;
}

const HUD: React.FC<HUDProps> = ({ score, highScore, level }) => {
  return (
    <div className="flex justify-between items-center w-full max-w-[600px] mb-4 px-4 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
      <div className="flex items-center gap-2">
        <Trophy className="text-yellow-400 w-5 h-5" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">High Score</p>
          <p className="text-lg font-orbitron text-yellow-400 leading-none">{highScore}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Layers className="text-blue-400 w-5 h-5" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Level</p>
          <p className="text-lg font-orbitron text-blue-400 leading-none">{level}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Zap className="text-green-400 w-5 h-5" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Score</p>
          <p className="text-xl font-orbitron text-green-400 leading-none">{score}</p>
        </div>
      </div>
    </div>
  );
};

export default HUD;
