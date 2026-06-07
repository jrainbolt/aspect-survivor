import Phaser from 'phaser';
import { GameEvents } from '../types/events';
import type { UpgradeOption } from '../upgrades/Upgrade';

export class UpgradePanel {
  private container?: Phaser.GameObjects.Container;

  constructor(private readonly scene: Phaser.Scene) {}

  show(choices: UpgradeOption[]): void {
    this.destroy();

    const { width, height } = this.scene.scale;
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.62).setOrigin(0);
    const title = this.scene.add.text(width / 2, height / 2 - 145, 'Level Up', {
      color: '#ffffff',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '34px',
      fontStyle: '800',
    }).setOrigin(0.5);

    const cards = choices.map((choice, index) => this.createChoiceCard(choice, width / 2 + (index - 1) * 230, height / 2));
    this.container = this.scene.add.container(0, 0, [overlay, title, ...cards]).setDepth(100);
  }

  destroy(): void {
    this.container?.destroy(true);
    this.container = undefined;
  }

  private createChoiceCard(choice: UpgradeOption, x: number, y: number): Phaser.GameObjects.Container {
    const card = this.scene.add.rectangle(0, 0, 204, 150, 0x202630).setStrokeStyle(2, 0x4ecdc4).setInteractive({ useHandCursor: true });
    const title = this.scene.add.text(0, -38, choice.title, {
      color: '#ffffff',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '21px',
      fontStyle: '800',
    }).setOrigin(0.5);
    const description = this.scene.add.text(0, 18, choice.description, {
      color: '#dbe4ee',
      align: 'center',
      fixedWidth: 168,
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '15px',
      lineSpacing: 5,
    }).setOrigin(0.5);

    card.on(Phaser.Input.Events.POINTER_OVER, () => card.setFillStyle(0x2f3a46));
    card.on(Phaser.Input.Events.POINTER_OUT, () => card.setFillStyle(0x202630));
    card.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.events.emit(GameEvents.UpgradeSelected, { upgradeId: choice.id });
      this.destroy();
    });

    return this.scene.add.container(x, y, [card, title, description]);
  }
}
