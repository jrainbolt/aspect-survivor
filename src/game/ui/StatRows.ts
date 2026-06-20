import Phaser from 'phaser';
import { FantasyTheme, fantasyText } from './FantasyTheme';

export interface StatRow { label: string; value: string; }

export function createStatRows(scene: Phaser.Scene, x: number, y: number, width: number, rows: StatRow[], spacing = 25): Phaser.GameObjects.Container {
  const children: Phaser.GameObjects.GameObject[] = [];
  rows.forEach((row, index) => {
    const rowY = index * spacing;
    children.push(scene.add.text(0, rowY, row.label, fantasyText(14, FantasyTheme.muted)).setOrigin(0, 0.5));
    children.push(scene.add.text(width, rowY, row.value, fantasyText(14, '#f5ead3', '900')).setOrigin(1, 0.5));
  });
  return scene.add.container(x, y, children);
}
