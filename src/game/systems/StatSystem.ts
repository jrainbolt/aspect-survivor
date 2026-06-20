import { characterDefinitions } from '../data/characters';
import { WEAPON_LEVEL_SIZE_BONUS, weaponDefinitions } from '../data/weapons';
import { specializationDefinitions } from '../data/specializations';
import { blessingRanks, getBlessingRank } from '../data/blessingRanks';
import type { RunState } from '../types';
import { DEFAULT_PLAYER_STATS, type PlayerStats, type PlayerStatKey, type PlayerStatValues, type StatModifier } from '../../types/stats';

export interface StatCalculationInput {
  characterId: RunState['characterId'];
  weaponId: RunState['weaponId'];
  weaponLevel: number;
  blessings: RunState['blessings'];
  specializationId?: RunState['specializationId'];
  specializationLevel?: number;
  permanentModifiers?: StatModifier[];
  temporaryModifiers?: StatModifier[];
  progression?: Pick<PlayerStats, 'currentHp' | 'level' | 'xp' | 'xpToNextLevel'>;
}

export class StatSystem {
  static calculate(input: StatCalculationInput): PlayerStats {
    const character = characterDefinitions[input.characterId];
    const weapon = weaponDefinitions[input.weaponId];
    const values: PlayerStatValues = { ...DEFAULT_PLAYER_STATS, ...character.baseStats };
    const modifiers: StatModifier[] = [
      {
        id: `character:${character.id}`,
        source: 'character',
        flat: {
          maxHp: character.passiveModifiers.maxHpBonus ?? 0,
          contactDamageReduction: character.passiveModifiers.contactDamageReduction ?? 0,
        },
        multiply: {
          moveSpeed: character.passiveModifiers.moveSpeedMultiplier ?? 1,
          spellDamageMultiplier: character.passiveModifiers.spellDamageMultiplier ?? 1,
        },
      },
      {
        id: `weapon:${weapon.id}`,
        source: 'weapon',
        flat: { pierce: weapon.pierce, knockback: weapon.knockback },
        multiply: { projectileSize: 1 + Math.max(0, input.weaponLevel - 1) * WEAPON_LEVEL_SIZE_BONUS },
      },
      ...(input.specializationId ? [this.getSpecializationModifier(input.specializationId, input.specializationLevel ?? 1)] : []),
      ...this.getBlessingModifiers(input.blessings),
      ...(input.permanentModifiers ?? []),
      ...(input.temporaryModifiers ?? []),
    ];

    for (const modifier of modifiers) this.applyModifier(values, modifier);
    this.clamp(values);
    const progression = input.progression ?? { currentHp: values.maxHp, level: 1, xp: 0, xpToNextLevel: 12 };

    return {
      ...values,
      currentHp: Math.min(progression.currentHp, values.maxHp),
      level: progression.level,
      xp: progression.xp,
      xpToNextLevel: progression.xpToNextLevel,
    };
  }

  static syncRunState(state: RunState): PlayerStats {
    const next = this.calculate({
      characterId: state.characterId,
      weaponId: state.weaponId,
      weaponLevel: state.weaponLevel,
      blessings: state.blessings,
      specializationId: state.specializationId,
      specializationLevel: state.specializationLevel,
      permanentModifiers: state.permanentStatModifiers,
      temporaryModifiers: state.temporaryStatModifiers,
      progression: state.playerStats,
    });
    Object.assign(state.playerStats, next);
    return state.playerStats;
  }

  private static getBlessingModifiers(blessings: RunState['blessings']): StatModifier[] {
    const rank = getBlessingRank(blessings, 'neptune-tidal-push');
    if (rank === 0) return [];
    const knockback = blessingRanks['neptune-tidal-push'][rank - 1].knockbackBonus ?? 0;
    return [{ id: 'blessing:neptune-tidal-push', source: 'blessing', flat: { knockback } }];
  }

  private static getSpecializationModifier(id: NonNullable<RunState['specializationId']>, level: number): StatModifier {
    const base = specializationDefinitions[id].statModifier;
    const flat = Object.fromEntries(Object.entries(base.flat ?? {}).map(([key, value]) => [key, value * Math.max(1, level)])) as StatModifier['flat'];
    return { ...base, flat };
  }

  private static applyModifier(values: PlayerStatValues, modifier: StatModifier): void {
    for (const [key, amount] of Object.entries(modifier.flat ?? {}) as [PlayerStatKey, number][]) values[key] += amount;
    for (const [key, multiplier] of Object.entries(modifier.multiply ?? {}) as [PlayerStatKey, number][]) values[key] *= multiplier;
  }

  private static clamp(stats: PlayerStatValues): void {
    stats.maxHp = Math.max(1, Math.round(stats.maxHp));
    stats.projectileCount = Math.max(1, Math.round(stats.projectileCount));
    stats.pierce = Math.max(0, Math.round(stats.pierce));
    stats.critChance = Phaser.Math.Clamp(stats.critChance, 0, 1);
    stats.cooldownReduction = Phaser.Math.Clamp(stats.cooldownReduction, 0, 0.75);
    stats.contactDamageReduction = Phaser.Math.Clamp(stats.contactDamageReduction, 0, 0.8);
    stats.xpGain = Math.max(0, stats.xpGain);
    stats.goldGain = Math.max(0, stats.goldGain);
  }
}
