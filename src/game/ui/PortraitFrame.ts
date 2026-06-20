import Phaser from 'phaser';
import { portraitDefinitions } from '../data/portraits';
import type { CharacterId } from '../types';
import { FantasyTheme } from './FantasyTheme';

export class PortraitFrame extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, characterId: CharacterId, size = 120) {
    const portrait = portraitDefinitions[characterId];
    const radius = size * 0.42;
    const backdrop = scene.add.circle(0, 0, radius, portrait.background);
    const shoulders = scene.add.ellipse(0, size * 0.25, size * 0.68, size * 0.26, portrait.armor);
    const neck = scene.add.rectangle(0, size * 0.12, size * 0.18, size * 0.22, portrait.skin);
    const head = scene.add.ellipse(0, -size * 0.05, size * 0.38, size * 0.48, portrait.skin);
    const hair = portrait.silhouette === 'knight'
      ? scene.add.rectangle(0, -size * 0.08, size * 0.46, size * 0.42, portrait.armor).setStrokeStyle(2, 0x69737d)
      : scene.add.ellipse(0, -size * 0.18, size * 0.43, size * 0.26, portrait.hair);
    const accent = portrait.silhouette === 'mage'
      ? scene.add.triangle(0, -size * 0.38, -size * 0.25, size * 0.18, size * 0.25, size * 0.18, 0, -size * 0.3, portrait.accent)
      : portrait.silhouette === 'hunter'
        ? scene.add.rectangle(size * 0.19, -size * 0.02, size * 0.08, size * 0.52, portrait.accent).setRotation(-0.35)
        : scene.add.rectangle(0, -size * 0.08, size * 0.27, size * 0.055, 0x222831);
    const frame = scene.add.circle(0, 0, radius + 5).setStrokeStyle(5, FantasyTheme.gold);
    const outer = scene.add.circle(0, 0, radius + 10).setStrokeStyle(1, 0x8b7446);
    super(scene, x, y, [backdrop, shoulders, neck, head, hair, accent, frame, outer]);
    scene.add.existing(this);
  }
}
