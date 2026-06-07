import Phaser from 'phaser';
import type { PlayerStats } from '../types/stats';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public readonly stats: PlayerStats = {
    maxHp: 100,
    hp: 100,
    damage: 12,
    attackSpeed: 1.2,
    moveSpeed: 230,
    level: 1,
    xp: 0,
    xpToNextLevel: 12,
  };

  private readonly keys: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private invulnerableUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.setCircle(16, 8, 8);

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is unavailable.');
    }

    this.keys = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(time: number): void {
    const x = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    const y = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);
    const direction = new Phaser.Math.Vector2(x, y).normalize();

    this.setVelocity(direction.x * this.stats.moveSpeed, direction.y * this.stats.moveSpeed);
    this.setTint(time < this.invulnerableUntil ? 0xffd166 : 0xffffff);
  }

  takeDamage(amount: number, time: number): boolean {
    if (time < this.invulnerableUntil || this.stats.hp <= 0) {
      return false;
    }

    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.invulnerableUntil = time + 450;
    return true;
  }

  healToFull(): void {
    this.stats.hp = this.stats.maxHp;
  }
}
