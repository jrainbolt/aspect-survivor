import type { Enemy } from '../../entities/Enemy';
import type { Player } from '../../entities/Player';
import type { Projectile } from '../../entities/Projectile';
import { sorcererSpecializationDefinitions } from '../data/sorcererSpecializations';
import type { DamageSource, SorcererSpecializationId } from '../types';
import { WeaponSystem, type WeaponFireEvent, type WeaponProfile } from './WeaponSystem';

interface BurnState { enemy: Enemy; damage: number; nextTickAt: number; expiresAt: number; marker: Phaser.GameObjects.Arc; }

export class SorcererWeaponSystem {
  private readonly weaponSystem: WeaponSystem;
  private readonly burns = new Map<number, BurnState>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getPath: () => SorcererSpecializationId,
    getWeaponLevel: () => number,
    private readonly getPathLevel: () => number,
    private readonly getHeroUpgrades: () => string[],
    onFire: (event: WeaponFireEvent) => void,
  ) {
    this.weaponSystem = new WeaponSystem('arcane-bolt', getWeaponLevel, onFire, () => this.getProfile());
  }

  updateWeapon(time: number, player: Player, enemies: Phaser.GameObjects.Group, projectiles: Phaser.Physics.Arcade.Group): void {
    this.weaponSystem.update(time, player, enemies, projectiles);
  }

  updateEffects(time: number, dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void): void {
    for (const [id, burn] of this.burns) {
      if (!burn.enemy.active || time >= burn.expiresAt) {
        burn.marker.destroy();
        this.burns.delete(id);
        continue;
      }
      burn.marker.setPosition(burn.enemy.x, burn.enemy.y - 24);
      if (time >= burn.nextTickAt) {
        burn.nextTickAt += 500;
        this.fireBurst(burn.enemy.x, burn.enemy.y, 0.55);
        dealDamage(burn.enemy, burn.damage, { sourceId: 'pyromancer-burn', sourceName: 'Pyromancer Burn', damageType: 'fire' });
      }
    }
  }

  onHit(time: number, projectile: Projectile, target: Enemy, enemies: Phaser.GameObjects.Group,
    dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void): void {
    const path = projectile.sorcererPath;
    if (!path) return;
    const level = Math.max(1, this.getPathLevel());
    const empowered = this.getHeroUpgrades().includes('chain-reaction');
    if (path === 'pyromancer') this.applyFire(time, target, projectile.damage, enemies, level, empowered, dealDamage);
    if (path === 'cryomancer') this.applyFrost(target, level, empowered);
    if (path === 'stormcaller') this.applyLightning(target, projectile.damage, enemies, level, empowered, dealDamage);
  }

  private getProfile(): WeaponProfile {
    const path = this.getPath();
    const definition = sorcererSpecializationDefinitions[path];
    return {
      sourceName: definition.weaponName,
      damageType: definition.element,
      damageMultiplier: definition.damageMultiplier,
      speedMultiplier: definition.speedMultiplier,
      cooldownMultiplier: definition.cooldownMultiplier,
      projectileColor: definition.projectileColor,
      projectileScale: path === 'pyromancer' ? 1.7 : path === 'cryomancer' ? 1.3 : 1.05,
      sorcererPath: path,
    };
  }

  private applyFire(time: number, target: Enemy, damage: number, enemies: Phaser.GameObjects.Group, level: number, empowered: boolean,
    dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void): void {
    this.burns.get(target.combatId)?.marker.destroy();
    const marker = this.scene.add.circle(target.x, target.y - 24, 7, 0xff542e, 0.85).setStrokeStyle(2, 0xffc15a).setDepth(21);
    this.burns.set(target.combatId, { enemy: target, damage: Math.max(1, Math.round(damage * (0.08 + level * 0.025))),
      nextTickAt: time + 500, expiresAt: time + 1500 + level * 500, marker });
    this.fireBurst(target.x, target.y, 1);
    const radius = 68 + level * 10 + (empowered ? 25 : 0);
    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active || enemy === target || Phaser.Math.Distance.Between(target.x, target.y, enemy.x, enemy.y) > radius) continue;
      dealDamage(enemy, Math.round(damage * (0.24 + level * 0.05)), { sourceId: 'pyromancer-explosion', sourceName: 'Fireball Explosion', damageType: 'fire' });
    }
  }

  private applyFrost(target: Enemy, level: number, empowered: boolean): void {
    target.slow(900 + level * 350 + (empowered ? 400 : 0), Math.max(0.32, 0.62 - level * 0.08));
    if (Math.random() < 0.07 * level + (empowered ? 0.08 : 0)) target.stun(380 + level * 90);
    const shard = this.scene.add.polygon(target.x, target.y, [0, -24, 8, 0, 0, 24, -8, 0], 0xbaf5ff, 0.9).setDepth(22);
    this.scene.tweens.add({ targets: shard, scale: 1.8, alpha: 0, duration: 420, onComplete: () => shard.destroy() });
  }

  private applyLightning(target: Enemy, damage: number, enemies: Phaser.GameObjects.Group, level: number, empowered: boolean,
    dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void): void {
    const hit = new Set<number>([target.combatId]);
    let source = target;
    const chains = level + (empowered ? 1 : 0);
    for (let index = 0; index < chains; index += 1) {
      const next = this.nearest(source, enemies, hit);
      if (!next) break;
      hit.add(next.combatId);
      this.drawBolt(source, next);
      dealDamage(next, Math.round(damage * (0.38 + level * 0.06)), { sourceId: 'stormcaller-chain', sourceName: 'Lightning Chain', damageType: 'lightning' });
      source = next;
    }
  }

  private nearest(source: Enemy, enemies: Phaser.GameObjects.Group, excluded: Set<number>): Enemy | undefined {
    let nearest: Enemy | undefined;
    let nearestDistance = 230 ** 2;
    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      const distance = Phaser.Math.Distance.Squared(source.x, source.y, enemy.x, enemy.y);
      if (enemy.active && !excluded.has(enemy.combatId) && distance < nearestDistance) { nearest = enemy; nearestDistance = distance; }
    }
    return nearest;
  }

  private fireBurst(x: number, y: number, scale: number): void {
    const burst = this.scene.add.circle(x, y, 20, 0xff6b35, 0.75).setDepth(22).setScale(scale);
    this.scene.tweens.add({ targets: burst, scale: scale * 2.4, alpha: 0, duration: 300, onComplete: () => burst.destroy() });
    for (let index = 0; index < 7; index += 1) {
      const ember = this.scene.add.circle(x, y, 3, index % 2 ? 0xffd166 : 0xff542e).setDepth(23);
      this.scene.tweens.add({ targets: ember, x: x + Phaser.Math.Between(-38, 38), y: y + Phaser.Math.Between(-38, 25), alpha: 0,
        duration: 380, onComplete: () => ember.destroy() });
    }
  }

  private drawBolt(source: Enemy, target: Enemy): void {
    const bolt = this.scene.add.line(0, 0, source.x, source.y, target.x, target.y, 0xfff3a1, 0.95).setOrigin(0).setLineWidth(6).setDepth(24);
    const flash = this.scene.add.circle(target.x, target.y, 14, 0xffffff, 0.8).setDepth(25);
    this.scene.tweens.add({ targets: [bolt, flash], alpha: 0, duration: 260, onComplete: () => { bolt.destroy(); flash.destroy(); } });
  }
}
