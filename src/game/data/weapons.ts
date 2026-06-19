import type { WeaponDefinition, WeaponId } from '../types';

export const weaponDefinitions: Record<WeaponId, WeaponDefinition> = {
  javelin: {
    id: 'javelin', displayName: 'Javelin', damageType: 'physical', baseDamage: 18,
    cooldownMs: 720, projectileSpeed: 620, range: 760, pierce: 1, knockback: 42,
    projectileColor: 0xffd166, projectileScale: 1.2,
  },
  'arcane-bolt': {
    id: 'arcane-bolt', displayName: 'Arcane Bolt', damageType: 'arcane', baseDamage: 27,
    cooldownMs: 900, projectileSpeed: 520, range: 700, pierce: 0, knockback: 28,
    projectileColor: 0x9b5de5, projectileScale: 1.35,
  },
  'holy-hammer': {
    id: 'holy-hammer', displayName: 'Holy Hammer', damageType: 'holy', baseDamage: 34,
    cooldownMs: 1050, projectileSpeed: 420, range: 330, pierce: 1, knockback: 150,
    projectileColor: 0xf4d35e, projectileScale: 1.65,
  },
};
