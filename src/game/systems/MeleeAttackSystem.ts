import type { Enemy } from '../../entities/Enemy';
import type { Player } from '../../entities/Player';
import type { MeleeAttackDefinition } from '../data/weapons';
import { getWeaponLevelDamageMultiplier } from '../data/weapons';
import type { DamageSource, SpecializationId } from '../types';
import { SpecializationSystem } from './SpecializationSystem';

interface ActiveAttack {
  definition: MeleeAttackDefinition;
  direction: Phaser.Math.Vector2;
  hitAt: number;
  endsAt: number;
  resolved: boolean;
  returnHitAt?: number;
  returnResolved: boolean;
}

export interface MeleeAttackCallbacks {
  dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void;
  onShieldGuard: () => void;
  onSwordSwing: () => void;
  onShieldBash: () => void;
  onImpact: (enemy: Enemy, heavy: boolean) => void;
}

export class MeleeAttackSystem {
  private readonly nextAttackAt = new Map<MeleeAttackDefinition['id'], number>();
  private activeAttacks: ActiveAttack[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getWeaponLevel: () => number,
    private readonly getSpecialization: () => SpecializationId | undefined,
    private readonly getSpecializationLevel: () => number,
    private readonly callbacks: MeleeAttackCallbacks,
  ) {}

  update(time: number, player: Player, enemies: Phaser.GameObjects.Group): void {
    const target = this.getNearestEnemy(player, enemies);
    if (target) player.setFacing(new Phaser.Math.Vector2(target.x - player.x, target.y - player.y));

    for (const attack of this.activeAttacks) {
      if (!attack.resolved && time >= attack.hitAt) this.resolveAttack(attack, player, enemies);
      if (attack.returnHitAt && !attack.returnResolved && time >= attack.returnHitAt) this.resolveAttack(attack, player, enemies, true);
    }
    this.activeAttacks = this.activeAttacks.filter((attack) => time < attack.endsAt);
    if (!target) return;

    const distance = Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y);
    const [sword, bash] = SpecializationSystem.getAttacks(this.getSpecialization(), this.getSpecializationLevel());
    if (distance <= sword.range + 16 && time >= (this.nextAttackAt.get(sword.id) ?? 0)
      && !this.activeAttacks.some((attack) => attack.definition.id === sword.id)) {
      this.startAttack(time, player, sword);
    }
    if (distance <= bash.range + 18 && time >= (this.nextAttackAt.get(bash.id) ?? 0)
      && !this.activeAttacks.some((attack) => attack.definition.id === bash.id)) {
      this.startAttack(time, player, bash);
    }
  }

  private startAttack(time: number, player: Player, definition: MeleeAttackDefinition): void {
    const direction = player.getFacingDirection();
    const isThrust = definition.shape === 'thrust';
    this.activeAttacks.push({
      definition,
      direction,
      hitAt: time + definition.activeFrameMs,
      endsAt: time + (isThrust ? Math.max(300, definition.durationMs) : definition.durationMs),
      resolved: false,
      returnHitAt: isThrust ? time + 185 : undefined,
      returnResolved: false,
    });
    const cooldown = definition.cooldownMs * (1 - player.stats.cooldownReduction) / player.stats.attackSpeed;
    this.nextAttackAt.set(definition.id, time + cooldown);

    if (definition.shape !== 'bash') {
      if (definition.shape === 'thrust') player.playPikeThrust();
      else player.playSwordHack();
      this.callbacks.onSwordSwing();
      if (definition.shape === 'thrust') this.drawThrust(player, direction, definition);
      else this.drawSwordArc(player, direction, definition);
    } else {
      player.playShieldBash();
      this.callbacks.onShieldBash();
      this.drawShieldThrust(player, direction, definition);
    }
  }

  private resolveAttack(attack: ActiveAttack, player: Player, enemies: Phaser.GameObjects.Group, isReturn = false): void {
    if (isReturn) attack.returnResolved = true;
    else attack.resolved = true;
    let hits = 0;
    const levelMultiplier = getWeaponLevelDamageMultiplier(this.getWeaponLevel());

    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active || !this.isInsideAttack(player, enemy, attack)) continue;
      const critical = Math.random() < player.stats.critChance;
      const returnMultiplier = isReturn ? 0.7 : 1;
      const damage = Math.round((attack.definition.baseDamage * player.stats.damage + player.stats.flatDamage) * levelMultiplier * returnMultiplier
        * (critical ? player.stats.critDamage : 1));
      enemy.applyKnockback(new Phaser.Math.Vector2(player.x, player.y), attack.definition.knockback + player.stats.knockback);
      enemy.stun(attack.definition.stunMs);
      this.callbacks.onImpact(enemy, attack.definition.shape === 'bash');
      this.callbacks.dealDamage(enemy, damage, {
        sourceId: `${this.getSpecialization() ? `${attack.definition.id}:${this.getSpecialization()}` : attack.definition.id}${isReturn ? ':return' : ''}`,
        sourceName: `${attack.definition.displayName}${isReturn ? ' Return' : ''}`,
        damageType: attack.definition.damageType,
        critical,
      });
      hits += 1;
    }
    if (!isReturn && attack.definition.shape === 'bash' && hits > 0) this.callbacks.onShieldGuard();
  }

  private isInsideAttack(player: Player, enemy: Enemy, attack: ActiveAttack): boolean {
    const origin = attack.definition.shape === 'thrust'
      ? this.getThrustOrigin(player, attack.direction)
      : new Phaser.Math.Vector2(player.x, player.y);
    const toEnemy = new Phaser.Math.Vector2(enemy.x - origin.x, enemy.y - origin.y);
    const distance = toEnemy.length();
    if (distance > attack.definition.range + 18) return false;
    if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) <= 30) return true;
    if (attack.definition.shape === 'thrust') {
      const forwardDistance = toEnemy.dot(attack.direction);
      const perpendicularDistance = Math.abs(toEnemy.x * attack.direction.y - toEnemy.y * attack.direction.x);
      return forwardDistance >= 0 && forwardDistance <= attack.definition.range + 18 && perpendicularDistance <= 30;
    }
    const angleDifference = Math.abs(Phaser.Math.Angle.Wrap(toEnemy.angle() - attack.direction.angle()));
    return angleDifference <= Phaser.Math.DegToRad(attack.definition.arcDegrees / 2);
  }

  private drawSwordArc(player: Player, direction: Phaser.Math.Vector2, definition: MeleeAttackDefinition): void {
    const angle = direction.angle();
    const halfArc = Phaser.Math.DegToRad(definition.arcDegrees / 2);
    const effect = this.scene.add.graphics().setDepth(9);
    effect.lineStyle(18, definition.color, 0.22);
    effect.beginPath();
    effect.arc(player.x, player.y, definition.range * 0.88, angle - halfArc, angle + halfArc);
    effect.strokePath();
    effect.lineStyle(7, 0xffffff, 0.92);
    effect.beginPath();
    effect.arc(player.x, player.y, definition.range * 0.88, angle - halfArc, angle + halfArc);
    effect.strokePath();
    this.scene.tweens.add({ targets: effect, alpha: 0, duration: definition.durationMs, onComplete: () => effect.destroy() });
  }

  private drawShieldThrust(player: Player, direction: Phaser.Math.Vector2, definition: MeleeAttackDefinition): void {
    const effect = this.scene.add.rectangle(
      player.x + direction.x * 26, player.y + direction.y * 26, definition.range * 0.7, 30, definition.color, 0.55,
    ).setRotation(direction.angle()).setDepth(9);
    this.scene.tweens.add({
      targets: effect,
      x: player.x + direction.x * definition.range,
      y: player.y + direction.y * definition.range,
      alpha: 0,
      duration: definition.durationMs,
      ease: 'Cubic.Out',
      onComplete: () => effect.destroy(),
    });
  }

  private drawThrust(player: Player, direction: Phaser.Math.Vector2, definition: MeleeAttackDefinition): void {
    const origin = this.getThrustOrigin(player, direction);
    const startX = origin.x;
    const startY = origin.y;
    const line = this.scene.add.rectangle(startX, startY, definition.range, 12, definition.color, 0.78)
      .setOrigin(0, 0.5).setRotation(direction.angle()).setScale(0.15, 1).setDepth(9);
    const tip = this.scene.add.circle(startX, startY, 10, 0xffffff, 0.9).setDepth(10);
    const endX = origin.x + direction.x * definition.range;
    const endY = origin.y + direction.y * definition.range;
    this.scene.tweens.add({ targets: line, scaleX: 1, duration: 100, ease: 'Cubic.Out', yoyo: true, hold: 55,
      onComplete: () => line.destroy() });
    this.scene.tweens.add({ targets: tip, x: endX, y: endY, duration: 100, ease: 'Cubic.Out', yoyo: true, hold: 55,
      onComplete: () => tip.destroy() });
  }

  private getThrustOrigin(player: Player, direction: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const perpendicular = new Phaser.Math.Vector2(-direction.y, direction.x);
    return new Phaser.Math.Vector2(player.x, player.y).add(direction.clone().scale(12)).add(perpendicular.scale(-21));
  }

  private getNearestEnemy(player: Player, enemies: Phaser.GameObjects.Group): Enemy | undefined {
    let nearest: Enemy | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) continue;
      const distance = Phaser.Math.Distance.Squared(player.x, player.y, enemy.x, enemy.y);
      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    }
    return nearest;
  }
}
