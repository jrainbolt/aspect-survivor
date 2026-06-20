import type { StatModifier } from '../types/stats';
import type { CharacterId } from '../game/types';

export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  modifier: Omit<StatModifier, 'id' | 'source'>;
  fullHeal?: boolean;
  category: 'generic' | 'hero';
  characterId?: CharacterId;
}

export const upgradeCatalog: UpgradeOption[] = [
  { id: 'damage-plus', title: 'Damage +', description: '+25% damage', category: 'generic', modifier: { multiply: { damage: 1.25 } } },
  { id: 'attack-speed-plus', title: 'Attack Speed +', description: '+18% attack rate', category: 'generic', modifier: { multiply: { attackSpeed: 1.18 } } },
  { id: 'max-hp-plus', title: 'Max HP +', description: '+25 max HP and full heal', category: 'generic', modifier: { flat: { maxHp: 25 } }, fullHeal: true },
  { id: 'move-speed-plus', title: 'Move Speed +', description: '+12% movement speed', category: 'generic', modifier: { multiply: { moveSpeed: 1.12 } } },

  { id: 'shield-mastery', title: 'Shield Mastery', description: '+25% Shield Bash damage', category: 'hero', characterId: 'paladin', modifier: {} },
  { id: 'holy-momentum', title: 'Holy Momentum', description: '+15% attack speed and +5 armor', category: 'hero', characterId: 'paladin', modifier: { multiply: { attackSpeed: 1.15 }, flat: { armor: 5 } } },
  { id: 'crushing-bash', title: 'Crushing Bash', description: '+100 Shield Bash knockback', category: 'hero', characterId: 'paladin', modifier: {} },
  { id: 'wide-cleave', title: 'Wide Cleave', description: '+35% Sword Hack arc', category: 'hero', characterId: 'paladin', modifier: {} },

  { id: 'arcane-echo', title: 'Arcane Echo', description: 'Fire one additional projectile', category: 'hero', characterId: 'sorcerer', modifier: { flat: { projectileCount: 1 } } },
  { id: 'spell-focus', title: 'Spell Focus', description: '+20% spell damage', category: 'hero', characterId: 'sorcerer', modifier: { multiply: { spellDamageMultiplier: 1.2 } } },
  { id: 'mana-surge', title: 'Mana Surge', description: '+18% elemental attack speed', category: 'hero', characterId: 'sorcerer', modifier: { multiply: { attackSpeed: 1.18 } } },
  { id: 'chain-reaction', title: 'Chain Reaction', description: 'Improve your path elemental effect', category: 'hero', characterId: 'sorcerer', modifier: {} },

  { id: 'piercing-volley', title: 'Piercing Volley', description: '+1 projectile pierce', category: 'hero', characterId: 'amazon', modifier: { flat: { pierce: 1 } } },
  { id: 'quick-step', title: 'Quick Step', description: '+10% movement speed', category: 'hero', characterId: 'amazon', modifier: { multiply: { moveSpeed: 1.1 } } },
  { id: 'hunting-instinct', title: 'Hunting Instinct', description: '+8% critical chance', category: 'hero', characterId: 'amazon', modifier: { flat: { critChance: 0.08 } } },
  { id: 'longshot', title: 'Longshot', description: '+18% projectile speed and size', category: 'hero', characterId: 'amazon', modifier: { multiply: { projectileSpeed: 1.18, projectileSize: 1.18 } } },
];
