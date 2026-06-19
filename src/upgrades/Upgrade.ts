import type { StatModifier } from '../types/stats';

export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  modifier: Omit<StatModifier, 'id' | 'source'>;
  fullHeal?: boolean;
}

export const upgradeCatalog: UpgradeOption[] = [
  { id: 'damage-plus', title: 'Damage +', description: '+25% projectile damage', modifier: { multiply: { damage: 1.25 } } },
  { id: 'attack-speed-plus', title: 'Attack Speed +', description: '+18% firing rate', modifier: { multiply: { attackSpeed: 1.18 } } },
  { id: 'max-hp-plus', title: 'Max HP +', description: '+25 max HP and full heal', modifier: { flat: { maxHp: 25 } }, fullHeal: true },
  { id: 'move-speed-plus', title: 'Move Speed +', description: '+12% movement speed', modifier: { multiply: { moveSpeed: 1.12 } } },
];
