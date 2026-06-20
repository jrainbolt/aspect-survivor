import { characterDefinitions } from '../data/characters';
import { getRoundDefinition } from '../data/rounds';
import type { CharacterId, RunState, RunStatsSnapshot } from '../types';
import { StatSystem } from './StatSystem';

export const RUN_STATE_KEY = 'active-run';
const createRunStats = (): RunStatsSnapshot => ({
  runStartTime: Date.now(), totalSurvivalTime: 0, enemiesDefeated: 0, elitesDefeated: 0,
  bossesDefeated: 0, goldEarned: 0, xpCollected: 0, levelReached: 1, roundsCompleted: 0,
  roundsCleared: 0, roundClearTimes: [], enemiesTargetThisRound: getRoundDefinition(1, 1)?.totalEnemyCount ?? 0,
  enemiesSpawnedThisRound: 0, enemiesDefeatedThisRound: 0,
  highestActReached: 1, blessingsChosen: 0, damageTaken: 0, healingReceived: 0,
});

export class RunStateSystem {
  static create(characterId: CharacterId): RunState {
    const character = characterDefinitions[characterId];
    const playerStats = StatSystem.calculate({ characterId, weaponId: character.startingWeaponId, weaponLevel: 1, blessings: [] });
    return {
      characterId,
      currentAct: 1,
      currentRound: 1,
      roundType: 'normal',
      roundElapsedTime: 0,
      enemiesTargetThisRound: getRoundDefinition(1, 1)?.totalEnemyCount ?? 0,
      enemiesSpawnedThisRound: 0,
      enemiesDefeatedThisRound: 0,
      totalSurvivalTime: 0,
      enemiesDefeated: 0,
      gold: 0,
      playerStats,
      weaponId: character.startingWeaponId,
      weaponLevel: 1,
      specializationId: undefined,
      specializationLevel: 0,
      blessings: [],
      blessingRerolls: 0,
      permanentStatModifiers: [],
      temporaryStatModifiers: [],
      damageSources: {},
      runStats: createRunStats(),
      campRewards: { heal: false, weapon: false, blessing: false, specialization: false },
    };
  }

  static get(registry: Phaser.Data.DataManager): RunState {
    const state = registry.get(RUN_STATE_KEY) as RunState | undefined;
    if (!state) throw new Error('No active run. Select a character first.');
    this.migrate(state);
    return state;
  }

  static set(registry: Phaser.Data.DataManager, state: RunState): void {
    registry.set(RUN_STATE_KEY, state);
  }

  static prepareNextRound(state: RunState): void {
    state.campRewards = { heal: false, weapon: false, blessing: false, specialization: false };
    if (state.currentRound < 3) {
      state.currentRound += 1;
      state.roundType = 'normal';
      this.resetRoundProgress(state);
      return;
    }
    state.currentRound = 4;
    state.roundType = 'boss';
    this.resetRoundProgress(state);
  }

  private static migrate(state: RunState): void {
    if ((state.weaponId as string) === 'holy-hammer') state.weaponId = 'sword-shield';
    const legacyStats = state.playerStats as unknown as { hp?: number; currentHp?: number };
    legacyStats.currentHp ??= legacyStats.hp ?? state.playerStats.maxHp;
    state.campRewards ??= { heal: false, weapon: false, blessing: false, specialization: false };
    state.campRewards.specialization ??= false;
    state.specializationLevel ??= state.specializationId ? 1 : 0;
    state.blessingRerolls ??= 0;
    state.permanentStatModifiers ??= [];
    state.temporaryStatModifiers ??= [];
    state.damageSources ??= {};
    state.runStats ??= {
      ...createRunStats(),
      totalSurvivalTime: state.totalSurvivalTime,
      enemiesDefeated: state.enemiesDefeated,
      goldEarned: state.gold,
      levelReached: state.playerStats.level,
      roundsCompleted: Math.max(0, state.currentRound - 1),
      highestActReached: state.currentAct,
      blessingsChosen: state.blessings.length,
    };
    state.roundElapsedTime ??= 0;
    const definition = getRoundDefinition(state.currentAct, state.currentRound);
    state.enemiesTargetThisRound ??= state.roundType === 'normal' ? definition?.totalEnemyCount ?? 0 : 0;
    state.enemiesSpawnedThisRound ??= 0;
    state.enemiesDefeatedThisRound ??= 0;
    state.runStats.roundsCleared ??= state.runStats.roundsCompleted;
    state.runStats.roundClearTimes ??= [];
    state.runStats.enemiesTargetThisRound ??= state.enemiesTargetThisRound;
    state.runStats.enemiesSpawnedThisRound ??= state.enemiesSpawnedThisRound;
    state.runStats.enemiesDefeatedThisRound ??= state.enemiesDefeatedThisRound;
    state.runStats.victoryStatus ??= state.result === 'act-complete' ? 'act1_complete' : state.result === 'defeat' ? 'died' : undefined;
    StatSystem.syncRunState(state);
  }

  private static resetRoundProgress(state: RunState): void {
    const definition = getRoundDefinition(state.currentAct, state.currentRound);
    state.roundElapsedTime = 0;
    state.enemiesTargetThisRound = state.roundType === 'normal' ? definition?.totalEnemyCount ?? 0 : 0;
    state.enemiesSpawnedThisRound = 0;
    state.enemiesDefeatedThisRound = 0;
    state.runStats.enemiesTargetThisRound = state.enemiesTargetThisRound;
    state.runStats.enemiesSpawnedThisRound = 0;
    state.runStats.enemiesDefeatedThisRound = 0;
  }
}
