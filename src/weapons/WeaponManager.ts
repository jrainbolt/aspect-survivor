import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import type { Weapon } from './Weapon';
import { BlasterWeapon } from './BlasterWeapon';

export class WeaponManager {
  private readonly weapons: Weapon[] = [new BlasterWeapon()];

  update(time: number, player: Player, enemies: Phaser.GameObjects.Group, projectiles: Phaser.Physics.Arcade.Group): void {
    for (const weapon of this.weapons) {
      weapon.update(time, player, enemies, projectiles);
    }
  }
}
