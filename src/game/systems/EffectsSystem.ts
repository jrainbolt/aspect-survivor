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

  actVictory(x: number, y: number): void {
    this.scene.cameras.main.flash(650, 255, 218, 112, false);
    for (let ringIndex = 0; ringIndex < 3; ringIndex += 1) {
      const ring = this.scene.add.circle(x, y, 28).setStrokeStyle(5, ringIndex % 2 === 0 ? 0xffd166 : 0xf5ead3, 0.95).setDepth(118);
      this.scene.tweens.add({ targets: ring, scale: 5 + ringIndex * 1.4, alpha: 0, duration: 900,
        delay: ringIndex * 130, ease: 'Cubic.Out', onComplete: () => ring.destroy() });
    }
    for (let index = 0; index < 24; index += 1) {
      const angle = index / 24 * Math.PI * 2;
      const spark = this.scene.add.rectangle(x, y, 4, 11, index % 2 === 0 ? 0xffd166 : 0xffffff).setRotation(angle).setDepth(119);
      this.scene.tweens.add({ targets: spark, x: x + Math.cos(angle) * Phaser.Math.Between(130, 260),
        y: y + Math.sin(angle) * Phaser.Math.Between(100, 220), angle: spark.angle + 180, alpha: 0,
        duration: Phaser.Math.Between(650, 1050), ease: 'Cubic.Out', onComplete: () => spark.destroy() });
    }
  }

  meleeImpact(enemy: Enemy, heavy: boolean): void {
    const color = heavy ? 0x7ee8e1 : 0xffe29a;
    const flash = this.scene.add.circle(enemy.x, enemy.y, heavy ? 18 : 12, color, 0.72).setDepth(35);
    this.scene.tweens.add({ targets: flash, scale: heavy ? 2.2 : 1.6, alpha: 0, duration: heavy ? 260 : 150, onComplete: () => flash.destroy() });
    const count = heavy ? 9 : 4;
    for (let index = 0; index < count; index += 1) {
      const particle = this.scene.add.circle(enemy.x, enemy.y + 10, Phaser.Math.Between(2, 4), heavy ? 0xb7a27a : color, 0.85).setDepth(34);
      this.scene.tweens.add({ targets: particle, x: particle.x + Phaser.Math.Between(-30, 30), y: particle.y + Phaser.Math.Between(-22, 12),
        alpha: 0, scale: 0.2, duration: Phaser.Math.Between(180, 320), onComplete: () => particle.destroy() });
    }
    if (heavy) this.scene.cameras.main.shake(105, 0.006);
  }
}
