/**
 * Simple level-up calculator for items (equipment/characters) using "cards" currency.
 * Rules used (keeps it deterministic and easy to tune):
 * - Each level requires `10 + level * 2` cards to go to the next level.
 * - `calculateLevelUp(entity, gainedCards)` returns new { level, cards }
 */

export function cardsNeededForNext(level: number) {
  return 10 + level * 2;
}

// Accepts any entity with `level` and `cards` (e.g., Equipment or Character)
export function calculateLevelUp(entity: { level?: number; cards?: number }, gainedCards: number) {
  const startingLevel = entity.level || 1;
  let cards = (entity.cards || 0) + gainedCards;
  let level = startingLevel;

  while (cards >= cardsNeededForNext(level)) {
    cards -= cardsNeededForNext(level);
    level += 1;
  }

  return { level, cards };
}
