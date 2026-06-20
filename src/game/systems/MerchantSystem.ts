import { merchantItems, type MerchantItemDefinition, type MerchantItemId } from '../data/merchantItems';
import type { RunState } from '../types';
import { RunStatsTracker } from './RunStatsTracker';
import { StatSystem } from './StatSystem';

export interface PurchaseResult { success: boolean; message: string; healing?: number; }

export class MerchantSystem {
  static getPrice(item: MerchantItemDefinition, state: RunState): number {
    if (item.id === 'weapon-upgrade') return item.basePrice + Math.max(0, state.weaponLevel - 1) * 15;
    return item.basePrice;
  }

  static purchase(state: RunState, id: MerchantItemId): PurchaseResult {
    const item = merchantItems.find((entry) => entry.id === id);
    if (!item) return { success: false, message: 'Unknown merchant item.' };
    const price = this.getPrice(item, state);
    if (state.gold < price) return { success: false, message: `Requires ${price} gold.` };
    if (id === 'heal' && state.playerStats.currentHp >= state.playerStats.maxHp) return { success: false, message: 'Health is already full.' };
    state.gold -= price;

    if (id === 'heal') {
      const before = state.playerStats.currentHp;
      state.playerStats.currentHp = Math.min(state.playerStats.maxHp, before + Math.ceil(state.playerStats.maxHp * 0.3));
      const healing = state.playerStats.currentHp - before;
      new RunStatsTracker(state).recordHealing(healing);
      return { success: true, message: `Restored ${Math.round(healing)} HP.`, healing };
    }
    if (id === 'weapon-upgrade') state.weaponLevel += 1;
    if (id === 'max-hp') state.permanentStatModifiers.push({ id: `merchant:max-hp:${Date.now()}`, source: 'upgrade', flat: { maxHp: 5 } });
    if (id === 'damage') state.permanentStatModifiers.push({ id: `merchant:damage:${Date.now()}`, source: 'upgrade', flat: { flatDamage: 2 } });
    if (id === 'blessing-reroll') state.blessingRerolls += 1;
    StatSystem.syncRunState(state);
    return { success: true, message: `${item.displayName} purchased.` };
  }
}
