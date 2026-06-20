export interface PlayerStatValues {
  maxHp: number;
  damage: number;
  flatDamage: number;
  attackSpeed: number;
  moveSpeed: number;
  armor: number;
  hpRegen: number;
  critChance: number;
  critDamage: number;
  projectileSpeed: number;
  projectileSize: number;
  projectileCount: number;
  pierce: number;
  knockback: number;
  pickupRange: number;
  xpGain: number;
  goldGain: number;
  luck: number;
  cooldownReduction: number;
  spellDamageMultiplier: number;
  contactDamageReduction: number;
}

export interface PlayerStats extends PlayerStatValues {
  currentHp: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export type PlayerStatKey = keyof PlayerStatValues;

export interface StatModifier {
  id: string;
  source: 'character' | 'weapon' | 'blessing' | 'upgrade' | 'temporary';
  flat?: Partial<Record<PlayerStatKey, number>>;
  multiply?: Partial<Record<PlayerStatKey, number>>;
}

export interface EnemyStats {
  maxHp: number;
  hp: number;
  damage: number;
  speed: number;
  xpValue: number;
}

export const DEFAULT_PLAYER_STATS: PlayerStatValues = {
  maxHp: 100,
  damage: 1,
  flatDamage: 0,
  attackSpeed: 1,
  moveSpeed: 220,
  armor: 0,
  hpRegen: 0,
  critChance: 0,
  critDamage: 1.5,
  projectileSpeed: 1,
  projectileSize: 1,
  projectileCount: 1,
  pierce: 0,
  knockback: 0,
  pickupRange: 170,
  xpGain: 1,
  goldGain: 1,
  luck: 0,
  cooldownReduction: 0,
  spellDamageMultiplier: 1,
  contactDamageReduction: 0,
};
