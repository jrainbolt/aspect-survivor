import Phaser from 'phaser';
import { characters } from '../game/data/characters';
import { weaponDefinitions } from '../game/data/weapons';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { RunStateSystem } from '../game/systems/RunStateSystem';
import { FantasyTheme, fantasyText } from '../game/ui/FantasyTheme';
import { PortraitFrame } from '../game/ui/PortraitFrame';

export class CharacterSelectScene extends Phaser.Scene {
  private cards: Phaser.GameObjects.Rectangle[] = [];
  private selectedIndex = 0;

  constructor() {
    super('CharacterSelectScene');
  }

  create(): void {
    this.cards = [];
    this.selectedIndex = 0;
    FullscreenSystem.install(this);
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, FantasyTheme.background).setOrigin(0);
    this.add.text(width / 2, 42, 'CHOOSE YOUR CHAMPION', fantasyText(30, '#f5ead3', '900')).setOrigin(0.5);
    this.add.text(width / 2, 74, 'Each path begins with a different strength', fantasyText(14, FantasyTheme.muted)).setOrigin(0.5);

    const narrow = width < 760;
    const spacing = Math.min(250, width * 0.29);
    characters.forEach((character, index) => {
      const x = narrow ? width / 2 : width / 2 + (index - 1) * spacing;
      const y = narrow ? 180 + index * 220 : height / 2 + 18;
      const cardWidth = narrow ? Math.min(520, width - 24) : Math.min(270, width * 0.29);
      const cardHeight = narrow ? 204 : Math.min(440, height - 150);
      const card = this.add.rectangle(x, y, cardWidth, cardHeight, FantasyTheme.panelRaised)
        .setStrokeStyle(2, character.visual.color).setInteractive({ useHandCursor: true });
      this.cards.push(card);
      const portraitX = narrow ? x - cardWidth / 2 + 64 : x;
      const portraitY = narrow ? y - 35 : y - cardHeight / 2 + 82;
      new PortraitFrame(this, portraitX, portraitY, character.id, narrow ? 86 : 118);
      const textX = narrow ? x - cardWidth / 2 + 124 : x;
      this.add.text(textX, narrow ? y - 76 : y - cardHeight / 2 + 153, character.displayName, fantasyText(23, '#ffffff', '900')).setOrigin(narrow ? 0 : 0.5);
      this.add.text(textX, narrow ? y - 44 : y - cardHeight / 2 + 190, character.description, {
        ...fantasyText(13, '#d4cec2'), align: narrow ? 'left' : 'center', fixedWidth: narrow ? cardWidth - 144 : cardWidth - 34,
        wordWrap: { width: narrow ? cardWidth - 152 : cardWidth - 42, useAdvancedWrap: true }, lineSpacing: 3,
      }).setOrigin(narrow ? 0 : 0.5, 0);
      const detailY = narrow ? y + 33 : y + 42;
      this.add.text(narrow ? x - cardWidth / 2 + 18 : x, detailY, `STARTING WEAPON  ·  ${weaponDefinitions[character.startingWeaponId].displayName}`, {
        ...fantasyText(12, '#d8ad55', '900'), fixedWidth: cardWidth - 36, align: narrow ? 'left' : 'center',
      }).setOrigin(narrow ? 0 : 0.5);
      this.add.text(narrow ? x - cardWidth / 2 + 18 : x, detailY + 28, character.passiveLabel, {
        ...fantasyText(12, '#f4dfad', '900'), fixedWidth: cardWidth - 36, align: narrow ? 'left' : 'center',
        wordWrap: { width: cardWidth - 44, useAdvancedWrap: true },
      }).setOrigin(narrow ? 0 : 0.5);
      const base = character.baseStats;
      this.add.text(narrow ? x - cardWidth / 2 + 18 : x, detailY + 62,
        `HP ${base.maxHp}   DMG ${(base.damage ?? 1).toFixed(1)}x   MOVE ${base.moveSpeed}`, {
          ...fantasyText(12, FantasyTheme.muted, '900'), fixedWidth: cardWidth - 36, align: narrow ? 'left' : 'center',
        }).setOrigin(narrow ? 0 : 0.5);
      card.on(Phaser.Input.Events.POINTER_OVER, () => this.select(index));
      card.on(Phaser.Input.Events.POINTER_DOWN, () => this.confirm());
    });

    this.updateSelection();
    this.input.keyboard?.on('keydown-LEFT', this.previous, this);
    this.input.keyboard?.on('keydown-RIGHT', this.next, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.on('keydown-SPACE', this.confirm, this);
    this.input.keyboard?.on('keydown-ESC', this.back, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private select(index: number): void {
    this.selectedIndex = Phaser.Math.Wrap(index, 0, characters.length);
    this.updateSelection();
  }

  private previous(): void { this.select(this.selectedIndex - 1); }
  private next(): void { this.select(this.selectedIndex + 1); }

  private updateSelection(): void {
    this.cards.forEach((card, index) => {
      card.setFillStyle(index === this.selectedIndex ? 0x303644 : FantasyTheme.panelRaised);
      card.setStrokeStyle(index === this.selectedIndex ? 5 : 2, index === this.selectedIndex ? FantasyTheme.goldBright : characters[index].visual.color);
    });
  }

  private confirm(): void {
    const character = characters[this.selectedIndex];
    RunStateSystem.set(this.registry, RunStateSystem.create(character.id));
    this.scene.start('GameScene');
  }

  private back(): void { this.scene.start('MainMenuScene'); }

  private cleanup(): void {
    this.input.keyboard?.off('keydown-LEFT', this.previous, this);
    this.input.keyboard?.off('keydown-RIGHT', this.next, this);
    this.input.keyboard?.off('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.off('keydown-SPACE', this.confirm, this);
    this.input.keyboard?.off('keydown-ESC', this.back, this);
  }
}
