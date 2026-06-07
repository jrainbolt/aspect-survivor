import Phaser from 'phaser';
import { HIGH_SCORE_KEY } from '../constants/storage';
import { MenuButton } from '../ui/MenuButton';

export class MainMenuScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x111418).setOrigin(0);
    this.createGrid(width, height);

    this.add
      .text(width / 2, height * 0.3, 'Aspect Survivor', {
        color: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '46px',
        fontStyle: '900',
        stroke: '#111418',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.3 + 54, `BEST ${this.formatTime(this.getHighScore())}`, {
        color: '#dbe4ee',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '16px',
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.buttons = [
      new MenuButton(this, width / 2, height * 0.56, 'Start', () => this.scene.start('GameScene'), () => this.select(0)),
      new MenuButton(this, width / 2, height * 0.56 + 70, 'Reset Best', () => this.resetHighScore(), () => this.select(1)),
    ];
    this.updateSelection();

    this.input.keyboard?.on('keydown-UP', this.selectPrevious, this);
    this.input.keyboard?.on('keydown-DOWN', this.selectNext, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirmSelection, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  private createGrid(width: number, height: number): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x232a34, 1);
    for (let x = 0; x < width; x += 64) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 64) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  private resetHighScore(): void {
    localStorage.removeItem(HIGH_SCORE_KEY);
    this.scene.restart();
  }

  private getHighScore(): number {
    return Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0);
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

  private handleShutdown(): void {
    this.input.keyboard?.off('keydown-UP', this.selectPrevious, this);
    this.input.keyboard?.off('keydown-DOWN', this.selectNext, this);
    this.input.keyboard?.off('keydown-ENTER', this.confirmSelection, this);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  }
}
