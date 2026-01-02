import { Character, Rarity, GachaDifficulty } from '../../../../types';
import { ALL_CHARACTERS } from '../constants';

const difficultyConfig: Record<GachaDifficulty, {
    count: number;
    rarities: Rarity[];
    levelRange: [number, number];
}> = {
    very_easy: {
        count: 1,
        rarities: [Rarity.N],
        levelRange: [1, 3],
    },
    easy: {
        count: 2,
        rarities: [Rarity.N, Rarity.R],
        levelRange: [3, 8],
    },
    normal: {
        count: 3,
        rarities: [Rarity.R, Rarity.SR],
        levelRange: [10, 15],
    },
    hard: {
        count: 4,
        rarities: [Rarity.SR, Rarity.SSR],
        levelRange: [20, 25],
    },
    very_hard: {
        count: 4,
        rarities: [Rarity.SR, Rarity.SSR],
        levelRange: [30, 40],
    },
    hell: {
        count: 4,
        rarities: [Rarity.SSR, Rarity.Mythic],
        levelRange: [45, 55],
    },
    hardcore: {
        count: 4,
        rarities: [Rarity.Mythic],
        levelRange: [60, 70],
    },
    boss: {
        count: 1,
        rarities: [Rarity.Mythic],
        levelRange: [100, 100],
    },
};

// Use a negative counter for enemy IDs to prevent collisions with player character IDs.
let enemyIdCounter = -1;

/**
 * Generates a random enemy team based on the selected difficulty.
 * @param difficulty The desired difficulty level.
 * @returns An array of Character objects representing the enemy team.
 */
export const generateEnemyTeam = (difficulty: Difficulty): Character[] => {
    const config = difficultyConfig[difficulty];
    const newTeam: Character[] = [];

    // Create a pool of characters based on allowed rarities
    const characterPool = ALL_CHARACTERS.filter(c => config.rarities.includes(c.rarity));

    if (characterPool.length === 0) {
        console.error(`No characters available for rarities: ${config.rarities.join(', ')}`);
        // Fallback to N rarity if the intended pool is empty (e.g., for hardcore with no mythics)
        const fallbackPool = ALL_CHARACTERS.filter(c => c.rarity === Rarity.N);
        if (fallbackPool.length > 0) characterPool.push(...fallbackPool);
        else return []; // No characters at all
    }

    for (let i = 0; i < config.count; i++) {
        // Pick a random character template from the pool
        const template = characterPool[Math.floor(Math.random() * characterPool.length)];

        // Calculate a random level within the specified range
        const level = Math.floor(Math.random() * (config.levelRange[1] - config.levelRange[0] + 1)) + config.levelRange[0];

        // Create a new character instance for the enemy team
        const enemyCharacter: Character = {
            ...template,
            id: enemyIdCounter--, // Assign a unique negative ID
            level: level,
            name: `${template.name} (적)`, // Optionally rename to mark as an enemy
        };
        
        newTeam.push(enemyCharacter);
    }

    return newTeam;
};