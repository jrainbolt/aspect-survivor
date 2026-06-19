import Phaser from 'phaser';
import { weaponDefinitions } from '../game/data/weapons';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { RunStateSystem } from '../game/systems/RunStateSystem';
import { RunStatsTracker } from '../game/systems/RunStatsTracker';
import { StatSystem } from '../game/systems/StatSystem';
import { MenuButton } from '../ui/MenuButton';

export class TownScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;
  private statusText!: Phaser.GameObjects.Text;

  constructor() { super('TownScene'); }

  create(): void {
    this.buttons = [];
    this.selectedIndex = 0;
    FullscreenSystem.install(this);
    const state = RunStateSystem.get(this.registry);
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x151a21).setOrigin(0);
    this.add.circle(width / 2, height * 0.26, 38, 0xee6c4d, 0.85);
    this.add.circle(width / 2, height * 0.26, 20, 0xffd166, 0.9);
    this.add.text(width / 2, 52, 'Campfire', {
      color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '34px', fontStyle: '900',
    }).setOrigin(0.5);
    this.add.text(width / 2, 94, `Act ${state.currentAct}  Round ${state.currentRound} cleared  |  Gold ${state.gold}`, {
      color: '#dbe4ee', fontFamily: 'Inter, Arial, sans-serif', fontSize: '15px', fontStyle: '700',
    }).setOrigin(0.5);

    const startY = height * 0.48;
    this.buttons = [
      new MenuButton(this, width / 2, startY, 'Heal 25%', () => this.heal(), () => this.select(0)),
      new MenuButton(this, width / 2, startY + 64, 'Upgrade Weapon', () => this.upgradeWeapon(), () => this.select(1)),
      new MenuButton(this, width / 2, startY + 128, 'Choose Blessing', () => this.chooseBlessing(), () => this.select(2)),
      new MenuButton(this, width / 2, startY + 210, 'Continue', () => this.continueRun(), () => this.select(3)),
    ];
    this.statusText = this.add.text(width / 2, startY + 170, this.getRewardStatus(), {
      color: '#ffd166', fontFamily: 'Inter, Arial, sans-serif', fontSize: '14px', fontStyle: '800',
    }).setOrigin(0.5);
    this.updateSelection();
    this.input.keyboard?.on('keydown-UP', this.previous, this);
    this.input.keyboard?.on('keydown-DOWN', this.next, this);
    this.input.keyboard?.on('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.on('keydown-SPACE', this.confirm, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
  }

  private claim(reward: keyof ReturnType<TownScene['getCampRewards']>, action: () => void, message: string): void {
    const state = RunStateSystem.get(this.registry);
    if (state.campRewards[reward]) {
      this.statusText.setText(`${message} already claimed`);
      return;
    }
    action();
    state.campRewards[reward] = true;
    this.statusText.setText(`${message}  |  ${this.getRewardStatus()}`);
  }

  private heal(): void {
    this.claim('heal', () => {
      const stats = RunStateSystem.get(this.registry).playerStats;
      const before = stats.currentHp;
      stats.currentHp = Math.min(stats.maxHp, stats.currentHp + Math.ceil(stats.maxHp * 0.25));
      new RunStatsTracker(RunStateSystem.get(this.registry)).recordHealing(stats.currentHp - before);
    }, 'Recovered 25% max HP');
  }

  private upgradeWeapon(): void {
    this.claim('weapon', () => {
      const state = RunStateSystem.get(this.registry);
      state.weaponLevel += 1;
      StatSystem.syncRunState(state);
    },
      `${weaponDefinitions[RunStateSystem.get(this.registry).weaponId].displayName} upgraded`);
  }

  private chooseBlessing(): void {
    const state = RunStateSystem.get(this.registry);
    if (state.campRewards.blessing) {
      this.statusText.setText('Blessing already claimed this visit');
      return;
    }
    this.scene.start('BlessingScene', { returnScene: 'TownScene', major: false });
  }

  private continueRun(): void {
    const state = RunStateSystem.get(this.registry);
    RunStateSystem.prepareNextRound(state);
    this.scene.start('GameScene');
  }

  private getCampRewards() {
    return RunStateSystem.get(this.registry).campRewards;
  }

  private getRewardStatus(): string {
    const rewards = this.getCampRewards();
    const available = [!rewards.heal && 'Heal', !rewards.weapon && 'Weapon', !rewards.blessing && 'Blessing'].filter(Boolean);
    return available.length > 0 ? `Available: ${available.join(', ')}` : 'All camp rewards claimed';
  }

  private select(index: number): void {
    this.selectedIndex = Phaser.Math.Wrap(index, 0, this.buttons.length);
    this.updateSelection();
  }
  private previous(): void { this.select(this.selectedIndex - 1); }
  private next(): void { this.select(this.selectedIndex + 1); }
  private updateSelection(): void { this.buttons.forEach((button, index) => button.setSelected(index === this.selectedIndex)); }
  private confirm(): void { this.buttons[this.selectedIndex]?.select(); }
  private cleanup(): void {
    this.input.keyboard?.off('keydown-UP', this.previous, this);
    this.input.keyboard?.off('keydown-DOWN', this.next, this);
    this.input.keyboard?.off('keydown-ENTER', this.confirm, this);
    this.input.keyboard?.off('keydown-SPACE', this.confirm, this);
  }
}
