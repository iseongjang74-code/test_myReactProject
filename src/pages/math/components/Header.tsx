
import React from 'react';
import { Difficulty } from '../../../../types';

interface HeaderProps {
  stage: number;
  difficulty: Difficulty;
  score: number;
  lives: number;
}

const Header: React.FC<HeaderProps> = ({ stage, difficulty, score, lives }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-md mx-auto flex justify-between items-center glass p-3 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">스테이지</span>
          <span className="text-xl font-bold text-cyan-400 text-glow-cyan">{stage}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">난이도</span>
          <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
            difficulty === Difficulty.EASY ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' :
            difficulty === Difficulty.MEDIUM ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
            'border-rose-500/50 text-rose-400 bg-rose-500/10'
          }`}>
            {difficulty}
          </span>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">생명</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <i key={i} className={`fas fa-heart text-[10px] ${i < lives ? 'text-rose-500' : 'text-slate-700'}`}></i>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">점수</span>
            <span className="text-xl font-bold text-white">{score}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
