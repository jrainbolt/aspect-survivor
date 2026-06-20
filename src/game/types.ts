import type { PlayerStats, PlayerStatValues, StatModifier } from '../types/stats';

export type CharacterId = 'amazon' | 'sorcerer' | 'paladin';
export type WeaponId = 'javelin' | 'arcane-bolt' | 'sword-shield';
export type BlessingId = 'jupiter-spark' | 'mars-bloodletting' | 'neptune-tidal-push';
export type PaladinSpecializationId = 'crusader' | 'templar' | 'guardian';
export type SorcererSpecializationId = 'pyromancer' | 'cryomancer' | 'stormcaller';
export type AmazonSpecializationId = 'wayfarer';
export type SpecializationId = PaladinSpecializationId | SorcererSpecializationId | AmazonSpecializationId;
export type RoundType = 'normal' | 'boss';
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'bleed' | 'water' | 'holy' | 'arcane' | 'unknown';

export interface PassiveModifiers {
  moveSpeedMultiplier?: number;
  spellDamageMultiplier?: number;
  maxHpBonus?: number;
  contactDamageReduction?: number;
}

export interface PlaceholderVisualConfig {
  color: number;
  accentColor: number;
  shape: 'circle' | 'diamond' | 'shield';
}

export interface CharacterDefinition {
  id: CharacterId;
  displayName: string;
  description: string;
  baseStats: Partial<PlayerStatValues>;
  startingWeaponId: WeaponId;
  passiveLabel: string;
  passiveModifiers: PassiveModifiers;
  visual: PlaceholderVisualConfig;
}

export type SpecializationIcon = 'blade' | 'tower-shield' | 'pike' | 'fire' | 'frost' | 'lightning' | 'javelin';

export interface SpecializationSummary {
  id: SpecializationId;
  characterId: CharacterId;
  displayName: string;
  weaponName: string;
  description: string;
  pros: readonly string[];
  cons: readonly string[];
  startingBonus: string;
  rangeLabel: string;
  specialText: string;
  choiceSummary: string;
  color: number;
  icon: SpecializationIcon;
  statModifier: StatModifier;
}

export interface WeaponDefinition {
  id: WeaponId;
  displayName: string;
  damageType: DamageType;
  baseDamage: number;
  cooldownMs: number;
  projectileSpeed: number;
  range: number;
  pierce: number;
  knockback: number;
  projectileColor: number;
  projectileScale: number;
}

export type BlessingEffect = 'chain-lightning' | 'bleed' | 'knockback';

export interface BlessingDefinition {
  id: BlessingId;
  god: 'Jupiter' | 'Mars' | 'Neptune';
  displayName: string;
  description: string;
  effect: BlessingEffect;
  color: number;
}

export interface BlessingRankDefinition {
  rank: 1 | 2 | 3;
  effectText: string;
  chance?: number;
  bounces?: number;
  damageMultiplier?: number;
  durationMs?: number;
  knockbackBonus?: number;
  slowMs?: number;
}

export interface DamageSourceRecord {
  sourceId: string;
  sourceName: string;
  damageType: DamageType;
  amount: number;
  critical?: boolean;
}

export type DamageSource = Omit<DamageSourceRecord, 'amount'>;
export interface DamageEvent extends DamageSource { amount: number; }

export interface RunStatsSnapshot {
  runStartTime: number;
  totalSurvivalTime: number;
  enemiesDefeated: number;
  elitesDefeated: number;
  bossesDefeated: number;
  goldEarned: number;
  xpCollected: number;
  levelReached: number;
  roundsCompleted: number;
  roundsCleared: number;
  roundClearTimes: number[];
  enemiesTargetThisRound: number;
  enemiesSpawnedThisRound: number;
  enemiesDefeatedThisRound: number;
  victoryStatus?: 'died' | 'act1_complete';
  highestActReached: number;
  blessingsChosen: number;
  damageTaken: number;
  healingReceived: number;
}

export interface RunState {
  characterId: CharacterId;
  currentAct: number;
  currentRound: number;
  roundType: RoundType;
  roundElapsedTime: number;
  enemiesTargetThisRound: number;
  enemiesSpawnedThisRound: number;
  enemiesDefeatedThisRound: number;
  totalSurvivalTime: number;
  enemiesDefeated: number;
  gold: number;
  playerStats: PlayerStats;
  weaponId: WeaponId;
  weaponLevel: number;
  specializationId?: SpecializationId;
  specializationLevel: number;
  blessings: BlessingId[];
  blessingRerolls: number;
  permanentStatModifiers: StatModifier[];
  temporaryStatModifiers: StatModifier[];
  heroUpgrades: string[];
  damageSources: Record<string, DamageSourceRecord>;
  runStats: RunStatsSnapshot;
  result?: 'defeat' | 'act-complete';
  campRewards: {
    heal: boolean;
    weapon: boolean;
    blessing: boolean;
    specialization: boolean;
  };
}

export interface SaveData {
  bestSurvivalTime: number;
  highestAct: number;
  highestLevel: number;
  mostEnemiesDefeated: number;
  mostGoldEarned: number;
}
