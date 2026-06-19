import type { Enemy } from '../../entities/Enemy';

export class EffectsSystem {
  constructor(private readonly scene: Phaser.Scene) {}

  showDamage(enemy: Enemy, amount: number, color = '#ffffff'): void {
    const text = this.scene.add.text(enemy.x, enemy.y - 24, String(amount), {
      color, fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px', fontStyle: '800',
      stroke: '#111418', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(40);
    this.scene.tweens.add({ targets: text, y: text.y - 32, alpha: 0, duration: 520, ease: 'Cubic.Out', onComplete: () => text.destroy() });
  }

  enemyDeath(x: number, y: number, color: number): void {
    for (let index = 0; index < 7; index += 1) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(18, 45);
      const particle = this.scene.add.circle(x, y, Phaser.Math.Between(2, 4), color).setDepth(7);
      this.scene.tweens.add({ targets: particle, x: x + Math.cos(angle) * distance, y: y + Math.sin(angle) * distance,
        alpha: 0, scale: 0.2, duration: Phaser.Math.Between(260, 440), onComplete: () => particle.destroy() });
    }
  }

  pickup(x: number, y: number): void {
    const ring = this.scene.add.circle(x, y, 8).setStrokeStyle(2, 0x00bbf9).setDepth(9);
    this.scene.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 260, onComplete: () => ring.destroy() });
  }

  levelUp(x: number, y: number): void {
    const ring = this.scene.add.circle(x, y, 22).setStrokeStyle(4, 0xffd166).setDepth(30);
    this.scene.tweens.add({ targets: ring, scale: 3.3, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => ring.destroy() });
  }
}
