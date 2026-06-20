import Phaser from 'phaser';
import type { SpecializationId } from '../types';

export class PaladinVisual {
  private readonly container: Phaser.GameObjects.Container;
  private readonly figure: Phaser.GameObjects.Container;
  private readonly sword: Phaser.GameObjects.Container;
  private readonly shield: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number, specializationId?: SpecializationId) {
    const cape = scene.add.rectangle(-7, 0, 22, 31, 0x7c2438).setStrokeStyle(2, 0x431522);
    const body = scene.add.rectangle(0, 0, 30, 34, 0xaeb8c4).setStrokeStyle(3, 0x56616e);
    const chest = scene.add.rectangle(5, 0, 15, 20, 0xf4d35e).setStrokeStyle(2, 0x9d7820);
    const helmet = scene.add.rectangle(3, -1, 19, 22, 0xdce3ea).setStrokeStyle(2, 0x65717d);
    const visor = scene.add.rectangle(11, -1, 8, 4, 0x27313b);
    const shoulderTop = scene.add.circle(1, -18, 7, 0xdce3ea).setStrokeStyle(2, 0x65717d);
    const shoulderBottom = scene.add.circle(1, 18, 7, 0xdce3ea).setStrokeStyle(2, 0x65717d);

    const shieldWidth = specializationId === 'templar' ? 25 : specializationId === 'guardian' ? 13 : 18;
    const shieldHeight = specializationId === 'templar' ? 43 : specializationId === 'guardian' ? 24 : 29;
    const shieldPlate = scene.add.ellipse(0, 0, shieldWidth, shieldHeight, specializationId === 'templar' ? 0x3d8c8a : 0x4ecdc4).setStrokeStyle(3, 0xdff9f7);
    const shieldBoss = scene.add.circle(0, 0, 4, 0xf4d35e);
    this.shield = scene.add.container(8, 22, [shieldPlate, shieldBoss]);

    const weaponLength = specializationId === 'guardian' ? 68 : specializationId === 'crusader' ? 43 : specializationId === 'templar' ? 24 : 31;
    const weaponWidth = specializationId === 'guardian' ? 4 : specializationId === 'crusader' ? 7 : 5;
    const blade = scene.add.rectangle(14, 0, weaponLength, weaponWidth, specializationId === 'guardian' ? 0x82cfff : 0xeaf2f8).setOrigin(0, 0.5).setStrokeStyle(1, 0x7d8995);
    const hilt = scene.add.rectangle(12, 0, 5, 15, 0xee964b);
    const weaponParts: Phaser.GameObjects.GameObject[] = [blade, hilt];
    if (specializationId === 'guardian') weaponParts.push(scene.add.triangle(14 + weaponLength, 0, -8, -7, 8, 0, -8, 7, 0xeaf2f8));
    this.sword = scene.add.container(8, -21, weaponParts);
    this.sword.setRotation(-0.2);

    this.figure = scene.add.container(0, 0, [cape, body, chest, helmet, visor, shoulderTop, shoulderBottom, this.shield, this.sword]);
    this.container = scene.add.container(x, y, [this.figure]);
    this.container.setDepth(11);
  }

  setPosition(x: number, y: number): void { this.container.setPosition(x, y); }
  setAlpha(alpha: number): void { this.container.setAlpha(alpha); }

  setFacing(direction: Phaser.Math.Vector2): void {
    const step = Math.PI / 4;
    this.container.setRotation(Math.round(direction.angle() / step) * step);
  }

  setLocomotion(state: 'idle' | 'walk' | 'sword-attack' | 'shield-bash' | 'hurt' | 'level-up', time: number): void {
    if (state === 'idle') {
      this.figure.setY(Math.sin(time * 0.004) * 1.2);
      this.figure.setAngle(0);
    } else if (state === 'walk') {
      this.figure.setY(Math.abs(Math.sin(time * 0.014)) * -3);
      this.figure.setAngle(Math.sin(time * 0.014) * 2.2);
    }
  }

  playSwordHack(): void {
    this.scene.tweens.killTweensOf(this.sword);
    this.sword.setRotation(-1.05);
    this.scene.tweens.add({ targets: this.sword, rotation: 0.95, duration: 115, ease: 'Cubic.Out', yoyo: true, hold: 35 });
  }

  playPikeThrust(): void {
    this.scene.tweens.killTweensOf(this.sword);
    this.sword.setRotation(0);
    this.sword.setX(8);
    this.scene.tweens.add({ targets: this.sword, x: 42, duration: 95, ease: 'Cubic.Out', yoyo: true, hold: 45 });
  }

  playShieldBash(): void {
    this.scene.tweens.killTweensOf(this.shield);
    this.shield.setX(8);
    this.scene.tweens.add({ targets: this.shield, x: 44, scaleX: 1.12, scaleY: 1.12, duration: 100, ease: 'Back.Out', yoyo: true, hold: 85 });
  }

  playHurt(): void {
    this.scene.tweens.killTweensOf(this.figure);
    this.figure.setX(-5);
    this.scene.tweens.add({ targets: this.figure, x: 0, alpha: { from: 0.35, to: 1 }, duration: 210, ease: 'Bounce.Out' });
  }

  playCelebration(): void {
    this.scene.tweens.killTweensOf(this.figure);
    this.scene.tweens.add({ targets: this.figure, y: -13, angle: -5, duration: 180, yoyo: true, repeat: 1, ease: 'Sine.Out' });
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
