import Phaser from 'phaser';
import { MenuButton } from './MenuButton';

export class PauseMenu {
  private container?: Phaser.GameObjects.Container;
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onResume: () => void,
    private readonly onMainMenu: () => void,
  ) {}

  show(): void {
    this.destroy();

    const { width, height } = this.scene.scale;
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.58).setOrigin(0);
    const title = this.scene.add
      .text(width / 2, height / 2 - 110, 'Paused', {
        color: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '34px',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.buttons = [
      new MenuButton(this.scene, width / 2, height / 2 - 20, 'Resume', this.onResume, () => this.select(0)),
      new MenuButton(this.scene, width / 2, height / 2 + 50, 'Main Menu', this.onMainMenu, () => this.select(1)),
    ];
    this.container = this.scene.add.container(0, 0, [overlay, title, ...this.buttons]).setDepth(110);
    this.selectedIndex = 0;
    this.registerKeyboard();
    this.updateSelection();
  }

  destroy(): void {
    this.unregisterKeyboard();
    this.container?.destroy(true);
    this.container = undefined;
    this.buttons = [];
  }

  resize(): void {
    if (this.container) {
      this.show();
    }
  }

  private registerKeyboard(): void {
    this.scene.input.keyboard?.on('keydown-UP', this.selectPrevious, this);
    this.scene.input.keyboard?.on('keydown-DOWN', this.selectNext, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.confirmSelection, this);
  }

  private unregisterKeyboard(): void {
    this.scene.input.keyboard?.off('keydown-UP', this.selectPrevious, this);
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
    this.selectedIndex = Phaser.Math.Wrap(index, 0, this.buttons.length);
    this.updateSelection();
  }

  private updateSelection(): void {
    this.buttons.forEach((button, index) => button.setSelected(index === this.selectedIndex));
  }

  private confirmSelection(): void {
    this.buttons[this.selectedIndex]?.select();
  }
}
