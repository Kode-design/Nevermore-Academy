import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Create textures programmatically
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Wednesday (Player)
        graphics.clear();
        graphics.fillStyle(0x000000); // Black hair/dress
        graphics.fillRect(6, 0, 20, 32); // Body
        graphics.fillStyle(0xffe0bd); // Pale skin
        graphics.fillRect(10, 4, 12, 10); // Face
        graphics.fillStyle(0x000000); // Braids
        graphics.fillRect(6, 4, 4, 20); // Left braid
        graphics.fillRect(22, 4, 4, 20); // Right braid
        graphics.generateTexture('wednesday', 32, 32);

        // Enid (Enemy/Obstacle)
        graphics.clear();
        graphics.fillStyle(0xff69b4); // Pink sweater
        graphics.fillRect(4, 14, 24, 18);
        graphics.fillStyle(0xffffaa); // Blonde hair
        graphics.fillRect(4, 0, 24, 20);
        graphics.fillStyle(0xffccaa); // Skin
        graphics.fillRect(8, 6, 16, 12);
        graphics.generateTexture('enid', 32, 32);

        // Thing (Projectile/Helper)
        graphics.clear();
        graphics.fillStyle(0xffccaa); // Skin
        graphics.fillRect(4, 10, 24, 14); // Hand body
        graphics.fillStyle(0xcc9977); // Fingers/Scars
        graphics.fillRect(4, 10, 4, 8);
        graphics.fillRect(10, 8, 4, 10);
        graphics.fillRect(16, 8, 4, 10);
        graphics.fillRect(22, 10, 4, 8);
        graphics.generateTexture('thing', 32, 32);

        // Page (Collectible)
        graphics.clear();
        graphics.fillStyle(0xffffff); // Paper
        graphics.fillRect(6, 4, 20, 24);
        graphics.fillStyle(0x000000); // Text
        graphics.fillRect(10, 8, 12, 2);
        graphics.fillRect(10, 12, 12, 2);
        graphics.fillRect(10, 16, 10, 2);
        graphics.generateTexture('page', 32, 32);

        // Floor
        graphics.clear();
        graphics.fillStyle(0x555555);
        graphics.fillRect(0, 0, 64, 64);
        graphics.fillStyle(0x444444);
        graphics.fillRect(2, 2, 60, 60);
        graphics.generateTexture('floor', 64, 64);

        // Wall
        graphics.clear();
        graphics.fillStyle(0x2d1b4e); // Dark purple
        graphics.fillRect(0, 0, 64, 64);
        graphics.lineStyle(4, 0x1a0b2e);
        graphics.strokeRect(0, 0, 64, 64);
        graphics.generateTexture('wall', 64, 64);
    }

    create() {
        this.scene.start('MainMenu');
    }
}
