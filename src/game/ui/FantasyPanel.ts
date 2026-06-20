import Phaser from 'phaser';
import { FantasyTheme, fantasyText } from './FantasyTheme';

export class FantasyPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, title?: string) {
    const shadow = scene.add.rectangle(5, 7, width, height, 0x000000, 0.35);
    const background = scene.add.rectangle(0, 0, width, height, FantasyTheme.panel, 0.98)
      .setStrokeStyle(2, FantasyTheme.border);
    const inner = scene.add.rectangle(0, 0, width - 12, height - 12).setStrokeStyle(1, 0x8b7446, 0.55);
    const ornaments = [
      scene.add.rectangle(-width / 2 + 7, -height / 2 + 7, 9, 9, FantasyTheme.gold).setRotation(Math.PI / 4),
      scene.add.rectangle(width / 2 - 7, -height / 2 + 7, 9, 9, FantasyTheme.gold).setRotation(Math.PI / 4),
      scene.add.rectangle(-width / 2 + 7, height / 2 - 7, 9, 9, FantasyTheme.gold).setRotation(Math.PI / 4),
      scene.add.rectangle(width / 2 - 7, height / 2 - 7, 9, 9, FantasyTheme.gold).setRotation(Math.PI / 4),
    ];
    const children: Phaser.GameObjects.GameObject[] = [shadow, background, inner, ...ornaments];
    if (title) {
      const plate = scene.add.rectangle(0, -height / 2 + 27, Math.min(width - 50, 240), 34, 0x2b251c)
        .setStrokeStyle(1, FantasyTheme.gold);
      const heading = scene.add.text(0, -height / 2 + 27, title.toUpperCase(), fantasyText(16, '#ffd77a', '900')).setOrigin(0.5);
      children.push(plate, heading);
    }
    super(scene, x, y, children);
    scene.add.existing(this);
  }
}
