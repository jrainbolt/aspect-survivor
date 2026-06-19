import type { Enemy } from '../../entities/Enemy';
import type { BlessingId, DamageSource } from '../types';

interface BleedState {
  enemy: Enemy;
  nextTickAt: number;
  expiresAt: number;
  damage: number;
}

export class BlessingSystem {
  private readonly bleedStates = new Map<number, BleedState>();

  constructor(private readonly getBlessings: () => BlessingId[]) {}

  onHit(
    time: number,
    target: Enemy,
    damage: number,
    enemies: Phaser.GameObjects.Group,
    dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void,
  ): void {
    const active = this.getBlessings();
    const sparkLevel = active.filter((id) => id === 'jupiter-spark').length;
    const bleedLevel = active.filter((id) => id === 'mars-bloodletting').length;
    if (sparkLevel > 0 && Math.random() < Math.min(0.65, 0.18 * sparkLevel)) {
      const chainTarget = this.findChainTarget(target, enemies);
      if (chainTarget) dealDamage(chainTarget, Math.max(1, Math.round(damage * (0.45 + sparkLevel * 0.1))), {
        sourceId: 'jupiter-spark', sourceName: 'Jupiter Spark', damageType: 'lightning',
      });
    }
    if (bleedLevel > 0) {
      this.bleedStates.set(target.combatId, {
        enemy: target,
        nextTickAt: time + 500,
        expiresAt: time + 2100,
        damage: Math.max(1, Math.round(damage * 0.12 * bleedLevel)),
      });
    }
  }

  update(time: number, dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void): void {
    for (const [id, bleed] of this.bleedStates) {
      if (!bleed.enemy.active || time >= bleed.expiresAt) {
        this.bleedStates.delete(id);
      } else if (time >= bleed.nextTickAt) {
        bleed.nextTickAt += 500;
        dealDamage(bleed.enemy, bleed.damage, {
          sourceId: 'mars-bloodletting', sourceName: 'Mars Bleed', damageType: 'bleed',
        });
      }
    }
  }

  private findChainTarget(source: Enemy, enemies: Phaser.GameObjects.Group): Enemy | undefined {
    let nearest: Enemy | undefined;
    let distance = 180 * 180;
    for (const child of enemies.getChildren()) {
      const candidate = child as Enemy;
      if (!candidate.active || candidate === source) continue;
      const candidateDistance = Phaser.Math.Distance.Squared(source.x, source.y, candidate.x, candidate.y);
      if (candidateDistance < distance) {
        nearest = candidate;
        distance = candidateDistance;
      }
    }
    return nearest;
  }
}
