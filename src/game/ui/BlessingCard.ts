import Phaser from 'phaser';
import type { BlessingDefinition } from '../types';
import { blessingRanks } from '../data/blessingRanks';
import { FantasyTheme, fantasyText } from './FantasyTheme';

const godGlyph: Record<BlessingDefinition['god'], string> = { Jupiter: 'J', Mars: 'M', Neptune: 'N' };
const romanRank = (rank: number): string => ['I', 'II', 'III'][rank - 1] ?? String(rank);

export class BlessingCard extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly accent: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, blessing: BlessingDefinition, currentRank: number,
    onSelect: () => void, onHover: () => void) {
    const background = scene.add.rectangle(0, 0, width, height, FantasyTheme.panelRaised)
      .setStrokeStyle(2, blessing.color).setInteractive({ useHandCursor: true });
    const icon = scene.add.circle(0, -height * 0.29, 27, blessing.color, 0.18).setStrokeStyle(2, blessing.color);
    const glyph = scene.add.text(0, -height * 0.29, godGlyph[blessing.god], fantasyText(24, `#${blessing.color.toString(16).padStart(6, '0')}`, '900')).setOrigin(0.5);
    const nextRank = currentRank + 1;
    const rankDefinition = blessingRanks[blessing.id][nextRank - 1];
    const currentDefinition = currentRank > 0 ? blessingRanks[blessing.id][currentRank - 1] : undefined;
    const god = scene.add.text(0, -height * 0.11, blessing.god.toUpperCase(), fantasyText(14, `#${blessing.color.toString(16).padStart(6, '0')}`, '900')).setOrigin(0.5);
    const name = scene.add.text(0, height * 0.03, `${blessing.displayName} ${romanRank(nextRank)}`, fantasyText(22, '#ffffff', '900')).setOrigin(0.5);
    const divider = scene.add.rectangle(0, height * 0.14, width - 42, 1, blessing.color, 0.6);
    const description = scene.add.text(0, height * 0.27,
      currentDefinition ? `CURRENT: ${currentDefinition.effectText}\nNEXT: ${rankDefinition.effectText}` : `NEW FAVOR\n${rankDefinition.effectText}`, {
      ...fantasyText(height < 220 ? 12 : 14, FantasyTheme.muted), align: 'center', fixedWidth: width - 38,
      wordWrap: { width: width - 46, useAdvancedWrap: true }, lineSpacing: 5,
    }).setOrigin(0.5);
    super(scene, x, y, [background, icon, glyph, god, name, divider, description]);
    this.background = background;
    this.accent = blessing.color;
    scene.add.existing(this);
    background.on(Phaser.Input.Events.POINTER_OVER, onHover);
    background.on(Phaser.Input.Events.POINTER_DOWN, onSelect);
  }


  setSelected(selected: boolean): void {
    this.background.setFillStyle(selected ? 0x303644 : FantasyTheme.panelRaised);
    this.background.setStrokeStyle(selected ? 4 : 2, selected ? FantasyTheme.goldBright : this.accent);
    this.scene.tweens.add({ targets: this, scale: selected ? 1.035 : 1, duration: 120, ease: 'Sine.Out' });
  }
}
