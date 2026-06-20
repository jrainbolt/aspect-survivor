import type { BlessingId, BlessingRankDefinition } from '../types';

export const MAX_BLESSING_RANK = 3;

export const blessingRanks: Record<BlessingId, readonly BlessingRankDefinition[]> = {
  'jupiter-spark': [
    { rank: 1, effectText: '5% chain chance · 1 bounce', chance: 0.05, bounces: 1, damageMultiplier: 0.5 },
    { rank: 2, effectText: '10% chain chance · 2 bounces', chance: 0.1, bounces: 2, damageMultiplier: 0.58 },
    { rank: 3, effectText: '15% chain chance · 3 bounces', chance: 0.15, bounces: 3, damageMultiplier: 0.66 },
  ],
  'mars-bloodletting': [
    { rank: 1, effectText: '12% damage over 2 seconds', damageMultiplier: 0.12, durationMs: 2000 },
    { rank: 2, effectText: '18% damage over 3 seconds', damageMultiplier: 0.18, durationMs: 3000 },
    { rank: 3, effectText: '25% damage over 4 seconds', damageMultiplier: 0.25, durationMs: 4000 },
  ],
  'neptune-tidal-push': [
    { rank: 1, effectText: '+70 knockback', knockbackBonus: 70 },
    { rank: 2, effectText: '+130 knockback · larger wave', knockbackBonus: 130 },
    { rank: 3, effectText: '+200 knockback · brief slow', knockbackBonus: 200, slowMs: 500 },
  ],
};

export const getBlessingRank = (blessings: BlessingId[], id: BlessingId): number => blessings.filter((blessingId) => blessingId === id).length;
