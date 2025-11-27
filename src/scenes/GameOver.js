import Phaser from 'phaser';

export default class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        this.won = data.won;
        this.score = data.score;
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        const message = this.won ? "SOLITUDE ACHIEVED" : "SOCIAL BATTERY DRAINED";
        const color = this.won ? '#a855f7' : '#ff0000'; // Purple or Red

        this.add.text(400, 200, message, {
            fontSize: '40px',
            fill: color,
            fontFamily: 'Courier New',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(400, 300, `Pages Collected: ${this.score}`, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.add.text(400, 450, "PRESS ENTER TO RESTART", {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('MainGame');
        });
    }
}
