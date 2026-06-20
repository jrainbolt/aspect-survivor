import Phaser from 'phaser';
import { characterDefinitions } from '../game/data/characters';
import { DamageTracker } from '../game/systems/DamageTracker';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { RunStateSystem } from '../game/systems/RunStateSystem';
import { SaveSystem } from '../game/systems/SaveSystem';
import type { RunState } from '../game/types';
import { MenuButton } from '../ui/MenuButton';
import { PortraitFrame } from '../game/ui/PortraitFrame';
import { specializationCatalog } from '../game/data/specializationCatalog';
import { SpecializationSystem } from '../game/systems/SpecializationSystem';

export class RunSummaryScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;
  private state!: RunState;

  constructor() { super('RunSummaryScene'); }

  create(): void {
    this.buttons = [];
    this.selectedIndex = 0;
    FullscreenSystem.install(this);
    this.state = RunStateSystem.get(this.registry);
    const { newRecords } = SaveSystem.recordRun(this.state);
    const stats = this.state.runStats;
    const hero = characterDefinitions[this.state.characterId];
    const topDamage = new DamageTracker(this.state).getTopSources(5);
    const { width, height } = this.scale;
    const centerX = width / 2;
    const narrow = width < 760;

    this.add.rectangle(0, 0, width, height, 0x111418).setOrigin(0);
    if (this.state.result === 'act-complete') {
      this.add.rectangle(centerX, 49, Math.min(560, width - 30), 76, 0x352d1b, 0.6).setStrokeStyle(2, 0xd8ad55, 0.8);
      this.add.line(0, 0, centerX - 280, 49, centerX - 105, 49, 0xd8ad55, 0.8).setOrigin(0);
      this.add.line(0, 0, centerX + 105, 49, centerX + 280, 49, 0xd8ad55, 0.8).setOrigin(0);
    }
    this.add.text(centerX, 44, this.state.result === 'act-complete' ? 'Act 1 Complete' : 'Run Summary', {
      color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '34px', fontStyle: '900',
    }).setOrigin(0.5);
    if (this.state.result === 'act-complete') {
      this.add.text(centerX, 69, 'THE ACT GUARDIAN HAS FALLEN', {
        color: '#d8ad55', fontFamily: 'Inter, Arial, sans-serif', fontSize: '11px', fontStyle: '800',
      }).setOrigin(0.5);
    }
    this.add.text(centerX, 84, hero.displayName, {
      color: '#ffd166', fontFamily: 'Inter, Arial, sans-serif', fontSize: '18px', fontStyle: '900',
    }).setOrigin(0.5);
    this.add.text(centerX, 108, this.state.specializationId
      ? `${specializationCatalog[this.state.specializationId].displayName} ${this.roman(this.state.specializationLevel)}` : 'No Specialization', {
      color: '#9aa6b2', fontFamily: 'Inter, Arial, sans-serif', fontSize: '13px', fontStyle: '800',
    }).setOrigin(0.5);
    new PortraitFrame(this, narrow ? 66 : centerX - 250, 78, this.state.characterId, 78);

    const leftX = narrow ? 16 : centerX - Math.min(330, width * 0.27);
    const rightX = narrow ? centerX + 8 : centerX + Math.min(120, width * 0.1);
    const columnWidth = narrow ? centerX - 24 : Math.min(360, width * 0.36);
    this.add.text(leftX, 130, 'Run Statistics', this.headingStyle()).setOrigin(0, 0);
    this.add.text(leftX, 166, [
      `Time Survived: ${this.formatTime(stats.totalSurvivalTime)}`,
      `Outcome: ${stats.victoryStatus === 'act1_complete' ? 'Act 1 Victory' : 'Fallen'}`,
      `Level Reached: ${stats.levelReached}`,
      `Enemies Defeated: ${stats.enemiesDefeated}`,
      `Bosses Defeated: ${stats.bossesDefeated}`,
      `Gold Earned: ${stats.goldEarned}`,
      `Rounds Cleared: ${stats.roundsCleared}`,
      `Clear Times: ${stats.roundClearTimes.map((time) => this.formatTime(time)).join(' / ') || 'None'}`,
      `Highest Act: ${stats.highestActReached}`,
      `Damage Taken: ${Math.round(stats.damageTaken)}`,
      `Healing Received: ${Math.round(stats.healingReceived)}`,
      `Blessings Chosen: ${stats.blessingsChosen}`,
    ].join('\n'), { ...this.bodyStyle(), fixedWidth: columnWidth }).setOrigin(0, 0);

    this.add.text(rightX, 130, 'Top Damage Sources', this.headingStyle()).setOrigin(0, 0);
    this.add.text(rightX, 166, topDamage.length > 0
      ? topDamage.map((source, index) => `${index + 1}. ${source.sourceName}: ${Math.round(source.amount)} (${source.damageType})`).join('\n')
      : 'No damage recorded', { ...this.bodyStyle(), fixedWidth: columnWidth, wordWrap: { width: columnWidth } }).setOrigin(0, 0);

    this.add.text(rightX, 330, 'Records', this.headingStyle()).setOrigin(0, 0);
    this.add.text(rightX, 366, newRecords.length > 0
      ? newRecords.map((record) => `NEW: ${record}`).join('\n')
      : 'No new records', { ...this.bodyStyle(), fixedWidth: columnWidth, wordWrap: { width: columnWidth }, color: newRecords.length > 0 ? '#ffd166' : '#9aa6b2' }).setOrigin(0, 0);

    const buttonY = height - (narrow ? 170 : 62);
    const positions = narrow ? [buttonY, buttonY + 58, buttonY + 116] : [buttonY, buttonY, buttonY];
    const xPositions = narrow ? [centerX, centerX, centerX] : [centerX - 240, centerX, centerX + 240];
    this.buttons = [
      new MenuButton(this, xPositions[0], positions[0], 'Retry', () => this.retry(), () => this.select(0)),
      new MenuButton(this, xPositions[1], positions[1], 'Character Select', () => this.scene.start('CharacterSelectScene'), () => this.select(1)),
      new MenuButton(this, xPositions[2], positions[2], 'Main Menu', () => this.scene.start('MainMenuScene'), () => this.select(2)),
    ];
    this.updateSelection();
    this.input.keyboard?.on('keydown-LEFT', this.previous, this);
    this.input.keyboard?.on('keydown-UP', this.previous, this);
    this.input.keyboard?.on('keydown-RIGHT', this.next, this);
    this.input.keyboard?.on('keydown-DOWN', this.next, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.on('keydown-SPACE', this.confirm, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private retry(): void {
    const nextState = RunStateSystem.create(this.state.characterId);
    if (this.state.specializationId) SpecializationSystem.choose(nextState, this.state.specializationId);
    RunStateSystem.set(this.registry, nextState);
    this.scene.start('GameScene');
  }
  private select(index: number): void { this.selectedIndex = Phaser.Math.Wrap(index, 0, this.buttons.length); this.updateSelection(); }
  private previous(): void { this.select(this.selectedIndex - 1); }
  private next(): void { this.select(this.selectedIndex + 1); }
  private updateSelection(): void { this.buttons.forEach((button, index) => button.setSelected(index === this.selectedIndex)); }
  private confirm(): void { this.buttons[this.selectedIndex]?.select(); }
  private cleanup(): void {
    this.input.keyboard?.off('keydown-LEFT', this.previous, this);
    this.input.keyboard?.off('keydown-UP', this.previous, this);
    this.input.keyboard?.off('keydown-RIGHT', this.next, this);
    this.input.keyboard?.off('keydown-DOWN', this.next, this);
    this.input.keyboard?.off('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.off('keydown-SPACE', this.confirm, this);
  }
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  }
  private roman(rank: number): string { return ['I', 'II', 'III'][rank - 1] ?? String(rank); }
  private headingStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '18px', fontStyle: '900' };
  }
  private bodyStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { color: '#dbe4ee', fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px', fontStyle: '700', lineSpacing: 8 };
  }
}
