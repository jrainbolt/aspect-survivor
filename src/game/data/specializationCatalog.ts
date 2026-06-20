import { amazonSpecializationDefinitions } from './amazonSpecializations';
import { sorcererSpecializationDefinitions } from './sorcererSpecializations';
import { specializationDefinitions as paladinSpecializationDefinitions } from './specializations';
import type { CharacterId, SpecializationId, SpecializationSummary } from '../types';

export const specializationCatalog: Record<SpecializationId, SpecializationSummary> = {
  ...paladinSpecializationDefinitions,
  ...sorcererSpecializationDefinitions,
  ...amazonSpecializationDefinitions,
};

export const getSpecializationsForCharacter = (characterId: CharacterId): SpecializationSummary[] =>
  Object.values(specializationCatalog).filter((definition) => definition.characterId === characterId);

export const isPaladinSpecialization = (id: SpecializationId): id is 'crusader' | 'templar' | 'guardian' =>
  paladinSpecializationDefinitions[id as keyof typeof paladinSpecializationDefinitions] !== undefined;

export const isSorcererSpecialization = (id: SpecializationId): id is 'pyromancer' | 'cryomancer' | 'stormcaller' =>
  sorcererSpecializationDefinitions[id as keyof typeof sorcererSpecializationDefinitions] !== undefined;
