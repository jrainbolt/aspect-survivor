import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import { blessingDefinitions } from '../game/data/blessings';
import { weaponDefinitions } from '../game/data/weapons';
import type { RunState } from '../game/types';
import { getBlessingRank } from '../game/data/blessingRanks';

export class Hud {
  private readonly hpBar: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly xpBar: Phaser.GameObjects.Rectangle;
  private readonly xpFill: Phaser.GameObjects.Rectangle;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly objectiveText: Phaser.GameObjects.Text;
  private readonly runText: Phaser.GameObjects.Text;
  private readonly bossBar: Phaser.GameObjects.Rectangle;
  private readonly bossFill: Phaser.GameObjects.Rectangle;
  private readonly bossText: Phaser.GameObjects.Text;
  private readonly weaponText: Phaser.GameObjects.Text;
  private readonly blessingText: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene, private readonly player: Player) {
    this.hpBar = scene.add.rectangle(20, 20, 260, 18, 0x2f3542).setOrigin(0).setScrollFactor(0).setDepth(50);
    this.hpFill = scene.add.rectangle(20, 20, 260, 18, 0xef476f).setOrigin(0).setScrollFactor(0).setDepth(51);
    this.hpText = scene.add.text(28, 20, '', this.textStyle(12)).setDepth(52);
    this.xpBar = scene.add.rectangle(20, 46, 260, 12, 0x2f3542).setOrigin(0).setScrollFactor(0).setDepth(50);
    this.xpFill = scene.add.rectangle(20, 46, 0, 12, 0x118ab2).setOrigin(0).setScrollFactor(0).setDepth(51);
    this.levelText = scene.add.text(300, 16, '', this.textStyle(18)).setScrollFactor(0).setDepth(51);
    this.objectiveText = scene.add.text(scene.scale.width - 20, 16, '', this.textStyle(18)).setOrigin(1, 0).setScrollFactor(0).setDepth(51);
    this.runText = scene.add.text(scene.scale.width - 20, 44, '', this.textStyle(13)).setOrigin(1, 0).setScrollFactor(0).setDepth(51);
    this.bossBar = scene.add.rectangle(scene.scale.width / 2 - 210, 78, 420, 14, 0x2f3542).setOrigin(0).setDepth(50).setVisible(false);
    this.bossFill = scene.add.rectangle(scene.scale.width / 2 - 210, 78, 420, 14, 0x9b5de5).setOrigin(0).setDepth(51).setVisible(false);
    this.bossText = scene.add.text(scene.scale.width / 2, 98, 'ACT GUARDIAN', this.textStyle(13)).setOrigin(0.5).setDepth(51).setVisible(false);
    this.weaponText = scene.add.text(20, scene.scale.height - 48, '', this.textStyle(14)).setDepth(51);
    this.blessingText = scene.add.text(20, scene.scale.height - 26, '', this.textStyle(12)).setDepth(51);
  }

  update(state: RunState, boss?: Enemy, enemiesAlive = 0, bossPhase = ''): void {
    const narrow = this.scene.scale.width < 600;
    const barWidth = narrow ? Math.max(170, this.scene.scale.width - 150) : 260;
    this.hpBar.width = barWidth;
    this.xpBar.width = barWidth;
    this.hpFill.width = barWidth * Phaser.Math.Clamp(this.player.stats.currentHp / this.player.stats.maxHp, 0, 1);
    this.xpFill.width = barWidth * Phaser.Math.Clamp(this.player.stats.xp / this.player.stats.xpToNextLevel, 0, 1);
    this.levelText.setText(`LV ${this.player.stats.level}`);
    this.hpText.setText(`${Math.ceil(this.player.stats.currentHp)} / ${this.player.stats.maxHp}`);
    this.levelText.setPosition(narrow ? 20 : 300, narrow ? 66 : 16);
    this.objectiveText.setText(state.roundType === 'boss'
      ? 'DEFEAT THE ACT GUARDIAN'
      : `DEFEATED ${state.enemiesDefeatedThisRound} / ${state.enemiesTargetThisRound}`);
    this.runText.setText(state.roundType === 'boss'
      ? `ACT ${state.currentAct}  BOSS ROUND  GOLD ${state.gold}`
      : `ALIVE ${enemiesAlive}  ·  ACT ${state.currentAct} ROUND ${state.currentRound}  ·  GOLD ${state.gold}`);
    this.objectiveText.setX(this.scene.scale.width - 20);
    this.runText.setX(this.scene.scale.width - 20);

    const showBoss = Boolean(boss?.active);
    const bossWidth = Math.min(420, this.scene.scale.width - 40);
    this.bossBar.width = bossWidth;
    this.bossBar.setVisible(showBoss);
    this.bossFill.setVisible(showBoss);
    this.bossText.setVisible(showBoss);
    this.bossText.setText(bossPhase ? `ACT GUARDIAN  ·  ${bossPhase}` : 'ACT GUARDIAN');
    if (boss) this.bossFill.width = bossWidth * Phaser.Math.Clamp(boss.stats.hp / boss.stats.maxHp, 0, 1);
    this.bossBar.setX(this.scene.scale.width / 2 - bossWidth / 2);
    this.bossFill.setX(this.scene.scale.width / 2 - bossWidth / 2);
    this.bossText.setX(this.scene.scale.width / 2);
    this.weaponText.setText(`${weaponDefinitions[state.weaponId].displayName}  LV ${state.weaponLevel}`);
    this.weaponText.setY(this.scene.scale.height - 48);
    this.blessingText.setText(this.formatBlessings(state));
    this.blessingText.setY(this.scene.scale.height - 26);
  }

  private formatBlessings(state: RunState): string {
    if (state.blessings.length === 0) return 'Blessings: None';
    const names: string[] = [];
    for (const id of new Set(state.blessings)) {
      const blessing = blessingDefinitions[id];
      names.push(`${blessing.god} ${blessing.displayName} ${this.roman(getBlessingRank(state.blessings, id))}`);
    }
    return names.join('  |  ');
  }

  private roman(rank: number): string { return ['I', 'II', 'III'][rank - 1] ?? String(rank); }

  private textStyle(fontSize: number): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color: '#f8f9fa',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: `${fontSize}px`,
      fontStyle: '700',
      stroke: '#111418',
      strokeThickness: 4,
    };
  }
}
