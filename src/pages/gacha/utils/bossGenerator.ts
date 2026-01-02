import { RaidBoss } from '../../../../types';

/**
 * Generate a boss combatant object used by RaidCombatScreen.
 * Returns an object with stats compatible with CombatCharacter/BossCombatant usage.
 */
export function generateRaidBossCombatant(boss: RaidBoss) {
  const hp = boss.hp ?? boss.maxHp ?? 100000;
  // Simple heuristic for boss attack: small % of HP
  const attack = Math.max(100, Math.round(hp * 0.02));
  const speed = 5 + Math.round((hp / 100000) * 10);

  return {
    name: boss.name,
    imageUrl: boss.imageUrl,
    hp,
    attack,
    speed,
    currentHp: hp,
    // boss may not have ultimate fields, keep minimal
  };
}
