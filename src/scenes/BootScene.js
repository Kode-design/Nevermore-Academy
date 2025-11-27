export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Background
        this.load.svg('diner_bg', 'assets/diner_bg.svg', { width: 800, height: 600 });

        // Characters (SVGs)
        this.load.svg('wednesday', 'assets/wednesday.svg', { width: 32, height: 64 });
        this.load.svg('biker', 'assets/biker.svg', { width: 40, height: 64 });
        this.load.svg('biker_leader', 'assets/biker_leader.svg', { width: 44, height: 68 });
    }

    create() {
        this.scene.start('DinerScene');
        this.scene.launch('UIScene');
    }
}
