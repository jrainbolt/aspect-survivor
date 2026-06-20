import Phaser from 'phaser';
import type { Enemy } from '../../entities/Enemy';
import type { Player } from '../../entities/Player';
import { combatTextConfig } from '../data/combatTextConfig';
import type { DamageType } from '../types';

export class CombatTextSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  enemyDamage(enemy: Enemy, amount: number, damageType: DamageType, critical = false): void {
    const config = critical ? combatTextConfig.critical
      : damageType === 'lightning' ? combatTextConfig.lightning
        : damageType === 'fire' ? combatTextConfig.fire
          : damageType === 'ice' ? combatTextConfig.ice
        : damageType === 'bleed' ? combatTextConfig.bleed
          : damageType === 'water' ? combatTextConfig.water : combatTextConfig.enemyDamage;
    this.float(enemy.x, enemy.y - 26, `${critical ? 'CRIT! ' : ''}${Math.round(amount)}`, config, critical ? 1.35 : 1);
  }

  playerDamage(player: Player, amount: number): void {
    this.float(player.x, player.y - 30, `-${Math.round(amount)}`, combatTextConfig.playerDamage, 1.2);
  }

  healing(x: number, y: number, amount: number): void {
    if (amount <= 0) return;
    this.float(x, y, `+${Math.round(amount)} HP`, combatTextConfig.healing, 1.25);
  }

  private float(x: number, y: number, label: string, config: { fontSize: number; durationMs: number; rise: number; color: string }, pop: number): void {
    const text = this.scene.add.text(x, y, label, {
      color: config.color, fontFamily: 'Inter, Arial, sans-serif', fontSize: `${config.fontSize}px`, fontStyle: '900',
      stroke: '#0b0e12', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(80).setScale(0.65);
    this.scene.tweens.add({ targets: text, y: y - config.rise, alpha: 0, scale: pop, duration: config.durationMs,
      ease: 'Cubic.Out', onComplete: () => text.destroy() });
  }
}
