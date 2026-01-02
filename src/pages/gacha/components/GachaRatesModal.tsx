
import React from 'react';
import { GACHA_RATES } from '../constants';
import { Rarity } from '../../../../types';
import { CloseIcon } from './icons';

interface GachaRatesModalProps {
    onClose: () => void;
}

const rarityOrder: Rarity[] = [Rarity.Mythic, Rarity.SSR, Rarity.SR, Rarity.R, Rarity.N];
const rarityColors: Record<Rarity, string> = {
    [Rarity.N]: 'text-gray-300',
    [Rarity.R]: 'text-green-400',
    [Rarity.SR]: 'text-blue-400',
    [Rarity.SSR]: 'text-yellow-400',
    [Rarity.Mythic]: 'text-fuchsia-400',
};

const GachaRatesModal: React.FC<GachaRatesModalProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-sm bg-gray-800 rounded-lg border border-gray-700 shadow-2xl p-6 space-y-4"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>
                
                <h2 className="text-2xl font-bold text-center text-cyan-300">소환 확률</h2>
                
                <div className="space-y-2">
                    {rarityOrder.map(rarity => (
                        <div key={rarity} className="flex justify-between items-center p-2 bg-gray-900/50 rounded-md">
                            <span className={`font-bold ${rarityColors[rarity]}`}>{rarity}</span>
                            <span className="text-white font-mono">{(GACHA_RATES[rarity] * 100).toFixed(2)}%</span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                    각 등급 내 캐릭터는 동일한 확률로 등장합니다.
                </p>
            </div>
        </div>
    );
};

export default GachaRatesModal;
