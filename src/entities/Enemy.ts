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
  private slowedUntil = 0;
  private slowMultiplier = 1;
  private nextSpecialAt = 0;
  private chargeWindupUntil = 0;
  private readonly chargeDirection = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    super(scene, x, y, `enemy-${config.kind}`);
    this.kind = config.kind;
    this.stats = { ...config.stats };
    this.visualColor = config.tint;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(config.scale);
    this.setDepth(5);
    this.setCircle(14, 10, 10);
    this.setCollideWorldBounds(true);
    this.setBounce(0.15);
  }

  chase(target: Phaser.Math.Vector2): void {
    this.keepInsideArena();
    if (this.scene.time.now < this.stunnedUntil) {
      this.setVelocity(0);
      return;
    }
    if (this.scene.time.now < this.knockedBackUntil) return;
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
    const distance = direction.length();

    if (this.kind === 'brute' && this.updateBruteCharge(direction, distance)) return;
    const contactDistance = Math.max(22, this.displayWidth * 0.32);
    if (distance < contactDistance) {
      if (distance > 0.01) direction.scale(-1 / distance);
      else direction.setToPolar(this.combatId * 2.39996, 1);
      const contactSpeed = this.stats.speed * (this.scene.time.now < this.slowedUntil ? this.slowMultiplier : 1) * 0.65;
      this.setVelocity(direction.x * contactSpeed, direction.y * contactSpeed);
      return;
    }
    direction.scale(1 / distance);
    if (this.kind === 'runner') {
      const weave = Math.sin(this.scene.time.now * 0.008 + this.combatId) * 0.58;
      direction.add(new Phaser.Math.Vector2(-direction.y, direction.x).scale(weave)).normalize();
      this.setRotation(direction.angle());
    }
    const speed = this.stats.speed * (this.scene.time.now < this.slowedUntil ? this.slowMultiplier : 1);
    this.setVelocity(direction.x * speed, direction.y * speed);
  }

  private keepInsideArena(): void {
    const margin = Math.max(18, this.displayWidth * 0.35);
    const maxX = Math.max(margin, this.scene.scale.width - margin);
    const maxY = Math.max(margin, this.scene.scale.height - margin);
    const clampedX = Phaser.Math.Clamp(this.x, margin, maxX);
    const clampedY = Phaser.Math.Clamp(this.y, margin, maxY);
    if (clampedX === this.x && clampedY === this.y) return;
    this.setPosition(clampedX, clampedY);
    this.body?.reset(clampedX, clampedY);
  }

  dashToward(target: Phaser.Math.Vector2, force: number, durationMs: number): void {
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y)).normalize();
    this.setVelocity(direction.x * force, direction.y * force);
    this.setRotation(direction.angle());
    this.knockedBackUntil = this.scene.time.now + durationMs;
  }

  getCombatRadius(): number {
    const bodyRadius = this.body instanceof Phaser.Physics.Arcade.Body ? this.body.halfWidth : 0;
    return Math.max(14, bodyRadius, this.displayWidth * 0.38);
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

  applyKnockback(source: Phaser.Math.Vector2, force: number, durationMs = Phaser.Math.Clamp(120 + force * 0.35, 140, 320)): void {
    const direction = new Phaser.Math.Vector2(this.x - source.x, this.y - source.y);
    if (direction.lengthSq() < 0.01) direction.setToPolar(this.combatId * 2.39996, 1);
    else direction.normalize();
    const effectiveForce = this.kind === 'boss' ? force * 0.22 : force;
    this.setVelocity(direction.x * effectiveForce, direction.y * effectiveForce);
    this.knockedBackUntil = Math.max(this.knockedBackUntil, this.scene.time.now + durationMs);
  }

  stun(durationMs: number): void {
    if (durationMs <= 0) return;
    const effectiveDuration = this.kind === 'boss' ? durationMs * 0.25 : durationMs;
    this.stunnedUntil = Math.max(this.stunnedUntil, this.scene.time.now + effectiveDuration);
    if (this.scene.time.now >= this.knockedBackUntil) this.setVelocity(0);
  }

  slow(durationMs: number, multiplier: number): void {
    this.slowedUntil = Math.max(this.slowedUntil, this.scene.time.now + durationMs);
    this.slowMultiplier = Math.min(this.slowMultiplier, multiplier);
  }

  private applyKindTint(): void {
    this.clearTint();
  }

  private updateBruteCharge(direction: Phaser.Math.Vector2, distance: number): boolean {
    const now = this.scene.time.now;
    if (this.chargeWindupUntil > 0) {
      if (now < this.chargeWindupUntil) {
        this.setVelocity(0);
        this.setScale(1.35 + Math.sin(now * 0.04) * 0.08);
        return true;
      }
      this.chargeWindupUntil = 0;
      this.setScale(1.35);
      this.setVelocity(this.chargeDirection.x * this.stats.speed * 3.1, this.chargeDirection.y * this.stats.speed * 3.1);
      this.knockedBackUntil = now + 430;
      return true;
    }
    if (now >= this.nextSpecialAt && distance > 100 && distance < 430) {
      this.chargeDirection.copy(direction).normalize();
      this.chargeWindupUntil = now + 420;
      this.nextSpecialAt = now + 3400 + (this.combatId % 5) * 170;
      this.setTintFill(0xffd166);
      this.scene.time.delayedCall(420, () => { if (this.active) this.clearTint(); });
      this.setVelocity(0);
      return true;
    }
    return false;
  }
}
