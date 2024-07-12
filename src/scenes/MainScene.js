import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.points = 0;
        this.clickPower = 1;
        this.autoClickPower = 0;
        this.soundOn = true;
        this.clickPowerCost = 100;
        this.autoClickPowerCost = 1000000;
        this.bgMusicOn = true;
        this.uiHeight = 100;
        this.rebirthCount = 0;
        this.autoClickInterval = 10000; // Start at 10 seconds (10000 ms)
        this.minAutoClickInterval = 1000; // Minimum interval of 1 second
    }

    preload() {
        this.load.image('clicker', '/assets/new_clicker.png');
        this.load.image('background', '/assets/background.png');
        this.load.image('new_clicker1', '/assets/new_clicker1.png');
        this.load.image('new_clicker2', '/assets/new_clicker2.png');
        this.load.audio('click', '/assets/click.mp3');
        this.load.audio('upgrade', '/assets/upgrade.mp3');
        this.load.audio('backgroundMusic', '/assets/background.mp3');
    }

    create(data) {
        Object.assign(this, data);

        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0);

        this.createUIBackgrounds();
        this.createTitle();
        this.initBackgroundMusic();
        this.createClicker();
        this.createPointsText();
        this.createButtons();

        this.loadProgress();
        this.startAutoClicker();
        
        this.events.on('toggleSound', (isOn) => {
            this.soundOn = isOn;
        });
    }

    createUIBackgrounds() {
        this.add.rectangle(
            this.cameras.main.width / 2,
            this.uiHeight / 2,
            this.cameras.main.width,
            this.uiHeight,
            0x000000
        ).setOrigin(0.5);

        this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height - this.uiHeight / 2,
            this.cameras.main.width,
            this.uiHeight,
            0x000000
        ).setOrigin(0.5);
    }

    createTitle() {
        this.add.text(this.cameras.main.width / 2, this.uiHeight / 3, 'MMF Clicker Crack', {
            fontSize: '28px',
            fill: '#d4af37',
            fontFamily: 'Typodermic',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    initBackgroundMusic() {
        if (!this.sound.get('backgroundMusic')) {
            this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
            this.backgroundMusic.play();
            this.backgroundMusic.setMute(!this.bgMusicOn);
        }
    }

    createClicker() {
        const equippedClickerImage = localStorage.getItem('equippedClicker') || 'clicker';
        this.clicker = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, equippedClickerImage)
            .setInteractive()
            .setScale(0.25);
        this.clicker.on('pointerdown', this.incrementPoints, this);
        this.clicker.on('pointerover', () => {
            this.tweens.add({
                targets: this.clicker,
                scale: 0.3,
                duration: 100,
                ease: 'Power2',
                yoyo: true
            });
        });
    }

    createPointsText() {
        this.pointsText = this.add.text(this.cameras.main.width / 2, this.uiHeight / 1.3, `Points: ${this.points.toLocaleString()}`, {
            fontSize: '24px',
            fill: '#4169E1',
            fontFamily: 'Arial',
            backgroundColor: '#333',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setStyle({
            backgroundColor: '#333',
            borderRadius: '10px',
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000',
                blur: 5,
                stroke: true,
                fill: true
            }
        });
    }

    createButtons() {
        const buttonY = this.cameras.main.height - this.uiHeight / 2;

        this.upgradeButton = this.createButton(this.cameras.main.width / 4, buttonY, 'Upgrade', () => {
            if (this.soundOn) this.sound.play('upgrade');
            this.scene.start('UpgradeScene', this.getSceneData());
        }, '14px');

        this.menuButton = this.createButton(this.cameras.main.width / 2, buttonY, 'Menu', () => {
            this.scene.start('MenuScene', this.getSceneData());
        }, '14px');

        this.clickerButton = this.createButton(3 * this.cameras.main.width / 4, buttonY, 'Clicker', () => {
            this.scene.start('ClickerScene', this.getSceneData());
        }, '14px');
    }

    createButton(x, y, text, callback, fontSize = '28px') {
        const button = this.add.text(x, y, text, {
            fontSize: fontSize,
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', callback)
            .setStyle({
                backgroundColor: '#444444',
                borderRadius: '10px',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000',
                    blur: 3,
                    stroke: true,
                    fill: true
                }
            });

        button.on('pointerover', () => {
            button.setStyle({ fill: '#ffff00' });
        });

        button.on('pointerout', () => {
            button.setStyle({ fill: '#ffffff' });
        });

        return button;
    }

    startAutoClicker() {
        if (this.autoClickPower > 0) {
            if (this.autoClickEvent) {
                this.autoClickEvent.remove(false);
            }
            this.autoClickEvent = this.time.addEvent({
                delay: this.autoClickInterval,
                callback: this.autoClick,
                callbackScope: this,
                loop: true
            });
        }
    }

    autoClick() {
        this.points += this.autoClickPower;
        this.pointsText.setText(`Points: ${this.points.toLocaleString()}`);
        this.saveProgress();
    }

    incrementPoints() {
        this.points += this.clickPower;
        this.pointsText.setText(`Points: ${this.points.toLocaleString()}`);
        if (this.soundOn) this.sound.play('click');
        this.tweens.add({
            targets: this.clicker,
            scale: 0.35,
            duration: 50,
            ease: 'Power2',
            yoyo: true
        });
        this.saveProgress();
    }

    saveProgress() {
        localStorage.setItem('clickerGame', JSON.stringify(this.getSceneData()));
    }

    loadProgress() {
        const savedData = localStorage.getItem('clickerGame');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.assign(this, data);
            this.pointsText.setText(`Points: ${this.points.toLocaleString()}`);
            if (this.backgroundMusic) {
                this.backgroundMusic.setMute(!this.bgMusicOn);
            }
        }
    }

    getSceneData() {
        return {
            points: this.points,
            clickPower: this.clickPower,
            autoClickPower: this.autoClickPower,
            bgMusicOn: this.bgMusicOn,
            soundOn: this.soundOn,
            clickPowerCost: this.clickPowerCost,
            autoClickPowerCost: this.autoClickPowerCost,
            rebirthCount: this.rebirthCount,
            autoClickInterval: this.autoClickInterval
        };
    }

    update(time, delta) {
        if (time % 5000 < delta) {
            this.saveProgress();
        }
    }
}
