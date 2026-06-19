import type { Enemy } from '../../entities/Enemy';
import type { Player } from '../../entities/Player';
import { paladinMeleeAttacks, type MeleeAttackDefinition } from '../data/weapons';
import type { DamageSource } from '../types';

interface ActiveAttack {
  definition: MeleeAttackDefinition;
  direction: Phaser.Math.Vector2;
  hitAt: number;
  endsAt: number;
  resolved: boolean;
}

export interface MeleeAttackCallbacks {
  dealDamage: (enemy: Enemy, amount: number, source: DamageSource) => void;
  onShieldGuard: () => void;
  onSwordSwing: () => void;
  onShieldBash: () => void;
}

export class MeleeAttackSystem {
  private readonly nextAttackAt = new Map<MeleeAttackDefinition['id'], number>();
  private activeAttack?: ActiveAttack;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getWeaponLevel: () => number,
    private readonly callbacks: MeleeAttackCallbacks,
  ) {}

  update(time: number, player: Player, enemies: Phaser.GameObjects.Group): void {
    const target = this.getNearestEnemy(player, enemies);
    if (target) player.setFacing(new Phaser.Math.Vector2(target.x - player.x, target.y - player.y));

    if (this.activeAttack) {
      if (!this.activeAttack.resolved && time >= this.activeAttack.hitAt) this.resolveAttack(player, enemies);
      if (time >= this.activeAttack.endsAt) this.activeAttack = undefined;
      return;
    }
    if (!target) return;

    const distance = Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y);
    const bash = paladinMeleeAttacks[1];
    const sword = paladinMeleeAttacks[0];
    if (distance <= bash.range + 18 && time >= (this.nextAttackAt.get(bash.id) ?? 0)) {
      this.startAttack(time, player, bash);
    } else if (distance <= sword.range + 16 && time >= (this.nextAttackAt.get(sword.id) ?? 0)) {
      this.startAttack(time, player, sword);
    }
  }

  private startAttack(time: number, player: Player, definition: MeleeAttackDefinition): void {
    const direction = player.getFacingDirection();
    this.activeAttack = {
      definition,
      direction,
      hitAt: time + definition.activeFrameMs,
      endsAt: time + definition.durationMs,
      resolved: false,
    };
    const cooldown = definition.cooldownMs * (1 - player.stats.cooldownReduction) / player.stats.attackSpeed;
    this.nextAttackAt.set(definition.id, time + cooldown);

    if (definition.shape === 'arc') {
      player.playSwordHack();
      this.callbacks.onSwordSwing();
      this.drawSwordArc(player, direction, definition);
    } else {
      player.playShieldBash();
      this.callbacks.onShieldBash();
      this.drawShieldThrust(player, direction, definition);
    }
  }

  private resolveAttack(player: Player, enemies: Phaser.GameObjects.Group): void {
    const attack = this.activeAttack;
    if (!attack) return;
    attack.resolved = true;
    let hits = 0;
    const levelMultiplier = 1 + (this.getWeaponLevel() - 1) * 0.22;

    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active || !this.isInsideAttack(player, enemy, attack)) continue;
      const critical = Math.random() < player.stats.critChance;
      const damage = Math.round(attack.definition.baseDamage * player.stats.damage * levelMultiplier
        * (critical ? player.stats.critDamage : 1));
      enemy.applyKnockback(new Phaser.Math.Vector2(player.x, player.y), attack.definition.knockback + player.stats.knockback);
      enemy.stun(attack.definition.stunMs);
      this.callbacks.dealDamage(enemy, damage, {
        sourceId: attack.definition.id,
        sourceName: attack.definition.displayName,
        damageType: attack.definition.damageType,
      });
      hits += 1;
    }
    if (attack.definition.shape === 'bash' && hits > 0) this.callbacks.onShieldGuard();
  }

  private isInsideAttack(player: Player, enemy: Enemy, attack: ActiveAttack): boolean {
    const toEnemy = new Phaser.Math.Vector2(enemy.x - player.x, enemy.y - player.y);
    if (toEnemy.length() > attack.definition.range + 18) return false;
    const angleDifference = Math.abs(Phaser.Math.Angle.Wrap(toEnemy.angle() - attack.direction.angle()));
    return angleDifference <= Phaser.Math.DegToRad(attack.definition.arcDegrees / 2);
  }

  private drawSwordArc(player: Player, direction: Phaser.Math.Vector2, definition: MeleeAttackDefinition): void {
    const angle = direction.angle();
    const halfArc = Phaser.Math.DegToRad(definition.arcDegrees / 2);
    const effect = this.scene.add.graphics().setDepth(9);
    effect.lineStyle(12, definition.color, 0.88);
    effect.beginPath();
    effect.arc(player.x, player.y, definition.range * 0.82, angle - halfArc, angle + halfArc);
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
