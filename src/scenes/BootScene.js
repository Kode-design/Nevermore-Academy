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

        // New Assets
        this.load.svg('thing', 'assets/thing.svg', { width: 24, height: 24 });
        this.load.svg('note', 'assets/note.svg', { width: 24, height: 24 });
        this.load.svg('vent', 'assets/vent.svg', { width: 32, height: 32 });
    }

    create() {
        this.scene.start('DinerScene');
        this.scene.launch('UIScene');
    }
}
