import Phaser from 'phaser';
import { blessingDefinitions } from '../game/data/blessings';
import { characterDefinitions } from '../game/data/characters';
import { formatStatLines, statSections } from '../game/data/statDisplay';
import { weaponDefinitions } from '../game/data/weapons';
import type { RunState } from '../game/types';
import { MenuButton } from './MenuButton';

export class PauseMenu {
  private container?: Phaser.GameObjects.Container;
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getState: () => RunState,
    private readonly onResume: () => void,
    private readonly onMainMenu: () => void,
  ) {}

  show(): void {
    this.destroy();
    const state = this.getState();
    const stats = state.playerStats;
    const character = characterDefinitions[state.characterId];
    const weapon = weaponDefinitions[state.weaponId];
    const { width, height } = this.scene.scale;
    const panelWidth = Math.min(1080, width - 32);
    const panelHeight = Math.min(680, height - 24);
    const narrow = panelWidth < 720;
    const centerX = width / 2;
    const top = (height - panelHeight) / 2;

    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.72).setOrigin(0);
    const panel = this.scene.add.rectangle(centerX, height / 2, panelWidth, panelHeight, 0x171c23)
      .setStrokeStyle(2, 0x4ecdc4, 0.9);
    const title = this.scene.add.text(centerX, top + 34, 'Paused', this.titleStyle(30)).setOrigin(0.5);
    const hero = this.scene.add.text(centerX, top + 76,
      `${character.displayName}  |  Level ${stats.level}  |  Act ${state.currentAct} Round ${state.currentRound}`, this.textStyle(16, '#ffd166')).setOrigin(0.5);

    const contentWidth = panelWidth - 64;
    const columnWidth = contentWidth / (narrow ? 2 : 3);
    const left = centerX - contentWidth / 2;
    const core = this.createSection(left, top + 116, columnWidth, 'Core Stats', [
      `HP: ${Math.ceil(stats.currentHp)} / ${stats.maxHp}`,
      ...formatStatLines(stats, statSections.core),
    ]);
    const combat = this.createSection(left + columnWidth, top + 116, columnWidth, 'Combat Stats', formatStatLines(stats, statSections.combat));
    const utility = this.createSection(narrow ? left : left + columnWidth * 2, narrow ? top + 350 : top + 116, columnWidth, 'Utility Stats', [
      ...formatStatLines(stats, statSections.utility),
      `Gold: ${state.gold}`,
    ]);

    const blessingLines = this.getBlessingLines(state);
    const build = this.createSection(narrow ? left + columnWidth : left, top + 350, narrow ? columnWidth : contentWidth * 0.55, 'Current Build', [
      `Weapon: ${weapon.displayName}  Level ${state.weaponLevel}`,
      ...blessingLines,
    ]);
    const status = this.createSection(narrow ? left : left + contentWidth * 0.58, narrow ? top + 530 : top + 350, narrow ? contentWidth : contentWidth * 0.42, 'Status Effects',
      state.temporaryStatModifiers.length > 0 ? state.temporaryStatModifiers.map((modifier) => modifier.id) : ['None']);

    const buttonY = top + panelHeight - (narrow ? 84 : 48);
    this.buttons = [
      new MenuButton(this.scene, narrow ? centerX : centerX - 125, buttonY, 'Resume', this.onResume, () => this.select(0)),
      new MenuButton(this.scene, narrow ? centerX : centerX + 125, narrow ? buttonY + 58 : buttonY, 'Main Menu', this.onMainMenu, () => this.select(1)),
    ];
    this.container = this.scene.add.container(0, 0, [overlay, panel, title, hero, core, combat, utility, build, status, ...this.buttons]).setDepth(110);
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

  resize(): void { if (this.container) this.show(); }

  private createSection(x: number, y: number, width: number, title: string, lines: string[]): Phaser.GameObjects.Container {
    const heading = this.scene.add.text(0, 0, title, this.titleStyle(17));
    const body = this.scene.add.text(0, 30, lines.join('\n'), {
      ...this.textStyle(14), fixedWidth: width - 16, lineSpacing: 7,
    });
    return this.scene.add.container(x, y, [heading, body]);
  }

  private getBlessingLines(state: RunState): string[] {
    if (state.blessings.length === 0) return ['Blessings: None'];
    const gods = ['Jupiter', 'Mars', 'Neptune'] as const;
    return gods.flatMap((god) => {
      const ids = state.blessings.filter((id) => blessingDefinitions[id].god === god);
      if (ids.length === 0) return [];
      const counts = new Map<string, number>();
      ids.forEach((id) => counts.set(blessingDefinitions[id].displayName, (counts.get(blessingDefinitions[id].displayName) ?? 0) + 1));
      return [`${god}: ${[...counts].map(([name, count]) => `${name}${count > 1 ? ` x${count}` : ''}`).join(', ')}`];
    });
  }

  private registerKeyboard(): void {
    this.scene.input.keyboard?.on('keydown-UP', this.previous, this);
    this.scene.input.keyboard?.on('keydown-DOWN', this.next, this);
    this.scene.input.keyboard?.on('keydown-LEFT', this.previous, this);
    this.scene.input.keyboard?.on('keydown-RIGHT', this.next, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.confirm, this);
    this.scene.input.keyboard?.on('keydown-SPACE', this.confirm, this);
  }
  private unregisterKeyboard(): void {
    this.scene.input.keyboard?.off('keydown-UP', this.previous, this);
    this.scene.input.keyboard?.off('keydown-DOWN', this.next, this);
    this.scene.input.keyboard?.off('keydown-LEFT', this.previous, this);
    this.scene.input.keyboard?.off('keydown-RIGHT', this.next, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.confirm, this);
    this.scene.input.keyboard?.off('keydown-SPACE', this.confirm, this);
  }
  private select(index: number): void { this.selectedIndex = Phaser.Math.Wrap(index, 0, this.buttons.length); this.updateSelection(); }
  private previous(): void { this.select(this.selectedIndex - 1); }
  private next(): void { this.select(this.selectedIndex + 1); }
  private updateSelection(): void { this.buttons.forEach((button, index) => button.setSelected(index === this.selectedIndex)); }
  private confirm(): void { this.buttons[this.selectedIndex]?.select(); }
  private textStyle(fontSize: number, color = '#dbe4ee'): Phaser.Types.GameObjects.Text.TextStyle {
    return { color, fontFamily: 'Inter, Arial, sans-serif', fontSize: `${fontSize}px`, fontStyle: '700' };
  }
  private titleStyle(fontSize: number): Phaser.Types.GameObjects.Text.TextStyle {
    return { color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', fontSize: `${fontSize}px`, fontStyle: '900' };
  }
}
