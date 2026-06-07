import type { EnemyKind } from '../entities/Enemy';

export class WaveManager {
  getSpawnInterval(elapsedSeconds: number): number {
    return Math.max(260, 1100 - elapsedSeconds * 7);
  }

  getEnemyKind(elapsedSeconds: number): EnemyKind {
    const roll = Math.random();
    if (elapsedSeconds > 120 && roll < 0.18) {
      return 'brute';
    }
    if (elapsedSeconds > 45 && roll < 0.35) {
      return 'runner';
    }
    return 'grunt';
  }

  getPackSize(elapsedSeconds: number): number {
    return Math.min(7, 1 + Math.floor(elapsedSeconds / 55));
  }
}
