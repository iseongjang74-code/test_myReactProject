
import React, { useState, useEffect, useCallback } from 'react';
import { Character, Difficulty, UltimateSkill, UltimateEffectType, TargetType, Equipment } from '../../../../types';
import { calculateStats } from '../utils/statCalculator';
import CharacterCard from './CharacterCard';
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

interface CombatScreenProps {
  playerTeam: Character[];
  enemyTeam: Character[];
  difficulty: Difficulty;
  ultimateSkills: UltimateSkill[];
  inventory: Equipment[]; 
  reward: number;
  onCombatEnd: (result: 'win' | 'lose') => void;
}

const CombatCharacterDisplay: React.FC<{ 
    character: CombatCharacter, 
    onClick?: () => void,
    canAct?: boolean,
    isAttacker?: boolean,
    isTargetable?: boolean
}> = ({ character, onClick, canAct, isAttacker, isTargetable }) => {
    const hpPercentage = (character.currentHp / character.hp) * 100;
    const ultPercentage = (character.ultimateGauge / character.maxUltimateGauge) * 100;
    const isDefeated = character.currentHp <= 0;

    const borderStyle = isAttacker
        ? 'ring-4 ring-yellow-400 scale-110'
        : isTargetable
        ? 'ring-4 ring-red-500 cursor-pointer hover:ring-red-400'
        : canAct
        ? 'ring-4 ring-green-500 cursor-pointer hover:ring-green-400'
        : '';
        
    return (
        <div 
            className={`relative transition-all duration-300 ${isAttacker ? 'z-10' : ''}`}
            onClick={onClick}
        >
             <div className={`${borderStyle} rounded-lg ${isDefeated ? 'opacity-50 grayscale' : ''}`}>
                <CharacterCard character={character} />
            </div>
            <div className={`absolute -bottom-7 left-1 right-1 transition-opacity ${isDefeated ? 'opacity-50' : ''}`}>
                <div className="w-full bg-gray-700 rounded-full h-3 border-2 border-black/50 overflow-hidden">
                    <div className="bg-green-500 h-full" style={{ width: `${hpPercentage}%` }}></div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 border border-black/50 mt-1 overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${ultPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const CombatScreen: React.FC<CombatScreenProps> = ({ playerTeam, enemyTeam, onCombatEnd, difficulty, ultimateSkills, inventory, reward }) => {
    const [combatants, setCombatants] = useState<CombatCharacter[]>([]);
    const [currentTurn, setCurrentTurn] = useState<'player' | 'enemy' | 'INITIALIZING'>('INITIALIZING');
    const [playerTurnState, setPlayerTurnState] = useState<'SELECT_ATTACKER' | 'SELECT_ACTION' | 'SELECT_TARGET'>('SELECT_ATTACKER');
    const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
    const [actedThisTurnIds, setActedThisTurnIds] = useState<Set<string>>(new Set());
    const [log, setLog] = useState<string[]>([]);
    const [message, setMessage] = useState('전투를 준비 중입니다...');
    const [result, setResult] = useState<'win' | 'lose' | null>(null);

    const allSkillsMap = new Map<number, UltimateSkill>(ALL_ULTIMATE_SKILLS.map(skill => [skill.id, skill]));
    const playerSkillsMap = new Map<number, UltimateSkill>(ultimateSkills.map(skill => [skill.id, skill]));

    useEffect(() => {
        const createCombatCharacter = (char: Character, isPlayer: boolean): CombatCharacter => {
            const equipment = isPlayer && char.equippedEquipmentId 
                ? inventory.find(e => e.id === char.equippedEquipmentId) 
                : undefined;
            
            const stats = calculateStats(char, equipment);
            
            const ultimateSkill = isPlayer
                ? playerSkillsMap.get(char.equippedUltimateId) || allSkillsMap.get(char.equippedUltimateId) || allSkillsMap.get(1)!
                : allSkillsMap.get(char.equippedUltimateId) || allSkillsMap.get(1)!;
                
            return {
                ...char,
                ...stats,
                currentHp: stats.hp,
                isPlayer,
                uniqueId: `${char.id}-${Math.random()}`,
                ultimateGauge: 0,
                maxUltimateGauge: 100,
                ultimateSkill,
            };
        };
        const playerCombatants = playerTeam.map(c => createCombatCharacter(c, true));
        const enemyCombatants = enemyTeam.map(c => createCombatCharacter(c, false));
        const playerTeamSpeed = playerCombatants.reduce((sum, char) => sum + char.speed, 0);
        const enemyTeamSpeed = enemyCombatants.reduce((sum, char) => sum + char.speed, 0);

        setCombatants([...playerCombatants, ...enemyCombatants]);
        
        if (playerTeamSpeed >= enemyTeamSpeed) {
            setCurrentTurn('player');
            setMessage('당신의 턴입니다! 행동할 아군을 선택하세요.');
        } else {
            setCurrentTurn('enemy');
            setMessage('적의 턴입니다...');
        }
        setLog(['전투 시작!']);
    }, [playerTeam, enemyTeam, ultimateSkills, inventory]); 

    const addLog = (newLog: string) => {
        setLog(prev => [newLog, ...prev.slice(0, 4)]);
    };

    const applyDamage = (targetId: string, damage: number) => {
        let isDefeated = false;
        setCombatants(prev => prev.map(c => {
            if (c.uniqueId === targetId) {
                const newHp = Math.max(0, c.currentHp - damage);
                if (newHp === 0) isDefeated = true;
                return { ...c, currentHp: newHp, ultimateGauge: Math.min(c.maxUltimateGauge, c.ultimateGauge + 30) };
            }
            return c;
        }));
        return isDefeated;
    };

    const endPlayerAction = (attacker: CombatCharacter) => {
        const newActedIds = new Set(actedThisTurnIds).add(attacker.uniqueId);
        setActedThisTurnIds(newActedIds);
        setSelectedAttackerId(null);
        
        const remainingPlayerCharacters = combatants.filter(c => c.isPlayer && c.currentHp > 0 && !newActedIds.has(c.uniqueId));

        if (remainingPlayerCharacters.length === 0) {
            setCurrentTurn('enemy');
            setMessage('적의 턴입니다...');
            setActedThisTurnIds(new Set());
        } else {
            setPlayerTurnState('SELECT_ATTACKER');
            setMessage('행동할 다른 아군을 선택하세요.');
        }
    };

    const handlePlayerAttack = useCallback((attacker: CombatCharacter, target: CombatCharacter) => {
        const damage = attacker.attack;
        addLog(`${attacker.name}이(가) ${target.name}에게 ${damage}의 피해를 입혔습니다!`);
        applyDamage(target.uniqueId, damage);
        setCombatants(prev => prev.map(c => c.uniqueId === attacker.uniqueId ? { ...c, ultimateGauge: Math.min(c.maxUltimateGauge, c.ultimateGauge + 40) } : c));
        endPlayerAction(attacker);
    }, [combatants, actedThisTurnIds]);

    const handleUseUltimate = (attacker: CombatCharacter, targets: CombatCharacter[]) => {
        const ultimate = attacker.ultimateSkill;
        let logMessage = `${attacker.name}이(가) 궁극기 [${ultimate.name}] (을)를 사용했습니다!`;
        addLog(logMessage);

        // Improved Level Scaling: 25% increase per level + 1
        const levelMultiplier = (ultimate.level - 1) * 0.25 + 1;

        targets.forEach(target => {
            switch (ultimate.effectType) {
                case UltimateEffectType.SINGLE_TARGET_DAMAGE:
                case UltimateEffectType.AREA_OF_EFFECT_DAMAGE:
                    const damage = Math.floor(attacker.attack * ultimate.power * levelMultiplier);
                    applyDamage(target.uniqueId, damage);
                    break;
                case UltimateEffectType.HEAL_SELF:
                case UltimateEffectType.HEAL_TEAM:
                     setCombatants(prev => prev.map(c => {
                        if (c.uniqueId === target.uniqueId) {
                            const newHp = Math.min(c.hp, c.currentHp + ultimate.power * levelMultiplier);
                            return { ...c, currentHp: newHp };
                        }
                        return c;
                    }));
                    break;
            }
        });

        setCombatants(prev => prev.map(c => c.uniqueId === attacker.uniqueId ? { ...c, ultimateGauge: 0 } : c));
        endPlayerAction(attacker);
    };

    useEffect(() => {
        const livingEnemies = combatants.filter(c => !c.isPlayer && c.currentHp > 0);
        const livingPlayers = combatants.filter(c => c.isPlayer && c.currentHp > 0);
        if (livingEnemies.length === 0 && combatants.length > 0) {
            setResult('win');
            setMessage('승리!');
        } else if (livingPlayers.length === 0 && combatants.length > 0) {
            setResult('lose');
            setMessage('패배...');
        }
    }, [combatants]);

    useEffect(() => {
        if (currentTurn !== 'enemy' || result) return;

        const enemyTurn = async () => {
            const livingEnemies = combatants.filter(c => !c.isPlayer && c.currentHp > 0);
            for (const attacker of livingEnemies) {
                await new Promise(resolve => setTimeout(resolve, 1200));
                if (result) break;

                const livingPlayers = combatants.filter(c => c.isPlayer && c.currentHp > 0);
                if (livingPlayers.length === 0) break;
                
                const target = livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
                const damage = attacker.attack;
                addLog(`${attacker.name}이(가) ${target.name}에게 ${damage}의 피해를 입혔습니다!`);
                applyDamage(target.uniqueId, damage);
                setCombatants(prev => prev.map(c => c.uniqueId === attacker.uniqueId ? { ...c, ultimateGauge: Math.min(c.maxUltimateGauge, c.ultimateGauge + 40) } : c));
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!result) {
                setCurrentTurn('player');
                setMessage('당신의 턴입니다! 행동할 아군을 선택하세요.');
                setPlayerTurnState('SELECT_ATTACKER');
                setActedThisTurnIds(new Set());
            }
        };
        enemyTurn();
    }, [currentTurn, result]);

    const handleSelectPlayerCharacter = (character: CombatCharacter) => {
        if (currentTurn !== 'player' || result || actedThisTurnIds.has(character.uniqueId)) return;
        setSelectedAttackerId(character.uniqueId);
        setPlayerTurnState('SELECT_ACTION');
        setMessage(`${character.name}의 행동을 선택하세요.`);
    };

    const handleSelectEnemyTarget = (target: CombatCharacter) => {
        if (playerTurnState !== 'SELECT_TARGET' || !selectedAttackerId || result || target.currentHp <= 0) return;
        const attacker = combatants.find(c => c.uniqueId === selectedAttackerId);
        if (attacker) {
            handlePlayerAttack(attacker, target);
        }
    };
    
    const handleActionChoice = (action: 'attack' | 'ultimate') => {
        if (playerTurnState !== 'SELECT_ACTION' || !selectedAttackerId) return;
        const attacker = combatants.find(c => c.uniqueId === selectedAttackerId)!;
        
        if(action === 'attack') {
            setPlayerTurnState('SELECT_TARGET');
            setMessage(`${attacker.name}(으)로 공격할 적을 선택하세요.`);
        } else {
            const ultimate = attacker.ultimateSkill;
            let targets: CombatCharacter[] = [];
            switch(ultimate.targetType) {
                case TargetType.ENEMY_SINGLE:
                    setPlayerTurnState('SELECT_TARGET');
                    setMessage(`궁극기로 공격할 적을 선택하세요.`);
                    return; 
                case TargetType.ENEMY_ALL:
                    targets = combatants.filter(c => !c.isPlayer && c.currentHp > 0);
                    break;
                case TargetType.ALLY_SELF:
                    targets = [attacker];
                    break;
                case TargetType.ALLY_ALL:
                    targets = combatants.filter(c => c.isPlayer && c.currentHp > 0);
                    break;
            }
            handleUseUltimate(attacker, targets);
        }
    };
    
    const handleRunAway = () => {
        if (window.confirm("정말 도망치시겠습니까? (패배로 처리됩니다)")) {
            onCombatEnd('lose');
        }
    };

    const selectedAttacker = combatants.find(c => c.uniqueId === selectedAttackerId);

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 space-y-4 relative">
             <button
                onClick={handleRunAway}
                className="absolute top-4 right-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-500 shadow-lg text-sm font-bold z-50 flex items-center gap-2"
            >
                <span>🏃</span> 도망가기
            </button>

            <div className="w-full">
                <h2 className="text-xl font-bold text-center text-red-400 mb-8">적 팀</h2>
                <div className="grid grid-cols-4 gap-x-4 gap-y-10 justify-items-center">
                    {combatants.filter(c => !c.isPlayer).map((char) => (
                        <CombatCharacterDisplay 
                            key={char.uniqueId} 
                            character={char}
                            isTargetable={playerTurnState === 'SELECT_TARGET' && char.currentHp > 0}
                            onClick={char.currentHp > 0 ? () => {
                                 if (playerTurnState === 'SELECT_TARGET' && selectedAttacker) {
                                    if(selectedAttacker.ultimateSkill.targetType === TargetType.ENEMY_SINGLE && selectedAttacker.ultimateGauge === selectedAttacker.maxUltimateGauge) {
                                        handleUseUltimate(selectedAttacker, [char])
                                    } else {
                                        handleSelectEnemyTarget(char)
                                    }
                                }
                            } : undefined}
                         />
                    ))}
                </div>
            </div>

            <div className="w-full max-w-lg min-h-[14rem] bg-black/50 p-3 rounded-lg border border-gray-700 text-center flex flex-col justify-between">
                <div>
                    <p className="text-lg font-bold text-cyan-300 mb-2">{message}</p>
                    {log.map((entry, index) => (
                        <p key={index} className={`transition-opacity duration-300 ${index === 0 ? 'text-white' : 'text-gray-400 text-xs'}`}>{entry}</p>
                    ))}
                </div>
                {playerTurnState === 'SELECT_ACTION' && selectedAttacker && (
                    <div className="flex gap-4 justify-center mt-4">
                        <button onClick={() => handleActionChoice('attack')} className="px-4 py-2 bg-red-600 rounded hover:bg-red-500">일반 공격</button>
                        <button onClick={() => handleActionChoice('ultimate')} disabled={selectedAttacker.ultimateGauge < selectedAttacker.maxUltimateGauge} className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed">궁극기 사용</button>
                    </div>
                )}
            </div>

            <div className="w-full">
                <h2 className="text-xl font-bold text-center text-green-400 mb-8">나의 팀</h2>
                 <div className="grid grid-cols-4 gap-x-4 gap-y-10 justify-items-center">
                    {combatants.filter(c => c.isPlayer).map((char) => (
                        <CombatCharacterDisplay 
                            key={char.uniqueId} 
                            character={char} 
                            canAct={currentTurn === 'player' && !actedThisTurnIds.has(char.uniqueId) && playerTurnState === 'SELECT_ATTACKER' && char.currentHp > 0}
                            isAttacker={selectedAttackerId === char.uniqueId}
                            onClick={char.currentHp > 0 ? () => handleSelectPlayerCharacter(char) : undefined}
                        />
                    ))}
                </div>
            </div>

            {result && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-gray-800 p-8 rounded-lg text-center shadow-2xl border-2 border-cyan-400">
                        <h1 className="text-5xl font-extrabold mb-4 text-yellow-400">{result === 'win' ? '승리!' : '패배...'}</h1>
                        <p className="text-gray-300 mb-6">{result === 'win' ? `${reward} 다이아 획득!` : '팀이 전멸했습니다.'}</p>
                        <button onClick={() => onCombatEnd(result)} className="px-8 py-3 rounded-lg bg-cyan-600 text-white font-bold text-lg hover:bg-cyan-500 transition-colors">확인</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombatScreen;
