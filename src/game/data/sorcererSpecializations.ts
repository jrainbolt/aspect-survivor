import type { SorcererSpecializationId, SpecializationSummary } from '../types';

export type SorcererElement = 'fire' | 'ice' | 'lightning';

export interface SorcererSpecializationDefinition extends SpecializationSummary {
  id: SorcererSpecializationId;
  characterId: 'sorcerer';
  element: SorcererElement;
  projectileColor: number;
  damageMultiplier: number;
  speedMultiplier: number;
  cooldownMultiplier: number;
}

export const sorcererSpecializationDefinitions: Record<SorcererSpecializationId, SorcererSpecializationDefinition> = {
  pyromancer: {
    id: 'pyromancer', characterId: 'sorcerer', displayName: 'Pyromancer', weaponName: 'Fireball',
    description: 'Ignites enemies and detonates compact explosions around each impact.',
    pros: ['Burn damage over time', 'Area damage explosions'], cons: ['Slowest projectile cadence'],
    startingBonus: 'Fireball I', rangeLabel: 'Area', specialText: 'Burning impacts and small explosions',
    choiceSummary: 'Burn damage · impact explosions', color: 0xff6b35, icon: 'fire',
    statModifier: { id: 'specialization:pyromancer', source: 'weapon', flat: {} },
    element: 'fire', projectileColor: 0xff5a36, damageMultiplier: 1.08, speedMultiplier: 0.86, cooldownMultiplier: 1.08,
  },
  cryomancer: {
    id: 'cryomancer', characterId: 'sorcerer', displayName: 'Cryomancer', weaponName: 'Frost Bolt',
    description: 'Controls crowds with chilling bolts, strong slows, and brief freezes.',
    pros: ['Reliable enemy slow', 'Chance to freeze targets'], cons: ['Lower direct damage'],
    startingBonus: 'Frost Bolt I', rangeLabel: 'Control', specialText: 'Frost slow and freeze chance',
    choiceSummary: 'Strong slows · freeze control', color: 0x8fe9ff, icon: 'frost',
    statModifier: { id: 'specialization:cryomancer', source: 'weapon', flat: { armor: 2 } },
    element: 'ice', projectileColor: 0xa9f3ff, damageMultiplier: 0.9, speedMultiplier: 0.95, cooldownMultiplier: 0.96,
  },
  stormcaller: {
    id: 'stormcaller', characterId: 'sorcerer', displayName: 'Stormcaller', weaponName: 'Lightning Bolt',
    description: 'Fires rapid lightning that arcs into nearby enemies for burst damage.',
    pros: ['Fast projectiles', 'Built-in chain damage'], cons: ['Lowest single-target impact'],
    startingBonus: 'Lightning Bolt I', rangeLabel: 'Burst', specialText: 'Fast bolts with chain lightning',
    choiceSummary: 'Fast bolts · chain damage', color: 0xffe66d, icon: 'lightning',
    statModifier: { id: 'specialization:stormcaller', source: 'weapon', multiply: { moveSpeed: 1.05 } },
    element: 'lightning', projectileColor: 0xfff08a, damageMultiplier: 0.84, speedMultiplier: 1.34, cooldownMultiplier: 0.8,
  },
};

export const sorcererSpecializations = Object.values(sorcererSpecializationDefinitions);
