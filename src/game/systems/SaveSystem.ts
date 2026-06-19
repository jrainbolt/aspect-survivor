import type { RunState, SaveData } from '../types';

const SAVE_KEY = 'aspect-survivor.progress';

export interface SaveResult {
  records: SaveData;
  newRecords: string[];
}

export class SaveSystem {
  static load(): SaveData {
    const legacyBest = Number(localStorage.getItem('aspect-survivor.high-score-seconds') ?? 0);
    const fallback: SaveData = {
      bestSurvivalTime: legacyBest,
      highestAct: 0,
      highestLevel: 0,
      mostEnemiesDefeated: 0,
      mostGoldEarned: 0,
    };
    try {
      return { ...fallback, ...JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}') as Partial<SaveData> };
    } catch {
      return fallback;
    }
  }

  static recordRun(state: RunState): SaveResult {
    const current = this.load();
    const stats = state.runStats;
    const candidates: SaveData = {
      bestSurvivalTime: stats.totalSurvivalTime,
      highestAct: stats.highestActReached,
      highestLevel: stats.levelReached,
      mostEnemiesDefeated: stats.enemiesDefeated,
      mostGoldEarned: stats.goldEarned,
    };
    const labels: Record<keyof SaveData, string> = {
      bestSurvivalTime: 'Best Survival Time',
      highestAct: 'Highest Act',
      highestLevel: 'Highest Level',
      mostEnemiesDefeated: 'Most Enemies Defeated',
      mostGoldEarned: 'Most Gold Earned',
    };
    const newRecords = (Object.keys(candidates) as (keyof SaveData)[])
      .filter((key) => candidates[key] > current[key])
      .map((key) => labels[key]);
    const records: SaveData = {
      bestSurvivalTime: Math.max(current.bestSurvivalTime, candidates.bestSurvivalTime),
      highestAct: Math.max(current.highestAct, candidates.highestAct),
      highestLevel: Math.max(current.highestLevel, candidates.highestLevel),
      mostEnemiesDefeated: Math.max(current.mostEnemiesDefeated, candidates.mostEnemiesDefeated),
      mostGoldEarned: Math.max(current.mostGoldEarned, candidates.mostGoldEarned),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(records));
    localStorage.setItem('aspect-survivor.high-score-seconds', String(Math.floor(records.bestSurvivalTime)));
    return { records, newRecords };
  }
}
