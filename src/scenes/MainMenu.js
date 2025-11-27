import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a1a');

        this.add.text(400, 150, "Wednesday's Solitude", {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Courier New',
            stroke: '#581c87',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(400, 250, "Collect all pages of the Nightshade Journal.", {
            fontSize: '20px',
            fill: '#cccccc',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.add.text(400, 290, "Avoid social interactions (Enid clones).", {
            fontSize: '20px',
            fill: '#cccccc',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.add.text(400, 330, "Use SPACE to send Thing to stun them.", {
            fontSize: '20px',
            fill: '#cccccc',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const startButton = this.add.text(400, 450, "PRESS ENTER TO START", {
            fontSize: '28px',
            fill: '#ff69b4', // Ironically pink for start
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Flicker effect
        this.tweens.add({
            targets: startButton,
            alpha: 0.5,
            duration: 800,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('MainGame');
        });
    }
}
