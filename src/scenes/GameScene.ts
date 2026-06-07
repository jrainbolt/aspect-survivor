import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { XpOrb } from '../entities/XpOrb';
import { EnemySpawner } from '../managers/EnemySpawner';
import { UpgradeManager } from '../managers/UpgradeManager';
import { WaveManager } from '../managers/WaveManager';
import { XpManager } from '../managers/XpManager';
import { GameEvents } from '../types/events';
import { Hud } from '../ui/Hud';
import { UpgradePanel } from '../ui/UpgradePanel';
import { WeaponManager } from '../weapons/WeaponManager';

const HIGH_SCORE_KEY = 'aspect-survivor.high-score-seconds';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private xpOrbs!: Phaser.Physics.Arcade.Group;
  private enemySpawner!: EnemySpawner;
  private waveManager!: WaveManager;
  private xpManager!: XpManager;
  private upgradeManager!: UpgradeManager;
  private weaponManager!: WeaponManager;
  private hud!: Hud;
  private upgradePanel!: UpgradePanel;
  private startedAt = 0;
  private upgradePausedAt = 0;
  private isChoosingUpgrade = false;
  private highScoreSeconds = 0;
  private gameOverText?: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  preload(): void {
    this.createCircleTexture('player', 20, 0x4ecdc4);
    this.createCircleTexture('enemy', 18, 0xef476f);
    this.createCircleTexture('projectile', 6, 0xffd166);
    this.createCircleTexture('xp-orb', 8, 0x118ab2);
    this.createGridTexture();
  }

  create(): void {
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'arena-grid').setOrigin(0).setDepth(0);

    this.player = new Player(this, this.scale.width / 2, this.scale.height / 2);
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: false });
    this.projectiles = this.physics.add.group({ classType: Projectile, runChildUpdate: false });
    this.xpOrbs = this.physics.add.group({ classType: XpOrb, runChildUpdate: false });

    this.waveManager = new WaveManager();
    this.upgradeManager = new UpgradeManager();
    this.weaponManager = new WeaponManager();
    this.enemySpawner = new EnemySpawner(this, this.enemies, this.waveManager);
    this.xpManager = new XpManager(this, this.player, this.upgradeManager);
    this.hud = new Hud(this, this.player);
    this.upgradePanel = new UpgradePanel(this);
    this.startedAt = this.time.now;
    this.highScoreSeconds = Number(localStorage.getItem(HIGH_SCORE_KEY) ?? 0);

    this.registerCollisions();
    this.registerEvents();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
  }

  override update(time: number): void {
    if (this.player.stats.hp <= 0) {
      return;
    }

    const elapsedSeconds = ((this.isChoosingUpgrade ? this.upgradePausedAt : time) - this.startedAt) / 1000;
    this.hud.update(elapsedSeconds, this.highScoreSeconds);
    if (this.isChoosingUpgrade) {
      return;
    }

    this.player.update(time);
    this.enemySpawner.update(time, elapsedSeconds);
    this.weaponManager.update(time, this.player, this.enemies, this.projectiles);
    this.updateEnemies();
    this.updateProjectiles(time);
    this.updateOrbs();
  }

  private registerCollisions(): void {
    this.physics.add.overlap(this.projectiles, this.enemies, (projectileObject, enemyObject) => {
      const projectile = projectileObject as Projectile;
      const enemy = enemyObject as Enemy;
      projectile.disableBody(true, true);

      if (enemy.takeDamage(projectile.damage)) {
        this.events.emit(GameEvents.EnemyKilled, { x: enemy.x, y: enemy.y, xpValue: enemy.stats.xpValue });
        enemy.destroy();
      }
    });

    this.physics.add.overlap(this.player, this.enemies, (_playerObject, enemyObject) => {
      const enemy = enemyObject as Enemy;
      const damaged = this.player.takeDamage(enemy.stats.damage, this.time.now);
      if (damaged) {
        this.events.emit(GameEvents.StatsChanged);
      }
      if (this.player.stats.hp <= 0) {
        this.endGame();
      }
    });

    this.physics.add.overlap(this.player, this.xpOrbs, (_playerObject, orbObject) => {
      const orb = orbObject as XpOrb;
      this.events.emit(GameEvents.XpCollected, { amount: orb.amount });
      orb.destroy();
    });
  }

  private registerEvents(): void {
    this.events.on(GameEvents.EnemyKilled, ({ x, y, xpValue }: { x: number; y: number; xpValue: number }) => {
      this.xpOrbs.add(new XpOrb(this, x, y, xpValue));
    });

    this.events.on(GameEvents.XpCollected, ({ amount }: { amount: number }) => {
      this.xpManager.addXp(amount);
    });

    this.events.on(GameEvents.LevelUp, ({ choices }: { choices: ReturnType<UpgradeManager['getChoices']> }) => {
      this.isChoosingUpgrade = true;
      this.upgradePausedAt = this.time.now;
      this.physics.pause();
      this.upgradePanel.show(choices);
    });

    this.events.on(GameEvents.UpgradeSelected, ({ upgradeId }: { upgradeId: string }) => {
      this.upgradeManager.applyUpgrade(this.player, upgradeId);
      this.startedAt += this.time.now - this.upgradePausedAt;
      this.isChoosingUpgrade = false;
      this.physics.resume();
      this.events.emit(GameEvents.StatsChanged);
    });
  }

  private updateEnemies(): void {
    const playerPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    for (const child of this.enemies.getChildren()) {
      (child as Enemy).chase(playerPosition);
    }
  }

  private updateProjectiles(time: number): void {
    for (const child of this.projectiles.getChildren()) {
      const projectile = child as Projectile;
      if (projectile.active && time > projectile.expiresAt) {
        projectile.disableBody(true, true);
      }
    }
  }

  private updateOrbs(): void {
    const playerPosition = new Phaser.Math.Vector2(this.player.x, this.player.y);
    for (const child of this.xpOrbs.getChildren()) {
      const orb = child as XpOrb;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y);
      if (distance < 150) {
        orb.attractTo(playerPosition, 260);
      }
    }
  }

  private endGame(): void {
    const survivedSeconds = Math.floor((this.time.now - this.startedAt) / 1000);
    this.highScoreSeconds = Math.max(this.highScoreSeconds, survivedSeconds);
    localStorage.setItem(HIGH_SCORE_KEY, String(this.highScoreSeconds));
    this.physics.pause();

    this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Game Over\nPress R to Restart', {
      align: 'center',
      color: '#ffffff',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '34px',
      fontStyle: '800',
      lineSpacing: 12,
      stroke: '#111418',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(120);

    this.input.keyboard?.once('keydown-R', () => this.scene.restart());
    this.events.emit(GameEvents.PlayerDied, { survivedSeconds, level: this.player.stats.level });
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.physics.world.setBounds(0, 0, gameSize.width, gameSize.height);
    this.gameOverText?.setPosition(gameSize.width / 2, gameSize.height / 2);
  }

  private createCircleTexture(key: string, radius: number, color: number): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(color, 1);
    graphics.fillCircle(radius, radius, radius);
    graphics.generateTexture(key, radius * 2, radius * 2);
    graphics.destroy();
  }

  private createGridTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x151a21, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.lineStyle(1, 0x232a34, 1);
    graphics.strokeLineShape(new Phaser.Geom.Line(0, 0, 64, 0));
    graphics.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, 64));
    graphics.generateTexture('arena-grid', 64, 64);
    graphics.destroy();
  }
}
