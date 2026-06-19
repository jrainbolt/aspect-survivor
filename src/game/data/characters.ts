import type { CharacterDefinition, CharacterId } from '../types';

export const characterDefinitions: Record<CharacterId, CharacterDefinition> = {
  amazon: {
    id: 'amazon',
    displayName: 'Amazon',
    description: 'A swift hunter whose javelins punch through enemy lines.',
    baseStats: { maxHp: 90, damage: 1, attackSpeed: 1, moveSpeed: 230, spellDamageMultiplier: 1 },
    startingWeaponId: 'javelin',
    passiveLabel: '+10% move speed',
    passiveModifiers: { moveSpeedMultiplier: 1.1 },
    visual: { color: 0x4ecdc4, accentColor: 0xffd166, shape: 'diamond' },
  },
  sorcerer: {
    id: 'sorcerer',
    displayName: 'Sorcerer',
    description: 'A volatile spellcaster who favors deliberate, heavy bolts.',
    baseStats: { maxHp: 80, damage: 1, attackSpeed: 1, moveSpeed: 220, spellDamageMultiplier: 1 },
    startingWeaponId: 'arcane-bolt',
    passiveLabel: '+15% spell damage',
    passiveModifiers: { spellDamageMultiplier: 1.15 },
    visual: { color: 0x9b5de5, accentColor: 0x00bbf9, shape: 'circle' },
  },
  paladin: {
    id: 'paladin',
    displayName: 'Paladin',
    description: 'An armored front-line fighter who controls space with sword and shield.',
    baseStats: { maxHp: 100, damage: 1, attackSpeed: 1, moveSpeed: 205, spellDamageMultiplier: 1 },
    startingWeaponId: 'sword-shield',
    passiveLabel: 'Shield Guard: +20 max HP, 20% less contact damage',
    passiveModifiers: { maxHpBonus: 20, contactDamageReduction: 0.2 },
    visual: { color: 0xf4d35e, accentColor: 0xee964b, shape: 'shield' },
  },
};

export const characters = Object.values(characterDefinitions);
