import Phaser from 'phaser';
import type { DamageSource, DamageType, WeaponId } from '../game/types';

interface ProjectileFireConfig {
  direction: Phaser.Math.Vector2;
  damage: number;
  speed: number;
  range: number;
  time: number;
  weaponId: WeaponId;
  pierce: number;
  knockback: number;
  color: number;
  scale: number;
  sourceName: string;
  damageType: DamageType;
  critical: boolean;
}

export class Projectile extends Phaser.Physics.Arcade.Image {
  public damage = 0;
  public expiresAt = 0;
  public weaponId: WeaponId = 'javelin';
  public knockback = 0;
  public source: DamageSource = { sourceId: 'unknown', sourceName: 'Unknown', damageType: 'unknown' };
  private pierceRemaining = 0;
  private readonly hitEnemyIds = new Set<number>();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'projectile');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(8);
    this.setCircle(5);
  }

  fire(config: ProjectileFireConfig): void {
    this.damage = config.damage;
    this.weaponId = config.weaponId;
    this.knockback = config.knockback;
    this.source = { sourceId: config.weaponId, sourceName: config.sourceName, damageType: config.damageType, critical: config.critical };
    this.pierceRemaining = config.pierce;
    this.hitEnemyIds.clear();
    this.setTint(config.color).setScale(config.scale);
    this.setVelocity(config.direction.x * config.speed, config.direction.y * config.speed);
    this.setRotation(config.direction.angle());
    this.expiresAt = config.time + (config.range / config.speed) * 1000;
  }

  registerHit(enemyId: number): boolean {
    if (this.hitEnemyIds.has(enemyId)) return false;
    this.hitEnemyIds.add(enemyId);
    if (this.pierceRemaining > 0) {
      this.pierceRemaining -= 1;
    } else {
      this.disableBody(true, true);
    }
    return true;
  }
}
