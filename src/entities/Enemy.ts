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
  private static nextCombatId = 1;
  public readonly combatId = Enemy.nextCombatId++;
  public readonly stats: EnemyStats;
  public readonly kind: EnemyKind;
  public readonly visualColor: number;
  private knockedBackUntil = 0;
  private stunnedUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    super(scene, x, y, 'enemy');
    this.kind = config.kind;
    this.stats = { ...config.stats };
    this.visualColor = config.tint;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setTint(config.tint);
    this.setScale(config.scale);
    this.setDepth(5);
    this.setCircle(14, 6, 6);
  }

  chase(target: Phaser.Math.Vector2): void {
    if (this.scene.time.now < this.stunnedUntil) {
      this.setVelocity(0);
      return;
    }
    if (this.scene.time.now < this.knockedBackUntil) return;
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

  applyKnockback(source: Phaser.Math.Vector2, force: number): void {
    const direction = new Phaser.Math.Vector2(this.x - source.x, this.y - source.y).normalize();
    this.setVelocity(direction.x * force, direction.y * force);
    this.knockedBackUntil = this.scene.time.now + 140;
  }

  stun(durationMs: number): void {
    if (durationMs <= 0) return;
    this.stunnedUntil = Math.max(this.stunnedUntil, this.scene.time.now + durationMs);
    this.setVelocity(0);
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
