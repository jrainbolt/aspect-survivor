import Phaser from 'phaser';
import './style.css';
import { GameScene } from './scenes/GameScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { TownScene } from './scenes/TownScene';
import { BlessingScene } from './scenes/BlessingScene';
import { RunSummaryScene } from './scenes/RunSummaryScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#111418',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [MainMenuScene, CharacterSelectScene, GameScene, TownScene, BlessingScene, RunSummaryScene],
};

new Phaser.Game(config);
