import React, { useState, useEffect } from 'react';
import { Character, GachaDifficulty } from '../../../../types';
import CharacterCard from './CharacterCard';
import { generateEnemyTeam } from '../utils/enemyGenerator';

interface BattleScreenProps {
    playerState: {
        teams: {
            characters: (Character | null)[];
        }[];
    };
    onStartCombat: (opponents: Character[], difficulty: GachaDifficulty) => void;
}

const difficultySettings: Record<GachaDifficulty, { label: string, color: string }> = {
    very_easy: { label: '매우 쉬움', color: 'bg-teal-700 hover:bg-teal-600' },
    easy: { label: '쉬움', color: 'bg-green-600 hover:bg-green-500' },
    normal: { label: '보통', color: 'bg-yellow-600 hover:bg-yellow-500' },
    hard: { label: '어려움', color: 'bg-orange-600 hover:bg-orange-500' },
    very_hard: { label: '매우 어려움', color: 'bg-red-600 hover:bg-red-500' },
    hell: { label: '지옥', color: 'bg-purple-700 hover:bg-purple-600' },
    hardcore: { label: '하드코어', color: 'bg-gray-700 hover:bg-gray-600' },
    boss: { label: '보스', color: 'bg-black border border-red-500 hover:bg-gray-900' },
};

const BattleScreen: React.FC<BattleScreenProps> = ({ playerState, onStartCombat }) => {
    const playerTeam = playerState.teams[0]?.characters.filter(c => c !== null) as Character[];
    const [difficulty, setDifficulty] = useState<GachaDifficulty>('normal');
    const [enemyTeam, setEnemyTeam] = useState<Character[]>([]);

    useEffect(() => {
        setEnemyTeam(generateEnemyTeam(difficulty));
    }, [difficulty]);

    return (
        <div className="space-y-6 text-center">
            <header>
                <h1 className="text-3xl font-bold text-cyan-300">전투 준비</h1>
                <p className="text-gray-400">도전할 난이도를 선택하세요.</p>
            </header>

            {/* Difficulty Selector */}
            <div className="p-3 bg-gray-800/50 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">난이도 선택</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(difficultySettings) as GachaDifficulty[]).map(level => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-3 py-2 rounded-md font-bold transition-all text-sm ${
                                difficulty === level
                                    ? `${difficultySettings[level].color} text-white ring-2 ring-white shadow-lg`
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                        >
                            {difficultySettings[level].label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-red-400">적 팀 (미리보기)</h2>
                {enemyTeam.length > 0 ? (
                    <div className="flex justify-center gap-4">
                        {enemyTeam.map((char, index) => (
                            <div key={index} className="w-24">
                                <CharacterCard character={char} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">난이도를 선택하여 적을 생성하세요.</p>
                )}
            </div>

             <div className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-green-400">나의 팀</h2>
                <div className="flex justify-center gap-4">
                     {playerTeam.map((char, index) => (
                        <div key={index} className="w-24">
                           <CharacterCard character={char} />
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={() => onStartCombat(enemyTeam, difficulty)}
                disabled={playerTeam.length === 0 || enemyTeam.length === 0}
                className="w-full p-4 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
                전투 시작!
            </button>
        </div>
    );
};

export default BattleScreen;