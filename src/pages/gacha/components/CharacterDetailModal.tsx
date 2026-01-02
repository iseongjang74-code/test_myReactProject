
import React from 'react';
import { Character, Rarity, Attribute, UltimateSkill, Equipment } from '../../../../types';
import { calculateStats } from '../utils/statCalculator';
import { CloseIcon } from './icons';

interface CharacterDetailModalProps {
    character: Character;
    equippedUltimate?: UltimateSkill;
    equippedEquipment?: Equipment;
    isCharacterInTeam: boolean;
    onAddToTeam: () => void;
    onRemoveFromTeam: () => void;
    onChangeUltimate: () => void;
    onChangeEquipment: () => void;
    onClose: () => void;
}

const rarityStyles: Record<Rarity, { border: string; text: string; bg: string }> = {
    [Rarity.N]: { border: 'border-gray-500', text: 'text-gray-300', bg: 'bg-gray-700' },
    [Rarity.R]: { border: 'border-green-500', text: 'text-green-400', bg: 'bg-green-600' },
    [Rarity.SR]: { border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-600' },
    [Rarity.SSR]: { border: 'border-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500' },
    [Rarity.Mythic]: { border: 'border-fuchsia-500', text: 'text-fuchsia-400', bg: 'bg-fuchsia-600' },
};

const attributeStyles: Record<Attribute, string> = {
    [Attribute.Fire]: 'text-red-400',
    [Attribute.Water]: 'text-blue-400',
    [Attribute.Wind]: 'text-green-400',
    [Attribute.Light]: 'text-yellow-300',
    [Attribute.Dark]: 'text-purple-400',
};

const StatDisplay: React.FC<{ label: string; value: number | string; }> = ({ label, value }) => (
    <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-md text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ 
    character, 
    equippedUltimate, 
    equippedEquipment, 
    isCharacterInTeam, 
    onAddToTeam, 
    onRemoveFromTeam, 
    onChangeUltimate, 
    onChangeEquipment,
    onClose 
}) => {
    // Pass equipped equipment to calculator to show boosted stats
    const stats = calculateStats(character, equippedEquipment);
    const rarityStyle = rarityStyles[character.rarity];
    const attributeStyle = attributeStyles[character.attribute];
    const cardsForNextLevel = Math.floor((character.level - 1) / 10) + 1;

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className={`relative w-full max-w-sm bg-gray-800 rounded-lg border-2 ${rarityStyle.border} shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto`}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-4">
                    <div className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${rarityStyle.border} flex-shrink-0`}>
                        <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className={`text-lg font-bold ${rarityStyle.text}`}>{character.rarity}</p>
                        <h2 className="text-2xl font-bold text-white">{character.name}</h2>
                        <p className="text-sm font-semibold">
                            Level {character.level} <span className={attributeStyle}>{character.attribute} 속성</span>
                        </p>
                    </div>
                </div>

                <p className="text-gray-300 text-sm italic">"{character.description}"</p>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-cyan-400">레벨업 진행도</h3>
                     <div className="w-full bg-gray-700 rounded-full h-4 relative overflow-hidden">
                        <div
                            className="bg-yellow-400 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${(character.cards / cardsForNextLevel) * 100}%` }}
                        ></div>
                        <span className="absolute inset-0 text-center text-xs font-bold text-black flex items-center justify-center">
                            {character.cards} / {cardsForNextLevel}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1">다음 레벨까지 필요한 카드</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 text-cyan-400">능력치 (장비 포함)</h3>
                    <div className="space-y-2">
                        <StatDisplay label="HP" value={stats.hp} />
                        <StatDisplay label="공격력" value={stats.attack} />
                        <StatDisplay label="속도" value={stats.speed} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <h3 className="text-sm font-semibold mb-2 text-purple-400">궁극기</h3>
                        {equippedUltimate ? (
                            <>
                                <p className="font-bold text-white text-sm">{equippedUltimate.name}</p>
                                <p className="text-xs text-gray-400">Lv.{equippedUltimate.level}</p>
                            </>
                        ) : (
                            <p className="text-gray-400 text-xs">없음</p>
                        )}
                        <button onClick={onChangeUltimate} className="w-full mt-2 p-1 rounded-md text-xs bg-gray-700 hover:bg-gray-600 transition-colors">변경</button>
                    </div>

                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <h3 className="text-sm font-semibold mb-2 text-green-400">장비</h3>
                        {equippedEquipment ? (
                            <>
                                <p className="font-bold text-white text-sm">{equippedEquipment.name}</p>
                                <p className="text-xs text-gray-400">Lv.{equippedEquipment.level} {equippedEquipment.rarity}</p>
                                <p className="text-[10px] text-cyan-300 mt-1">{equippedEquipment.specialEffect}</p>
                            </>
                        ) : (
                            <p className="text-gray-400 text-xs">없음</p>
                        )}
                        <button onClick={onChangeEquipment} className="w-full mt-2 p-1 rounded-md text-xs bg-gray-700 hover:bg-gray-600 transition-colors">변경</button>
                    </div>
                </div>

                {isCharacterInTeam ? (
                    <button onClick={onRemoveFromTeam} className="w-full p-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors">
                        팀에서 제거
                    </button>
                ) : (
                    <button onClick={onAddToTeam} className="w-full p-2 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition-colors">
                        팀에 추가
                    </button>
                )}
            </div>
        </div>
    );
};

export default CharacterDetailModal;
