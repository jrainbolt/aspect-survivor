import Phaser from 'phaser';
import type { EnemyStats } from '../types/stats';

export type EnemyKind = 'grunt' | 'brute' | 'runner' | 'boss';

export interface EnemyConfig {
  kind: EnemyKind;
  stats: EnemyStats;
  tint: number;
  scale: number;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public readonly stats: EnemyStats;
  public readonly kind: EnemyKind;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    super(scene, x, y, 'enemy');
    this.kind = config.kind;
    this.stats = { ...config.stats };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setTint(config.tint);
    this.setScale(config.scale);
    this.setDepth(5);
    this.setCircle(14, 6, 6);
  }

  chase(target: Phaser.Math.Vector2): void {
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y)).normalize();
    this.setVelocity(direction.x * this.stats.speed, direction.y * this.stats.speed);
  }

  takeDamage(amount: number): boolean {
    this.stats.hp -= amount;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(55, () => {
      if (this.active) {
        this.clearTint();
        this.applyKindTint();
      }
    });

    return this.stats.hp <= 0;
  }

  private applyKindTint(): void {
    const tintByKind: Record<EnemyKind, number> = {
      grunt: 0xef476f,
      runner: 0x06d6a0,
      brute: 0xf8961e,
      boss: 0x9b5de5,
    };
    this.setTint(tintByKind[this.kind]);
  }
}
