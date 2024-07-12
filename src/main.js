import Phaser from 'phaser'
import MainScene from './scenes/MainScene.js'
import UpgradeScene from './scenes/UpgradeScene.js'
import MenuScene from './scenes/MenuScene.js'
import ClickerScene from './scenes/ClickerScene.js'

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  parent: 'game-container',
  scene: [MainScene, UpgradeScene, MenuScene, ClickerScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
}

const game = new Phaser.Game(config)
