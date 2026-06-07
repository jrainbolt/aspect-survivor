import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { GameEvents } from '../types/events';
import type { UpgradeManager } from './UpgradeManager';

export class XpManager {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly upgradeManager: UpgradeManager,
  ) {}

  addXp(amount: number): void {
    this.player.stats.xp += amount;

    while (this.player.stats.xp >= this.player.stats.xpToNextLevel) {
      this.player.stats.xp -= this.player.stats.xpToNextLevel;
      this.player.stats.level += 1;
      this.player.stats.xpToNextLevel = this.getXpForLevel(this.player.stats.level);
      this.scene.events.emit(GameEvents.LevelUp, { choices: this.upgradeManager.getChoices() });
      break;
    }

    this.scene.events.emit(GameEvents.StatsChanged);
  }

  private getXpForLevel(level: number): number {
    return Math.floor(10 + level * 7 + Math.pow(level, 1.35) * 4);
  }
}
