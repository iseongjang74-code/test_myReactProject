
import React from 'react';
import { Equipment, Rarity } from '../../../../types';
import { CloseIcon } from './icons';
import { calculateEquipmentStats } from '../utils/statCalculator';

interface EquipmentSelectModalProps {
    inventory: Equipment[];
    onSelect: (equipmentId: number) => void;
    onClose: () => void;
}

const rarityStyles: Record<Rarity, { border: string; text: string; }> = {
    [Rarity.N]: { border: 'border-gray-500', text: 'text-gray-300' },
    [Rarity.R]: { border: 'border-green-500', text: 'text-green-400' },
    [Rarity.SR]: { border: 'border-blue-500', text: 'text-blue-400' },
    [Rarity.SSR]: { border: 'border-yellow-400', text: 'text-yellow-400' },
    [Rarity.Mythic]: { border: 'border-fuchsia-500', text: 'text-fuchsia-400' },
};

const EquipmentSelectModal: React.FC<EquipmentSelectModalProps> = ({ inventory, onSelect, onClose }) => {
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
                <h2 className="text-2xl font-bold text-center text-cyan-300 mb-4">장비 선택</h2>
                
                {inventory.length === 0 ? (
                    <p className="text-center text-gray-500">장비가 없습니다. 상점에서 획득하세요.</p>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                        {inventory.map(item => {
                            const calculatedStats = calculateEquipmentStats(item);
                            return (
                                <div 
                                    key={item.id}
                                    onClick={() => onSelect(item.id)}
                                    className={`p-3 bg-gray-900/50 rounded-lg border-2 ${rarityStyles[item.rarity].border} cursor-pointer hover:bg-gray-700 transition-colors`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className={`font-bold text-lg ${rarityStyles[item.rarity].text}`}>{item.name}</h3>
                                            <p className="text-sm font-semibold text-white">Lv.{item.level} <span className="text-xs text-gray-400">({item.cards} 강화)</span></p>
                                        </div>
                                        <div className="text-right text-xs text-gray-300">
                                            {calculatedStats.attack > 0 && <p>공격 +{calculatedStats.attack.toLocaleString()}</p>}
                                            {calculatedStats.hp > 0 && <p>체력 +{calculatedStats.hp.toLocaleString()}</p>}
                                            {calculatedStats.speed > 0 && <p>속도 +{calculatedStats.speed.toLocaleString()}</p>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-cyan-400 mt-1 font-bold">{item.specialEffect}</p>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentSelectModal;
