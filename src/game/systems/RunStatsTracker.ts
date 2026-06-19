import type { EnemyKind } from '../../entities/Enemy';
import type { RunState } from '../types';

export class RunStatsTracker {
  constructor(private readonly state: RunState) {}

  addSurvival(seconds: number): void {
    this.state.runStats.totalSurvivalTime += seconds;
    this.state.totalSurvivalTime = this.state.runStats.totalSurvivalTime;
  }

  recordKill(kind: EnemyKind, gold: number): void {
    this.state.runStats.enemiesDefeated += 1;
    this.state.enemiesDefeated = this.state.runStats.enemiesDefeated;
    if (kind === 'brute') this.state.runStats.elitesDefeated += 1;
    if (kind === 'boss') this.state.runStats.bossesDefeated += 1;
    this.state.runStats.goldEarned += gold;
    this.state.gold += gold;
  }

  recordXp(amount: number): void {
    this.state.runStats.xpCollected += amount;
  }

  recordLevel(level: number): void {
    this.state.runStats.levelReached = Math.max(this.state.runStats.levelReached, level);
  }

  recordRoundComplete(): void {
    this.state.runStats.roundsCompleted += 1;
  }

  recordAct(act: number): void {
    this.state.runStats.highestActReached = Math.max(this.state.runStats.highestActReached, act);
  }

  recordBlessing(): void {
    this.state.runStats.blessingsChosen += 1;
  }

  recordDamageTaken(amount: number): void {
    this.state.runStats.damageTaken += amount;
  }

  recordHealing(amount: number): void {
    this.state.runStats.healingReceived += amount;
  }
}
