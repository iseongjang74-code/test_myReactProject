import { Character, Equipment, Rarity } from '../../../../types';

/**
 * Lightweight stat calculation helpers used by combat components.
 * These are intentionally simple and deterministic so the UI can show
 * stat previews without depending on server logic.
 */

export function calculateEquipmentStats(equipment: Equipment) {
  if (!equipment) return { attack: 0, hp: 0, speed: 0 };

  const levelBonus = 1 + equipment.level * 0.05;
  const cardsBonus = 1 + equipment.cards * 0.01;
  const multiplier = levelBonus * cardsBonus;

  const attack = Math.round(equipment.baseStats.attack * multiplier);
  const hp = Math.round(equipment.baseStats.hp * multiplier);
  const speed = Math.round(equipment.baseStats.speed * multiplier);

  return { attack, hp, speed };
}

export function calculateStats(character: Character, equipment?: Equipment) {
  // Base stats determined by level + rarity
  const rarityMultiplierMap: Record<Rarity, number> = {
    [Rarity.N]: 1,
    [Rarity.R]: 1.15,
    [Rarity.SR]: 1.35,
    [Rarity.SSR]: 1.6,
    [Rarity.Mythic]: 2.0,
  };

  const rarityMultiplier = rarityMultiplierMap[character.rarity] ?? 1;

  const baseAttack = Math.round((character.level * 4 + 10) * rarityMultiplier);
  const baseHp = Math.round((character.level * 20 + 100) * rarityMultiplier);
  const baseSpeed = Math.round(10 + character.level * 0.4 + (character.level > 50 ? 2 : 0));

  let eq = { attack: 0, hp: 0, speed: 0 };
  if (equipment) {
    eq = calculateEquipmentStats(equipment);
  }

  return {
    attack: baseAttack + eq.attack,
    hp: baseHp + eq.hp,
    speed: Math.max(1, baseSpeed + eq.speed),
  };
}
