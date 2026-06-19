import Phaser from 'phaser';
import { blessings } from '../game/data/blessings';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { RunStateSystem } from '../game/systems/RunStateSystem';
import { RunStatsTracker } from '../game/systems/RunStatsTracker';
import { StatSystem } from '../game/systems/StatSystem';

interface BlessingSceneData {
  returnScene?: 'TownScene' | 'RunSummaryScene';
  major?: boolean;
}

export class BlessingScene extends Phaser.Scene {
  private choices = blessings;
  private cards: Phaser.GameObjects.Rectangle[] = [];
  private selectedIndex = 0;
  private returnScene: 'TownScene' | 'RunSummaryScene' = 'TownScene';
  private major = false;

  constructor() { super('BlessingScene'); }

  init(data: BlessingSceneData): void {
    this.returnScene = data.returnScene ?? 'TownScene';
    this.major = data.major ?? false;
  }

  create(): void {
    this.cards = [];
    this.selectedIndex = 0;
    FullscreenSystem.install(this);
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x111418).setOrigin(0);
    this.add.text(width / 2, 58, this.major ? 'Major Divine Favor' : 'Choose a Divine Favor', {
      color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '32px', fontStyle: '900',
    }).setOrigin(0.5);

    const narrow = width < 760;
    const spacing = Math.min(250, width * 0.29);
    this.choices.forEach((blessing, index) => {
      const x = narrow ? width / 2 : width / 2 + (index - 1) * spacing;
      const y = narrow ? 160 + index * 190 : height / 2;
      const cardWidth = narrow ? Math.min(520, width - 32) : Math.min(220, width * 0.27);
      const card = this.add.rectangle(x, y, cardWidth, narrow ? 168 : 260, 0x202630)
        .setStrokeStyle(2, blessing.color).setInteractive({ useHandCursor: true });
      this.cards.push(card);
      this.add.text(narrow ? x - cardWidth / 2 + 64 : x, narrow ? y - 34 : y - 82, blessing.god, {
        color: `#${blessing.color.toString(16).padStart(6, '0')}`, fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '16px', fontStyle: '900',
      }).setOrigin(0.5);
      this.add.text(narrow ? x + 35 : x, narrow ? y - 42 : y - 38, blessing.displayName, {
        color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '22px', fontStyle: '900',
      }).setOrigin(0.5);
      this.add.text(narrow ? x + 35 : x, narrow ? y + 28 : y + 28, blessing.description, {
        color: '#dbe4ee', align: 'center', fixedWidth: narrow ? cardWidth - 120 : Math.min(180, width * 0.23),
        wordWrap: { width: narrow ? cardWidth - 130 : Math.min(170, width * 0.22), useAdvancedWrap: true },
        fontFamily: 'Inter, Arial, sans-serif', fontSize: '14px', lineSpacing: 5,
      }).setOrigin(0.5);
      card.on(Phaser.Input.Events.POINTER_OVER, () => this.select(index));
      card.on(Phaser.Input.Events.POINTER_DOWN, () => this.confirm());
    });

    this.updateSelection();
    this.input.keyboard?.on('keydown-LEFT', this.previous, this);
    this.input.keyboard?.on('keydown-RIGHT', this.next, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.on('keydown-SPACE', this.confirm, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private select(index: number): void {
    this.selectedIndex = Phaser.Math.Wrap(index, 0, this.choices.length);
    this.updateSelection();
  }
  private previous(): void { this.select(this.selectedIndex - 1); }
  private next(): void { this.select(this.selectedIndex + 1); }
  private updateSelection(): void {
    this.cards.forEach((card, index) => {
      card.setFillStyle(index === this.selectedIndex ? 0x303a46 : 0x202630);
      card.setStrokeStyle(index === this.selectedIndex ? 5 : 2, index === this.selectedIndex ? 0xffd166 : this.choices[index].color);
    });
  }

  private confirm(): void {
    const state = RunStateSystem.get(this.registry);
    const blessing = this.choices[this.selectedIndex];
    state.blessings.push(blessing.id);
    new RunStatsTracker(state).recordBlessing();
    StatSystem.syncRunState(state);
    if (this.returnScene === 'TownScene') state.campRewards.blessing = true;
    this.scene.start(this.returnScene);
  }

  private cleanup(): void {
    this.input.keyboard?.off('keydown-LEFT', this.previous, this);
    this.input.keyboard?.off('keydown-RIGHT', this.next, this);
    this.input.keyboard?.off('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.off('keydown-SPACE', this.confirm, this);
  }
}
