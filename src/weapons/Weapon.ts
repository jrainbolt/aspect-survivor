import type { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import type { Projectile } from '../entities/Projectile';

export interface Weapon {
  readonly id: string;
  readonly name: string;
  update(time: number, player: Player, enemies: Phaser.GameObjects.Group, projectiles: Phaser.Physics.Arcade.Group): void;
}

export function getNearestEnemy(player: Player, enemies: Phaser.GameObjects.Group): Enemy | undefined {
  let nearest: Enemy | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const child of enemies.getChildren()) {
    const enemy = child as Enemy;
    if (!enemy.active) {
      continue;
    }

    const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
    if (distance < nearestDistance) {
      nearest = enemy;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function spawnProjectile(
  group: Phaser.Physics.Arcade.Group,
  player: Player,
  target: Enemy,
  time: number,
): Projectile {
  const projectile = group.get(player.x, player.y, 'projectile') as Projectile;
  projectile.setActive(true);
  projectile.setVisible(true);
  projectile.enableBody(true, player.x, player.y, true, true);
  projectile.fire(
    new Phaser.Math.Vector2(target.x, target.y),
    player.stats.damage,
    560,
    680,
    time,
  );
  return projectile;
}
