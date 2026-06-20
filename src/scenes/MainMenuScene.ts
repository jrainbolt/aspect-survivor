import Phaser from 'phaser';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { SaveSystem } from '../game/systems/SaveSystem';
import { MenuButton } from '../ui/MenuButton';

export class MainMenuScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    this.buttons = [];
    this.selectedIndex = 0;
    FullscreenSystem.install(this);
    const { width, height } = this.scale;
    const compactHeight = height < 560;
    const titleY = compactHeight ? 82 : height * 0.3;
    const buttonY = compactHeight ? 175 : height * 0.56;
    this.add.rectangle(0, 0, width, height, 0x111418).setOrigin(0);
    this.createGrid(width, height);

    this.add
      .text(width / 2, titleY, 'Aspect Survivor', {
        color: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '46px',
        fontStyle: '900',
        stroke: '#111418',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, titleY + 54, this.getProgressLabel(), {
        color: '#dbe4ee',
        align: 'center',
        fixedWidth: Math.max(180, width - 32),
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '16px',
        fontStyle: '800',
      })
      .setOrigin(0.5);

    this.buttons = [
      new MenuButton(this, width / 2, buttonY, 'Start Run', () => this.scene.start('CharacterSelectScene'), () => this.select(0)),
      new MenuButton(this, width / 2, buttonY + 70, 'Reset Best', () => this.resetHighScore(), () => this.select(1)),
    ];
    this.createControlsPanel(width, height);
    this.updateSelection();

    this.input.keyboard?.on('keydown-UP', this.selectPrevious, this);
    this.input.keyboard?.on('keydown-DOWN', this.selectNext, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirmSelection, this);
    this.input.keyboard?.on('keydown-SPACE', this.confirmSelection, this);
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

  private createControlsPanel(width: number, height: number): void {
    const panelWidth = Math.min(660, width - 32);
    const narrow = width < 520;
    const panelHeight = narrow ? 104 : 78;
    const y = Math.min(height - panelHeight / 2 - 18, height * 0.84);
    this.add.rectangle(width / 2, y, panelWidth, panelHeight, 0x171c24, 0.96).setStrokeStyle(1, 0x65522f, 0.9);
    this.add.text(width / 2, y - 22, 'CONTROLS', {
      color: '#ffd166', fontFamily: 'Inter, Arial, sans-serif', fontSize: '12px', fontStyle: '900',
    }).setOrigin(0.5);
    const controls = narrow
      ? 'MOVE  WASD / ARROWS\nMENUS  ARROWS + ENTER / SPACE\nPAUSE  ESC / M   ·   FULLSCREEN  F\nATTACK  AUTOMATIC'
      : 'MOVE  WASD / ARROWS     MENUS  ARROWS + ENTER / SPACE\nPAUSE  ESC / M     FULLSCREEN  F     ATTACK  AUTOMATIC';
    this.add.text(width / 2, y + (narrow ? 12 : 8), controls, {
        color: '#dbe4ee', fontFamily: 'Inter, Arial, sans-serif', fontSize: narrow ? '11px' : '13px',
        fontStyle: '700', align: 'center', fixedWidth: panelWidth - 24, lineSpacing: narrow ? 3 : 6,
      }).setOrigin(0.5);
  }

  private resetHighScore(): void {
    localStorage.removeItem('aspect-survivor.progress');
    localStorage.removeItem('aspect-survivor.high-score-seconds');
    this.scene.restart();
  }

  private getProgressLabel(): string {
    const save = SaveSystem.load();
    return `BEST ${this.formatTime(save.bestSurvivalTime)}  |  ACT ${save.highestAct}  |  LEVEL ${save.highestLevel}`;
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
    this.input.keyboard?.off('keydown-SPACE', this.confirmSelection, this);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  }
}
