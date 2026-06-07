import type { Player } from '../entities/Player';

export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  apply(player: Player): void;
}

export const upgradeCatalog: UpgradeOption[] = [
  {
    id: 'damage-plus',
    title: 'Damage +',
    description: '+25% projectile damage',
    apply: (player) => {
      player.stats.damage = Math.round(player.stats.damage * 1.25);
    },
  },
  {
    id: 'attack-speed-plus',
    title: 'Attack Speed +',
    description: '+18% firing rate',
    apply: (player) => {
      player.stats.attackSpeed = Number((player.stats.attackSpeed * 1.18).toFixed(2));
    },
  },
  {
    id: 'max-hp-plus',
    title: 'Max HP +',
    description: '+25 max HP and full heal',
    apply: (player) => {
      player.stats.maxHp += 25;
      player.healToFull();
    },
  },
  {
    id: 'move-speed-plus',
    title: 'Move Speed +',
    description: '+12% movement speed',
    apply: (player) => {
      player.stats.moveSpeed = Math.round(player.stats.moveSpeed * 1.12);
    },
  },
];
