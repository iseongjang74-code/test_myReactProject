
import React, { useState, useEffect } from 'react';
import { PlayerState, Character, Difficulty, Guild, ChatMessage, RaidBoss } from '../../../types.ts';
import { INITIAL_PLAYER_STATE, RAID_BOSS_TEMPLATE } from './constants.ts';
import LoginScreen from './components/LoginScreen.tsx';
import MainScreen from './components/MainScreen.tsx';
import GachaScreen from './components/GachaScreen.tsx';
import TeamScreen from './components/TeamScreen.tsx';
import BattleScreen from './components/BattleScreen.tsx';
import SocialScreen from './components/SocialScreen.tsx';
import ShopScreen from './components/ShopScreen.tsx';
import GuildScreen from './components/GuildScreen.tsx';
import CombatScreen from './components/CombatScreen.tsx';
import RaidCombatScreen from './components/RaidCombatScreen.tsx';

import { HomeIcon, GachaIcon, TeamIcon, BattleIcon, SocialIcon, ShopIcon, GuildIcon } from './components/icons/index.ts';

type Screen = 'login' | 'main' | 'gacha' | 'team' | 'battle' | 'social' | 'shop' | 'guild';
type CombatState = { opponents: Character[]; difficulty: import('../../../types').GachaDifficulty; reward: number; } | null;
type RaidCombatState = { raidBoss: RaidBoss } | null;

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
    const [currentScreen, setCurrentScreen] = useState<Screen>('login');
    const [combatState, setCombatState] = useState<CombatState>(null);
    const [raidCombatState, setRaidCombatState] = useState<RaidCombatState | null>(null);
    const [allGuilds, setAllGuilds] = useState<Guild[]>([]); // Mock guild data

    // --- MOCK GUILD DATA ---
    useEffect(() => {
        if (currentUser) {
            // Initialize with some mock guilds if none exist
            if (allGuilds.length === 0) {
                setAllGuilds([
                    { id: 'guild-1', name: '최강용병단', creator: 'AcePlayer', members: [{ username: 'AcePlayer', joinedAt: new Date().toISOString() }], chat: [{username: 'System', message: '최강용병단 길드가 생성되었습니다.', timestamp: new Date().toISOString()}], raidBoss: {...RAID_BOSS_TEMPLATE} },
                    { id: 'guild-2', name: '어둠의자손들', creator: 'ShadowCat', members: [{ username: 'ShadowCat', joinedAt: new Date().toISOString() }], chat: [{username: 'System', message: '어둠의자손들 길드가 생성되었습니다.', timestamp: new Date().toISOString()}], raidBoss: {...RAID_BOSS_TEMPLATE, name: "심연의 감시자", hp: 75000000, maxHp: 75000000} },
                ]);
            }
        }
    }, [currentUser]);


    // Load and save player data from localStorage
    useEffect(() => {
        if (currentUser) {
            const savedState = localStorage.getItem(`playerState_${currentUser}`);
            if (savedState) {
                try {
                    const parsedState = JSON.parse(savedState);
                    // Merge with INITIAL_PLAYER_STATE to ensure new fields (like inventory) are present for old saves
                    setPlayerState({
                        ...INITIAL_PLAYER_STATE,
                        ...parsedState,
                        inventory: parsedState.inventory || INITIAL_PLAYER_STATE.inventory,
                        ultimateSkills: parsedState.ultimateSkills || INITIAL_PLAYER_STATE.ultimateSkills
                    });
                } catch (e) {
                    console.error("Failed to parse save state", e);
                    setPlayerState(INITIAL_PLAYER_STATE);
                }
            } else {
                setPlayerState(INITIAL_PLAYER_STATE);
            }
        } else {
            setPlayerState(null);
            setCurrentScreen('login');
        }
    }, [currentUser]);

    useEffect(() => {
        if (playerState && currentUser) {
            localStorage.setItem(`playerState_${currentUser}`, JSON.stringify(playerState));
        }
    }, [playerState, currentUser]);

    const handleLogin = (username: string) => {
        setCurrentUser(username);
        setCurrentScreen('main');
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleNavigate = (screen: Screen) => {
        setCurrentScreen(screen);
    };
    
    const handleStartCombat = (opponents: Character[], difficulty: import('../../../types').GachaDifficulty) => {
        const rewardMap: Record<import('../../../types').GachaDifficulty, number> = {
            very_easy: 100,
            easy: 300,
            normal: 800,
            hard: 2000,
            very_hard: 5000,
            hell: 15000,
            hardcore: 50000,
            boss: 100000
        };
        const reward = rewardMap[difficulty];
        setCombatState({ opponents, difficulty, reward });
    };

    const handleCombatEnd = (result: 'win' | 'lose') => {
        if (result === 'win' && playerState && combatState) {
            // The reward is now pre-calculated and stored in combatState
            setPlayerState({ ...playerState, currency: playerState.currency + combatState.reward });
        }
        setCombatState(null);
    };

    const handleEquipUltimate = (characterId: number, ultimateId: number) => {
        setPlayerState(prev => {
            if (!prev) return null;
            const updatedCharacters = prev.characters.map(c => 
                c.id === characterId ? { ...c, equippedUltimateId: ultimateId } : c
            );
            const updatedTeams = prev.teams.map(team => ({
                ...team,
                characters: team.characters.map(char => 
                    char && char.id === characterId ? { ...char, equippedUltimateId: ultimateId } : char
                )
            }));
            return { ...prev, characters: updatedCharacters, teams: updatedTeams };
        });
    };

    const handleEquipEquipment = (characterId: number, equipmentId: number) => {
         setPlayerState(prev => {
            if (!prev) return null;
            const updatedCharacters = prev.characters.map(c => 
                c.id === characterId ? { ...c, equippedEquipmentId: equipmentId } : c
            );
            const updatedTeams = prev.teams.map(team => ({
                ...team,
                characters: team.characters.map(char => 
                    char && char.id === characterId ? { ...char, equippedEquipmentId: equipmentId } : char
                )
            }));
            return { ...prev, characters: updatedCharacters, teams: updatedTeams };
        });
    };

    // --- Guild Handlers ---
    const handleCreateGuild = (guildName: string) => {
        if (!currentUser || !playerState || playerState.guildId) return;
        const newGuild: Guild = {
            id: `guild-${Date.now()}`,
            name: guildName,
            creator: currentUser,
            members: [{ username: currentUser, joinedAt: new Date().toISOString() }],
            chat: [{ username: 'System', message: `${guildName} 길드가 생성되었습니다.`, timestamp: new Date().toISOString() }],
            raidBoss: {...RAID_BOSS_TEMPLATE}
        };
        setAllGuilds(prev => [...prev, newGuild]);
        setPlayerState(prev => prev ? ({ ...prev, guildId: newGuild.id }) : null);
    };

    const handleJoinGuild = (guildId: string) => {
        if (!currentUser || !playerState || playerState.guildId) return;
        setAllGuilds(prev => prev.map(g => {
            if (g.id === guildId) {
                return {
                    ...g,
                    members: [...g.members, { username: currentUser, joinedAt: new Date().toISOString() }],
                    chat: [...g.chat, { username: 'System', message: `${currentUser}님이 가입했습니다.`, timestamp: new Date().toISOString() }]
                };
            }
            return g;
        }));
        setPlayerState(prev => prev ? ({ ...prev, guildId: guildId }) : null);
    };

    const handleLeaveGuild = () => {
        if (!currentUser || !playerState || !playerState.guildId) return;
        const guildId = playerState.guildId;
        setAllGuilds(prev => prev.map(g => {
             if (g.id === guildId) {
                return {
                    ...g,
                    members: g.members.filter(m => m.username !== currentUser),
                     chat: [...g.chat, { username: 'System', message: `${currentUser}님이 탈퇴했습니다.`, timestamp: new Date().toISOString() }]
                };
            }
            return g;
        }));
        setPlayerState(prev => prev ? ({ ...prev, guildId: null }) : null);
    };

    const handleSendMessage = (message: string) => {
        if (!currentUser || !playerState || !playerState.guildId) return;
         const guildId = playerState.guildId;
         const newMessage: ChatMessage = {
             username: currentUser,
             message,
             timestamp: new Date().toISOString()
         };
         setAllGuilds(prev => prev.map(g => g.id === guildId ? { ...g, chat: [...g.chat, newMessage] } : g));
    };
    
    const handleAttackRaid = () => {
        if (!playerState || !playerState.guildId) return;
        const guild = allGuilds.find(g => g.id === playerState.guildId);
        if (guild && guild.raidBoss.hp > 0) {
            setRaidCombatState({ raidBoss: guild.raidBoss });
        }
    };
    
    const handleRaidCombatEnd = (damageDealt: number) => {
         if (!currentUser || !playerState || !playerState.guildId) return;
         const guildId = playerState.guildId;
         let bossDefeated = false;

         setAllGuilds(prev => prev.map(g => {
            if (g.id === guildId) {
                const newHp = Math.max(0, g.raidBoss.hp - damageDealt);
                if (newHp === 0 && g.raidBoss.hp > 0) { // Check if it was just defeated
                    bossDefeated = true;
                }
                const newChat = bossDefeated
                        ? [...g.chat, { username: 'System', message: `${currentUser}님이 레이드 보스에게 최후의 일격을 가했습니다!`, timestamp: new Date().toISOString() }]
                        : g.chat;

                return {
                    ...g,
                    raidBoss: { ...g.raidBoss, hp: newHp, lastAttackedBy: currentUser },
                    chat: newChat
                };
            }
            return g;
        }));

        if (bossDefeated) {
            const guild = allGuilds.find(g => g.id === guildId);
            if (guild) {
                setPlayerState(prev => prev ? ({ ...prev, currency: prev.currency + guild.raidBoss.reward }) : null);
            }
        }
        
        setRaidCombatState(null);
    };

    const renderScreen = () => {
        if (!currentUser || !playerState) {
            return <LoginScreen onLogin={handleLogin} />;
        }
        if (combatState) {
            // Safely get the active team, filtering out null slots
            const activeTeam = playerState.teams[0]?.characters.filter(c => c !== null) as Character[] || [];
            
            return <CombatScreen 
                        playerTeam={activeTeam}
                        enemyTeam={combatState.opponents}
                        difficulty={combatState.difficulty}
                        reward={combatState.reward}
                        ultimateSkills={playerState.ultimateSkills || []}
                        inventory={playerState.inventory || []} 
                        onCombatEnd={handleCombatEnd}
                    />;
        }
        if (raidCombatState) {
            const activeTeam = playerState.teams[0]?.characters.filter(c => c !== null) as Character[] || [];

            return <RaidCombatScreen 
                playerTeam={activeTeam}
                boss={raidCombatState.raidBoss}
                ultimateSkills={playerState.ultimateSkills || []}
                inventory={playerState.inventory || []} 
                onCombatEnd={handleRaidCombatEnd}
            />
        }

        switch (currentScreen) {
            case 'main':
                return <MainScreen 
                    playerState={playerState} 
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onNavigate={handleNavigate}
                />;
            case 'gacha':
                return <GachaScreen playerState={playerState} setPlayerState={setPlayerState} />;
            case 'team':
                return <TeamScreen 
                    playerState={playerState} 
                    setPlayerState={setPlayerState}
                    onEquipUltimate={handleEquipUltimate}
                    onEquipEquipment={handleEquipEquipment} 
                />;
            case 'battle':
                return <BattleScreen playerState={playerState} onStartCombat={handleStartCombat} />;
            case 'social':
                return <SocialScreen friends={playerState.friends} />;
            case 'shop':
                return <ShopScreen playerState={playerState} setPlayerState={setPlayerState} />;
            case 'guild':
                return <GuildScreen 
                    playerState={playerState} 
                    allGuilds={allGuilds} 
                    currentUser={currentUser}
                    onCreateGuild={handleCreateGuild}
                    onJoinGuild={handleJoinGuild}
                    onLeaveGuild={handleLeaveGuild}
                    onSendMessage={handleSendMessage}
                    onAttackRaid={handleAttackRaid}
                />;
            default:
                return <MainScreen playerState={playerState} currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-cyan-500 selection:text-white pb-20 md:pb-0">
             <div className="max-w-2xl mx-auto min-h-screen bg-gray-900 shadow-2xl overflow-hidden relative">
                <main className="p-4 pb-24">
                    {renderScreen()}
                </main>
                
                {currentUser && !combatState && !raidCombatState && (
                    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 flex justify-around items-center max-w-2xl mx-auto z-50">
                        <button onClick={() => setCurrentScreen('main')} className={`p-2 rounded-lg ${currentScreen === 'main' ? 'text-cyan-400 bg-gray-700' : 'text-gray-400'}`}>
                            <HomeIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setCurrentScreen('team')} className={`p-2 rounded-lg ${currentScreen === 'team' ? 'text-cyan-400 bg-gray-700' : 'text-gray-400'}`}>
                            <TeamIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setCurrentScreen('battle')} className={`p-2 rounded-lg ${currentScreen === 'battle' ? 'text-cyan-400 bg-gray-700' : 'text-gray-400'}`}>
                            <BattleIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setCurrentScreen('guild')} className={`p-2 rounded-lg ${currentScreen === 'guild' ? 'text-cyan-400 bg-gray-700' : 'text-gray-400'}`}>
                            <GuildIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setCurrentScreen('shop')} className={`p-2 rounded-lg ${currentScreen === 'shop' ? 'text-cyan-400 bg-gray-700' : 'text-gray-400'}`}>
                            <ShopIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setCurrentScreen('social')} className={`p-2 rounded-lg ${currentScreen === 'social' ? 'text-cyan-400 bg-gray-700' : 'text-gray-400'}`}>
                            <SocialIcon className="w-6 h-6" />
                        </button>
                    </nav>
                )}
             </div>
        </div>
    );
};

export default App;
