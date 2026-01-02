import React from 'react';
import { PlayerFriend } from '../../../../types';
import CharacterCard from './CharacterCard';

interface SocialScreenProps {
    friends: PlayerFriend[];
}

const SocialScreen: React.FC<SocialScreenProps> = ({ friends }) => {
    return (
        <div className="space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-cyan-300">커뮤니티</h1>
                <p className="text-gray-400">친구 및 라이벌과 교류하세요.</p>
            </header>

            {/* Cooperative Nudge */}
            <section className="p-4 bg-gradient-to-br from-green-900 to-teal-900 rounded-lg border-2 border-green-500 shadow-lg text-center">
                <h2 className="text-xl font-bold text-green-300">협동 레이드 가능!</h2>
                <p className="text-sm text-gray-200 mt-1 mb-3">친구와 팀을 이루어 월드 보스를 물리치고 두 배의 보상을 획득하세요!</p>
                <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition-colors">
                    파티 찾기
                </button>
            </section>

            {/* Friend List */}
            <section>
                <h2 className="text-xl font-semibold mb-3">친구 목록</h2>
                <div className="space-y-4">
                    {friends.map(friend => (
                        <div key={friend.id} className="p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-lg font-bold">{friend.name}</p>
                                    <p className="text-xs text-gray-400">활동: {friend.lastActive}</p>
                                </div>
                                {friend.lastRarePull && (
                                     <div className="text-right text-xs bg-yellow-900/50 border border-yellow-600 p-2 rounded-md">
                                        <p className="text-yellow-300">최근 획득:</p>
                                        <p className="font-semibold">{friend.lastRarePull.rarity} {friend.lastRarePull.name}</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">{friend.name}의 팀</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {friend.team.characters.map((char, index) => 
                                        char ? <CharacterCard key={index} character={char} /> : <div key={index} className="aspect-square bg-gray-700 rounded-lg"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SocialScreen;