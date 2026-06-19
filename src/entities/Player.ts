import Phaser from 'phaser';
import type { CharacterDefinition } from '../game/types';
import type { PlayerStats } from '../types/stats';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public readonly stats: PlayerStats;

  private readonly keys: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key[]>;
  private invulnerableUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, character: CharacterDefinition, stats: PlayerStats) {
    super(scene, x, y, 'player');
    this.stats = stats;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.setCircle(16, 8, 8);
    this.setTint(character.visual.color);

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is unavailable.');
    }

    this.keys = {
      up: [
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      ],
      down: [
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      ],
      left: [
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      ],
      right: [
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      ],
    };
  }

  update(time: number, delta: number): number {
    const x = Number(this.isDirectionDown('right')) - Number(this.isDirectionDown('left'));
    const y = Number(this.isDirectionDown('down')) - Number(this.isDirectionDown('up'));
    const direction = new Phaser.Math.Vector2(x, y).normalize();

    this.setVelocity(direction.x * this.stats.moveSpeed, direction.y * this.stats.moveSpeed);
    this.setAlpha(time < this.invulnerableUntil ? 0.55 : 1);
    const healing = Math.min(this.stats.maxHp - this.stats.currentHp, this.stats.hpRegen * delta / 1000);
    this.stats.currentHp += healing;
    return healing;
  }

  private isDirectionDown(direction: keyof Player['keys']): boolean {
    return this.keys[direction].some((key) => key.isDown);
  }

  takeDamage(amount: number, time: number): number {
    if (time < this.invulnerableUntil || this.stats.currentHp <= 0) return 0;
    const mitigated = amount * (100 / (100 + Math.max(0, this.stats.armor)));
    const damageTaken = Math.min(this.stats.currentHp, mitigated);
    this.stats.currentHp = Math.max(0, this.stats.currentHp - damageTaken);
    this.invulnerableUntil = time + 450;
    return damageTaken;
  }

  healToFull(): void {
    this.stats.currentHp = this.stats.maxHp;
  }

  playRecoil(): void {
    this.scene.tweens.killTweensOf(this);
    this.setScale(0.86);
    this.scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 110, ease: 'Back.Out' });
  }
}
