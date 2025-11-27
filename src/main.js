import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top down, no gravity
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        UIScene
    ]
};

const game = new Phaser.Game(config);
