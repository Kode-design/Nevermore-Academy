import { introDialogue } from '../data/dialogues.js';

export default class DinerScene extends Phaser.Scene {
    constructor() {
        super('DinerScene');
    }

    create() {
        // Background
        const bg = this.add.image(480, 270, 'diner_bg');
        bg.setDisplaySize(960, 540);

        // Characters
        // Wednesday
        this.wednesday = this.physics.add.sprite(200, 300, 'wednesday');
        this.wednesday.setCollideWorldBounds(true);

        // Bikers
        this.leader = this.add.sprite(700, 350, 'biker_leader');
        this.biker1 = this.add.sprite(650, 320, 'biker');
        this.helmetGuy = this.add.sprite(750, 320, 'biker'); // Placeholder asset

        // Shadow effect for helmet guy
        this.shadow = this.add.circle(750, 320, 30, 0x000000, 0.5);
        this.tweens.add({
            targets: this.shadow,
            alpha: 0.2,
            scale: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Start initial dialogue after a short delay
        this.time.delayedCall(1000, () => {
            this.events.emit('start-dialogue', introDialogue);
        });

        // Player movement
        this.cursors = this.input.keyboard.createCursorKeys();

        this.canMove = false;
        this.events.on('dialogue-complete', () => {
            this.canMove = true;
        });
    }

    update() {
        if (!this.canMove) {
            if (this.wednesday.body) this.wednesday.setVelocity(0);
            return;
        }

        const speed = 160;
        this.wednesday.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.wednesday.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.wednesday.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.wednesday.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.wednesday.setVelocityY(speed);
        }
    }
}
