import type { Player } from '../entities/Player';
import { upgradeCatalog, type UpgradeOption } from '../upgrades/Upgrade';

export class UpgradeManager {
  getChoices(count = 3): UpgradeOption[] {
    return Phaser.Utils.Array.Shuffle([...upgradeCatalog]).slice(0, count);
  }

  applyUpgrade(player: Player, upgradeId: string): void {
    const upgrade = upgradeCatalog.find((option) => option.id === upgradeId);
    if (!upgrade) {
      throw new Error(`Unknown upgrade: ${upgradeId}`);
    }

    upgrade.apply(player);
  }
}
