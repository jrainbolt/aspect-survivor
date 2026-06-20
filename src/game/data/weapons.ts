import type { WeaponDefinition, WeaponId } from '../types';

export const WEAPON_LEVEL_DAMAGE_BONUS = 0.22;
export const WEAPON_LEVEL_SIZE_BONUS = 0.05;
export const getWeaponLevelDamageMultiplier = (level: number): number => 1 + Math.max(0, level - 1) * WEAPON_LEVEL_DAMAGE_BONUS;

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
  'sword-shield': {
    id: 'sword-shield', displayName: 'Sword & Shield', damageType: 'physical', baseDamage: 30,
    cooldownMs: 620, projectileSpeed: 0, range: 100, pierce: 0, knockback: 20,
    projectileColor: 0xf4d35e, projectileScale: 1,
  },
};

export type MeleeAttackShape = 'arc' | 'bash' | 'thrust';

export interface MeleeAttackDefinition {
  id: 'paladin-sword-hack' | 'paladin-shield-bash';
  displayName: string;
  shape: MeleeAttackShape;
  damageType: 'physical';
  baseDamage: number;
  cooldownMs: number;
  durationMs: number;
  activeFrameMs: number;
  range: number;
  arcDegrees: number;
  knockback: number;
  stunMs: number;
  color: number;
}

export const paladinMeleeAttacks: readonly MeleeAttackDefinition[] = [
  {
    id: 'paladin-sword-hack', displayName: 'Paladin Sword Hack', shape: 'arc', damageType: 'physical',
    baseDamage: 30, cooldownMs: 620, durationMs: 220, activeFrameMs: 75, range: 100,
    arcDegrees: 90, knockback: 35, stunMs: 0, color: 0xffe29a,
  },
  {
    id: 'paladin-shield-bash', displayName: 'Paladin Shield Bash', shape: 'bash', damageType: 'physical',
    baseDamage: 22, cooldownMs: 1650, durationMs: 300, activeFrameMs: 110, range: 72,
    arcDegrees: 50, knockback: 240, stunMs: 320, color: 0x7ee8e1,
  },
];
