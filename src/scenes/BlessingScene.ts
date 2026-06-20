import Phaser from 'phaser';
import { blessings } from '../game/data/blessings';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { RunStateSystem } from '../game/systems/RunStateSystem';
import { RunStatsTracker } from '../game/systems/RunStatsTracker';
import { StatSystem } from '../game/systems/StatSystem';
import { BlessingCard } from '../game/ui/BlessingCard';
import { FantasyPanel } from '../game/ui/FantasyPanel';
import { FantasyTheme, fantasyText } from '../game/ui/FantasyTheme';
import { getBlessingRank, MAX_BLESSING_RANK } from '../game/data/blessingRanks';

interface BlessingSceneData { returnScene?: 'TownScene' | 'RunSummaryScene'; major?: boolean; }

export class BlessingScene extends Phaser.Scene {
  private choices = blessings;
  private cards: BlessingCard[] = [];
  private selectedIndex = 0;
  private returnScene: 'TownScene' | 'RunSummaryScene' = 'TownScene';
  private major = false;

  constructor() { super('BlessingScene'); }
  init(data: BlessingSceneData): void { this.returnScene = data.returnScene ?? 'TownScene'; this.major = data.major ?? false; }

  create(): void {
    this.cards = [];
    this.selectedIndex = 0;
    FullscreenSystem.install(this);
    const state = RunStateSystem.get(this.registry);
    const eligible = blessings.filter((blessing) => getBlessingRank(state.blessings, blessing.id) < MAX_BLESSING_RANK);
    if (eligible.length === 0) {
      if (this.returnScene === 'TownScene') state.campRewards.blessing = true;
      this.scene.start(this.returnScene);
      return;
    }
    this.choices = Phaser.Utils.Array.Shuffle([...eligible]).slice(0, Math.min(2, eligible.length));
    const { width, height } = this.scale;
    const narrow = width < 760;
    this.add.rectangle(0, 0, width, height, FantasyTheme.background).setOrigin(0);
    this.add.circle(width / 2, height * 0.48, Math.min(width, height) * 0.38, 0x59411e, 0.08);
    this.add.text(width / 2, 44, this.major ? 'A GREATER FAVOR' : 'THE GODS ANSWER', fantasyText(30, '#f5ead3', '900')).setOrigin(0.5);
    this.add.text(width / 2, 78, 'Choose the power that will shape your journey', fantasyText(14, FantasyTheme.muted)).setOrigin(0.5);

    const panelWidth = Math.min(1040, width - 28);
    const panelHeight = narrow ? Math.min(650, height - 116) : Math.min(480, height - 140);
    const panelY = 105 + panelHeight / 2;
    new FantasyPanel(this, width / 2, panelY, panelWidth, panelHeight);
    const cardWidth = narrow ? panelWidth - 44 : Math.min(280, (panelWidth - 80) / 3);
    const cardHeight = narrow ? Math.min(170, (panelHeight - 50) / 3) : panelHeight - 58;
    this.choices.forEach((blessing, index) => {
      const x = narrow ? width / 2 : width / 2 + (index - (this.choices.length - 1) / 2) * (cardWidth + 22);
      const y = narrow ? panelY - panelHeight / 2 + 105 + index * (cardHeight + 14) : panelY;
      this.cards.push(new BlessingCard(this, x, y, cardWidth, cardHeight, blessing, getBlessingRank(state.blessings, blessing.id), () => this.confirm(), () => this.select(index)));
    });
    const reroll = this.add.text(width / 2, 102 + panelHeight, `REROLL [R]  ·  ${state.blessingRerolls} TOKEN${state.blessingRerolls === 1 ? '' : 'S'}`, fantasyText(13, state.blessingRerolls > 0 ? '#ffd77a' : FantasyTheme.muted, '900'))
      .setOrigin(0.5).setInteractive({ useHandCursor: state.blessingRerolls > 0 });
    reroll.on(Phaser.Input.Events.POINTER_DOWN, this.reroll, this);
    this.updateSelection();
    this.input.keyboard?.on('keydown-LEFT', this.previous, this);
    this.input.keyboard?.on('keydown-UP', this.previous, this);
    this.input.keyboard?.on('keydown-RIGHT', this.next, this);
    this.input.keyboard?.on('keydown-DOWN', this.next, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.on('keydown-SPACE', this.confirm, this);
    this.input.keyboard?.on('keydown-R', this.reroll, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private select(index: number): void { this.selectedIndex = Phaser.Math.Wrap(index, 0, this.choices.length); this.updateSelection(); }
  private previous(): void { this.select(this.selectedIndex - 1); }
  private next(): void { this.select(this.selectedIndex + 1); }
  private updateSelection(): void { this.cards.forEach((card, index) => card.setSelected(index === this.selectedIndex)); }
  private confirm(): void {
    const state = RunStateSystem.get(this.registry);
    state.blessings.push(this.choices[this.selectedIndex].id);
    new RunStatsTracker(state).recordBlessing();
    StatSystem.syncRunState(state);
    if (this.returnScene === 'TownScene') state.campRewards.blessing = true;
    this.scene.start(this.returnScene);
  }
  private reroll(): void {
    const state = RunStateSystem.get(this.registry);
    if (state.blessingRerolls <= 0) return;
    state.blessingRerolls -= 1;
    this.scene.restart({ returnScene: this.returnScene, major: this.major });
  }
  private cleanup(): void {
    ['LEFT', 'UP'].forEach((key) => this.input.keyboard?.off(`keydown-${key}`, this.previous, this));
    ['RIGHT', 'DOWN'].forEach((key) => this.input.keyboard?.off(`keydown-${key}`, this.next, this));
    this.input.keyboard?.off('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.off('keydown-SPACE', this.confirm, this);
    this.input.keyboard?.off('keydown-R', this.reroll, this);
  }
}
