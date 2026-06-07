import type { UpgradeOption } from '../upgrades/Upgrade';

export const GameEvents = {
  StatsChanged: 'stats-changed',
  EnemyKilled: 'enemy-killed',
  XpCollected: 'xp-collected',
  LevelUp: 'level-up',
  UpgradeSelected: 'upgrade-selected',
  PlayerDied: 'player-died',
} as const;

export interface GameEventMap {
  [GameEvents.StatsChanged]: void;
  [GameEvents.EnemyKilled]: { x: number; y: number; xpValue: number };
  [GameEvents.XpCollected]: { amount: number };
  [GameEvents.LevelUp]: { choices: UpgradeOption[] };
  [GameEvents.UpgradeSelected]: { upgradeId: string };
  [GameEvents.PlayerDied]: { survivedSeconds: number; level: number };
}
