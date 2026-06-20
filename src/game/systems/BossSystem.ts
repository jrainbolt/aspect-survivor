import Phaser from 'phaser';
import type { Enemy, EnemyKind } from '../../entities/Enemy';
import type { Player } from '../../entities/Player';

interface BossSystemCallbacks {
  damagePlayer: (amount: number) => void;
  summon: (kind: Exclude<EnemyKind, 'boss'>, x: number, y: number) => void;
  playAttack: () => void;
  canResolveAttack: () => boolean;
}

export class BossSystem {
  private nextAttackAt = 0;
  private attackCount = 0;
  private summonedAtSeventy = false;
  private summonedAtThirtyFive = false;
  private phase = 1;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly callbacks: BossSystemCallbacks,
  ) {}

  update(time: number, boss: Enemy | undefined, player: Player): void {
    if (!boss?.active) return;
    const hpRatio = boss.stats.hp / boss.stats.maxHp;
    this.phase = hpRatio > 0.66 ? 1 : hpRatio > 0.33 ? 2 : 3;
    this.handleReinforcements(boss, hpRatio);
    if (this.nextAttackAt === 0) this.nextAttackAt = time + 1800;
    if (time < this.nextAttackAt) return;

    this.attackCount += 1;
    if (this.attackCount % 2 === 0) this.telegraphCharge(boss, player);
    else this.telegraphGroundStrike(boss, player);
    this.nextAttackAt = time + (this.phase === 1 ? 4000 : this.phase === 2 ? 3200 : 2400);
  }

  getPhaseLabel(): string {
    return ['IRON OATH', 'WAR AWAKENED', 'LAST STAND'][this.phase - 1];
  }

  private handleReinforcements(boss: Enemy, hpRatio: number): void {
    if (!this.summonedAtSeventy && hpRatio <= 0.7) {
      this.summonedAtSeventy = true;
      this.summonRing(boss, ['runner', 'runner', 'runner', 'grunt']);
    }
    if (!this.summonedAtThirtyFive && hpRatio <= 0.35) {
      this.summonedAtThirtyFive = true;
      this.summonRing(boss, ['brute', 'brute', 'runner', 'runner']);
    }
  }

  private summonRing(boss: Enemy, kinds: Array<Exclude<EnemyKind, 'boss'>>): void {
    this.callbacks.playAttack();
    const ring = this.scene.add.circle(boss.x, boss.y, 28).setStrokeStyle(5, 0xc9a2ff, 0.9).setDepth(30);
    this.scene.tweens.add({ targets: ring, scale: 3.2, alpha: 0, duration: 600, onComplete: () => ring.destroy() });
    kinds.forEach((kind, index) => {
      const angle = index / kinds.length * Math.PI * 2;
      this.callbacks.summon(kind, boss.x + Math.cos(angle) * 86, boss.y + Math.sin(angle) * 86);
    });
  }

  private telegraphGroundStrike(boss: Enemy, player: Player): void {
    const x = player.x;
    const y = player.y;
    const radius = 58 + this.phase * 9;
    const warning = this.scene.add.circle(x, y, radius, 0x9b5de5, 0.12)
      .setStrokeStyle(4, 0xe4c7ff, 0.9).setDepth(4);
    this.scene.tweens.add({ targets: warning, scale: { from: 0.35, to: 1 }, alpha: { from: 0.8, to: 0.3 }, duration: 680 });
    this.scene.time.delayedCall(700, () => {
      warning.destroy();
      if (!boss.active || !this.callbacks.canResolveAttack()) return;
      this.callbacks.playAttack();
      const blast = this.scene.add.circle(x, y, radius, 0xc9a2ff, 0.72).setDepth(31);
      this.scene.tweens.add({ targets: blast, scale: 1.35, alpha: 0, duration: 320, onComplete: () => blast.destroy() });
      this.scene.cameras.main.shake(140, 0.008);
      if (Phaser.Math.Distance.Between(player.x, player.y, x, y) <= radius) this.callbacks.damagePlayer(14 + this.phase * 5);
    });
  }

  private telegraphCharge(boss: Enemy, player: Player): void {
    const target = new Phaser.Math.Vector2(player.x, player.y);
    const warning = this.scene.add.line(0, 0, boss.x, boss.y, target.x, target.y, 0xe4c7ff, 0.55)
      .setOrigin(0).setLineWidth(7).setDepth(4);
    this.scene.tweens.add({ targets: warning, alpha: { from: 0.2, to: 0.85 }, duration: 520, yoyo: true });
    this.scene.time.delayedCall(600, () => {
      warning.destroy();
      if (!boss.active || !this.callbacks.canResolveAttack()) return;
      this.callbacks.playAttack();
      boss.dashToward(target, 360 + this.phase * 45, 560);
      this.scene.cameras.main.shake(110, 0.006);
    });
  }
}
