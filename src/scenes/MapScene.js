import GameManager from '../managers/GameManager.js';

export default class MapScene extends Phaser.Scene {
    constructor() {
        super('MapScene');
    }

    create() {
        this.add.image(400, 300, 'jericho_map');

        // Location Markers
        this.createMarker(200, 480, 'DinerScene', 'Weathervane Diner', true);
        this.createMarker(500, 500, 'TunnelScene', 'Old Tunnels', GameManager.getFlag('tunnelsUnlocked'));
        this.createMarker(600, 100, 'NevermoreScene', 'Nevermore Academy', false); // Locked for now

        this.add.text(400, 50, 'Select Destination', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Courier',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    createMarker(x, y, sceneKey, name, unlocked) {
        const marker = this.add.sprite(x, y, 'map_marker');

        if (!unlocked) {
            marker.setTint(0x555555); // Dark/Locked
            // Lock icon?
            this.add.text(x, y + 30, '???', { fontSize: '16px', fill: '#aaa', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
            return;
        }

        marker.setInteractive({ useHandCursor: true });

        // Hover effect
        marker.on('pointerover', () => {
            marker.setScale(1.2);
            this.label = this.add.text(x, y - 40, name, {
                fontSize: '20px',
                fill: '#fff',
                backgroundColor: '#000',
                padding: { x: 5, y: 5 }
            }).setOrigin(0.5);
        });

        marker.on('pointerout', () => {
            marker.setScale(1);
            if (this.label) this.label.destroy();
        });

        marker.on('pointerdown', () => {
            this.scene.start(sceneKey);
        });
    }
}
