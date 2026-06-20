import Phaser from 'phaser';
import { Enemy, type EnemyConfig, type EnemyKind } from '../entities/Enemy';
import type { RoundType } from '../game/types';
import type { RoundDefinition } from '../game/data/rounds';

const enemyConfigs: Record<EnemyKind, EnemyConfig> = {
  grunt: {
    kind: 'grunt',
    tint: 0xef476f,
    scale: 1,
    stats: { maxHp: 28, hp: 28, damage: 12, speed: 92, xpValue: 4 },
  },
  runner: {
    kind: 'runner',
    tint: 0x06d6a0,
    scale: 0.82,
    stats: { maxHp: 18, hp: 18, damage: 8, speed: 155, xpValue: 5 },
  },
  brute: {
    kind: 'brute',
    tint: 0xf8961e,
    scale: 1.35,
    stats: { maxHp: 70, hp: 70, damage: 18, speed: 65, xpValue: 10 },
  },
  boss: {
    kind: 'boss',
    tint: 0x9b5de5,
    scale: 2.7,
    stats: { maxHp: 5000, hp: 5000, damage: 38, speed: 55, xpValue: 150 },
  },
};

export class EnemySpawner {
  private nextSpawnAt = 0;
  private bossSpawned = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly enemies: Phaser.Physics.Arcade.Group,
  ) {}

  update(time: number, roundType: RoundType, definition?: RoundDefinition, alreadySpawned = 0): number {
    if (roundType === 'boss') {
      if (!this.bossSpawned) {
        this.spawnAt('boss', this.scene.scale.width / 2, 105);
        this.bossSpawned = true;
      }
      return 0;
    }

    if (!definition || alreadySpawned >= definition.totalEnemyCount || time < this.nextSpawnAt) return 0;

    const spawnCount = Math.min(definition.waveSize, definition.totalEnemyCount - alreadySpawned);
    for (let index = 0; index < spawnCount; index += 1) {
      this.spawn(this.chooseEnemy(definition));
    }

    this.nextSpawnAt = time + definition.waveIntervalMs;
    return spawnCount;
  }

  private chooseEnemy(definition: RoundDefinition): EnemyKind {
    const totalWeight = definition.enemyComposition.reduce((total, entry) => total + entry.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const entry of definition.enemyComposition) {
      roll -= entry.weight;
      if (roll <= 0) return entry.kind;
    }
    return definition.enemyComposition.at(-1)?.kind ?? 'grunt';
  }

  private spawn(kind: EnemyKind): void {
    const { width, height } = this.scene.scale;
    const margin = 22;
    const side = Phaser.Math.Between(0, 3);
    const x = side === 0 ? margin : side === 1 ? width - margin : Phaser.Math.Between(margin, width - margin);
    const y = side === 2 ? margin : side === 3 ? height - margin : Phaser.Math.Between(margin, height - margin);
    this.spawnAt(kind, x, y);
  }

  spawnAt(kind: EnemyKind, x: number, y: number): Enemy {
    const enemy = new Enemy(this.scene, x, y, enemyConfigs[kind]);
    this.enemies.add(enemy);
    return enemy;
  }
}
