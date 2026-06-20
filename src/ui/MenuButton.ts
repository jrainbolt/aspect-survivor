import Phaser from 'phaser';
import { FantasyTheme, fantasyText } from '../game/ui/FantasyTheme';

export interface MenuButtonOptions {
  width?: number;
  height?: number;
  subtitle?: string;
  accent?: number;
}

export class MenuButton extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly labelText: Phaser.GameObjects.Text;
  private readonly normalX: number;
  private readonly accent: number;
  private disabled = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    private readonly onSelect: () => void,
    private readonly onHover?: () => void,
    options: MenuButtonOptions = {},
  ) {
    const width = options.width ?? 220;
    const height = options.height ?? 54;
    const accent = options.accent ?? FantasyTheme.gold;
    const background = scene.add
      .rectangle(0, 0, width, height, FantasyTheme.panelRaised)
      .setStrokeStyle(2, accent, 0.85)
      .setInteractive({ useHandCursor: true });
    const text = scene.add
      .text(options.subtitle ? -width / 2 + 20 : 0, options.subtitle ? -10 : 0, label, fantasyText(options.subtitle ? 19 : 18, '#f5ead3', '900'))
      .setOrigin(0.5);
    if (options.subtitle) text.setOrigin(0, 0.5);
    const children: Phaser.GameObjects.GameObject[] = [background, text];
    if (options.subtitle) {
      children.push(scene.add.text(-width / 2 + 20, 16, options.subtitle, {
        ...fantasyText(12, FantasyTheme.muted), fixedWidth: width - 40, align: 'left',
        wordWrap: { width: width - 44, useAdvancedWrap: true }, lineSpacing: 2,
      }).setOrigin(0, 0.5));
    }

    super(scene, x, y, children);
    this.background = background;
    this.labelText = text;
    this.normalX = x;
    this.accent = accent;

    scene.add.existing(this);

    background.on(Phaser.Input.Events.POINTER_OVER, () => this.onHover?.());
    background.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.onHover?.();
      this.select();
    });
  }

  setSelected(isSelected: boolean): void {
    this.background.setFillStyle(isSelected ? 0x2f3a46 : 0x202630);
    this.background.setStrokeStyle(isSelected ? 4 : 2, isSelected ? FantasyTheme.goldBright : this.accent, 0.95);
    this.scene.tweens.add({ targets: this, x: this.normalX + (isSelected ? 4 : 0), duration: 100 });
  }

  select(): void {
    if (!this.disabled) this.onSelect();
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.setAlpha(disabled ? 0.45 : 1);
    this.labelText.setColor(disabled ? '#77736b' : '#f5ead3');
  }
}
