import type { PlayerStatKey, PlayerStats } from '../../types/stats';

export interface StatDisplayDefinition {
  key: PlayerStatKey;
  label: string;
  format: (value: number) => string;
}

const number = (value: number): string => Number(value.toFixed(1)).toString();
const percent = (value: number): string => `${Math.round(value * 100)}%`;
const multiplier = (value: number): string => `${value.toFixed(2)}x`;

export const statSections: Record<'core' | 'combat' | 'utility', StatDisplayDefinition[]> = {
  core: [
    { key: 'damage', label: 'Damage', format: multiplier },
    { key: 'attackSpeed', label: 'Attack Speed', format: multiplier },
    { key: 'moveSpeed', label: 'Move Speed', format: number },
    { key: 'armor', label: 'Armor', format: number },
    { key: 'hpRegen', label: 'HP Regen', format: (value) => `${number(value)}/s` },
  ],
  combat: [
    { key: 'critChance', label: 'Crit Chance', format: percent },
    { key: 'critDamage', label: 'Crit Damage', format: multiplier },
    { key: 'projectileCount', label: 'Projectiles', format: number },
    { key: 'pierce', label: 'Pierce', format: number },
    { key: 'knockback', label: 'Knockback', format: number },
    { key: 'cooldownReduction', label: 'Cooldown Reduction', format: percent },
  ],
  utility: [
    { key: 'pickupRange', label: 'Pickup Range', format: number },
    { key: 'xpGain', label: 'XP Gain', format: multiplier },
    { key: 'goldGain', label: 'Gold Gain', format: multiplier },
    { key: 'luck', label: 'Luck', format: number },
  ],
};

export function formatStatLines(stats: PlayerStats, definitions: StatDisplayDefinition[]): string[] {
  return definitions.map(({ key, label, format }) => `${label}: ${format(stats[key])}`);
}
