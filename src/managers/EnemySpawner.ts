import Phaser from 'phaser';
import { Enemy, type EnemyConfig, type EnemyKind } from '../entities/Enemy';
import type { WaveManager } from './WaveManager';

const enemyConfigs: Record<EnemyKind, EnemyConfig> = {
  grunt: {
    kind: 'grunt',
    tint: 0xef476f,
    scale: 1,
    stats: { maxHp: 28, hp: 28, damage: 12, speed: 92, xpValue: 4 },
  },
  runner: {
    kind: 'runner',
    tint: 0x06d6a0,
    scale: 0.82,
    stats: { maxHp: 18, hp: 18, damage: 8, speed: 155, xpValue: 5 },
  },
  brute: {
    kind: 'brute',
    tint: 0xf8961e,
    scale: 1.35,
    stats: { maxHp: 70, hp: 70, damage: 18, speed: 65, xpValue: 10 },
  },
  boss: {
    kind: 'boss',
    tint: 0x9b5de5,
    scale: 2.35,
    stats: { maxHp: 450, hp: 450, damage: 30, speed: 58, xpValue: 85 },
  },
};

export class EnemySpawner {
  private nextSpawnAt = 0;
  private lastBossMinute = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemies: Phaser.Physics.Arcade.Group,
    private readonly waveManager: WaveManager,
  ) {}

  update(time: number, elapsedSeconds: number): void {
    if (time < this.nextSpawnAt) {
      return;
    }

    const bossMinute = Math.floor(elapsedSeconds / 300);
    if (bossMinute > 0 && bossMinute > this.lastBossMinute) {
      this.spawn('boss');
      this.lastBossMinute = bossMinute;
    }

    for (let index = 0; index < this.waveManager.getPackSize(elapsedSeconds); index += 1) {
      this.spawn(this.waveManager.getEnemyKind(elapsedSeconds));
    }

    this.nextSpawnAt = time + this.waveManager.getSpawnInterval(elapsedSeconds);
  }

  private spawn(kind: EnemyKind): void {
    const { width, height } = this.scene.scale;
    const margin = 44;
    const side = Phaser.Math.Between(0, 3);
    const x = side === 0 ? -margin : side === 1 ? width + margin : Phaser.Math.Between(0, width);
    const y = side === 2 ? -margin : side === 3 ? height + margin : Phaser.Math.Between(0, height);
    const enemy = new Enemy(this.scene, x, y, enemyConfigs[kind]);
    this.enemies.add(enemy);
  }
}
