
import React from 'react';
import { Puzzle } from '../../../../types';

interface PuzzleCardProps {
  puzzle: Puzzle;
  onSelectOption: (option: string) => void;
  selectedOption: string | null;
  isLocked: boolean;
  showHint: boolean;
  onToggleHint: () => void;
}

const PuzzleCard: React.FC<PuzzleCardProps> = ({ 
  puzzle, 
  onSelectOption, 
  selectedOption, 
  isLocked,
  showHint,
  onToggleHint
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 animate-slide-up">
      <div className="glass p-5 rounded-3xl border-l-4 border-l-cyan-500 shadow-xl">
        <p className="text-cyan-200 text-sm italic leading-relaxed">
          <i className="fas fa-quote-left mr-2 opacity-50"></i>
          {puzzle.story}
        </p>
      </div>

      <div className="glass p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
        
        <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-fingerprint text-cyan-500"></i>
          패턴 해독
        </h3>
        
        <p className="text-2xl font-bold mb-8 text-white font-mono leading-tight whitespace-pre-line">
          {puzzle.question}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {puzzle.options.map((option, idx) => (
            <button
              key={idx}
              disabled={isLocked}
              onClick={() => onSelectOption(option)}
              className={`p-4 rounded-2xl font-mono text-xl font-bold transition-all duration-200 border transform active:scale-95 ${
                selectedOption === option 
                  ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg scale-105 glow-cyan'
                  : 'bg-slate-800/50 border-white/10 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onToggleHint}
          className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
            showHint ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <i className={`fas fa-lightbulb opacity-75`}></i>
          {showHint ? '힌트 확인됨' : '단서 요청하기'}
        </button>
      </div>

      {showHint && (
        <div className="glass p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 animate-slide-up text-center">
          <p className="text-amber-200 text-xs">
            <span className="font-bold mr-1">HINT:</span> {puzzle.hint}
          </p>
        </div>
      )}
    </div>
  );
};

export default PuzzleCard;
