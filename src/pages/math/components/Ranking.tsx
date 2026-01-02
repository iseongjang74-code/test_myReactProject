
import React from 'react';
import { ScoreEntry } from '../../../../types';

interface RankingProps {
  rankings: ScoreEntry[];
  onBack: () => void;
}

const Ranking: React.FC<RankingProps> = ({ rankings, onBack }) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 animate-slide-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">TOP AGENTS</h2>
        <p className="text-slate-400 text-xs">전체 해독 전문가 순위</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">순위</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">에이전트</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">점수</th>
            </tr>
          </thead>
          <tbody>
            {rankings.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-10 text-center text-slate-500 italic">아직 기록된 점수가 없습니다.</td>
              </tr>
            ) : (
              rankings.map((entry, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-cyan-400">#{idx + 1}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{entry.name}</span>
                      <span className="text-[10px] text-slate-500">스테이지 {entry.stage}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-white">{entry.score.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={onBack}
        className="w-full py-4 glass text-slate-400 rounded-2xl font-bold border-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <i className="fas fa-arrow-left"></i>
        메인으로 돌아가기
      </button>
    </div>
  );
};

export default Ranking;
