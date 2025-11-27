import Phaser from 'phaser';

export default class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: 'GameUI', active: false });
    }

    create() {
        this.scoreText = this.add.text(20, 20, 'Pages: 0/10', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Courier New',
            stroke: '#000',
            strokeThickness: 4
        });

        this.batteryText = this.add.text(20, 50, 'Social Battery: 100%', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'Courier New',
            stroke: '#000',
            strokeThickness: 4
        });

        // Listen for events from MainGame
        const gameScene = this.scene.get('MainGame');
        gameScene.events.on('updateScore', this.updateScore, this);
        gameScene.events.on('updateBattery', this.updateBattery, this);
    }

    updateScore(score) {
        this.scoreText.setText('Pages: ' + score + '/10');
    }

    updateBattery(battery) {
        if (battery > 50) this.batteryText.setFill('#00ff00');
        else if (battery > 20) this.batteryText.setFill('#ffff00');
        else this.batteryText.setFill('#ff0000');

        this.batteryText.setText('Social Battery: ' + battery + '%');
    }
}
