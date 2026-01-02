import React, { useState } from 'react';
import { PlayerState, Character, Rarity } from '../../../../types';
import { ALL_CHARACTERS, GACHA_RATES } from '../constants';
import { calculateLevelUp } from '../utils/levelUpCalculator';
import GachaResultModal from './GachaResultModal';
import GachaRatesModal from './GachaRatesModal';
import { PercentIcon } from './icons';

interface GachaScreenProps {
    playerState: PlayerState;
    setPlayerState: React.Dispatch<React.SetStateAction<PlayerState | null>>;
}

const SINGLE_PULL_COST = 30;
const TEN_PULL_COST = 300;
const HUNDRED_PULL_COST = 3000;
const THOUSAND_PULL_COST = 50000;
const TEN_THOUSAND_PULL_COST = 500000;

const performGachaPull = (): Character => {
    const rand = Math.random();
    let cumulative = 0;

    const charactersByRarity: { [key in Rarity]?: Character[] } = {};
    ALL_CHARACTERS.forEach(char => {
        if (!charactersByRarity[char.rarity]) {
            charactersByRarity[char.rarity] = [];
        }
        charactersByRarity[char.rarity]!.push(char);
    });

    for (const rarity of Object.keys(GACHA_RATES) as Rarity[]) {
        cumulative += GACHA_RATES[rarity];
        if (rand < cumulative) {
            const possibleChars = charactersByRarity[rarity];
            if (possibleChars && possibleChars.length > 0) {
                const chosenChar = possibleChars[Math.floor(Math.random() * possibleChars.length)];
                return { ...chosenChar, id: Date.now() + Math.random(), cards: 0 }; 
            }
        }
    }
    return { ...charactersByRarity[Rarity.N]![0], id: Date.now() + Math.random(), cards: 0 };
};

const GachaScreen: React.FC<GachaScreenProps> = ({ playerState, setPlayerState }) => {
    const [gachaResult, setGachaResult] = useState<Character[] | null>(null);
    const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleGacha = (pulls: number, cost: number) => {
        if (!playerState || playerState.currency < cost || isAnimating) return;

        setIsAnimating(true);
        
        let newCharacters: Character[] = Array.from({ length: pulls }, performGachaPull);

        if (pulls === 10) {
            const hasHighRarity = newCharacters.some(c => [Rarity.SR, Rarity.SSR, Rarity.Mythic].includes(c.rarity));
            if (!hasHighRarity) {
                const srOrHigherChars = ALL_CHARACTERS.filter(c => [Rarity.SR, Rarity.SSR, Rarity.Mythic].includes(c.rarity));
                if (srOrHigherChars.length > 0) {
                    const guaranteedChar = srOrHigherChars[Math.floor(Math.random() * srOrHigherChars.length)];
                    newCharacters[0] = { ...guaranteedChar, id: Date.now() + Math.random(), cards: 0 };
                }
            }
        } else if (pulls === 100) {
            const hasHighRarity = newCharacters.some(c => [Rarity.SSR, Rarity.Mythic].includes(c.rarity));
            if (!hasHighRarity) {
                const ssrOrHigherChars = ALL_CHARACTERS.filter(c => [Rarity.SSR, Rarity.Mythic].includes(c.rarity));
                 if (ssrOrHigherChars.length > 0) {
                    const guaranteedChar = ssrOrHigherChars[Math.floor(Math.random() * ssrOrHigherChars.length)];
                    newCharacters[0] = { ...guaranteedChar, id: Date.now() + Math.random(), cards: 0 };
                }
            }
        } else if (pulls === 1000) {
            const hasMythic = newCharacters.some(c => c.rarity === Rarity.Mythic);
            if (!hasMythic) {
                const mythicChars = ALL_CHARACTERS.filter(c => c.rarity === Rarity.Mythic);
                if (mythicChars.length > 0) {
                    const guaranteedChar = mythicChars[Math.floor(Math.random() * mythicChars.length)];
                    newCharacters[0] = { ...guaranteedChar, id: Date.now() + Math.random(), cards: 0 };
                }
            }
        } else if (pulls === 10000) {
            const mythicChars = ALL_CHARACTERS.filter(c => c.rarity === Rarity.Mythic);
            if (mythicChars.length > 0) {
                // 신화 캐릭터 10명 보장
                for (let i = 0; i < 10; i++) {
                    const guaranteedChar = mythicChars[Math.floor(Math.random() * mythicChars.length)];
                    newCharacters[i] = { ...guaranteedChar, id: Date.now() + Math.random() + i, cards: 0 };
                }
                // 결과 배열을 섞어 무작위성을 부여합니다.
                for (let i = newCharacters.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newCharacters[i], newCharacters[j]] = [newCharacters[j], newCharacters[i]];
                }
            }
        }


        setTimeout(() => {
            setPlayerState(prev => {
                if (!prev) return null;
                const playerCharsMap = new Map<string, Character>();
                prev.characters.forEach(c => playerCharsMap.set(c.name, { ...c }));

                newCharacters.forEach(pulledChar => {
                    if (playerCharsMap.has(pulledChar.name)) {
                        const existing = playerCharsMap.get(pulledChar.name)!;
                        const { level, cards } = calculateLevelUp(existing, 1);
                        existing.level = level;
                        existing.cards = cards;
                    } else {
                        playerCharsMap.set(pulledChar.name, { ...pulledChar, level: 1, cards: 0 });
                    }
                });
                
                const updatedCharacters = Array.from(playerCharsMap.values());

                return {
                    ...prev,
                    currency: prev.currency - cost,
                    characters: updatedCharacters,
                };
            });
            setGachaResult(newCharacters);
            setIsAnimating(false);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-cyan-300">소환</h1>
                <p className="text-gray-400">새로운 동료를 만나 운명을 개척하세요.</p>
            </header>

            <div className="p-4 bg-gray-800 rounded-lg flex justify-between items-center sticky top-4 z-10">
                <span className="font-semibold text-lg">보유 보석</span>
                <span className="font-bold text-2xl text-yellow-300">{playerState?.currency.toLocaleString()}</span>
                 <button 
                    onClick={() => setIsRatesModalOpen(true)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                    <PercentIcon className="w-4 h-4" />
                    소환 확률
                </button>
            </div>

            <div className="relative aspect-video w-full max-w-lg mx-auto flex items-center justify-center rounded-lg overflow-hidden bg-black">
                 <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/50 via-black to-indigo-900/50 opacity-70"></div>
                 <div className="absolute w-full h-full animate-spin-slow" style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 10%, transparent 70%)' }}></div>
                 <p className="text-2xl font-bold text-white z-10 drop-shadow-lg">소환진</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleGacha(1, SINGLE_PULL_COST)}
                    disabled={!playerState || playerState.currency < SINGLE_PULL_COST || isAnimating}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold shadow-lg hover:from-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <p className="text-lg">1회 소환</p>
                    <p className="text-sm font-normal">보석 {SINGLE_PULL_COST}</p>
                </button>

                <button
                    onClick={() => handleGacha(10, TEN_PULL_COST)}
                    disabled={!playerState || playerState.currency < TEN_PULL_COST || isAnimating}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg hover:from-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                     <p className="text-lg">10회 소환</p>
                    <p className="text-sm font-normal">보석 {TEN_PULL_COST}</p>
                </button>

                <button
                    onClick={() => handleGacha(100, HUNDRED_PULL_COST)}
                    disabled={!playerState || playerState.currency < HUNDRED_PULL_COST || isAnimating}
                    className="col-span-2 w-full p-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg hover:from-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <p className="text-lg">100회 소환 (SSR+ 1명 확정)</p>
                    <p className="text-sm font-normal">보석 {HUNDRED_PULL_COST}</p>
                </button>

                 <button
                    onClick={() => handleGacha(1000, THOUSAND_PULL_COST)}
                    disabled={!playerState || playerState.currency < THOUSAND_PULL_COST || isAnimating}
                    className="col-span-2 w-full p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-red-500 text-white font-bold shadow-lg hover:from-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <p className="text-lg">1000회 소환 (신화 1명 확정)</p>
                    <p className="text-sm font-normal">보석 {THOUSAND_PULL_COST}</p>
                </button>

                <button
                    onClick={() => handleGacha(10000, TEN_THOUSAND_PULL_COST)}
                    disabled={!playerState || playerState.currency < TEN_THOUSAND_PULL_COST || isAnimating}
                    className="col-span-2 w-full p-3 rounded-lg bg-gradient-to-r from-fuchsia-600 to-yellow-500 text-white font-bold shadow-lg hover:from-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <p className="text-lg">10000회 소환 (신화 10명 확정)</p>
                    <p className="text-sm font-normal">보석 {TEN_THOUSAND_PULL_COST.toLocaleString()}</p>
                </button>
            </div>

            {gachaResult && <GachaResultModal results={gachaResult} onClose={() => setGachaResult(null)} />}
            {isRatesModalOpen && <GachaRatesModal onClose={() => setIsRatesModalOpen(false)} />}
        </div>
    );
};

export default GachaScreen;