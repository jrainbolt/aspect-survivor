export interface PlayerStats {
  maxHp: number;
  hp: number;
  damage: number;
  attackSpeed: number;
  moveSpeed: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface EnemyStats {
  maxHp: number;
  hp: number;
  damage: number;
  speed: number;
  xpValue: number;
}

export interface WeaponStats {
  damage: number;
  shotsPerSecond: number;
  projectileSpeed: number;
  range: number;
}
