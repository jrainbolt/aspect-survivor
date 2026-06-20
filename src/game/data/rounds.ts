import type { EnemyKind } from '../../entities/Enemy';

export type NormalEnemyKind = Exclude<EnemyKind, 'boss'>;

export interface EnemyCompositionEntry {
  kind: NormalEnemyKind;
  weight: number;
}

export interface RoundDefinition {
  act: number;
  round: number;
  totalEnemyCount: number;
  waveSize: number;
  waveIntervalMs: number;
  enemyComposition: readonly EnemyCompositionEntry[];
  clearReward: number;
}

export const roundDefinitions: readonly RoundDefinition[] = [
  {
    act: 1,
    round: 1,
    totalEnemyCount: 40,
    waveSize: 5,
    waveIntervalMs: 4000,
    enemyComposition: [
      { kind: 'grunt', weight: 0.8 },
      { kind: 'runner', weight: 0.2 },
    ],
    clearReward: 40,
  },
  {
    act: 1,
    round: 2,
    totalEnemyCount: 55,
    waveSize: 7,
    waveIntervalMs: 3500,
    enemyComposition: [
      { kind: 'grunt', weight: 0.6 },
      { kind: 'runner', weight: 0.25 },
      { kind: 'brute', weight: 0.15 },
    ],
    clearReward: 60,
  },
  {
    act: 1,
    round: 3,
    totalEnemyCount: 70,
    waveSize: 9,
    waveIntervalMs: 3000,
    enemyComposition: [
      { kind: 'grunt', weight: 0.5 },
      { kind: 'runner', weight: 0.3 },
      { kind: 'brute', weight: 0.2 },
    ],
    clearReward: 85,
  },
];

export const getRoundDefinition = (act: number, round: number): RoundDefinition | undefined =>
  roundDefinitions.find((definition) => definition.act === act && definition.round === round);
