import Phaser from 'phaser';
import type { Player } from '../entities/Player';

export class Hud {
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly xpFill: Phaser.GameObjects.Rectangle;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly highScoreText: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene, private readonly player: Player) {
    scene.add.rectangle(20, 20, 260, 18, 0x2f3542).setOrigin(0).setScrollFactor(0).setDepth(50);
    this.hpFill = scene.add.rectangle(20, 20, 260, 18, 0xef476f).setOrigin(0).setScrollFactor(0).setDepth(51);
    scene.add.rectangle(20, 46, 260, 12, 0x2f3542).setOrigin(0).setScrollFactor(0).setDepth(50);
    this.xpFill = scene.add.rectangle(20, 46, 0, 12, 0x118ab2).setOrigin(0).setScrollFactor(0).setDepth(51);
    this.levelText = scene.add.text(300, 16, '', this.textStyle(18)).setScrollFactor(0).setDepth(51);
    this.timerText = scene.add.text(scene.scale.width - 20, 16, '', this.textStyle(20)).setOrigin(1, 0).setScrollFactor(0).setDepth(51);
    this.highScoreText = scene.add.text(scene.scale.width - 20, 44, '', this.textStyle(13)).setOrigin(1, 0).setScrollFactor(0).setDepth(51);
  }

  update(elapsedSeconds: number, highScoreSeconds: number): void {
    this.hpFill.width = 260 * Phaser.Math.Clamp(this.player.stats.hp / this.player.stats.maxHp, 0, 1);
    this.xpFill.width = 260 * Phaser.Math.Clamp(this.player.stats.xp / this.player.stats.xpToNextLevel, 0, 1);
    this.levelText.setText(`LV ${this.player.stats.level}`);
    this.timerText.setText(this.formatTime(elapsedSeconds));
    this.highScoreText.setText(`BEST ${this.formatTime(highScoreSeconds)}`);
    this.timerText.setX(this.scene.scale.width - 20);
    this.highScoreText.setX(this.scene.scale.width - 20);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  }

  private textStyle(fontSize: number): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: '#f8f9fa',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: `${fontSize}px`,
      fontStyle: '700',
      stroke: '#111418',
      strokeThickness: 4,
    };
  }
}
