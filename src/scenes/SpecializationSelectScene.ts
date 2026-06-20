import Phaser from 'phaser';
import { characterDefinitions } from '../game/data/characters';
import { getSpecializationsForCharacter } from '../game/data/specializationCatalog';
import { weaponDefinitions } from '../game/data/weapons';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { RunStateSystem } from '../game/systems/RunStateSystem';
import { SpecializationSystem } from '../game/systems/SpecializationSystem';
import { PortraitFrame } from '../game/ui/PortraitFrame';
import { FantasyTheme, fantasyText } from '../game/ui/FantasyTheme';

export class SpecializationSelectScene extends Phaser.Scene {
  private cards: Phaser.GameObjects.Rectangle[] = [];
  private selectedIndex = 0;

  constructor() { super('SpecializationSelectScene'); }

  create(): void {
    this.cards = [];
    this.selectedIndex = 0;
    FullscreenSystem.install(this);
    const state = RunStateSystem.get(this.registry);
    const hero = characterDefinitions[state.characterId];
    const choices = getSpecializationsForCharacter(state.characterId);
    const { width, height } = this.scale;
    const stacked = width < 600 && height >= 650;
    const narrowHeader = width < 600;

    this.add.rectangle(0, 0, width, height, FantasyTheme.background).setOrigin(0);
    this.add.text(width / 2, 34, 'CHOOSE YOUR PATH', fantasyText(30, '#f5ead3', '900')).setOrigin(0.5);
    const portraitX = narrowHeader ? width / 2 - 108 : width / 2 - 170;
    const heroTextX = narrowHeader ? width / 2 - 54 : width / 2 - 112;
    new PortraitFrame(this, portraitX, 91, hero.id, 78);
    this.add.text(heroTextX, 73, hero.displayName, fantasyText(21, '#ffffff', '900')).setOrigin(0, 0.5);
    this.add.text(heroTextX, 99, `Passive: ${hero.passiveLabel}`, { ...fantasyText(12, '#f4dfad', '900'), fixedWidth: width - heroTextX - 10 }).setOrigin(0, 0.5);
    this.add.text(heroTextX, 120, `Starting weapon: ${weaponDefinitions[hero.startingWeaponId].displayName}`, { ...fantasyText(12, FantasyTheme.muted), fixedWidth: width - heroTextX - 10 }).setOrigin(0, 0.5);

    const cardWidth = stacked ? Math.min(520, width - 24) : Math.min(300, (width - 72) / Math.max(1, choices.length));
    const cardHeight = stacked ? 160 : Math.min(390, height - 210);
    const spacing = Math.min(320, width / Math.max(1, choices.length));
    choices.forEach((choice, index) => {
      const x = stacked ? width / 2 : width / 2 + (index - (choices.length - 1) / 2) * spacing;
      const y = stacked ? 230 + index * 170 : height / 2 + 75;
      const card = this.add.rectangle(x, y, cardWidth, cardHeight, FantasyTheme.panelRaised)
        .setStrokeStyle(2, choice.color).setInteractive({ useHandCursor: true });
      this.cards.push(card);
      const left = x - cardWidth / 2 + 18;
      const top = y - cardHeight / 2;
      this.add.text(left, top + 22, choice.displayName, fantasyText(21, '#ffffff', '900')).setOrigin(0, 0.5);
      this.add.text(left, top + 48, choice.description, {
        ...fantasyText(12, '#d4cec2'), fixedWidth: cardWidth - 36, wordWrap: { width: cardWidth - 42, useAdvancedWrap: true },
      }).setOrigin(0, 0);
      const detailsY = stacked ? top + 84 : top + 122;
      this.add.text(left, detailsY, `PROS  ·  ${choice.pros.join('  ·  ')}`, {
        ...fantasyText(12, '#66e39a', '900'), fixedWidth: cardWidth - 36, wordWrap: { width: cardWidth - 42 },
      }).setOrigin(0, 0);
      this.add.text(left, detailsY + (stacked ? 24 : 48), `CONS  ·  ${choice.cons.join('  ·  ')}`, {
        ...fantasyText(12, '#ef8a96', '900'), fixedWidth: cardWidth - 36, wordWrap: { width: cardWidth - 42 },
      }).setOrigin(0, 0);
      this.add.text(left, top + cardHeight - 28, `STARTING BONUS  ·  ${choice.startingBonus}`, {
        ...fantasyText(12, '#d8ad55', '900'), fixedWidth: cardWidth - 36,
      }).setOrigin(0, 0.5);
      card.on(Phaser.Input.Events.POINTER_OVER, () => this.select(index, choices.length));
      card.on(Phaser.Input.Events.POINTER_DOWN, () => { this.select(index, choices.length); this.confirm(); });
    });

    this.updateSelection(choices);
    this.input.keyboard?.on('keydown-LEFT', this.previous, this);
    this.input.keyboard?.on('keydown-UP', this.previous, this);
    this.input.keyboard?.on('keydown-RIGHT', this.next, this);
    this.input.keyboard?.on('keydown-DOWN', this.next, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.on('keydown-SPACE', this.confirm, this);
    this.input.keyboard?.on('keydown-ESC', this.back, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private getChoices() {
    return getSpecializationsForCharacter(RunStateSystem.get(this.registry).characterId);
  }
  private select(index: number, count = this.getChoices().length): void { this.selectedIndex = Phaser.Math.Wrap(index, 0, count); this.updateSelection(this.getChoices()); }
  private previous(): void { this.select(this.selectedIndex - 1); }
  private next(): void { this.select(this.selectedIndex + 1); }
  private updateSelection(choices = this.getChoices()): void {
    this.cards.forEach((card, index) => card
      .setFillStyle(index === this.selectedIndex ? 0x303644 : FantasyTheme.panelRaised)
      .setStrokeStyle(index === this.selectedIndex ? 5 : 2, index === this.selectedIndex ? FantasyTheme.goldBright : choices[index].color));
  }
  private confirm(): void {
    const state = RunStateSystem.get(this.registry);
    const choice = this.getChoices()[this.selectedIndex];
    if (!choice || !SpecializationSystem.choose(state, choice.id)) return;
    this.scene.start('GameScene');
  }
  private back(): void { this.scene.start('CharacterSelectScene'); }
  private cleanup(): void {
    this.input.keyboard?.off('keydown-LEFT', this.previous, this);
    this.input.keyboard?.off('keydown-UP', this.previous, this);
    this.input.keyboard?.off('keydown-RIGHT', this.next, this);
    this.input.keyboard?.off('keydown-DOWN', this.next, this);
    this.input.keyboard?.off('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.off('keydown-SPACE', this.confirm, this);
    this.input.keyboard?.off('keydown-ESC', this.back, this);
  }
}
