
import React, { useState, useEffect } from 'react';
import { Character, RaidBoss, UltimateSkill, Equipment, UltimateEffectType } from '../types';
import { calculateStats } from '../utils/statCalculator';
import CharacterCard from './CharacterCard';
import { generateRaidBossCombatant } from '../utils/bossGenerator';
import { ALL_ULTIMATE_SKILLS } from '../constants';

type CombatCharacter = Character & {
  attack: number;
  hp: number;
  speed: number;
  currentHp: number;
  isPlayer: boolean;
  uniqueId: string;
  ultimateGauge: number;
  maxUltimateGauge: number;
  ultimateSkill: UltimateSkill;
};

type BossCombatant = ReturnType<typeof generateRaidBossCombatant> & {
    currentHp: number;
};

interface RaidCombatScreenProps {
  playerTeam: Character[];
  boss: RaidBoss;
  ultimateSkills: UltimateSkill[];
  inventory: Equipment[]; 
  onCombatEnd: (damageDealt: number) => void;
}

const CombatCharacterDisplay: React.FC<{ character: CombatCharacter | BossCombatant; isAttacker?: boolean }> = ({ character, isAttacker }) => {
    const hpPercentage = (character.currentHp / character.hp) * 100;
    const isDefeated = character.currentHp <= 0;

    const borderStyle = isAttacker ? 'ring-4 ring-yellow-400 scale-110' : '';

    return (
        <div className={`relative transition-all duration-300 ${isAttacker ? 'z-10' : ''}`}>
            <div className={`${borderStyle} rounded-lg ${isDefeated ? 'opacity-50 grayscale' : ''}`}>
                <CharacterCard character={character} />
            </div>
            <div className={`absolute -bottom-5 left-1 right-1 transition-opacity ${isDefeated ? 'opacity-50' : ''}`}>
                <div className="w-full bg-gray-700 rounded-full h-3 border-2 border-black/50 overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${hpPercentage}%` }}></div>
                </div>
                 { 'ultimateGauge' in character && 
                    <div className="w-full bg-gray-700 rounded-full h-2 border border-black/50 mt-1 overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${(character.ultimateGauge / character.maxUltimateGauge) * 100}%` }}></div>
                    </div>
                 }
            </div>
        </div>
    );
};


const RaidCombatScreen: React.FC<RaidCombatScreenProps> = ({ playerTeam, boss, ultimateSkills, inventory, onCombatEnd }) => {
    const [playerCombatants, setPlayerCombatants] = useState<CombatCharacter[]>([]);
    const [bossCombatant, setBossCombatant] = useState<BossCombatant | null>(null);
    const [turn, setTurn] = useState(0);
    const [maxTurns] = useState(10);
    const [log, setLog] = useState<string[]>([]);
    const [isAnimating, setIsAnimating] = useState(true);

    const allSkillsMap = new Map<number, UltimateSkill>(ALL_ULTIMATE_SKILLS.map(skill => [skill.id, skill]));
    const playerSkillsMap = new Map<number, UltimateSkill>(ultimateSkills.map(skill => [skill.id, skill]));
    
    useEffect(() => {
        const createCombatCharacter = (char: Character): CombatCharacter => {
            const equipment = char.equippedEquipmentId 
                ? inventory.find(e => e.id === char.equippedEquipmentId) 
                : undefined;
            
            const stats = calculateStats(char, equipment);
            
            const ultimateSkill = playerSkillsMap.get(char.equippedUltimateId) || allSkillsMap.get(char.equippedUltimateId) || allSkillsMap.get(1)!;
            return {
                ...char,
                ...stats,
                currentHp: stats.hp,
                isPlayer: true,
                uniqueId: `${char.id}-${Math.random()}`,
                ultimateGauge: 0,
                maxUltimateGauge: 100,
                ultimateSkill: ultimateSkill,
            };
        };
        setPlayerCombatants(playerTeam.map(createCombatCharacter));
        setBossCombatant(generateRaidBossCombatant(boss));
        setLog(['레이드 보스 출현!']);
        setIsAnimating(false);
    }, [playerTeam, boss, ultimateSkills, inventory]); 

     const addLog = (newLog: string) => {
        setLog(prev => [newLog, ...prev.slice(0, 4)]);
    };

    const handleCombatFinish = () => {
        if (!bossCombatant) return;
        const damageDealt = boss.hp - bossCombatant.currentHp;
        addLog(`전투 종료! 총 ${damageDealt.toLocaleString()}의 피해를 입혔습니다.`);
        setTimeout(() => {
            onCombatEnd(damageDealt);
        }, 2000);
    }
    
    useEffect(() => {
        if (isAnimating || !bossCombatant) return;

        const livingPlayers = playerCombatants.filter(c => c.currentHp > 0);
        const combatEnded = turn >= maxTurns || livingPlayers.length === 0 || bossCombatant.currentHp <= 0;

        if (combatEnded) {
            handleCombatFinish();
            return;
        }

        const runTurn = async () => {
            setIsAnimating(true);
            setTurn(prev => prev + 1);

            // Player attacks
            for (const attacker of livingPlayers) {
                if(bossCombatant.currentHp <= 0) break;
                await new Promise(r => setTimeout(r, 600));
                
                // Use ultimate if available
                if (attacker.ultimateGauge >= attacker.maxUltimateGauge) {
                    const ultimate = attacker.ultimateSkill;
                    addLog(`${attacker.name}이(가) 궁극기 [${ultimate.name}] (을)를 사용!`);
                    
                    // Improved Scaling
                    const levelMultiplier = (ultimate.level - 1) * 0.25 + 1;
                    const damage = Math.floor(attacker.attack * ultimate.power * levelMultiplier);

                     setBossCombatant(prevBoss => {
                        if (!prevBoss) return null;
                        const newHp = Math.max(0, prevBoss.currentHp - damage);
                        return { ...prevBoss, currentHp: newHp };
                    });
                    
                    setPlayerCombatants(prev => prev.map(c => c.uniqueId === attacker.uniqueId ? {...c, ultimateGauge: 0} : c));

                } else { // Normal attack
                    const damage = attacker.attack;
                    addLog(`${attacker.name}이(가) 보스를 공격! ${damage} 피해!`);
                    setBossCombatant(prevBoss => {
                        if (!prevBoss) return null;
                        const newHp = Math.max(0, prevBoss.currentHp - damage);
                        return { ...prevBoss, currentHp: newHp };
                    });

                    // Gain ultimate gauge
                     setPlayerCombatants(prev => prev.map(c => c.uniqueId === attacker.uniqueId ? {...c, ultimateGauge: Math.min(c.maxUltimateGauge, c.ultimateGauge + 40)} : c));
                }
            }

            // Boss attacks
            if(bossCombatant.currentHp > 0) {
                await new Promise(r => setTimeout(r, 1000));
                const stillLivingPlayers = playerCombatants.filter(c => c.currentHp > 0);
                if (stillLivingPlayers.length > 0) {
                    const target = stillLivingPlayers[Math.floor(Math.random() * stillLivingPlayers.length)];
                    const damage = bossCombatant.attack;
                    addLog(`보스가 ${target.name}에게 ${damage} 피해를 입혔습니다!`);
                    setPlayerCombatants(prev => prev.map(c => {
                        if (c.uniqueId === target.uniqueId) {
                            const newHp = Math.max(0, c.currentHp - damage);
                            return { ...c, currentHp: newHp, ultimateGauge: Math.min(c.maxUltimateGauge, c.ultimateGauge + 30) };
                        }
                        return c;
                    }));
                }
            }

            setIsAnimating(false);
        };

        const turnTimeout = setTimeout(runTurn, 1000);
        return () => clearTimeout(turnTimeout);

    }, [turn, isAnimating, bossCombatant, playerCombatants]);

    if (!bossCombatant) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 space-y-4">
             <div className="w-full text-center">
                 <h2 className="text-xl font-bold text-red-400 mb-8">레이드 보스</h2>
                 <div className="flex justify-center">
                    <div className="w-48">
                        <CombatCharacterDisplay character={bossCombatant} />
                    </div>
                 </div>
            </div>

             <div className="w-full max-w-lg min-h-[14rem] bg-black/50 p-3 rounded-lg border border-gray-700 text-center flex flex-col justify-between">
                <div>
                    <p className="text-xl font-bold text-cyan-300 mb-2">Turn {turn} / {maxTurns}</p>
                    {log.map((entry, index) => (
                        <p key={index} className={`transition-opacity duration-300 ${index === 0 ? 'text-white' : 'text-gray-400 text-xs'}`}>{entry}</p>
                    ))}
                </div>
            </div>

            <div className="w-full">
                <h2 className="text-xl font-bold text-center text-green-400 mb-8">나의 팀</h2>
                 <div className="grid grid-cols-4 gap-x-4 gap-y-10 justify-items-center">
                    {playerCombatants.map((char) => (
                        <CombatCharacterDisplay key={char.uniqueId} character={char} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RaidCombatScreen;
