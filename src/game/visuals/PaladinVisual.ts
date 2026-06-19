import Phaser from 'phaser';

export class PaladinVisual {
  private readonly container: Phaser.GameObjects.Container;
  private readonly sword: Phaser.GameObjects.Container;
  private readonly shield: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    const cape = scene.add.rectangle(-7, 0, 22, 31, 0x7c2438).setStrokeStyle(2, 0x431522);
    const body = scene.add.rectangle(0, 0, 30, 34, 0xaeb8c4).setStrokeStyle(3, 0x56616e);
    const chest = scene.add.rectangle(5, 0, 15, 20, 0xf4d35e).setStrokeStyle(2, 0x9d7820);
    const helmet = scene.add.rectangle(3, -1, 19, 22, 0xdce3ea).setStrokeStyle(2, 0x65717d);
    const visor = scene.add.rectangle(11, -1, 8, 4, 0x27313b);
    const shoulderTop = scene.add.circle(1, -18, 7, 0xdce3ea).setStrokeStyle(2, 0x65717d);
    const shoulderBottom = scene.add.circle(1, 18, 7, 0xdce3ea).setStrokeStyle(2, 0x65717d);

    const shieldPlate = scene.add.ellipse(0, 0, 18, 29, 0x4ecdc4).setStrokeStyle(3, 0xdff9f7);
    const shieldBoss = scene.add.circle(0, 0, 4, 0xf4d35e);
    this.shield = scene.add.container(8, 22, [shieldPlate, shieldBoss]);

    const blade = scene.add.rectangle(14, 0, 31, 5, 0xeaf2f8).setOrigin(0, 0.5).setStrokeStyle(1, 0x7d8995);
    const hilt = scene.add.rectangle(12, 0, 5, 15, 0xee964b);
    this.sword = scene.add.container(8, -21, [blade, hilt]);
    this.sword.setRotation(-0.2);

    this.container = scene.add.container(x, y, [cape, body, chest, helmet, visor, shoulderTop, shoulderBottom, this.shield, this.sword]);
    this.container.setDepth(11);
  }

  setPosition(x: number, y: number): void { this.container.setPosition(x, y); }
  setAlpha(alpha: number): void { this.container.setAlpha(alpha); }
  setScale(scale: number): void { this.container.setScale(scale); }

  setFacing(direction: Phaser.Math.Vector2): void {
    const step = Math.PI / 4;
    this.container.setRotation(Math.round(direction.angle() / step) * step);
  }

  playSwordHack(): void {
    this.scene.tweens.killTweensOf(this.sword);
    this.sword.setRotation(-1.05);
    this.scene.tweens.add({ targets: this.sword, rotation: 0.8, duration: 170, ease: 'Cubic.Out', yoyo: true, hold: 20 });
  }

  playShieldBash(): void {
    this.scene.tweens.killTweensOf(this.shield);
    this.shield.setX(8);
    this.scene.tweens.add({ targets: this.shield, x: 30, duration: 110, ease: 'Cubic.Out', yoyo: true, hold: 55 });
  }

  playGuardFlash(): void {
    const ring = this.scene.add.circle(this.container.x, this.container.y, 24, 0x7ee8e1, 0.2)
      .setStrokeStyle(4, 0xbffff9, 0.95).setDepth(12);
    this.scene.tweens.add({
      targets: ring, scale: 1.75, alpha: 0, duration: 300, ease: 'Cubic.Out',
      onComplete: () => ring.destroy(),
    });
  }
}
