export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // Create a simple loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        // Load assets here (if any). For now we generate them in create.
    }

    create() {
        // Generate placeholder textures
        this.createPlaceholderTextures();

        this.scene.start('GameScene');
    }

    createPlaceholderTextures() {
        // Khristopher (Player) - Tall, black clothes
        const playerGfx = this.make.graphics();
        playerGfx.fillStyle(0x000000); // Black
        playerGfx.fillRect(0, 0, 32, 64);
        playerGfx.generateTexture('player', 32, 64);

        // Marcia - Short, brown hair, oversized sweater
        const marciaGfx = this.make.graphics();
        marciaGfx.fillStyle(0x8B4513); // Brownish
        marciaGfx.fillRect(0, 0, 32, 56); // Shorter
        marciaGfx.generateTexture('marcia', 32, 56);

        // Cass (Rabbit) - Tiny black & white
        const rabbitGfx = this.make.graphics();
        rabbitGfx.fillStyle(0xFFFFFF); // White
        rabbitGfx.fillRect(0, 0, 16, 16);
        rabbitGfx.fillStyle(0x000000);
        rabbitGfx.fillRect(4, 4, 4, 4); // Spot
        rabbitGfx.generateTexture('rabbit', 16, 16);

        // Floor/Platform
        const floorGfx = this.make.graphics();
        floorGfx.fillStyle(0x555555);
        floorGfx.fillRect(0, 0, 32, 32);
        floorGfx.generateTexture('floor', 32, 32);

        // Wall
        const wallGfx = this.make.graphics();
        wallGfx.fillStyle(0x333333);
        wallGfx.fillRect(0, 0, 32, 32);
        wallGfx.generateTexture('wall', 32, 32);

        // Door
        const doorGfx = this.make.graphics();
        doorGfx.fillStyle(0x4a3c31);
        doorGfx.fillRect(0, 0, 40, 70);
        doorGfx.generateTexture('door', 40, 70);

        // Background - Apartment Interior
        const bgGfx = this.make.graphics();
        bgGfx.fillStyle(0x2d2d2d);
        bgGfx.fillRect(0, 0, 960, 540);
        bgGfx.generateTexture('bg_apartment', 960, 540);
    }
}
