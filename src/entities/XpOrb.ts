import Phaser from 'phaser';

export class XpOrb extends Phaser.Physics.Arcade.Image {
  public readonly amount: number;

  constructor(scene: Phaser.Scene, x: number, y: number, amount: number) {
    super(scene, x, y, 'xp-orb');
    this.amount = amount;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(4);
    this.setCircle(7);
  }

  attractTo(target: Phaser.Math.Vector2, speed: number): void {
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y)).normalize();
    this.setVelocity(direction.x * speed, direction.y * speed);
  }
}
