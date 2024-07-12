export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.rebirthCount = 0;
    this.rebirthCost = 1000000;
  }

  init(data) {
    this.points = data.points;
    this.clickPower = data.clickPower;
    this.autoClickPower = data.autoClickPower;
    this.bgMusicOn = data.bgMusicOn;
    this.soundOn = data.soundOn;
    this.clickPowerCost = data.clickPowerCost;
    this.autoClickPowerCost = data.autoClickPowerCost;
    this.rebirthCount = data.rebirthCount || 0;
  }

  preload() {
    this.load.image('background', '/assets/background.png');
  }

  create() {
    this.add.image(180, 320, 'background')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

       // Add a semi-transparent tint over the background
       this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000, 0.5)
       .setOrigin(0, 0);
    // Add "Airdrop Coming Soon" tag
    this.add.text(180, 340, 'Airdrop Coming Soon!', {
      fontSize: '28px',
      fill: '#FFA500',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Add Rebirth Button
    this.rebirthButton = this.createButton(180, 460, `Rebirth (${this.rebirthCount}) - Cost: ${this.rebirthCost.toLocaleString()} points`, this.rebirth, this, '20px');

    // Add Rebirth Count display
    this.rebirthCountText = this.add.text(180, 420, `Rebirths: ${this.rebirthCount}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Add Sound Toggles
    this.soundButton = this.createButton(180, 160, `Sound: ${this.soundOn ? 'On' : 'Off'}`, () => {
      this.soundOn = !this.soundOn;
      this.soundButton.setText(`Sound: ${this.soundOn ? 'On' : 'Off'}`);
      this.events.emit('toggleSound', this.soundOn);
    }, this, '20px');

    this.musicButton = this.createButton(180, 120, `Music: ${this.bgMusicOn ? 'On' : 'Off'}`, () => {
      this.bgMusicOn = !this.bgMusicOn;
      this.musicButton.setText(`Music: ${this.bgMusicOn ? 'On' : 'Off'}`);
      if (this.bgMusicOn) {
        this.sound.play('backgroundMusic');
      } else {
        this.sound.stopByKey('backgroundMusic');
      }
    }, this, '20px');

    // Add Back Button
    this.backButton = this.createButton(180, 520, 'Back', () => {
      this.scene.start('MainScene', {
        points: this.points,
        clickPower: this.clickPower,
        autoClickPower: this.autoClickPower,
        bgMusicOn: this.bgMusicOn,
        soundOn: this.soundOn,
        clickPowerCost: this.clickPowerCost,
        autoClickPowerCost: this.autoClickPowerCost,
        rebirthCount: this.rebirthCount,
      });
    }, this, '20px');
  }

  rebirth() {
    if (this.points >= this.rebirthCost) {
      this.rebirthCount++;
      this.points = 0;
      this.clickPower = this.rebirthCount + 1; // Start with 2x, 3x, 4x, etc.
      this.autoClickPower = 0;
      this.clickPowerCost = 100;
      this.autoClickPowerCost = 1000000;

      this.saveProgress();
      this.updateRebirthButton();
      this.updateRebirthCountText();

      // You might want to show a message to the user about the successful rebirth
      this.showRebirthMessage();

      this.scene.start('MainScene', {
        points: this.points,
        clickPower: this.clickPower,
        autoClickPower: this.autoClickPower,
        bgMusicOn: this.bgMusicOn,
        soundOn: this.soundOn,
        clickPowerCost: this.clickPowerCost,
        autoClickPowerCost: this.autoClickPowerCost,
        rebirthCount: this.rebirthCount,
      });
    } else {
      // Show a message that the player doesn't have enough points
      this.showInsufficientPointsMessage();
    }
  }

  updateRebirthButton() {
    this.rebirthButton.setText(`Rebirth (${this.rebirthCount}) : ${this.rebirthCost.toLocaleString()} points`);
  }

  updateRebirthCountText() {
    this.rebirthCountText.setText(`Rebirths: ${this.rebirthCount}`);
  }

  showRebirthMessage() {
    const message = this.add.text(180, 400, `Rebirth successful! You now start with ${this.clickPower}x click power.`, {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 300 },
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      message.destroy();
    });
  }

  showInsufficientPointsMessage() {
    const message = this.add.text(180, 300, `Not enough points! You need ${this.rebirthCost.toLocaleString()} points to rebirth.`, {
      fontSize: '18px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 300 },
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      message.destroy();
    });
  }

  createButton(x, y, text, callback, context, fontSize = '28px') {
    const button = this.add.text(x, y, text, {
      fontSize: fontSize,
      fill: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#444444',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', callback.bind(context))
      .setStyle({
        backgroundColor: '#444444',
        borderRadius: '10px',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000',
          blur: 3,
          stroke: true,
          fill: true,
        },
      });

    button.on('pointerover', () => {
      button.setStyle({ fill: '#ffff00' });
    });

    button.on('pointerout', () => {
      button.setStyle({ fill: '#ffffff' });
    });

    return button;
  }

  saveProgress() {
    localStorage.setItem('clickerGame', JSON.stringify({
      points: this.points,
      clickPower: this.clickPower,
      autoClickPower: this.autoClickPower,
      clickPowerCost: this.clickPowerCost,
      autoClickPowerCost: this.autoClickPowerCost,
      rebirthCount: this.rebirthCount,
    }));
  }
}
