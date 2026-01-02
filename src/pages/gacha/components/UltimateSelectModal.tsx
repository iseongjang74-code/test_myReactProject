
import React from 'react';
import { UltimateSkill, UltimateRarity, UltimateEffectType } from '../../../../types';
import { CloseIcon } from './icons';

interface UltimateSelectModalProps {
    ownedUltimates: UltimateSkill[];
    onSelect: (ultimateId: number) => void;
    onClose: () => void;
}

const rarityStyles: Record<UltimateRarity, { border: string; text: string; }> = {
    [UltimateRarity.R]: { border: 'border-green-500', text: 'text-green-400' },
    [UltimateRarity.SR]: { border: 'border-blue-500', text: 'text-blue-400' },
    [UltimateRarity.SSR]: { border: 'border-yellow-400', text: 'text-yellow-400' },
    [UltimateRarity.Mythic]: { border: 'border-fuchsia-500', text: 'text-fuchsia-400' },
};

const UltimateSelectModal: React.FC<UltimateSelectModalProps> = ({ ownedUltimates, onSelect, onClose }) => {
    const getSkillEffectDescription = (skill: UltimateSkill) => {
        // Same multiplier logic as combat
        const multiplier = (skill.level - 1) * 0.25 + 1;
        const totalPower = (skill.power * multiplier).toFixed(1);
        
        switch (skill.effectType) {
            case UltimateEffectType.SINGLE_TARGET_DAMAGE:
            case UltimateEffectType.AREA_OF_EFFECT_DAMAGE:
                return `공격력의 ${totalPower}배 피해`;
            case UltimateEffectType.HEAL_SELF:
            case UltimateEffectType.HEAL_TEAM:
                return `기본 회복량 ${(skill.power * multiplier).toFixed(0)}`;
            default:
                return '';
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-lg bg-gray-800 rounded-lg border border-gray-700 shadow-2xl p-6"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-center text-cyan-300 mb-4">궁극기 선택</h2>
                
                <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                    {ownedUltimates.map(skill => (
                        <div 
                            key={skill.id}
                            onClick={() => onSelect(skill.id)}
                            className={`p-3 bg-gray-900/50 rounded-lg border-2 ${rarityStyles[skill.rarity].border} cursor-pointer hover:bg-gray-700 transition-colors`}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className={`font-bold text-lg ${rarityStyles[skill.rarity].text}`}>{skill.name}</h3>
                                <span className="text-sm font-semibold text-white">Lv.{skill.level}</span>
                            </div>
                            <p className="text-sm text-yellow-300 font-semibold">{getSkillEffectDescription(skill)}</p>
                            <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UltimateSelectModal;
