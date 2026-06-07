import Phaser from 'phaser';
import { GameEvents } from '../types/events';
import type { UpgradeOption } from '../upgrades/Upgrade';

export class UpgradePanel {
  private container?: Phaser.GameObjects.Container;
  private choices: UpgradeOption[] = [];
  private cards: Phaser.GameObjects.Rectangle[] = [];
  private selectedIndex = 0;

  constructor(private readonly scene: Phaser.Scene) {}

  show(choices: UpgradeOption[]): void {
    this.destroy();
    this.choices = choices;
    this.selectedIndex = 0;

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
    this.registerKeyboard();
    this.updateSelection();
  }

  destroy(): void {
    this.unregisterKeyboard();
    this.container?.destroy(true);
    this.container = undefined;
    this.choices = [];
    this.cards = [];
  }

  private createChoiceCard(choice: UpgradeOption, x: number, y: number): Phaser.GameObjects.Container {
    const card = this.scene.add.rectangle(0, 0, 204, 150, 0x202630).setStrokeStyle(2, 0x4ecdc4).setInteractive({ useHandCursor: true });
    const cardIndex = this.cards.length;
    this.cards.push(card);

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

    card.on(Phaser.Input.Events.POINTER_OVER, () => this.select(cardIndex));
    card.on(Phaser.Input.Events.POINTER_DOWN, () => this.confirmSelection());

    return this.scene.add.container(x, y, [card, title, description]);
  }

  private registerKeyboard(): void {
    this.scene.input.keyboard?.on('keydown-LEFT', this.selectPrevious, this);
    this.scene.input.keyboard?.on('keydown-UP', this.selectPrevious, this);
    this.scene.input.keyboard?.on('keydown-RIGHT', this.selectNext, this);
    this.scene.input.keyboard?.on('keydown-DOWN', this.selectNext, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.confirmSelection, this);
  }

  private unregisterKeyboard(): void {
    this.scene.input.keyboard?.off('keydown-LEFT', this.selectPrevious, this);
    this.scene.input.keyboard?.off('keydown-UP', this.selectPrevious, this);
    this.scene.input.keyboard?.off('keydown-RIGHT', this.selectNext, this);
    this.scene.input.keyboard?.off('keydown-DOWN', this.selectNext, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.confirmSelection, this);
  }

  private selectPrevious(): void {
    this.select(this.selectedIndex - 1);
  }

  private selectNext(): void {
    this.select(this.selectedIndex + 1);
  }

  private select(index: number): void {
    if (this.choices.length === 0) {
      return;
    }

    this.selectedIndex = Phaser.Math.Wrap(index, 0, this.choices.length);
    this.updateSelection();
  }

  private updateSelection(): void {
    this.cards.forEach((card, index) => {
      const isSelected = index === this.selectedIndex;
      card.setFillStyle(isSelected ? 0x2f3a46 : 0x202630);
      card.setStrokeStyle(isSelected ? 4 : 2, isSelected ? 0xffd166 : 0x4ecdc4);
    });
  }

  private confirmSelection(): void {
    const choice = this.choices[this.selectedIndex];
    if (!choice) {
      return;
    }

    this.scene.events.emit(GameEvents.UpgradeSelected, { upgradeId: choice.id });
    this.destroy();
  }
}
