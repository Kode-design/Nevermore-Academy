export default class TunnelScene extends Phaser.Scene {
    constructor() {
        super('TunnelScene');
    }

    create() {
        // Background
        this.add.image(400, 300, 'tunnel_bg');
        this.physics.world.setBounds(0, 0, 800, 600);

        // Ground
        this.ground = this.physics.add.staticGroup();
        this.ground.create(400, 580, null).setSize(800, 40).setVisible(false); // Invisible floor

        // Platforms (Pipe collision)
        this.platforms = this.physics.add.staticGroup();
        // Pipe at y=500 is visual, let's make it solid?
        // Let's just have floor for now.

        // --- Characters (Copy setup from DinerScene for consistency) ---
        // Wednesday
        this.wednesday = this.physics.add.sprite(50, 500, 'wednesday');
        this.wednesday.setCollideWorldBounds(true);
        this.wednesday.body.setSize(20, 10);
        this.wednesday.body.setOffset(6, 50);

        // Thing
        this.thing = this.physics.add.sprite(50, 500, 'thing');
        this.thing.setVisible(false);
        this.thing.setCollideWorldBounds(true);
        this.thing.body.setSize(16, 16);

        // Camera
        this.cameras.main.startFollow(this.wednesday, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.5);

        // Input Setup (Simplified Copy)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-T', () => this.toggleCharacter());

        this.isThingActive = false;

        // Initial Message
        this.time.delayedCall(500, () => {
             this.events.emit('start-dialogue', [
                 { name: 'Wednesday', text: "The tunnels. Damp, dark, and smelling of centuries of regret." },
                 { name: 'Wednesday', text: "Perfect." }
             ]);
        });

        // Scene needs UIScene to be active? It likely persists, but let's make sure.
        this.scene.launch('UIScene');
    }

    toggleCharacter() {
        this.isThingActive = !this.isThingActive;
        if (this.isThingActive) {
            this.thing.setPosition(this.wednesday.x, this.wednesday.y + 10);
            this.thing.setVisible(true);
            this.cameras.main.startFollow(this.thing);
            this.wednesday.setAlpha(0.7);
        } else {
            this.thing.setVisible(false);
            this.cameras.main.startFollow(this.wednesday);
            this.wednesday.setAlpha(1);
        }
    }

    update() {
        const speed = this.isThingActive ? 250 : 160;
        const activeSprite = this.isThingActive ? this.thing : this.wednesday;

        activeSprite.setVelocity(0);

        if (this.cursors.left.isDown) {
            activeSprite.setVelocityX(-speed);
            activeSprite.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            activeSprite.setVelocityX(speed);
            activeSprite.setFlipX(false);
        }

        if (this.cursors.up.isDown) {
            activeSprite.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            activeSprite.setVelocityY(speed);
        }
    }
}
