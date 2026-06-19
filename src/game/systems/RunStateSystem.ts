import { characterDefinitions } from '../data/characters';
import type { CharacterId, RunState, RunStatsSnapshot } from '../types';
import { StatSystem } from './StatSystem';

export const RUN_STATE_KEY = 'active-run';
export const NORMAL_ROUND_SECONDS = 60;

const createRunStats = (): RunStatsSnapshot => ({
  runStartTime: Date.now(), totalSurvivalTime: 0, enemiesDefeated: 0, elitesDefeated: 0,
  bossesDefeated: 0, goldEarned: 0, xpCollected: 0, levelReached: 1, roundsCompleted: 0,
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
      roundTimer: NORMAL_ROUND_SECONDS,
      totalSurvivalTime: 0,
      enemiesDefeated: 0,
      gold: 0,
      playerStats,
      weaponId: character.startingWeaponId,
      weaponLevel: 1,
      blessings: [],
      permanentStatModifiers: [],
      temporaryStatModifiers: [],
      damageSources: {},
      runStats: createRunStats(),
      campRewards: { heal: false, weapon: false, blessing: false },
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
    state.campRewards = { heal: false, weapon: false, blessing: false };
    if (state.currentRound < 3) {
      state.currentRound += 1;
      state.roundType = 'normal';
      state.roundTimer = NORMAL_ROUND_SECONDS;
      return;
    }
    state.currentRound = 4;
    state.roundType = 'boss';
    state.roundTimer = 0;
  }

  private static migrate(state: RunState): void {
    const legacyStats = state.playerStats as unknown as { hp?: number; currentHp?: number };
    legacyStats.currentHp ??= legacyStats.hp ?? state.playerStats.maxHp;
    state.campRewards ??= { heal: false, weapon: false, blessing: false };
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
    StatSystem.syncRunState(state);
  }
}
