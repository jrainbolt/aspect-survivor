import { paladinMeleeAttacks, type MeleeAttackDefinition } from '../data/weapons';
import { specializationDefinitions } from '../data/specializations';
import { isPaladinSpecialization, specializationCatalog } from '../data/specializationCatalog';
import type { PaladinSpecializationId, RunState, SpecializationId } from '../types';
import { StatSystem } from './StatSystem';

export class SpecializationSystem {
  static readonly maxLevel = 3;

  static getMaxLevel(id: SpecializationId): number { return id === 'wayfarer' ? 1 : this.maxLevel; }

  static choose(state: RunState, id: SpecializationId): boolean {
    if (state.specializationId || specializationCatalog[id].characterId !== state.characterId) return false;
    state.specializationId = id;
    state.specializationLevel = 1;
    StatSystem.syncRunState(state);
    return true;
  }

  static upgrade(state: RunState): boolean {
    if (!state.specializationId || state.specializationLevel >= this.getMaxLevel(state.specializationId)) return false;
    state.specializationLevel += 1;
    StatSystem.syncRunState(state);
    return true;
  }

  static getAttacks(id?: SpecializationId, level = id ? 1 : 0): readonly MeleeAttackDefinition[] {
    if (!id || !isPaladinSpecialization(id)) return paladinMeleeAttacks;
    const specialization = specializationDefinitions[id];
    const scaled = (multiplier: number): number => 1 + (multiplier - 1) * Math.max(1, level);
    const sword = paladinMeleeAttacks[0];
    const bash = paladinMeleeAttacks[1];
    return [
      {
        ...sword,
        displayName: id === 'guardian' ? 'Guardian Pike Thrust' : `${specialization.displayName} Sword Hack`,
        shape: specialization.sword.shape,
        baseDamage: sword.baseDamage * scaled(specialization.sword.damageMultiplier),
        range: sword.range * scaled(specialization.sword.rangeMultiplier),
        arcDegrees: sword.arcDegrees * scaled(specialization.sword.arcMultiplier),
        cooldownMs: sword.cooldownMs * scaled(specialization.sword.cooldownMultiplier),
        knockback: sword.knockback * scaled(specialization.sword.knockbackMultiplier),
        color: specialization.color,
      },
      {
        ...bash,
        displayName: `${specialization.displayName} Shield Bash`,
        baseDamage: bash.baseDamage * scaled(specialization.bash.damageMultiplier),
        range: bash.range * scaled(specialization.bash.rangeMultiplier),
        cooldownMs: bash.cooldownMs * scaled(specialization.bash.cooldownMultiplier),
        knockback: bash.knockback * scaled(specialization.bash.knockbackMultiplier),
        color: specialization.color,
      },
    ];
  }

  static getDefinition(id: SpecializationId) { return specializationCatalog[id]; }

  static isPaladin(id: SpecializationId | undefined): id is PaladinSpecializationId {
    return Boolean(id && isPaladinSpecialization(id));
  }

}
