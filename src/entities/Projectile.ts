import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Image {
  public damage = 0;
  public expiresAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'projectile');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(8);
    this.setCircle(5);
  }

  fire(target: Phaser.Math.Vector2, damage: number, speed: number, range: number, time: number): void {
    this.damage = damage;
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y)).normalize();
    this.setVelocity(direction.x * speed, direction.y * speed);
    this.setRotation(direction.angle());
    this.expiresAt = time + (range / speed) * 1000;
  }
}
