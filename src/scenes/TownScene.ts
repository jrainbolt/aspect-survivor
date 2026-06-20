import Phaser from 'phaser';
import { blessingDefinitions } from '../game/data/blessings';
import { characterDefinitions } from '../game/data/characters';
import { weaponDefinitions } from '../game/data/weapons';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { RunStateSystem } from '../game/systems/RunStateSystem';
import type { RunState } from '../game/types';
import { createDivider } from '../game/ui/Divider';
import { FantasyPanel } from '../game/ui/FantasyPanel';
import { FantasyTheme, fantasyText } from '../game/ui/FantasyTheme';
import { PortraitFrame } from '../game/ui/PortraitFrame';
import { createStatRows } from '../game/ui/StatRows';
import { MenuButton } from '../ui/MenuButton';
import { WeaponCard } from '../game/ui/WeaponCard';
import { specializations, specializationDefinitions } from '../game/data/specializations';
import { SpecializationSystem } from '../game/systems/SpecializationSystem';
import { merchantItems } from '../game/data/merchantItems';
import { MerchantSystem } from '../game/systems/MerchantSystem';
import { getBlessingRank } from '../game/data/blessingRanks';
import { CombatTextSystem } from '../game/systems/CombatTextSystem';
import { AudioSystem } from '../game/systems/AudioSystem';
import { getRoundDefinition } from '../game/data/rounds';

interface TownSceneData { feedback?: string; healing?: number; }
const TOWN_SELECTION_KEY = 'town-selected-index';

export class TownScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;
  private statusText!: Phaser.GameObjects.Text;
  private state!: RunState;
  private feedback = '';
  private healing = 0;
  private readonly audio = new AudioSystem();
  private blessingButton?: MenuButton;

  constructor() { super('TownScene'); }

  init(data: TownSceneData): void { this.feedback = data.feedback ?? ''; this.healing = data.healing ?? 0; }

  create(): void {
    this.buttons = [];
    this.blessingButton = undefined;
    this.selectedIndex = Number(this.registry.get(TOWN_SELECTION_KEY) ?? 0);
    FullscreenSystem.install(this);
    this.state = RunStateSystem.get(this.registry);
    const { width, height } = this.scale;
    const wide = width >= 850;
    this.drawBackground(width, height);

    this.add.text(width / 2, 38, 'THE EMBER REFUGE', fantasyText(30, '#f5ead3', '900')).setOrigin(0.5);
    const nextLabel = this.state.currentRound >= 3 ? 'the Act Guardian' : `Round ${this.state.currentRound + 1}`;
    this.add.text(width / 2, 72, `Round ${this.state.currentRound} cleared · Prepare for ${nextLabel}`, fantasyText(14, FantasyTheme.muted)).setOrigin(0.5);

    if (wide) {
      const gap = 20;
      const totalWidth = Math.min(1120, width - 40);
      const leftWidth = totalWidth * 0.39;
      const rightWidth = totalWidth - leftWidth - gap;
      const panelHeight = Math.min(650, height - 120);
      const leftX = width / 2 - totalWidth / 2 + leftWidth / 2;
      const rightX = leftX + leftWidth / 2 + gap + rightWidth / 2;
      this.drawHeroPanel(leftX, 98 + panelHeight / 2, leftWidth, panelHeight);
      this.drawChoicePanel(rightX, 98 + panelHeight / 2, rightWidth, panelHeight);
    } else {
      const panelWidth = width - 24;
      this.drawHeroPanel(width / 2, 238, panelWidth, 280);
      this.drawChoicePanel(width / 2, 568, panelWidth, 340);
    }

    this.updateAvailability();
    this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex, 0, Math.max(0, this.buttons.length - 1));
    this.updateSelection();
    this.statusText.setText(this.feedback || this.getPreparationSummary());
    if (this.healing > 0) new CombatTextSystem(this).healing(width * (wide ? 0.2 : 0.5), wide ? 235 : 210, this.healing);
    this.input.keyboard?.on('keydown-UP', this.previous, this);
    this.input.keyboard?.on('keydown-DOWN', this.next, this);
    this.input.keyboard?.on('keydown-LEFT', this.previous, this);
    this.input.keyboard?.on('keydown-RIGHT', this.next, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.on('keydown-SPACE', this.confirm, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private drawBackground(width: number, height: number): void {
    this.add.rectangle(0, 0, width, height, FantasyTheme.background).setOrigin(0);
    for (let index = 0; index < 9; index += 1) {
      const ember = this.add.circle(Phaser.Math.Between(0, width), height + 10, Phaser.Math.Between(1, 3), 0xee964b, 0.45);
      this.tweens.add({ targets: ember, y: Phaser.Math.Between(40, height * 0.6), x: ember.x + Phaser.Math.Between(-50, 50), alpha: 0,
        duration: Phaser.Math.Between(3500, 6500), repeat: -1, delay: Phaser.Math.Between(0, 2500) });
    }
  }

  private drawHeroPanel(x: number, y: number, width: number, height: number): void {
    new FantasyPanel(this, x, y, width, height, 'Wayfarer');
    const stats = this.state.playerStats;
    const hero = characterDefinitions[this.state.characterId];
    const top = y - height / 2;
    if (height < 400) {
      new PortraitFrame(this, x - width / 2 + 58, top + 72, this.state.characterId, 68);
      this.add.text(x - width / 2 + 108, top + 58, hero.displayName, fantasyText(21, '#ffffff', '900')).setOrigin(0, 0.5);
      this.add.text(x - width / 2 + 108, top + 86, `LV ${stats.level} · ACT ${this.state.currentAct} · ROUND ${this.state.currentRound}`, fantasyText(12, '#d8ad55', '900')).setOrigin(0, 0.5);
      const hpWidth = width - 48;
      this.add.rectangle(x, top + 126, hpWidth, 13, 0x35262a);
      this.add.rectangle(x - hpWidth / 2, top + 126, hpWidth * stats.currentHp / stats.maxHp, 13, 0xb84555).setOrigin(0, 0.5);
      this.add.text(x, top + 126, `${Math.ceil(stats.currentHp)} / ${stats.maxHp} HP`, fantasyText(10, '#ffffff', '900')).setOrigin(0.5);
      const compactRows = [`DMG ${stats.damage.toFixed(2)}x`, `ARM ${Math.round(stats.armor)}`, `ATK ${stats.attackSpeed.toFixed(2)}x`, `MOVE ${Math.round(stats.moveSpeed)}`, `GOLD ${this.state.gold}`];
      this.add.text(x, top + 158, compactRows.join('  ·  '), { ...fantasyText(12, '#ddd5c7', '900'), fixedWidth: width - 36, align: 'center', wordWrap: { width: width - 40 } }).setOrigin(0.5, 0);
      this.add.text(x, top + 207, `${weaponDefinitions[this.state.weaponId].displayName}  ·  Level ${this.state.weaponLevel}`, fantasyText(14, '#f5ead3', '900')).setOrigin(0.5);
      const blessingNames = [...new Set(this.state.blessings)].map((id) => `${blessingDefinitions[id].displayName} ${this.roman(getBlessingRank(this.state.blessings, id))}`).join(' · ') || 'No divine favors';
      this.add.text(x, top + 238, blessingNames, { ...fantasyText(12, FantasyTheme.muted), fixedWidth: width - 36, align: 'center' }).setOrigin(0.5);
      return;
    }
    new PortraitFrame(this, x, top + 105, this.state.characterId, 112);
    this.add.text(x, top + 176, hero.displayName, fantasyText(25, '#ffffff', '900')).setOrigin(0.5);
    this.add.text(x, top + 207, `LEVEL ${stats.level}  ·  ACT ${this.state.currentAct}  ·  ROUND ${this.state.currentRound}`, fantasyText(13, '#d8ad55', '900')).setOrigin(0.5);

    const hpWidth = Math.min(width - 70, 310);
    this.add.rectangle(x, top + 238, hpWidth, 15, 0x35262a).setStrokeStyle(1, 0x6c3a43);
    this.add.rectangle(x - hpWidth / 2, top + 238, hpWidth * stats.currentHp / stats.maxHp, 15, 0xb84555).setOrigin(0, 0.5);
    this.add.text(x, top + 238, `${Math.ceil(stats.currentHp)} / ${stats.maxHp} HP`, fantasyText(11, '#ffffff', '900')).setOrigin(0.5);
    createDivider(this, x, top + 270, width - 60);

    const rows = [
      { label: 'Damage', value: `${stats.damage.toFixed(2)}x` }, { label: 'Armor', value: `${Math.round(stats.armor)}` },
      { label: 'Attack Speed', value: `${stats.attackSpeed.toFixed(2)}x` }, { label: 'Move Speed', value: `${Math.round(stats.moveSpeed)}` },
      { label: 'Gold', value: `${this.state.gold}` },
    ];
    createStatRows(this, x - width / 2 + 34, top + 295, width - 68, rows);
    const buildY = top + 420;
    createDivider(this, x, buildY - 12, width - 60);
    this.add.text(x - width / 2 + 34, buildY + 5, `SPECIALIZATION  ·  ${this.state.specializationId ? `${specializationDefinitions[this.state.specializationId].displayName} ${this.roman(this.state.specializationLevel)}` : 'Unchosen'}`, fantasyText(12, '#d8ad55', '900')).setOrigin(0, 0.5);
    new WeaponCard(this, x, buildY + 86, width - 54, this.state);
    this.drawBlessings(x - width / 2 + 34, buildY + 166, width - 68);
  }

  private drawBlessings(x: number, y: number, width: number): void {
    this.add.text(x, y, 'DIVINE FAVORS', fantasyText(12, '#d8ad55', '900')).setOrigin(0, 0.5);
    if (this.state.blessings.length === 0) {
      this.add.text(x, y + 26, 'No favors claimed', fantasyText(13, FantasyTheme.muted)).setOrigin(0, 0.5);
      return;
    }
    const grouped = new Map<string, string[]>();
    [...new Set(this.state.blessings)].forEach((id) => {
      const blessing = blessingDefinitions[id];
      grouped.set(blessing.god, [...(grouped.get(blessing.god) ?? []), `${blessing.displayName} ${this.roman(getBlessingRank(this.state.blessings, id))}`]);
    });
    [...grouped].slice(0, 3).forEach(([god, names], index) => {
      const definition = blessingDefinitions[this.state.blessings.find((id) => blessingDefinitions[id].god === god)!];
      this.add.circle(x + 7, y + 29 + index * 24, 7, definition.color, 0.3).setStrokeStyle(1, definition.color);
      this.add.text(x + 22, y + 29 + index * 24, `${god}: ${names.join(', ')}`, {
        ...fantasyText(13, '#ddd5c7'), fixedWidth: width - 24,
      }).setOrigin(0, 0.5);
    });
  }

  private drawChoicePanel(x: number, y: number, width: number, height: number): void {
    new FantasyPanel(this, x, y, width, height, 'Camp Decisions');
    const top = y - height / 2;
    const compact = height < 500;
    this.buttons = [];
    const trainingY = top + (compact ? 72 : 110);
    this.add.rectangle(x, trainingY, width - 34, compact ? 48 : 112, 0x111720, 0.55).setStrokeStyle(1, 0x65522f, 0.65);
    this.add.text(x, top + (compact ? 47 : 57), 'WEAPON SPECIALIZATION', fantasyText(12, '#d8ad55', '900')).setOrigin(0.5);
    if (this.state.characterId === 'paladin' && !this.state.specializationId) {
      const specWidth = compact ? (width - 44) / 3 : Math.min(190, (width - 64) / 3);
      specializations.forEach((specialization, index) => {
        const buttonIndex = this.buttons.length;
        const specX = x + (index - 1) * (specWidth + 8);
        this.buttons.push(new MenuButton(this, specX, trainingY + (compact ? 5 : 0), specialization.displayName,
          () => this.chooseSpecialization(specialization.id), () => this.select(buttonIndex),
          { width: specWidth, height: compact ? 36 : 76, subtitle: compact ? undefined : specialization.choiceSummary, accent: specialization.color }));
      });
    } else if (this.state.specializationId && this.state.specializationLevel < SpecializationSystem.maxLevel) {
      const specialization = specializationDefinitions[this.state.specializationId];
      this.add.text(x, top + (compact ? 58 : 78), `CURRENT PATH  ·  ${specialization.displayName} ${this.roman(this.state.specializationLevel)}`,
        fantasyText(12, `#${specialization.color.toString(16).padStart(6, '0')}`, '900')).setOrigin(0.5);
      const buttonIndex = this.buttons.length;
      const advance = new MenuButton(this, x, trainingY + (compact ? 8 : 16), `Advance ${specialization.displayName} ${this.roman(this.state.specializationLevel + 1)}`,
        () => this.advanceSpecialization(), () => this.select(buttonIndex),
        { width: Math.min(430, width - 70), height: compact ? 34 : 58, subtitle: compact ? undefined : specialization.choiceSummary, accent: specialization.color });
      advance.setDisabled(this.state.campRewards.specialization);
      this.buttons.push(advance);
    } else {
      this.add.text(x, trainingY + 4, `PATH MASTERED  ·  ${this.state.specializationId ? `${specializationDefinitions[this.state.specializationId].displayName} ${this.roman(this.state.specializationLevel)}` : 'Standard Armament'}`,
        fantasyText(14, '#d8ad55', '900')).setOrigin(0.5);
    }

    const blessingHeaderY = top + (compact ? 110 : 180);
    createDivider(this, x, blessingHeaderY - 13, width - 52);
    this.add.text(x, blessingHeaderY, 'DIVINE FAVOR', fantasyText(12, '#d8ad55', '900')).setOrigin(0.5);
    const blessingIndex = this.buttons.length;
    this.blessingButton = new MenuButton(this, x, top + (compact ? 132 : 213), 'Seek Divine Favor', () => this.chooseBlessing(), () => this.select(blessingIndex),
      { width: Math.min(430, width - 70), height: compact ? 32 : 54, subtitle: compact ? undefined : 'Choose or rank up one blessing', accent: 0x9b7ede });
    this.buttons.push(this.blessingButton);

    const merchantTop = top + (compact ? 164 : 268);
    createDivider(this, x, merchantTop - 13, width - 52);
    this.add.text(x, merchantTop, `SUPPLY SHOP  ·  ${this.state.gold} GOLD`, fantasyText(12, '#d8ad55', '900')).setOrigin(0.5);
    const columnWidth = Math.min(275, (width - 58) / 2);
    merchantItems.forEach((item, index) => {
      const buttonIndex = this.buttons.length;
      const price = MerchantSystem.getPrice(item, this.state);
      const column = index % 2;
      const row = Math.floor(index / 2);
      const itemX = x + (column === 0 ? -(columnWidth + 7) / 2 : (columnWidth + 7) / 2);
      const button = new MenuButton(this, itemX, merchantTop + (compact ? 20 : 37) + row * (compact ? 32 : 58), `${item.displayName}  ·  ${price}g`,
        () => this.purchase(item.id), () => this.select(buttonIndex), { width: columnWidth, height: compact ? 28 : 48, subtitle: compact ? undefined : item.description, accent: item.color });
      button.setDisabled(this.state.gold < price || (item.id === 'heal' && this.state.playerStats.currentHp >= this.state.playerStats.maxHp));
      this.buttons.push(button);
    });

    const continueHeaderY = top + (compact ? 280 : 483);
    createDivider(this, x, continueHeaderY - 13, width - 52);
    this.add.text(x, continueHeaderY, 'START NEXT ROUND', fantasyText(12, '#d8ad55', '900')).setOrigin(0.5);
    const continueIndex = this.buttons.length;
    const nextRound = getRoundDefinition(this.state.currentAct, this.state.currentRound + 1);
    const nextObjective = nextRound ? `Face ${nextRound.totalEnemyCount} enemies` : 'Challenge the Act Guardian';
    this.buttons.push(new MenuButton(this, x, top + (compact ? 302 : 520), 'Venture Onward', () => this.continueRun(), () => this.select(continueIndex),
      { width: Math.min(430, width - 70), height: compact ? 32 : 56, subtitle: compact ? undefined : nextObjective, accent: 0x4ecdc4 }));
    this.statusText = this.add.text(x, top + (compact ? height - 10 : height - 36), '', {
      ...fantasyText(compact ? 10 : 13, '#d8ad55', '900'), fixedWidth: width - 52, align: 'center',
    }).setOrigin(0.5);
  }

  private purchase(id: Parameters<typeof MerchantSystem.purchase>[1]): void {
    const result = MerchantSystem.purchase(this.state, id);
    if (!result.success) { this.statusText.setText(result.message); return; }
    this.audio.playTownPurchase();
    this.scene.restart({ feedback: result.message, healing: result.healing ?? 0 });
  }

  private chooseSpecialization(id: Parameters<typeof SpecializationSystem.choose>[1]): void {
    if (!SpecializationSystem.choose(this.state, id)) return;
    this.audio.playTownPurchase();
    this.state.campRewards.specialization = true;
    this.scene.restart({ feedback: `${specializationDefinitions[id].displayName} path chosen.` });
  }

  private advanceSpecialization(): void {
    if (!this.state.specializationId || this.state.campRewards.specialization || !SpecializationSystem.upgrade(this.state)) return;
    this.audio.playTownPurchase();
    this.state.campRewards.specialization = true;
    const specialization = specializationDefinitions[this.state.specializationId];
    this.scene.restart({ feedback: `${specialization.displayName} advanced to ${this.roman(this.state.specializationLevel)}.` });
  }

  private chooseBlessing(): void {
    if (this.state.campRewards.blessing) { this.statusText.setText('A divine favor was already chosen here.'); return; }
    this.scene.start('BlessingScene', { returnScene: 'TownScene', major: false });
  }

  private continueRun(): void { this.audio.playTownPurchase(); RunStateSystem.prepareNextRound(this.state); this.scene.start('GameScene'); }
  private updateAvailability(): void {
    this.blessingButton?.setDisabled(this.state.campRewards.blessing);
  }
  private select(index: number): void {
    this.selectedIndex = Phaser.Math.Wrap(index, 0, this.buttons.length);
    this.registry.set(TOWN_SELECTION_KEY, this.selectedIndex);
    this.updateSelection();
  }
  private previous(): void { this.select(this.selectedIndex - 1); }
  private next(): void { this.select(this.selectedIndex + 1); }
  private updateSelection(): void { this.buttons.forEach((button, index) => button.setSelected(index === this.selectedIndex)); }
  private confirm(): void { this.buttons[this.selectedIndex]?.select(); }
  private roman(rank: number): string { return ['I', 'II', 'III'][rank - 1] ?? String(rank); }
  private getPreparationSummary(): string {
    const hpPercent = Math.round(this.state.playerStats.currentHp / this.state.playerStats.maxHp * 100);
    const favor = this.state.campRewards.blessing ? 'Favor claimed' : 'Divine favor available';
    return `${favor}  ·  HP ${hpPercent}%  ·  Weapon level ${this.state.weaponLevel}`;
  }
  private cleanup(): void {
    this.input.keyboard?.off('keydown-UP', this.previous, this);
    this.input.keyboard?.off('keydown-DOWN', this.next, this);
    this.input.keyboard?.off('keydown-LEFT', this.previous, this);
    this.input.keyboard?.off('keydown-RIGHT', this.next, this);
    this.input.keyboard?.off('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.off('keydown-SPACE', this.confirm, this);
  }
}
