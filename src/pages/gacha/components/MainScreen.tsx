import React from 'react';
import { Achievement, Attribute, Character, Friend, Team } from '../../../../types';
import CharacterCard from './CharacterCard';
import { LogoutIcon } from './icons';

interface MainScreenProps {
    playerState: {
        teams: Team[];
        achievements: Achievement[];
        friends: Friend[];
        characters: Character[];
    };
    currentUser: string;
    onLogout: () => void;
    onNavigate: (screen: 'gacha' | 'team' | 'battle' | 'social') => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ playerState, currentUser, onLogout, onNavigate }) => {
    const mainTeam = playerState.teams[0];

    const getCharacterCountByAttribute = (attribute: Attribute) => {
        return playerState.characters.filter(c => c.attribute === attribute).length;
    }

    return (
        <div className="space-y-8">
            <header className="text-center relative">
                <div className="absolute top-0 right-0 flex items-center space-x-2 text-sm">
                    <span className="text-gray-400">{currentUser}</span>
                    <button onClick={onLogout} className="text-gray-400 hover:text-white" title="로그아웃">
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-cyan-300">가챠 너지</h1>
                <p className="text-gray-400">최고가 되기 위한 여정이 여기서 시작됩니다.</p>
            </header>

            {/* Main Team */}
            <section>
                <h2 className="text-xl font-semibold mb-3">나의 메인 팀</h2>
                <div 
                    onClick={() => onNavigate('team')}
                    className="grid grid-cols-4 gap-3 p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                >
                    {mainTeam.characters.map((char, index) =>
                        char ? <CharacterCard key={index} character={char} /> : <div key={index} className="aspect-square bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-3xl">+</div>
                    )}
                </div>
            </section>

            {/* Gacha Nudge */}
            <section>
                <button
                    onClick={() => onNavigate('gacha')}
                    className="w-full p-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform duration-300 animate-pulse hover:animate-none"
                >
                    ✨ 추천 가챠 등장! ✨
                </button>
            </section>

            {/* Achievements */}
            <section>
                <h2 className="text-xl font-semibold mb-3">일일 & 주간 업적</h2>
                <div className="space-y-3">
                    {playerState.achievements.map(ach => {
                         const isMissingCharacter = ach.requiredCharacterAttribute && getCharacterCountByAttribute(ach.requiredCharacterAttribute) < ach.target;
                         return (
                            <div key={ach.id} className={`p-3 bg-gray-800 rounded-lg ${isMissingCharacter ? 'border border-dashed border-yellow-500 animate-pulse' : ''}`}>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <p className="font-semibold">{ach.name} {isMissingCharacter && <span className="text-yellow-400 text-xs"> ({ach.requiredCharacterAttribute} 속성 캐릭터 부족!)</span>}</p>
                                    <p className="text-gray-400">{ach.progress}/{ach.target}</p>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-cyan-500 h-2.5 rounded-full"
                                        style={{ width: `${(ach.progress / ach.target) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                         )
                    })}
                </div>
            </section>
            
            {/* Friends Activity (Social Proof Nudge) */}
            <section>
                 <h2 className="text-xl font-semibold mb-3">친구 활동</h2>
                 <div className="space-y-4">
                     {playerState.friends.map(friend => (
                         <div key={friend.id} className="p-3 bg-gray-800/50 rounded-lg flex items-center space-x-4">
                             <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0">
                                <img src={friend.team.characters[0]?.imageUrl} alt={friend.name} className="w-full h-full object-cover rounded-full" />
                             </div>
                             <div className="flex-grow">
                                <p className="font-bold">{friend.name}</p>
                                {friend.lastRarePull && (
                                    <p className="text-xs text-yellow-400 truncate">
                                        방금 <span className="font-bold">SSR</span> {friend.lastRarePull.name} 획득!
                                    </p>
                                )}
                                <p className="text-xs text-gray-400">활동: {friend.lastActive}</p>
                             </div>
                             <button onClick={() => onNavigate('social')} className="bg-indigo-600 px-3 py-1 text-sm rounded-md hover:bg-indigo-500 transition-colors">보기</button>
                         </div>
                     ))}
                 </div>
            </section>

        </div>
    );
};

export default MainScreen;
