import Phaser from 'phaser'

export default class UpgradeScene extends Phaser.Scene {
  constructor() {
    super('UpgradeScene')
  }

  init(data) {
    this.points = data.points || 0
    this.clickPower = data.clickPower || 1
    this.autoClickPower = data.autoClickPower || 0
    this.bgMusicOn = data.bgMusicOn
    this.soundOn = data.soundOn
    this.clickPowerCost = data.clickPowerCost || 100
    this.autoClickPowerCost = data.autoClickPowerCost || 1000000
    this.autoClickInterval = data.autoClickInterval || 10000
    this.minAutoClickInterval = 1000
  }

  preload() {
    this.load.image('background', '/assets/background.png')
  }

  create() {
    this.add.image(180, 320, 'background')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height)

    this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000, 0.5)
      .setOrigin(0, 0)

    this.createTitle('Upgrades')

    // Increase Click Power button now at the top
    this.createUpgradeButton('Increase Click Power', 100, this.clickPowerCost, () => this.buyUpgrade('clickPower'))

    // Points and Click # info now below the Increase Click Power button
    this.createInfoText('Points', this.points, 180)
    this.createInfoText('Click #', parseFloat(this.clickPower.toFixed(1)), 230)

    // Increase Auto Click button
    this.createUpgradeButton('Increase Auto Click', 300, this.autoClickPowerCost, () => this.buyUpgrade('autoClickPower'))

    // Auto Click info below the Increase Auto Click button
    this.createInfoText('Click Level', this.autoClickPower, 380)
    this.createInfoText('Click Interval', (this.autoClickInterval / 1000).toFixed(1) + 's', 430)

    this.createBackButton()
  }

  createTitle(text) {
    return this.add.text(this.sys.game.config.width / 2, 30, text, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5)
  }

  createInfoText(label, value, y) {
    const container = this.add.container(this.sys.game.config.width / 2, y)

    const labelText = this.add.text(0, 0, label, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(1, 0.5)

    const valueText = this.add.text(10, 0, value.toLocaleString(), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5)

    container.add([labelText, valueText])
    container.setSize(labelText.width + valueText.width + 10, Math.max(labelText.height, valueText.height))

    return container
  }

  createUpgradeButton(text, y, cost, callback) {
    const button = this.add.container(this.sys.game.config.width / 2, y)

    const bg = this.add.rectangle(0, 0, 300, 60, 0x4a4a4a)
      .setStrokeStyle(2, 0xffffff)

    const buttonText = this.add.text(0, -15, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    const costText = this.add.text(0, 15, `Cost: ${cost.toLocaleString()} points`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5)

    button.add([bg, buttonText, costText])
    button.setSize(300, 60)
    button.setInteractive(new Phaser.Geom.Rectangle(-150, -30, 300, 60), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', callback)
      .on('pointerover', () => bg.setFillStyle(0x6a6a6a))
      .on('pointerout', () => bg.setFillStyle(0x4a4a4a))

    return button
  }

  buyUpgrade(type) {
    let cost
    switch (type) {
      case 'clickPower':
        cost = this.clickPowerCost
        if (this.points >= cost) {
          this.points -= cost
          this.clickPower += 1
          this.clickPowerCost += 250
          if (this.soundOn) this.sound.play('upgrade')
          this.saveProgress()
          this.scene.restart(this)
        }
        break
      case 'autoClickPower':
        cost = this.autoClickPowerCost
        if (this.points >= cost) {
          this.points -= cost
          if (this.autoClickInterval > this.minAutoClickInterval) {
            this.autoClickInterval = Math.max(this.autoClickInterval - 100, this.minAutoClickInterval)
          }
          this.autoClickPower++
          this.autoClickPowerCost = Math.floor(this.autoClickPowerCost * 1.5)
          if (this.soundOn) this.sound.play('upgrade')
          this.saveProgress()
          this.scene.restart(this)
        }
        break
    }
  }

  createBackButton() {
    const backButton = this.add.text(180, 600, 'Back', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('MainScene', { 
          points: this.points, 
          clickPower: this.clickPower, 
          autoClickPower: this.autoClickPower, 
          bgMusicOn: this.bgMusicOn, 
          soundOn: this.soundOn,
          clickPowerCost: this.clickPowerCost,
          autoClickPowerCost: this.autoClickPowerCost,
          autoClickInterval: this.autoClickInterval,
        })
      })
      .setStyle({
        backgroundColor: '#333333',
        borderRadius: '10px',
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#000000',
          blur: 5,
          stroke: true,
          fill: true
        }
      })

    backButton.on('pointerover', () => {
      backButton.setStyle({ fill: '#ffff00' })
    })

    backButton.on('pointerout', () => {
      backButton.setStyle({ fill: '#ffffff' })
    })
  }

  saveProgress() {
    localStorage.setItem('clickerGame', JSON.stringify({ 
      points: this.points, 
      clickPower: this.clickPower, 
      autoClickPower: this.autoClickPower,
      clickPowerCost: this.clickPowerCost,
      autoClickPowerCost: this.autoClickPowerCost,
      autoClickInterval: this.autoClickInterval
    }))
  }
}