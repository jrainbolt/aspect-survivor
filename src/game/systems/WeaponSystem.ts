import type { Enemy } from '../../entities/Enemy';
import type { Player } from '../../entities/Player';
import { Projectile } from '../../entities/Projectile';
import { getWeaponLevelDamageMultiplier, weaponDefinitions } from '../data/weapons';
import type { WeaponId } from '../types';
import type { DamageType, SorcererSpecializationId } from '../types';

export interface WeaponProfile {
  sourceName: string;
  damageType: DamageType;
  damageMultiplier: number;
  speedMultiplier: number;
  cooldownMultiplier: number;
  projectileColor: number;
  projectileScale: number;
  sorcererPath?: SorcererSpecializationId;
}

export interface WeaponFireEvent {
  direction: Phaser.Math.Vector2;
  weaponId: WeaponId;
}

export class WeaponSystem {
  private nextShotAt = 0;

  constructor(
    private readonly weaponId: WeaponId,
    private readonly getWeaponLevel: () => number,
    private readonly onFire: (event: WeaponFireEvent) => void,
    private readonly getProfile?: () => WeaponProfile | undefined,
  ) {}

  update(time: number, player: Player, enemies: Phaser.GameObjects.Group, projectiles: Phaser.Physics.Arcade.Group): void {
    if (time < this.nextShotAt) return;
    const target = this.getNearestEnemy(player, enemies);
    if (!target) return;

    const definition = weaponDefinitions[this.weaponId];
    const profile = this.getProfile?.();
    const direction = new Phaser.Math.Vector2(target.x - player.x, target.y - player.y);
    if (direction.lengthSq() < 1) direction.copy(player.getFacingDirection());
    else direction.normalize();
    player.setFacing(direction);
    const levelMultiplier = getWeaponLevelDamageMultiplier(this.getWeaponLevel());
    const damageType = profile?.damageType ?? definition.damageType;
    const typeMultiplier = damageType === 'arcane' || profile?.sorcererPath ? player.stats.spellDamageMultiplier : 1;
    const baseDamage = (definition.baseDamage * (profile?.damageMultiplier ?? 1) * player.stats.damage + player.stats.flatDamage) * levelMultiplier * typeMultiplier;
    const count = player.stats.projectileCount;
    for (let index = 0; index < count; index += 1) {
      const spread = count === 1 ? 0 : Phaser.Math.DegToRad((index - (count - 1) / 2) * 9);
      const shotDirection = direction.clone().rotate(spread);
      const critical = Math.random() < player.stats.critChance;
      const damage = Math.round(baseDamage * (critical ? player.stats.critDamage : 1));
      const projectile = projectiles.get(player.x, player.y, 'projectile') as Projectile;
      projectile.setActive(true).setVisible(true).enableBody(true, player.x, player.y, true, true);
      projectile.fire({
        direction: shotDirection,
        damage,
        speed: definition.projectileSpeed * (profile?.speedMultiplier ?? 1) * player.stats.projectileSpeed,
        range: definition.range,
        time,
        weaponId: definition.id,
        pierce: player.stats.pierce,
        knockback: player.stats.knockback,
        color: profile?.projectileColor ?? definition.projectileColor,
        scale: (profile?.projectileScale ?? definition.projectileScale) * player.stats.projectileSize,
        sourceName: profile?.sourceName ?? definition.displayName,
        damageType,
        critical,
        sorcererPath: profile?.sorcererPath,
      });
    }

    const cooldownMultiplier = 1 - player.stats.cooldownReduction;
    this.nextShotAt = time + (definition.cooldownMs * (profile?.cooldownMultiplier ?? 1) * cooldownMultiplier) / player.stats.attackSpeed;
    this.onFire({ direction, weaponId: definition.id });
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
