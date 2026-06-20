import { getRoundDefinition, type RoundDefinition } from '../game/data/rounds';
import type { RunStatsTracker } from '../game/systems/RunStatsTracker';
import type { RunState } from '../game/types';

export class RoundManager {
  constructor(
    private readonly state: RunState,
    private readonly runStats: RunStatsTracker,
  ) {}

  get definition(): RoundDefinition | undefined {
    return this.state.roundType === 'normal'
      ? getRoundDefinition(this.state.currentAct, this.state.currentRound)
      : undefined;
  }

  updateElapsed(seconds: number): void {
    this.state.roundElapsedTime += seconds;
  }

  recordSpawned(count: number): void {
    if (count <= 0) return;
    this.state.enemiesSpawnedThisRound += count;
    this.syncProgress();
  }

  recordDefeated(): void {
    if (this.state.roundType !== 'normal') return;
    this.state.enemiesDefeatedThisRound += 1;
    this.syncProgress();
  }

  isCleared(enemiesAlive: number): boolean {
    const definition = this.definition;
    return Boolean(
      definition
      && this.state.enemiesSpawnedThisRound >= definition.totalEnemyCount
      && enemiesAlive === 0,
    );
  }

  private syncProgress(): void {
    this.runStats.recordRoundProgress(
      this.state.enemiesTargetThisRound,
      this.state.enemiesSpawnedThisRound,
      this.state.enemiesDefeatedThisRound,
    );
  }
}
