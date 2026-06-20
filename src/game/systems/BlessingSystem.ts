import type { Enemy } from '../../entities/Enemy';
import { blessingRanks, getBlessingRank } from '../data/blessingRanks';
import type { BlessingId, DamageSource } from '../types';

interface BleedState { enemy: Enemy; nextTickAt: number; expiresAt: number; damage: number; marker: Phaser.GameObjects.Arc; }

export class BlessingSystem {
  private readonly bleedStates = new Map<number, BleedState>();

  constructor(private readonly scene: Phaser.Scene, private readonly getBlessings: () => BlessingId[]) {}

  onHit(time: number, target: Enemy, damage: number, enemies: Phaser.GameObjects.Group,
    hitOrigin: Phaser.Math.Vector2,
    dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void): void {
    const active = this.getBlessings();
    const sparkRank = getBlessingRank(active, 'jupiter-spark');
    const bleedRank = getBlessingRank(active, 'mars-bloodletting');
    const neptuneRank = getBlessingRank(active, 'neptune-tidal-push');

    if (sparkRank > 0) {
      const rank = blessingRanks['jupiter-spark'][sparkRank - 1];
      if (Math.random() < (rank.chance ?? 0)) this.chainLightning(target, enemies, rank.bounces ?? 1,
        Math.max(1, Math.round(damage * (rank.damageMultiplier ?? 0.5))), dealDamage);
    }
    if (bleedRank > 0) {
      const rank = blessingRanks['mars-bloodletting'][bleedRank - 1];
      this.bleedStates.get(target.combatId)?.marker.destroy();
      const marker = this.scene.add.circle(target.x, target.y - 24, 8, 0x7d1428, 0.9).setStrokeStyle(3, 0xff657d).setDepth(20);
      this.scene.tweens.add({ targets: marker, scale: 1.35, alpha: 0.65, duration: 300, yoyo: true, repeat: -1 });
      this.bleedStates.set(target.combatId, { enemy: target, nextTickAt: time + 500,
        expiresAt: time + (rank.durationMs ?? 2000), damage: Math.max(1, Math.round(damage * (rank.damageMultiplier ?? 0.12))), marker });
      this.bleedBurst(target);
    }
    if (neptuneRank > 0) {
      this.waterImpact(target, neptuneRank);
      this.applyTidalPush(target, enemies, hitOrigin, neptuneRank);
      const slowMs = blessingRanks['neptune-tidal-push'][neptuneRank - 1].slowMs ?? 0;
      if (slowMs > 0) target.slow(slowMs, 0.55);
    }
  }

  update(time: number, dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void): void {
    for (const [id, bleed] of this.bleedStates) {
      if (!bleed.enemy.active || time >= bleed.expiresAt) {
        bleed.marker.destroy();
        this.bleedStates.delete(id);
      } else {
        bleed.marker.setPosition(bleed.enemy.x, bleed.enemy.y - 22);
        if (time >= bleed.nextTickAt) {
          bleed.nextTickAt += 500;
          this.bleedBurst(bleed.enemy);
          dealDamage(bleed.enemy, bleed.damage, { sourceId: 'mars-bloodletting', sourceName: 'Mars Bleed', damageType: 'bleed' });
        }
      }
    }
  }

  private chainLightning(source: Enemy, enemies: Phaser.GameObjects.Group, bounces: number, damage: number,
    dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void): void {
    const hit = new Set<number>([source.combatId]);
    let previous = source;
    for (let index = 0; index < bounces; index += 1) {
      const target = this.findChainTarget(previous, enemies, hit);
      if (!target) break;
      hit.add(target.combatId);
      this.drawLightning(previous.x, previous.y, target.x, target.y);
      dealDamage(target, damage, { sourceId: 'jupiter-spark', sourceName: 'Jupiter Spark', damageType: 'lightning' });
      previous = target;
    }
  }

  private findChainTarget(source: Enemy, enemies: Phaser.GameObjects.Group, excluded: Set<number>): Enemy | undefined {
    let nearest: Enemy | undefined;
    let distance = 210 * 210;
    for (const child of enemies.getChildren()) {
      const candidate = child as Enemy;
      if (!candidate.active || excluded.has(candidate.combatId)) continue;
      const candidateDistance = Phaser.Math.Distance.Squared(source.x, source.y, candidate.x, candidate.y);
      if (candidateDistance < distance) { nearest = candidate; distance = candidateDistance; }
    }
    return nearest;
  }

  private drawLightning(x1: number, y1: number, x2: number, y2: number): void {
    const glow = this.scene.add.graphics().setDepth(24);
    const bolt = this.scene.add.graphics().setDepth(25);
    const points: Phaser.Math.Vector2[] = [new Phaser.Math.Vector2(x1, y1)];
    for (let step = 1; step < 8; step += 1) {
      const progress = step / 8;
      points.push(new Phaser.Math.Vector2(Phaser.Math.Linear(x1, x2, progress) + Phaser.Math.Between(-12, 12), Phaser.Math.Linear(y1, y2, progress) + Phaser.Math.Between(-12, 12)));
    }
    points.push(new Phaser.Math.Vector2(x2, y2));
    glow.lineStyle(15, 0x4fc3ff, 0.26).beginPath().moveTo(x1, y1);
    bolt.lineStyle(7, 0xffffff, 1).beginPath().moveTo(x1, y1);
    for (const point of points.slice(1)) {
      glow.lineTo(point.x, point.y);
      bolt.lineTo(point.x, point.y);
    }
    glow.strokePath();
    bolt.strokePath();
    const sourceFlash = this.scene.add.circle(x1, y1, 14, 0xffe66d, 0.72).setDepth(26);
    const flash = this.scene.add.circle(x2, y2, 20, 0xfff5a8, 0.88).setDepth(26);
    for (let step = 1; step < 8; step += 1) {
      const progress = step / 8;
      const particle = this.scene.add.circle(Phaser.Math.Linear(x1, x2, progress), Phaser.Math.Linear(y1, y2, progress), 3, 0x8fe9ff).setDepth(27);
      this.scene.tweens.add({ targets: particle, x: particle.x + Phaser.Math.Between(-18, 18), y: particle.y + Phaser.Math.Between(-18, 18), alpha: 0,
        duration: 380, onComplete: () => particle.destroy() });
    }
    this.scene.cameras.main.shake(80, 0.0025);
    this.scene.tweens.add({ targets: [glow, bolt, sourceFlash, flash], alpha: 0, duration: 420,
      onComplete: () => { glow.destroy(); bolt.destroy(); sourceFlash.destroy(); flash.destroy(); } });
  }

  private bleedBurst(enemy: Enemy): void {
    const slash = this.scene.add.rectangle(enemy.x, enemy.y, 30, 4, 0xff4d6d, 0.9).setRotation(-0.65).setDepth(20);
    this.scene.tweens.add({ targets: slash, scaleX: 1.6, alpha: 0, duration: 360, onComplete: () => slash.destroy() });
    for (let index = 0; index < 9; index += 1) {
      const particle = this.scene.add.circle(enemy.x, enemy.y, Phaser.Math.Between(2, 4), index % 2 ? 0x6e1023 : 0xff4d6d).setDepth(19);
      this.scene.tweens.add({ targets: particle, x: particle.x + Phaser.Math.Between(-25, 25), y: particle.y + Phaser.Math.Between(-32, 12), alpha: 0,
        duration: 460, onComplete: () => particle.destroy() });
    }
  }

  private waterImpact(enemy: Enemy, rank: number): void {
    const ripple = this.scene.add.circle(enemy.x, enemy.y, 14).setStrokeStyle(5 + rank, 0x55d6ff, 0.9).setDepth(18);
    const outer = this.scene.add.circle(enemy.x, enemy.y, 22).setStrokeStyle(3, 0xb7efff, 0.7).setDepth(18);
    this.scene.tweens.add({ targets: ripple, scale: 2.3 + rank * 0.3, alpha: 0, duration: 480, onComplete: () => ripple.destroy() });
    this.scene.tweens.add({ targets: outer, scale: 2.8 + rank * 0.35, alpha: 0, duration: 620, onComplete: () => outer.destroy() });
    for (let index = 0; index < 7; index += 1) {
      const droplet = this.scene.add.circle(enemy.x, enemy.y, 3, 0x55d6ff, 0.9).setDepth(19);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.scene.tweens.add({ targets: droplet, x: enemy.x + Math.cos(angle) * Phaser.Math.Between(24, 46),
        y: enemy.y + Math.sin(angle) * Phaser.Math.Between(24, 46), alpha: 0, duration: 430, onComplete: () => droplet.destroy() });
    }
    this.scene.cameras.main.shake(65, 0.0015);
  }

  private applyTidalPush(target: Enemy, enemies: Phaser.GameObjects.Group, origin: Phaser.Math.Vector2, rank: number): void {
    const primaryForce = 260 + rank * 140;
    target.applyKnockback(origin, primaryForce, 240 + rank * 35);
    const radiusSquared = (80 + rank * 25) ** 2;
    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active || enemy === target) continue;
      if (Phaser.Math.Distance.Squared(target.x, target.y, enemy.x, enemy.y) <= radiusSquared) {
        enemy.applyKnockback(origin, primaryForce * 0.55, 180 + rank * 25);
      }
    }
  }
}
