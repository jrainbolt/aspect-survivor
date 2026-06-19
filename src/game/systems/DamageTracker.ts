import type { DamageEvent, DamageSourceRecord, RunState } from '../types';

export class DamageTracker {
  constructor(private readonly state: RunState) {}

  record(event: DamageEvent): void {
    if (event.amount <= 0) return;
    const existing = this.state.damageSources[event.sourceId];
    if (existing) {
      existing.amount += event.amount;
      return;
    }
    this.state.damageSources[event.sourceId] = { ...event };
  }

  getTopSources(limit = 5): DamageSourceRecord[] {
    return Object.values(this.state.damageSources).sort((a, b) => b.amount - a.amount).slice(0, limit);
  }
}
