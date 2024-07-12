import Phaser from 'phaser'

export default class ClickerScene extends Phaser.Scene {
  constructor() {
    super('ClickerScene')
    this.clickers = [
      { name: 'Default Clicker', image: 'clicker', cost: 0, equipped: true },
      { name: 'MMF Mama', image: 'new_clicker1', cost: 10000000, equipped: false },
      { name: 'MMF Chad', image: 'new_clicker2', cost: 50000000, equipped: false },
      // Add more clickers here
    ]
    this.uiHeight = 100 // Height of the bottom UI area
  }

  init(data) {
    this.points = data.points || 0
    this.clickPower = data.clickPower || 1
    this.autoClickPower = data.autoClickPower || 0
    this.bgMusicOn = data.bgMusicOn
    this.soundOn = data.soundOn
    this.clickPowerCost = data.clickPowerCost || 100
    this.autoClickPowerCost = data.autoClickPowerCost || 1000000
    this.rebirthCount = data.rebirthCount || 0
  }

  preload() {
    this.load.image('background', '/assets/background.png')
    this.clickers.forEach(clicker => {
      this.load.image(clicker.image, `/assets/${clicker.image}.png`)
    })
  }

  create() {
    this.add.image(180, 320, 'background')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height)

    this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000, 0.5)
      .setOrigin(0, 0)

    // Add bottom black UI background
    this.add.rectangle(
      this.sys.game.config.width / 2,
      this.sys.game.config.height - this.uiHeight / 2,
      this.sys.game.config.width,
      this.uiHeight,
      0x000000
    ).setOrigin(0.5);

    this.createScrollableArea()

    // Add "Buy New Clicker image!" text
    this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height - this.uiHeight + 20, 'Buy New Clicker image!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Move Points text to the bottom
    this.pointsText = this.createInfoText('Points', this.points, this.sys.game.config.height - this.uiHeight / 2)

    this.createBackButton()
  }

  createScrollableArea() {
    const scrollStartY = 10
    const scrollableArea = this.add.container(0, scrollStartY)
    const maskHeight = this.sys.game.config.height - this.uiHeight - scrollStartY
    const mask = this.add.graphics().fillRect(0, scrollStartY, 320, maskHeight)
    scrollableArea.setMask(new Phaser.Display.Masks.GeometryMask(this, mask))

    let yPosition = -10
    this.clickers.forEach((clicker, index) => {
      const clickerButton = this.createClickerButton(clicker, yPosition)
      scrollableArea.add(clickerButton)
      yPosition += 182
    })

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      scrollableArea.y -= deltaY;
      const maxScrollY = -yPosition + maskHeight;
      scrollableArea.y = Phaser.Math.Clamp(scrollableArea.y, maxScrollY, 0);
    });

    this.input.on('pointerdown', (pointer) => {
      this.dragStartY = pointer.y
      this.dragStartScrollY = scrollableArea.y
    })

    this.input.on('pointermove', (pointer) => {
      if (this.dragStartY !== undefined) {
        const dragDeltaY = pointer.y - this.dragStartY
        scrollableArea.y = Phaser.Math.Clamp(
          this.dragStartScrollY + dragDeltaY,
          -yPosition + maskHeight,
          0
        )
      }
    })

    this.input.on('pointerup', () => {
      this.dragStartY = undefined
    })
  }

  createClickerButton(clicker, y) {
    const container = this.add.container(180, y)

    const clickerImage = this.add.image(0, -50, clicker.image)
      .setOrigin(0.5)
      .setScale(0.07)

    const nameText = this.add.text(0, 0, clicker.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    const costText = this.add.text(0, 30, clicker.cost === 0 ? 'Free' : `Cost: ${clicker.cost.toLocaleString()} points`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5)

    const button = this.add.rectangle(0, 70, 200, 40, 0x4a4a4a)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive()

    const buttonText = this.add.text(0, 70, this.getButtonText(clicker), {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5)

    button.on('pointerdown', () => this.handleClickerAction(clicker, buttonText))
    button.on('pointerover', () => button.setFillStyle(0x6a6a6a))
    button.on('pointerout', () => button.setFillStyle(0x4a4a4a))

    container.add([clickerImage, nameText, costText, button, buttonText])

    return container
  }

  getButtonText(clicker) {
    if (clicker.equipped) return 'Equipped'
    if (clicker.cost === 0) return 'Equip'
    if (clicker.cost <= this.points) return 'Buy & Equip'
    return 'Not enough points'
  }

  handleClickerAction(clicker, buttonText) {
    if (clicker.equipped) {
      return
    }

    if (clicker.cost <= this.points || clicker.cost === 0) {
      this.points -= clicker.cost
      this.pointsText.getAt(1).setText(this.points.toLocaleString())
      this.clickers.forEach(c => c.equipped = false)
      clicker.equipped = true
      buttonText.setText('Equipped')
      localStorage.setItem('equippedClicker', clicker.image)
      if (this.soundOn) this.sound.play('upgrade')
    }

    this.clickers.forEach((c, index) => {
      const container = this.children.list[2].list[index]
      container.getAt(4).setText(this.getButtonText(c))
    })

    this.saveProgress()
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

  createBackButton() {
    const backButton = this.add.text(180, this.sys.game.config.height - 20, 'Back', {
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
          rebirthCount: this.rebirthCount,
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
      autoClickPowerCost: this.autoClickPowerCost
    }))
  }
}