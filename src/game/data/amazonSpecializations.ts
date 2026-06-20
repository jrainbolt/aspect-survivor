import type { AmazonSpecializationId, SpecializationSummary } from '../types';

export const amazonSpecializationDefinitions: Record<AmazonSpecializationId, SpecializationSummary> = {
  wayfarer: {
    id: 'wayfarer', characterId: 'amazon', displayName: 'Wayfarer', weaponName: 'Javelin',
    description: 'The current Amazon path: a mobile hunter built around piercing javelins.',
    pros: ['Fast movement', 'Piercing ranged attacks'], cons: ['Full Amazon paths are a future milestone'],
    startingBonus: 'Piercing Javelin I', rangeLabel: 'Long', specialText: 'Mobile piercing attacker',
    choiceSummary: 'Fast movement · piercing javelin', color: 0x4ecdc4, icon: 'javelin',
    statModifier: { id: 'specialization:wayfarer', source: 'weapon', flat: {} },
  },
};
