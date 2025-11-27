class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load assets
        this.load.svg('wednesday', 'assets/wednesday.svg', { width: 32, height: 32 });
        this.load.svg('enid', 'assets/enid.svg', { width: 32, height: 32 });
        // Tileset needs to be loaded as image or spritesheet.
        // For tilemap Tiled JSON we use 'image', but here we are using a simple grid.
        // Let's load it as a spritesheet for easier usage.
        this.load.spritesheet('tiles', 'assets/tileset.svg', { frameWidth: 32, frameHeight: 32 });

        this.load.svg('book', 'assets/book.svg', { width: 32, height: 32 });
        this.load.svg('ui_box', 'assets/ui_box.svg', { width: 400, height: 100 });
    }

    create() {
        this.scene.start('MenuScene');
    }
}

export default BootScene;
