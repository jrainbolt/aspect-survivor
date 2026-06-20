import type { Player } from '../entities/Player';
import { StatSystem } from '../game/systems/StatSystem';
import type { RunState } from '../game/types';
import { upgradeCatalog, type UpgradeOption } from '../upgrades/Upgrade';

export class UpgradeManager {
  constructor(private readonly getState: () => RunState) {}

  getChoices(count = 3): UpgradeOption[] {
    const state = this.getState();
    const generic = Phaser.Utils.Array.Shuffle(upgradeCatalog.filter((upgrade) => upgrade.category === 'generic'));
    const hero = Phaser.Utils.Array.Shuffle(upgradeCatalog.filter((upgrade) => upgrade.category === 'hero'
      && upgrade.characterId === state.characterId && !state.heroUpgrades.includes(upgrade.id)));
    const choices = hero.length > 0 ? [hero[0], ...generic.slice(0, Math.max(0, count - 1))] : generic.slice(0, count);
    return Phaser.Utils.Array.Shuffle(choices);
  }

  applyUpgrade(player: Player, state: RunState, upgradeId: string): void {
    const upgrade = upgradeCatalog.find((option) => option.id === upgradeId);
    if (!upgrade) throw new Error(`Unknown upgrade: ${upgradeId}`);
    state.permanentStatModifiers.push({
      id: `upgrade:${upgrade.id}:${state.permanentStatModifiers.length}`,
      source: 'upgrade',
      ...upgrade.modifier,
    });
    if (upgrade.category === 'hero' && !state.heroUpgrades.includes(upgrade.id)) state.heroUpgrades.push(upgrade.id);
    StatSystem.syncRunState(state);
    if (upgrade.fullHeal) player.healToFull();
  }
}
