import type { SpecializationId } from '../types';
import type { StatModifier } from '../../types/stats';

export interface SpecializationDefinition {
  id: SpecializationId;
  displayName: string;
  weaponName: string;
  description: string;
  rangeLabel: string;
  specialText: string;
  choiceSummary: string;
  color: number;
  icon: 'blade' | 'tower-shield' | 'pike';
  statModifier: StatModifier;
  sword: { damageMultiplier: number; rangeMultiplier: number; arcMultiplier: number; cooldownMultiplier: number; shape: 'arc' | 'thrust'; knockbackMultiplier: number };
  bash: { damageMultiplier: number; rangeMultiplier: number; cooldownMultiplier: number; knockbackMultiplier: number };
}

export const specializationDefinitions: Record<SpecializationId, SpecializationDefinition> = {
  crusader: {
    id: 'crusader', displayName: 'Crusader', weaponName: 'Crusader Blade',
    description: 'An aggressive holy warrior who overwhelms foes with broad, rapid cuts.',
    rangeLabel: 'Medium', specialText: 'Larger holy slash arc', choiceSummary: '+28% sword damage · +22% reach · faster swings', color: 0xf4d35e, icon: 'blade',
    statModifier: { id: 'specialization:crusader', source: 'weapon', flat: { damage: 0.15 } },
    sword: { damageMultiplier: 1.28, rangeMultiplier: 1.22, arcMultiplier: 1.3, cooldownMultiplier: 0.78, shape: 'arc', knockbackMultiplier: 1.1 },
    bash: { damageMultiplier: 1, rangeMultiplier: 1, cooldownMultiplier: 1, knockbackMultiplier: 1 },
  },
  templar: {
    id: 'templar', displayName: 'Templar', weaponName: 'Templar Shield',
    description: 'A steadfast protector built around armor, control, and crushing shield impacts.',
    rangeLabel: 'Short', specialText: 'Heavy bash and damage reduction', choiceSummary: '+12 armor · +10% guard · +65% bash force', color: 0x4ecdc4, icon: 'tower-shield',
    statModifier: { id: 'specialization:templar', source: 'weapon', flat: { armor: 12, contactDamageReduction: 0.1 } },
    sword: { damageMultiplier: 0.86, rangeMultiplier: 0.9, arcMultiplier: 0.9, cooldownMultiplier: 1.08, shape: 'arc', knockbackMultiplier: 1 },
    bash: { damageMultiplier: 1.45, rangeMultiplier: 1.18, cooldownMultiplier: 0.86, knockbackMultiplier: 1.65 },
  },
  guardian: {
    id: 'guardian', displayName: 'Guardian', weaponName: 'Guardian Pike',
    description: 'A reach fighter who holds lanes with long, piercing thrusts.',
    rangeLabel: 'Long', specialText: 'Piercing thrust line attack', choiceSummary: '+72% reach · piercing line · stronger control', color: 0x82cfff, icon: 'pike',
    statModifier: { id: 'specialization:guardian', source: 'weapon', flat: { armor: 3 } },
    sword: { damageMultiplier: 1.08, rangeMultiplier: 1.72, arcMultiplier: 0.24, cooldownMultiplier: 1.08, shape: 'thrust', knockbackMultiplier: 1.35 },
    bash: { damageMultiplier: 0.8, rangeMultiplier: 1, cooldownMultiplier: 1.15, knockbackMultiplier: 1.15 },
  },
};

export const specializations = Object.values(specializationDefinitions);
