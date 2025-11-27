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

        // Atmosphere & Effects
        this.load.svg('shadow_entity', 'assets/shadow_entity.svg', { width: 64, height: 100 });
        this.load.svg('smoke_particle', 'assets/smoke_particle.svg', { width: 8, height: 8 });
        this.load.svg('light_mask', 'assets/light_mask.svg', { width: 256, height: 256 });

        // Map & Tunnels
        this.load.svg('jericho_map', 'assets/jericho_map.svg', { width: 800, height: 600 });
        this.load.svg('map_marker', 'assets/map_marker.svg', { width: 32, height: 48 });
        this.load.svg('tunnel_bg', 'assets/tunnel_bg.svg', { width: 800, height: 600 });
    }

    create() {
        this.scene.start('DinerScene');
        this.scene.launch('UIScene');
    }
}
