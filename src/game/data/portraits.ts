import type { CharacterId } from '../types';

export interface PortraitDefinition {
  background: number;
  skin: number;
  hair: number;
  armor: number;
  accent: number;
  silhouette: 'hunter' | 'mage' | 'knight';
}

export const portraitDefinitions: Record<CharacterId, PortraitDefinition> = {
  amazon: { background: 0x163b3b, skin: 0xd9a06f, hair: 0x3d2117, armor: 0x397f71, accent: 0xffd166, silhouette: 'hunter' },
  sorcerer: { background: 0x29204d, skin: 0xc98f72, hair: 0xe7e2ef, armor: 0x6747a5, accent: 0x00bbf9, silhouette: 'mage' },
  paladin: { background: 0x3b3020, skin: 0xd4a17b, hair: 0x6f4933, armor: 0xaeb8c4, accent: 0xf4d35e, silhouette: 'knight' },
};
