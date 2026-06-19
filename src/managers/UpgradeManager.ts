import type { Player } from '../entities/Player';
import { StatSystem } from '../game/systems/StatSystem';
import type { RunState } from '../game/types';
import { upgradeCatalog, type UpgradeOption } from '../upgrades/Upgrade';

export class UpgradeManager {
  getChoices(count = 3): UpgradeOption[] {
    return Phaser.Utils.Array.Shuffle([...upgradeCatalog]).slice(0, count);
  }

  applyUpgrade(player: Player, state: RunState, upgradeId: string): void {
    const upgrade = upgradeCatalog.find((option) => option.id === upgradeId);
    if (!upgrade) throw new Error(`Unknown upgrade: ${upgradeId}`);
    state.permanentStatModifiers.push({
      id: `upgrade:${upgrade.id}:${state.permanentStatModifiers.length}`,
      source: 'upgrade',
      ...upgrade.modifier,
    });
    StatSystem.syncRunState(state);
    if (upgrade.fullHeal) player.healToFull();
  }
}
