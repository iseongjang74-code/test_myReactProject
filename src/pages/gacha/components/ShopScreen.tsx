
import React, { useState } from 'react';
import { PlayerState, UltimateRarity, UltimateSkill, Equipment, Rarity } from '../../../../types';
import { ShopIcon } from './icons';
import PurchaseModal from './PurchaseModal';
import PasswordPromptModal from './PasswordPromptModal';
import { ALL_ULTIMATE_SKILLS, ULTIMATE_GACHA_RATES, ALL_EQUIPMENT, GACHA_RATES } from '../constants';
import { calculateLevelUp } from '../utils/levelUpCalculator';

interface ShopScreenProps {
    playerState: PlayerState;
    setPlayerState: React.Dispatch<React.SetStateAction<PlayerState | null>>;
}

interface CurrencyPack {
    name: string;
    amount: number;
    price: string;
    color: string;
    bestValue?: boolean;
}

const currencyPacks: CurrencyPack[] = [
    { name: '스타터 팩', amount: 500, price: '₩1,200', color: 'from-green-500 to-teal-500' },
    { name: '가성비 팩', amount: 1200, price: '₩2,500', color: 'from-blue-500 to-cyan-500' },
    { name: '프로 팩', amount: 3000, price: '₩5,900', color: 'from-purple-500 to-indigo-500' },
    { name: '고래 팩', amount: 10000, price: '₩15,000', color: 'from-yellow-500 to-orange-500' },
    { name: '지배자 팩', amount: 50000, price: '₩55,000', color: 'from-red-500 to-rose-500' },
    { name: '신들의 축복', amount: 10000000, price: '₩119,000', color: 'from-fuchsia-600 via-purple-600 to-indigo-700', bestValue: true },
];

const performUltimateGachaPull = (): UltimateSkill => {
    const rand = Math.random();
    let cumulative = 0;
    const skillsByRarity: { [key in UltimateRarity]?: UltimateSkill[] } = {};
    ALL_ULTIMATE_SKILLS.forEach(skill => {
        if (!skillsByRarity[skill.rarity]) skillsByRarity[skill.rarity] = [];
        skillsByRarity[skill.rarity]!.push(skill);
    });
    for (const rarity of Object.keys(ULTIMATE_GACHA_RATES) as UltimateRarity[]) {
        cumulative += ULTIMATE_GACHA_RATES[rarity];
        if (rand < cumulative) {
            const possibleSkills = skillsByRarity[rarity];
            if (possibleSkills && possibleSkills.length > 0) return { ...possibleSkills[Math.floor(Math.random() * possibleSkills.length)] };
        }
    }
    return { ...skillsByRarity[UltimateRarity.R]![0] };
};

const performEquipmentGachaPull = (): Equipment => {
    const rand = Math.random();
    let cumulative = 0;
    const itemsByRarity: { [key in Rarity]?: Equipment[] } = {};
    ALL_EQUIPMENT.forEach(item => {
        if (!itemsByRarity[item.rarity]) itemsByRarity[item.rarity] = [];
        itemsByRarity[item.rarity]!.push(item);
    });
    for (const rarity of Object.keys(GACHA_RATES) as Rarity[]) {
        cumulative += GACHA_RATES[rarity];
        if (rand < cumulative) {
            const possibleItems = itemsByRarity[rarity];
            if (possibleItems && possibleItems.length > 0) {
                 // Clone and reset dynamic props
                return { ...possibleItems[Math.floor(Math.random() * possibleItems.length)], cards: 0 }; 
            }
        }
    }
    // Fallback
    return { ...itemsByRarity[Rarity.N]![0], cards: 0 };
};

const ShopScreen: React.FC<ShopScreenProps> = ({ playerState, setPlayerState }) => {
    const [selectedPackForPurchase, setSelectedPackForPurchase] = useState<CurrencyPack | null>(null);
    const [packToVerify, setPackToVerify] = useState<CurrencyPack | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [ultimateGachaResult, setUltimateGachaResult] = useState<UltimateSkill[] | null>(null);
    const [equipmentGachaResult, setEquipmentGachaResult] = useState<Equipment[] | null>(null);

    const ULTIMATE_PULL_COST = 150;
    const EQUIPMENT_PULL_COST = 100;
    const TEN_THOUSAND_EQUIPMENT_PULL_COST = 1000000;

    const handlePurchaseClick = (pack: CurrencyPack) => {
        setPackToVerify(pack);
        setIsPasswordModalOpen(true);
    };

    const handlePasswordConfirm = (password: string) => {
        if (password.trim() === "12121212") {
            setIsPasswordModalOpen(false);
            setSelectedPackForPurchase(packToVerify);
            setPackToVerify(null);
            return true;
        }
        return false;
    };

    const handleConfirmPurchase = (amount: number) => {
        setPlayerState(prev => prev ? ({ ...prev, currency: prev.currency + amount }) : null);
        setSelectedPackForPurchase(null);
    };

    const handleUltimateGacha = (pulls: number) => {
        const cost = ULTIMATE_PULL_COST * pulls;
        if (!playerState || playerState.currency < cost) return;
        const newSkills = Array.from({ length: pulls }, performUltimateGachaPull);
        setPlayerState(prev => {
            if (!prev) return null;
            const playerSkillsMap = new Map<number, UltimateSkill>();
            prev.ultimateSkills.forEach(s => playerSkillsMap.set(s.id, { ...s }));
            newSkills.forEach(pulledSkill => {
                if (playerSkillsMap.has(pulledSkill.id)) {
                    const existing = playerSkillsMap.get(pulledSkill.id)!;
                    existing.level += 1;
                } else {
                    playerSkillsMap.set(pulledSkill.id, { ...pulledSkill, level: 1 });
                }
            });
            return { ...prev, currency: prev.currency - cost, ultimateSkills: Array.from(playerSkillsMap.values()) };
        });
        setUltimateGachaResult(newSkills);
    };

    const handleEquipmentGacha = (pulls: number) => {
        let cost = EQUIPMENT_PULL_COST * pulls;
        if (pulls === 10000) cost = TEN_THOUSAND_EQUIPMENT_PULL_COST;

        if (!playerState || playerState.currency < cost) return;
        
        let newItems: Equipment[] = [];
        
        if (pulls === 10000) {
            // Guarantee 10 Mythics for 10000 pulls
            const mythicItems = ALL_EQUIPMENT.filter(e => e.rarity === Rarity.Mythic);
             if (mythicItems.length > 0) {
                 for(let i=0; i<10; i++) {
                     const template = mythicItems[Math.floor(Math.random() * mythicItems.length)];
                     newItems.push({ ...template, cards: 0 });
                 }
             }
             // Rest are random
             for(let i=newItems.length; i<pulls; i++) {
                 newItems.push(performEquipmentGachaPull());
             }
             // Shuffle array to mix guarantees
             for (let i = newItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
            }
        } else {
             newItems = Array.from({ length: pulls }, performEquipmentGachaPull);
        }
        
        setPlayerState(prev => {
            if (!prev) return null;
            const inventoryMap = new Map<number, Equipment>();
            prev.inventory.forEach(item => inventoryMap.set(item.id, { ...item }));
            
            newItems.forEach(pulledItem => {
                if (inventoryMap.has(pulledItem.id)) {
                    const existing = inventoryMap.get(pulledItem.id)!;
                     // Use the generic level up calculator. Equipment has 'cards' now.
                    const { level, cards } = calculateLevelUp(existing, 1);
                    existing.level = level;
                    existing.cards = cards;
                } else {
                    inventoryMap.set(pulledItem.id, { ...pulledItem, level: 1, cards: 0 });
                }
            });
            return { ...prev, currency: prev.currency - cost, inventory: Array.from(inventoryMap.values()) };
        });
        setEquipmentGachaResult(newItems);
    }

    // Helper to sort and slice for display to avoid rendering 10k items
    const getDisplayedEquipmentResult = () => {
        if (!equipmentGachaResult) return [];
        // Show Mythics and SSRs first, then others, up to 100 items
        const sorted = [...equipmentGachaResult].sort((a, b) => {
             const rarityOrder = { [Rarity.Mythic]: 5, [Rarity.SSR]: 4, [Rarity.SR]: 3, [Rarity.R]: 2, [Rarity.N]: 1 };
             return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        });
        return sorted.slice(0, 60);
    };

    return (
        <div className="space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-cyan-300">상점</h1>
                <p className="text-gray-400">보석을 구매하여 모험을 계속하세요.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="p-4 bg-gray-800/50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3 text-purple-400">궁극기 뽑기</h2>
                    <div className="flex justify-around items-center gap-2">
                        <button onClick={() => handleUltimateGacha(1)} disabled={!playerState || playerState.currency < ULTIMATE_PULL_COST} className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors disabled:opacity-50 text-sm">1회 ({ULTIMATE_PULL_COST})</button>
                        <button onClick={() => handleUltimateGacha(10)} disabled={!playerState || playerState.currency < ULTIMATE_PULL_COST * 10} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 text-sm">10회 ({ULTIMATE_PULL_COST * 10})</button>
                    </div>
                </section>

                <section className="p-4 bg-gray-800/50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3 text-green-400">장비 뽑기</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleEquipmentGacha(1)} disabled={!playerState || playerState.currency < EQUIPMENT_PULL_COST} className="px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition-colors disabled:opacity-50 text-sm">1회 ({EQUIPMENT_PULL_COST})</button>
                        <button onClick={() => handleEquipmentGacha(10)} disabled={!playerState || playerState.currency < EQUIPMENT_PULL_COST * 10} className="px-4 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-500 transition-colors disabled:opacity-50 text-sm">10회 ({EQUIPMENT_PULL_COST * 10})</button>
                        <button onClick={() => handleEquipmentGacha(10000)} disabled={!playerState || playerState.currency < TEN_THOUSAND_EQUIPMENT_PULL_COST} className="col-span-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold hover:from-emerald-500 transition-colors disabled:opacity-50 text-sm border border-green-400">10000회 (신화 10개 확정)</button>
                    </div>
                </section>
            </div>

            <section>
                <h2 className="text-xl font-semibold mb-3">보석 팩</h2>
                <div className="grid grid-cols-2 gap-4">
                    {currencyPacks.map((pack) => (
                        <div key={pack.amount} className={`relative p-4 rounded-lg bg-gradient-to-br ${pack.color} text-white shadow-lg text-center flex flex-col justify-between`}>
                           {pack.bestValue && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    BEST VALUE
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold">{pack.name}</h3>
                                <p className="text-2xl font-extrabold my-2">{pack.amount.toLocaleString()} 보석</p>
                                <p className="text-sm font-semibold">{pack.price}</p>
                            </div>
                             <button onClick={() => handlePurchaseClick(pack)} className="mt-3 w-full p-2 rounded-md bg-white/20 font-semibold hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                                <ShopIcon className="w-5 h-5" /> 구매
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {isPasswordModalOpen && <PasswordPromptModal onConfirm={handlePasswordConfirm} onClose={() => setIsPasswordModalOpen(false)} />}
            {selectedPackForPurchase && <PurchaseModal pack={selectedPackForPurchase} onConfirm={() => handleConfirmPurchase(selectedPackForPurchase.amount)} onClose={() => setSelectedPackForPurchase(null)} />}
            
            {/* Results Modals */}
            {ultimateGachaResult && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setUltimateGachaResult(null)}>
                     <div className="bg-gray-800 p-4 rounded-lg max-w-lg w-full" onClick={e => e.stopPropagation()}>
                         <h2 className="text-2xl text-center font-bold mb-4 text-purple-300">궁극기 획득!</h2>
                         <div className="grid grid-cols-3 gap-2">
                             {ultimateGachaResult.map((skill, i) => (
                                 <div key={i} className="bg-gray-900 p-2 rounded border border-gray-700">
                                     <p className="font-bold text-sm">{skill.name}</p>
                                     <p className="text-xs text-gray-400">{skill.rarity} 등급</p>
                                 </div>
                             ))}
                         </div>
                         <button onClick={() => setUltimateGachaResult(null)} className="w-full mt-4 p-2 bg-cyan-600 rounded">확인</button>
                     </div>
                 </div>
            )}
             {equipmentGachaResult && (
                 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEquipmentGachaResult(null)}>
                     <div className="bg-gray-800 p-4 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                         <h2 className="text-2xl text-center font-bold mb-4 text-green-300">장비 획득!</h2>
                         <div className="text-center text-gray-400 mb-2">{equipmentGachaResult.length}개의 장비를 획득했습니다.</div>
                         <div className="grid grid-cols-3 gap-2">
                             {getDisplayedEquipmentResult().map((item, i) => (
                                 <div key={i} className={`bg-gray-900 p-2 rounded border ${item.rarity === Rarity.Mythic ? 'border-fuchsia-500' : item.rarity === Rarity.SSR ? 'border-yellow-400' : 'border-gray-700'}`}>
                                     <p className="font-bold text-sm truncate">{item.name}</p>
                                     <p className={`text-xs ${item.rarity === Rarity.Mythic ? 'text-fuchsia-400' : item.rarity === Rarity.SSR ? 'text-yellow-400' : 'text-gray-400'}`}>{item.rarity}</p>
                                 </div>
                             ))}
                         </div>
                         {equipmentGachaResult.length > 60 && (
                            <p className="text-center text-gray-500 mt-2 italic">...및 기타 {equipmentGachaResult.length - 60}개 아이템 (인벤토리로 지급됨)</p>
                         )}
                         <button onClick={() => setEquipmentGachaResult(null)} className="w-full mt-4 p-2 bg-cyan-600 rounded">확인</button>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default ShopScreen;
