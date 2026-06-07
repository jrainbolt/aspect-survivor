import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { getNearestEnemy, spawnProjectile, type Weapon } from './Weapon';

export class BlasterWeapon implements Weapon {
  public readonly id = 'blaster';
  public readonly name = 'Blaster';
  private nextShotAt = 0;

  update(time: number, player: Player, enemies: Phaser.GameObjects.Group, projectiles: Phaser.Physics.Arcade.Group): void {
    if (time < this.nextShotAt) {
      return;
    }

    const target = getNearestEnemy(player, enemies);
    if (!target) {
      return;
    }

    spawnProjectile(projectiles, player, target, time);
    this.nextShotAt = time + 1000 / player.stats.attackSpeed;
  }
}
