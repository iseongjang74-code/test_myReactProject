
import React from 'react';
import { Difficulty } from '../../../../types';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
  onShowRanking: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowRanking }) => {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>(Difficulty.EASY);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 animate-slide-up">
      <div className="text-center mb-4">
        <div className="inline-block p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 mb-6 glow-cyan">
          <i className="fas fa-brain text-4xl text-cyan-400"></i>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">MATH PUZZLE</h1>
        <p className="text-slate-400 text-sm">논리적 사고의 한계에 도전하세요.</p>
      </div>

      <div className="w-full glass p-6 rounded-3xl flex flex-col gap-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">시작 난이도 선택</label>
        <div className="flex flex-col gap-2">
          {Object.values(Difficulty).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`py-4 rounded-2xl font-bold transition-all border ${
                selectedDifficulty === diff
                  ? 'bg-cyan-600 border-cyan-400 text-white glow-cyan'
                  : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full gap-3">
        <button
          onClick={() => onStart(selectedDifficulty)}
          className="w-full py-5 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:bg-cyan-400 transition-all transform active:scale-95 shadow-xl"
        >
          게임 시작
        </button>
        <button
          onClick={onShowRanking}
          className="w-full py-4 glass text-white rounded-2xl font-bold border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          <i className="fas fa-trophy text-amber-400"></i>
          순위 보기
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
