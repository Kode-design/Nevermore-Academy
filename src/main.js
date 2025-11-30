import BootScene from './scenes/BootScene.js';
import PreloaderScene from './scenes/PreloaderScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true // Enable debug for development
        }
    },
    scene: [
        BootScene,
        PreloaderScene,
        GameScene,
        UIScene
    ]
};

const game = new Phaser.Game(config);
