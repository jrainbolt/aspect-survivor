import Phaser from 'phaser';
import { FantasyTheme } from './FantasyTheme';

export function createDivider(scene: Phaser.Scene, x: number, y: number, width: number): Phaser.GameObjects.Container {
  const line = scene.add.rectangle(0, 0, width, 1, FantasyTheme.border);
  const diamond = scene.add.rectangle(0, 0, 7, 7, FantasyTheme.gold).setRotation(Math.PI / 4);
  return scene.add.container(x, y, [line, diamond]);
}
