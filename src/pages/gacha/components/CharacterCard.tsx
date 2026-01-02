import React from 'react';
import { Character, Rarity } from '../../../../types';

interface CharacterCardProps {
    character: Character;
    onClick?: () => void;
    isSelected?: boolean;
}

const rarityStyles: Record<Rarity, { border: string; text: string; shadow: string }> = {
    [Rarity.N]: { border: 'border-gray-500', text: 'text-gray-300', shadow: 'shadow-gray-500/50' },
    [Rarity.R]: { border: 'border-green-500', text: 'text-green-400', shadow: 'shadow-green-500/50' },
    [Rarity.SR]: { border: 'border-blue-500', text: 'text-blue-400', shadow: 'shadow-blue-500/50' },
    [Rarity.SSR]: { border: 'border-yellow-400', text: 'text-yellow-400', shadow: 'shadow-yellow-400/50' },
    [Rarity.Mythic]: { border: 'border-fuchsia-500', text: 'text-fuchsia-400', shadow: 'shadow-fuchsia-500/50' },
};


const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick, isSelected }) => {
    const styles = rarityStyles[character.rarity];

    return (
        <div 
            className={`relative aspect-square rounded-lg overflow-hidden border-2 ${styles.border} shadow-lg ${styles.shadow} transition-transform hover:scale-105 ${onClick ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-cyan-400' : ''}`}
            onClick={onClick}
        >
            <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            
            <div className={`absolute top-1 left-1 bg-black/60 px-2 py-0.5 rounded-full text-xs font-bold ${styles.text}`}>
                {character.rarity}
            </div>

            <div className="absolute top-1 right-1 bg-black/60 px-2 py-0.5 rounded-full text-xs font-bold text-white">
                Lv.{character.level}
            </div>

            <div className="absolute bottom-1 left-0 right-0 px-2 text-center">
                <p className="text-white text-xs font-bold truncate drop-shadow-md">{character.name}</p>
            </div>
        </div>
    );
};

export default CharacterCard;