import Phaser from 'phaser';

export class MenuButton extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    private readonly onSelect: () => void,
    private readonly onHover?: () => void,
  ) {
    const background = scene.add
      .rectangle(0, 0, 220, 54, 0x202630)
      .setStrokeStyle(2, 0x4ecdc4, 0.85)
      .setInteractive({ useHandCursor: true });
    const text = scene.add
      .text(0, 0, label, {
        color: '#f8f9fa',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '20px',
        fontStyle: '800',
      })
      .setOrigin(0.5);

    super(scene, x, y, [background, text]);
    this.background = background;

    scene.add.existing(this);

    background.on(Phaser.Input.Events.POINTER_OVER, () => this.onHover?.());
    background.on(Phaser.Input.Events.POINTER_DOWN, () => this.onSelect());
  }

  setSelected(isSelected: boolean): void {
    this.background.setFillStyle(isSelected ? 0x2f3a46 : 0x202630);
    this.background.setStrokeStyle(isSelected ? 4 : 2, isSelected ? 0xffd166 : 0x4ecdc4, 0.95);
  }

  select(): void {
    this.onSelect();
  }
}
