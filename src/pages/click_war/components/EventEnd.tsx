import React from 'react';
import { LeaderboardData } from '../../../../types';
import Leaderboard from './Leaderboard';
import TrophyIcon from './icons/TrophyIcon';

interface EventEndProps {
  leaderboard: LeaderboardData;
  userCountry: string;
}

const getFlagEmoji = (countryCode: string) => {
    const countryMap: Record<string, string> = {
        'USA': 'US', 'China': 'CN', 'India': 'IN', 'Brazil': 'BR',
        'Russia': 'RU', 'Japan': 'JP', 'Germany': 'DE', 'United Kingdom': 'GB',
        'France': 'FR', 'South Korea': 'KR', 'Canada': 'CA', 'Australia': 'AU'
    };
    const code = countryMap[countryCode] || 'AQ';
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};


const EventEnd: React.FC<EventEndProps> = ({ leaderboard, userCountry }) => {
  // FIX: Cast `a` and `b` to number for sorting, as type inference fails with data from JSON.parse.
  const sortedLeaderboard = Object.entries(leaderboard).sort(([, a], [, b]) => (b as number) - (a as number));
  const winner = sortedLeaderboard.length > 0 ? sortedLeaderboard[0] : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-4">The War is Over!</h1>
        {winner && (
          <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg">
             <TrophyIcon className="w-24 h-24 text-yellow-400 mb-4" />
            <h2 className="text-3xl text-white">The winner is</h2>
            <p className="text-5xl font-bold text-yellow-400 mt-2">
              {getFlagEmoji(winner[0])} {winner[0]}
            </p>
            <p className="text-2xl text-gray-300 mt-2 font-mono">
                with {(winner[1] as number).toLocaleString()} clicks!
            </p>
          </div>
        )}
      </div>
      <div className="w-full max-w-md">
        <h3 className="text-xl font-bold text-center mb-4">Final Standings</h3>
        <Leaderboard leaderboard={leaderboard} userCountry={userCountry} />
      </div>
    </div>
  );
};

export default EventEnd;
