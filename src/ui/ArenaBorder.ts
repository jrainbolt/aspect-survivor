import Phaser from 'phaser';

export class ArenaBorder {
  private readonly border: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.border = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height)
      .setOrigin(0)
      .setFillStyle(0x000000, 0)
      .setStrokeStyle(4, 0x4ecdc4, 0.85)
      .setDepth(45)
      .setScrollFactor(0);
  }

  resize(width: number, height: number): void {
    this.border.setSize(width, height);
  }
}
