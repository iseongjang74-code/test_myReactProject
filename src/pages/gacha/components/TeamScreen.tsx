
import React, { useState } from 'react';
import { Character, PlayerState, UltimateSkill } from '../../../../types';
import CharacterCard from './CharacterCard';
import CharacterDetailModal from './CharacterDetailModal';
import { getTeamAdvice } from '../services/geminiService';
import { SwordIcon } from './icons';
import UltimateSelectModal from './UltimateSelectModal';
import EquipmentSelectModal from './EquipmentSelectModal';
import { ALL_ULTIMATE_SKILLS } from '../constants';


interface TeamScreenProps {
    playerState: PlayerState;
    setPlayerState: React.Dispatch<React.SetStateAction<PlayerState | null>>;
    onEquipUltimate: (characterId: number, ultimateId: number) => void;
    onEquipEquipment: (characterId: number, equipmentId: number) => void;
}

const TeamScreen: React.FC<TeamScreenProps> = ({ playerState, setPlayerState, onEquipUltimate, onEquipEquipment }) => {
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [isUltimateModalOpen, setIsUltimateModalOpen] = useState(false);
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
    const [advice, setAdvice] = useState<string>('');
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

    const mainTeam = playerState.teams[0];
    const teamCharacterIds = new Set(mainTeam.characters.filter(Boolean).map((c) => c!.id));
    
    const allSkillsMap = new Map<number, UltimateSkill>(ALL_ULTIMATE_SKILLS.map(skill => [skill.id, skill]));
    // Map existing skills in player state to include leveled up ones
    const playerSkillsMap = new Map<number, UltimateSkill>(playerState.ultimateSkills.map(skill => [skill.id, skill]));
    
    const getUltimate = (id: number) => playerSkillsMap.get(id) || allSkillsMap.get(id);
    const getEquipment = (id?: number) => id ? playerState.inventory.find(e => e.id === id) : undefined;

    const handleOpenModal = (character: Character) => {
        setSelectedCharacter(character);
    };

    const handleCloseModal = () => {
        setSelectedCharacter(null);
        setIsUltimateModalOpen(false);
        setIsEquipmentModalOpen(false);
    };

    const handleAddToTeam = (character: Character) => {
        const firstEmptySlot = mainTeam.characters.findIndex(c => c === null);
        if (firstEmptySlot !== -1 && !teamCharacterIds.has(character.id)) {
            const newTeamCharacters = [...mainTeam.characters];
            newTeamCharacters[firstEmptySlot] = character;
            setPlayerState(prev => prev ? ({
                ...prev,
                teams: [{ ...prev.teams[0], characters: newTeamCharacters }],
            }) : null);
        }
        handleCloseModal();
    };

    const handleRemoveFromTeam = (characterId: number) => {
        const newTeamCharacters = mainTeam.characters.map(c => (c && c.id === characterId) ? null : c);
        setPlayerState(prev => prev ? ({
            ...prev,
            teams: [{ ...prev.teams[0], characters: newTeamCharacters }],
        }) : null);
        handleCloseModal();
    };

    const handleGetTeamAdvice = async () => {
        setIsLoadingAdvice(true);
        setAdvice('');
        const result = await getTeamAdvice(playerState.characters);
        setAdvice(result);
        setIsLoadingAdvice(false);
    };

    const handleSelectUltimate = (ultimateId: number) => {
        if(selectedCharacter) {
            onEquipUltimate(selectedCharacter.id, ultimateId);
        }
        setIsUltimateModalOpen(false);
        setSelectedCharacter(null);
    };

    const handleSelectEquipment = (equipmentId: number) => {
        if(selectedCharacter) {
            onEquipEquipment(selectedCharacter.id, equipmentId);
        }
        setIsEquipmentModalOpen(false);
        setSelectedCharacter(null);
    };

    return (
        <div className="space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-cyan-300">캐릭터 관리</h1>
                <p className="text-gray-400">보유 캐릭터를 확인하고 최강의 팀을 구성하세요.</p>
            </header>

            <section className="p-4 bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">메인 팀</h2>
                <div className="grid grid-cols-4 gap-3">
                    {mainTeam.characters.map((char, index) => (
                        <div key={index} className="relative">
                            {char ? (
                                <CharacterCard character={char} onClick={() => handleOpenModal(char)} />
                            ) : (
                                <div className="aspect-square w-full h-full bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 text-4xl">
                                    +
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
            
            <section>
                <button
                    onClick={handleGetTeamAdvice}
                    disabled={isLoadingAdvice}
                    className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <SwordIcon className="w-6 h-6" />
                    {isLoadingAdvice ? '분석 중...' : 'AI 팀 조합 추천받기'}
                </button>
                {advice && (
                     <div className="prose prose-invert mt-4 p-4 bg-gray-800/50 rounded-lg max-w-none" dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }} />
                )}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-3">보유 캐릭터 목록</h2>
                <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                    {playerState.characters.map((char) => (
                        <CharacterCard 
                            key={char.id}
                            character={char}
                            onClick={() => handleOpenModal(char)}
                        />
                    ))}
                </div>
            </section>

            {selectedCharacter && !isUltimateModalOpen && !isEquipmentModalOpen && (
                <CharacterDetailModal 
                    character={selectedCharacter}
                    equippedUltimate={getUltimate(selectedCharacter.equippedUltimateId)}
                    equippedEquipment={getEquipment(selectedCharacter.equippedEquipmentId)}
                    isCharacterInTeam={teamCharacterIds.has(selectedCharacter.id)}
                    onAddToTeam={() => handleAddToTeam(selectedCharacter)}
                    onRemoveFromTeam={() => handleRemoveFromTeam(selectedCharacter.id)}
                    onChangeUltimate={() => setIsUltimateModalOpen(true)}
                    onChangeEquipment={() => setIsEquipmentModalOpen(true)}
                    onClose={handleCloseModal} 
                />
            )}
            
            {isUltimateModalOpen && selectedCharacter && (
                <UltimateSelectModal
                    ownedUltimates={playerState.ultimateSkills}
                    onSelect={handleSelectUltimate}
                    onClose={() => setIsUltimateModalOpen(false)}
                />
            )}

            {isEquipmentModalOpen && selectedCharacter && (
                <EquipmentSelectModal
                    inventory={playerState.inventory}
                    onSelect={handleSelectEquipment}
                    onClose={() => setIsEquipmentModalOpen(false)}
                />
            )}
        </div>
    );
};

export default TeamScreen;
