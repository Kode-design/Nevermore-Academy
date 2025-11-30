export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load any assets needed for the preloader (e.g., logo, loading bar)
    }

    create() {
        this.scene.start('PreloaderScene');
    }
}
