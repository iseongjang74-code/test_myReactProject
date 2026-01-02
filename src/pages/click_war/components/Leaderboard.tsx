
import React from 'react';
import { LeaderboardData } from '../../../../types';
import { getFlagEmoji, getCountryCode } from '../utils';

interface LeaderboardProps {
  leaderboard: LeaderboardData;
  userCountry: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, userCountry }) => {
  const sortedLeaderboard = Object.entries(leaderboard)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  return (
    <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-800 flex flex-col h-full max-h-[600px]">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase tracking-widest">
          Global Ranks
        </h2>
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">Live Updates</span>
      </div>
      <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-grow">
        {sortedLeaderboard.map(([country, clicks], index) => (
          <div
            key={country}
            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
              country === userCountry
                ? 'bg-yellow-500 border-yellow-400 text-gray-900 font-bold scale-[1.03] shadow-xl shadow-yellow-500/20'
                : 'bg-gray-800/40 border-gray-800 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`text-xs font-black w-6 ${country === userCountry ? 'text-gray-900/50' : 'text-gray-600'}`}>
                #{index + 1}
              </span>
              <span className="text-3xl drop-shadow-sm">{getFlagEmoji(getCountryCode(country))}</span>
              <span className="text-sm font-black uppercase tracking-tight truncate max-w-[100px]">{country}</span>
            </div>
            <span className="text-lg font-black font-mono tracking-tighter">
              {Math.floor(clicks as number).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
    </div>
  );
};

export default Leaderboard;
