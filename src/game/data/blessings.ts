import type { BlessingDefinition, BlessingId } from '../types';

export const blessingDefinitions: Record<BlessingId, BlessingDefinition> = {
  'jupiter-spark': {
    id: 'jupiter-spark', god: 'Jupiter', displayName: 'Spark',
    description: 'Hits have an 18% chance to arc to a nearby enemy.',
    effect: 'chain-lightning', color: 0xffd166,
  },
  'mars-bloodletting': {
    id: 'mars-bloodletting', god: 'Mars', displayName: 'Bloodletting',
    description: 'Hits inflict a short bleed that deals damage over time.',
    effect: 'bleed', color: 0xef476f,
  },
  'neptune-tidal-push': {
    id: 'neptune-tidal-push', god: 'Neptune', displayName: 'Tidal Push',
    description: 'Every weapon hit applies additional knockback.',
    effect: 'knockback', color: 0x00bbf9,
  },
};

export const blessings = Object.values(blessingDefinitions);
