import Phaser from 'phaser';
import { characters } from '../game/data/characters';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { RunStateSystem } from '../game/systems/RunStateSystem';
import { PaladinVisual } from '../game/visuals/PaladinVisual';

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
    this.add.rectangle(0, 0, width, height, 0x111418).setOrigin(0);
    this.add.text(width / 2, 54, 'Choose Your Hero', {
      color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '34px', fontStyle: '900',
    }).setOrigin(0.5);

    const narrow = width < 760;
    const spacing = Math.min(250, width * 0.29);
    characters.forEach((character, index) => {
      const x = narrow ? width / 2 : width / 2 + (index - 1) * spacing;
      const y = narrow ? 160 + index * 195 : height / 2;
      const cardWidth = narrow ? Math.min(520, width - 32) : Math.min(220, width * 0.27);
      const cardHeight = narrow ? 174 : 310;
      const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0x202630)
        .setStrokeStyle(2, character.visual.color).setInteractive({ useHandCursor: true });
      this.cards.push(card);
      const visualX = narrow ? x - cardWidth / 2 + 54 : x;
      const visualY = narrow ? y : y - 92;
      if (character.id === 'paladin') {
        const visual = new PaladinVisual(this, visualX, visualY);
        visual.setScale(narrow ? 1.15 : 1.35);
      } else {
        this.add.circle(visualX, visualY, narrow ? 28 : 34, character.visual.color).setStrokeStyle(5, character.visual.accentColor);
      }
      this.add.text(narrow ? x - 18 : x, narrow ? y - 52 : y - 35, character.displayName, {
        color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '22px', fontStyle: '900',
      }).setOrigin(0.5);
      this.add.text(narrow ? x + 36 : x, narrow ? y + 5 : y + 25, character.description, {
        color: '#dbe4ee', align: 'center', fixedWidth: narrow ? cardWidth - 130 : Math.min(184, width * 0.23),
        wordWrap: { width: narrow ? cardWidth - 140 : Math.min(174, width * 0.22), useAdvancedWrap: true },
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '14px', lineSpacing: 5,
      }).setOrigin(0.5);
      this.add.text(narrow ? x + 36 : x, narrow ? y + 62 : y + 105, character.passiveLabel, {
        color: '#ffd166', align: 'center', fixedWidth: narrow ? cardWidth - 130 : cardWidth - 24,
        wordWrap: { width: narrow ? cardWidth - 140 : cardWidth - 34, useAdvancedWrap: true },
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '13px', fontStyle: '800',
      }).setOrigin(0.5);
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
      card.setFillStyle(index === this.selectedIndex ? 0x303a46 : 0x202630);
      card.setStrokeStyle(index === this.selectedIndex ? 5 : 2, index === this.selectedIndex ? 0xffd166 : characters[index].visual.color);
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
