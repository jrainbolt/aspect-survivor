import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { Projectile } from '../entities/Projectile';
import { XpOrb } from '../entities/XpOrb';
import { characterDefinitions } from '../game/data/characters';
import { AudioSystem } from '../game/systems/AudioSystem';
import { BlessingSystem } from '../game/systems/BlessingSystem';
import { DamageTracker } from '../game/systems/DamageTracker';
import { EffectsSystem } from '../game/systems/EffectsSystem';
import { FullscreenSystem } from '../game/systems/FullscreenSystem';
import { NORMAL_ROUND_SECONDS, RunStateSystem } from '../game/systems/RunStateSystem';
import { RunStatsTracker } from '../game/systems/RunStatsTracker';
import { WeaponSystem } from '../game/systems/WeaponSystem';
import type { DamageSource, RunState } from '../game/types';
import { EnemySpawner } from '../managers/EnemySpawner';
import { UpgradeManager } from '../managers/UpgradeManager';
import { WaveManager } from '../managers/WaveManager';
import { XpManager } from '../managers/XpManager';
import { GameEvents } from '../types/events';
import { ArenaBorder } from '../ui/ArenaBorder';
import { Hud } from '../ui/Hud';
import { PauseMenu } from '../ui/PauseMenu';
import { UpgradePanel } from '../ui/UpgradePanel';

export class GameScene extends Phaser.Scene {
  private state!: RunState;
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private xpOrbs!: Phaser.Physics.Arcade.Group;
  private enemySpawner!: EnemySpawner;
  private weaponSystem!: WeaponSystem;
  private blessingSystem!: BlessingSystem;
  private effects!: EffectsSystem;
  private audio = new AudioSystem();
  private damageTracker!: DamageTracker;
  private runStatsTracker!: RunStatsTracker;
  private xpManager!: XpManager;
  private upgradeManager!: UpgradeManager;
  private arenaBorder!: ArenaBorder;
  private hud!: Hud;
  private upgradePanel!: UpgradePanel;
  private pauseMenu!: PauseMenu;
  private arenaBackground!: Phaser.GameObjects.TileSprite;
  private boss?: Enemy;
  private isChoosingUpgrade = false;
  private isPaused = false;
  private roundEnding = false;

  constructor() { super('GameScene'); }

  preload(): void {
    this.createCircleTexture('player', 20, 0xffffff);
    this.createCircleTexture('enemy', 18, 0xffffff);
    this.createCircleTexture('projectile', 6, 0xffffff);
    this.createCircleTexture('xp-orb', 8, 0x118ab2);
    this.createGridTexture();
  }

  create(): void {
    this.resetRoundLifecycle();
    FullscreenSystem.install(this);
    this.physics.resume();
    this.state = RunStateSystem.get(this.registry);
    const character = characterDefinitions[this.state.characterId];
    this.configureBounds(this.scale.width, this.scale.height);
    this.arenaBackground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'arena-grid').setOrigin(0).setDepth(0);

    this.player = new Player(this, this.scale.width / 2, this.scale.height / 2, character, this.state.playerStats);
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: false });
    this.projectiles = this.physics.add.group({ classType: Projectile, runChildUpdate: false });
    this.xpOrbs = this.physics.add.group({ classType: XpOrb, runChildUpdate: false });
    this.upgradeManager = new UpgradeManager();
    this.xpManager = new XpManager(this, this.player, this.upgradeManager);
    this.enemySpawner = new EnemySpawner(this, this.enemies, new WaveManager());
    this.effects = new EffectsSystem(this);
    this.damageTracker = new DamageTracker(this.state);
    this.runStatsTracker = new RunStatsTracker(this.state);
    this.blessingSystem = new BlessingSystem(() => this.state.blessings);
    this.weaponSystem = new WeaponSystem(this.state.weaponId, () => this.state.weaponLevel, () => {
      this.player.playRecoil();
      this.audio.playWeaponFire();
    });
    this.arenaBorder = new ArenaBorder(this);
    this.hud = new Hud(this, this.player);
    this.upgradePanel = new UpgradePanel(this);
    this.pauseMenu = new PauseMenu(this, () => this.state, () => this.resumeGame(), () => this.exitToMainMenu());

    this.registerCollisions();
    this.registerEvents();
    this.input.keyboard?.on('keydown-ESC', this.togglePause, this);
    this.input.keyboard?.on('keydown-M', this.togglePause, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    if (this.state.roundType === 'boss') this.audio.playBossSpawn();
  }

  private resetRoundLifecycle(): void {
    this.isChoosingUpgrade = false;
    this.isPaused = false;
    this.roundEnding = false;
    this.boss = undefined;
  }

  override update(time: number, delta: number): void {
    this.hud.update(this.state, this.boss);
    if (this.player.stats.currentHp <= 0 || this.isChoosingUpgrade || this.isPaused || this.roundEnding) return;

    const deltaSeconds = delta / 1000;
    this.runStatsTracker.addSurvival(deltaSeconds);
    if (this.state.roundType === 'normal') {
      this.state.roundTimer = Math.max(0, this.state.roundTimer - deltaSeconds);
      if (this.state.roundTimer <= 0) {
        this.completeNormalRound();
        return;
      }
    }

    const elapsed = this.state.roundType === 'normal'
      ? NORMAL_ROUND_SECONDS - this.state.roundTimer + (this.state.currentRound - 1) * NORMAL_ROUND_SECONDS
      : 0;
    this.runStatsTracker.recordHealing(this.player.update(time, delta));
    this.enemySpawner.update(time, elapsed, this.state.roundType);
    this.captureBoss();
    this.weaponSystem.update(time, this.player, this.enemies, this.projectiles);
    this.blessingSystem.update(time, (enemy, amount, source) => this.damageEnemy(enemy, amount, source, false));
    this.updateEnemies();
    this.updateProjectiles(time);
    this.updateOrbs();
  }

  private registerCollisions(): void {
    this.physics.add.overlap(this.projectiles, this.enemies, (projectileObject, enemyObject) => {
      const projectile = projectileObject as Projectile;
      const enemy = enemyObject as Enemy;
      if (!projectile.registerHit(enemy.combatId)) return;
      enemy.applyKnockback(new Phaser.Math.Vector2(this.player.x, this.player.y), projectile.knockback);
      this.blessingSystem.onHit(this.time.now, enemy, projectile.damage, this.enemies,
        (target, amount, source) => this.damageEnemy(target, amount, source, false));
      this.damageEnemy(enemy, projectile.damage, projectile.source, true);
    });

    this.physics.add.overlap(this.player, this.enemies, (_playerObject, enemyObject) => {
      const enemy = enemyObject as Enemy;
      const damageTaken = this.player.takeDamage(enemy.stats.damage, this.time.now);
      if (damageTaken > 0) {
        this.runStatsTracker.recordDamageTaken(damageTaken);
        this.audio.playPlayerHurt();
        this.events.emit(GameEvents.StatsChanged);
      }
      if (this.player.stats.currentHp <= 0) this.endGame();
    });

    this.physics.add.overlap(this.player, this.xpOrbs, (_playerObject, orbObject) => {
      const orb = orbObject as XpOrb;
      this.effects.pickup(orb.x, orb.y);
      this.audio.playPickup();
      const amount = Math.max(1, Math.round(orb.amount * this.player.stats.xpGain));
      this.runStatsTracker.recordXp(amount);
      this.events.emit(GameEvents.XpCollected, { amount });
      orb.destroy();
    });
  }

  private registerEvents(): void {
    this.events.on(GameEvents.XpCollected, this.handleXpCollected, this);
    this.events.on(GameEvents.LevelUp, this.handleLevelUp, this);
    this.events.on(GameEvents.UpgradeSelected, this.handleUpgradeSelected, this);
  }

  private handleXpCollected({ amount }: { amount: number }): void {
    this.xpManager.addXp(amount);
    this.runStatsTracker.recordLevel(this.player.stats.level);
  }

  private handleLevelUp({ choices }: { choices: ReturnType<UpgradeManager['getChoices']> }): void {
    this.isChoosingUpgrade = true;
    this.physics.pause();
    this.effects.levelUp(this.player.x, this.player.y);
    this.audio.playLevelUp();
    this.upgradePanel.show(choices);
  }

  private handleUpgradeSelected({ upgradeId }: { upgradeId: string }): void {
    this.upgradeManager.applyUpgrade(this.player, this.state, upgradeId);
    this.isChoosingUpgrade = false;
    this.physics.resume();
  }

  private damageEnemy(enemy: Enemy, amount: number, source: DamageSource, allowEffects: boolean): void {
    if (!enemy.active) return;
    const actualDamage = Math.min(enemy.stats.hp, amount);
    this.damageTracker.record({ ...source, amount: actualDamage });
    if (allowEffects) this.audio.playHit();
    this.effects.showDamage(enemy, Math.round(actualDamage), allowEffects ? '#ffffff' : '#ff9f8f');
    if (enemy.takeDamage(amount)) this.killEnemy(enemy);
  }

  private killEnemy(enemy: Enemy): void {
    const { x, y, kind } = enemy;
    const xpValue = enemy.stats.xpValue;
    const baseGold = kind === 'boss' ? 50 : kind === 'brute' ? 3 : 1;
    const gold = Math.max(1, Math.round(baseGold * this.player.stats.goldGain));
    this.runStatsTracker.recordKill(kind, gold);
    this.effects.enemyDeath(x, y, enemy.visualColor);
    this.xpOrbs.add(new XpOrb(this, x, y, xpValue));
    enemy.destroy();
    if (kind === 'boss') this.completeBossRound();
  }

  private captureBoss(): void {
    if (this.boss?.active || this.state.roundType !== 'boss') return;
    this.boss = this.enemies.getChildren().find((child) => (child as Enemy).kind === 'boss') as Enemy | undefined;
  }

  private updateEnemies(): void {
    const target = new Phaser.Math.Vector2(this.player.x, this.player.y);
    for (const child of this.enemies.getChildren()) (child as Enemy).chase(target);
  }

  private updateProjectiles(time: number): void {
    for (const child of this.projectiles.getChildren()) {
      const projectile = child as Projectile;
      if (projectile.active && time > projectile.expiresAt) projectile.disableBody(true, true);
    }
  }

  private updateOrbs(): void {
    const target = new Phaser.Math.Vector2(this.player.x, this.player.y);
    for (const child of this.xpOrbs.getChildren()) {
      const orb = child as XpOrb;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y) < this.player.stats.pickupRange) orb.attractTo(target, 300);
    }
  }

  private completeNormalRound(): void {
    this.roundEnding = true;
    this.runStatsTracker.recordRoundComplete();
    this.state.campRewards = { heal: false, weapon: false, blessing: false };
    this.physics.pause();
    this.time.delayedCall(350, () => this.scene.start('TownScene'));
  }

  private completeBossRound(): void {
    if (this.roundEnding) return;
    this.roundEnding = true;
    this.runStatsTracker.recordRoundComplete();
    this.runStatsTracker.recordAct(this.state.currentAct);
    this.state.result = 'act-complete';
    this.physics.pause();
    this.time.delayedCall(700, () => this.scene.start('BlessingScene', { returnScene: 'RunSummaryScene', major: true }));
  }

  private endGame(): void {
    this.roundEnding = true;
    this.state.result = 'defeat';
    this.physics.pause();
    this.time.delayedCall(350, () => this.scene.start('RunSummaryScene'));
  }

  private togglePause(): void {
    if (this.player.stats.currentHp <= 0 || this.isChoosingUpgrade || this.roundEnding) return;
    if (this.isPaused) this.resumeGame(); else this.pauseGame();
  }
  private pauseGame(): void { this.isPaused = true; this.physics.pause(); this.pauseMenu.show(); }
  private resumeGame(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.pauseMenu.destroy();
    this.physics.resume();
  }
  private exitToMainMenu(): void { this.pauseMenu.destroy(); this.scene.start('MainMenuScene'); }

  private configureBounds(width: number, height: number): void {
    this.physics.world.setBounds(0, 0, width, height);
    this.cameras.main.setBounds(0, 0, width, height);
  }
  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.configureBounds(gameSize.width, gameSize.height);
    this.arenaBackground.setSize(gameSize.width, gameSize.height);
    this.arenaBorder.resize(gameSize.width, gameSize.height);
    this.player.setPosition(
      Phaser.Math.Clamp(this.player.x, 24, gameSize.width - 24),
      Phaser.Math.Clamp(this.player.y, 24, gameSize.height - 24),
    );
    this.pauseMenu.resize();
  }
  private handleShutdown(): void {
    this.input.keyboard?.off('keydown-ESC', this.togglePause, this);
    this.input.keyboard?.off('keydown-M', this.togglePause, this);
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.off(GameEvents.XpCollected, this.handleXpCollected, this);
    this.events.off(GameEvents.LevelUp, this.handleLevelUp, this);
    this.events.off(GameEvents.UpgradeSelected, this.handleUpgradeSelected, this);
    this.pauseMenu?.destroy();
    this.upgradePanel?.destroy();
  }

  private createCircleTexture(key: string, radius: number, color: number): void {
    if (this.textures.exists(key)) return;
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(color, 1).fillCircle(radius, radius, radius).generateTexture(key, radius * 2, radius * 2).destroy();
  }
  private createGridTexture(): void {
    if (this.textures.exists('arena-grid')) return;
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x151a21, 1).fillRect(0, 0, 64, 64);
    graphics.lineStyle(1, 0x232a34, 1).strokeLineShape(new Phaser.Geom.Line(0, 0, 64, 0));
    graphics.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, 64)).generateTexture('arena-grid', 64, 64).destroy();
  }
}
