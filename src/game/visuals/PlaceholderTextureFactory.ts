import Phaser from 'phaser';

export class PlaceholderTextureFactory {
  static create(scene: Phaser.Scene): void {
    this.createHeroes(scene);
    this.createEnemies(scene);
  }

  private static createHeroes(scene: Phaser.Scene): void {
    if (!scene.textures.exists('hero-amazon')) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x183f3d).fillTriangle(9, 24, 31, 8, 31, 40);
      g.lineStyle(3, 0x4ecdc4).strokeTriangle(9, 24, 31, 8, 31, 40);
      g.fillStyle(0xd8a178).fillCircle(27, 24, 7);
      g.lineStyle(4, 0xffd166).lineBetween(13, 37, 42, 8);
      g.fillStyle(0xf4f1de).fillTriangle(42, 8, 35, 10, 40, 15);
      g.generateTexture('hero-amazon', 48, 48).destroy();
    }

    if (!scene.textures.exists('hero-sorcerer')) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x5a3190).fillTriangle(8, 24, 34, 7, 34, 41);
      g.lineStyle(3, 0x9b5de5).strokeTriangle(8, 24, 34, 7, 34, 41);
      g.fillStyle(0xc9b4ff).fillCircle(27, 24, 7);
      g.lineStyle(3, 0x7fe7ff).lineBetween(29, 34, 43, 34);
      g.fillStyle(0x00bbf9).fillCircle(43, 34, 5);
      g.generateTexture('hero-sorcerer', 48, 48).destroy();
    }
  }

  private static createEnemies(scene: Phaser.Scene): void {
    if (!scene.textures.exists('enemy-grunt')) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x9f2848).fillTriangle(7, 8, 19, 14, 11, 20).fillTriangle(41, 8, 29, 14, 37, 20);
      g.fillStyle(0xef476f).fillCircle(24, 26, 16);
      g.fillStyle(0x35131e).fillCircle(18, 23, 3).fillCircle(30, 23, 3);
      g.generateTexture('enemy-grunt', 48, 48).destroy();
    }
    if (!scene.textures.exists('enemy-runner')) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x037f65).fillTriangle(4, 24, 39, 8, 34, 24).fillTriangle(4, 24, 39, 40, 34, 24);
      g.fillStyle(0x06d6a0).fillCircle(27, 24, 11);
      g.fillStyle(0xd9fff4).fillCircle(34, 20, 3);
      g.generateTexture('enemy-runner', 48, 48).destroy();
    }
    if (!scene.textures.exists('enemy-brute')) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x9c4e08).fillRoundedRect(5, 8, 38, 34, 7);
      g.fillStyle(0xf8961e).fillRoundedRect(9, 11, 30, 28, 5);
      g.lineStyle(4, 0x5e2c05).lineBetween(10, 12, 38, 38).lineBetween(38, 12, 10, 38);
      g.fillStyle(0xffe0a8).fillCircle(18, 21, 3).fillCircle(30, 21, 3);
      g.generateTexture('enemy-brute', 48, 48).destroy();
    }
    if (!scene.textures.exists('enemy-boss')) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x3b1d62).fillTriangle(5, 17, 12, 2, 19, 17).fillTriangle(29, 17, 36, 2, 43, 17);
      g.fillStyle(0x7c43b5).fillCircle(24, 26, 19);
      g.lineStyle(3, 0xd7b5ff).strokeCircle(24, 26, 18);
      g.fillStyle(0xffd166).fillTriangle(9, 20, 15, 8, 20, 20).fillTriangle(20, 20, 24, 5, 29, 20).fillTriangle(29, 20, 35, 8, 40, 20);
      g.fillStyle(0x1a0b29).fillCircle(18, 28, 4).fillCircle(30, 28, 4);
      g.generateTexture('enemy-boss', 48, 48).destroy();
    }
  }
}
