import BootScene from './scenes/BootScene.js';
import DinerScene from './scenes/DinerScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 960, // 16:9 aspect mostly
    height: 540,
    parent: document.body,
    backgroundColor: '#000000',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // Set to true to see hitboxes
        }
    },
    scene: [BootScene, DinerScene, UIScene]
};

const game = new Phaser.Game(config);
