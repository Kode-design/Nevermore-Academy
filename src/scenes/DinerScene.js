import { introDialogue, noteDialogue, ventDialogue, thingVentDialogue } from '../data/dialogues.js';

export default class DinerScene extends Phaser.Scene {
    constructor() {
        super('DinerScene');
    }

    create() {
        // Background
        const bg = this.add.image(480, 270, 'diner_bg');
        bg.setDisplaySize(960, 540);
        this.physics.world.setBounds(0, 0, 960, 540);

        // --- Interaction Group ---
        this.interactables = this.physics.add.group();

        // --- Characters ---
        // Wednesday
        this.wednesday = this.physics.add.sprite(200, 300, 'wednesday');
        this.wednesday.setCollideWorldBounds(true);
        this.wednesday.body.setSize(20, 10);
        this.wednesday.body.setOffset(6, 50); // Small hitbox at feet

        // Thing (Initially inactive/invisible)
        this.thing = this.physics.add.sprite(200, 300, 'thing');
        this.thing.setVisible(false);
        this.thing.setCollideWorldBounds(true);
        this.thing.body.setSize(16, 16);

        // Bikers
        this.bikerGroup = this.add.group();
        this.leader = this.add.sprite(700, 350, 'biker_leader');
        this.biker1 = this.add.sprite(650, 320, 'biker');
        this.helmetGuy = this.add.sprite(750, 320, 'biker'); // Placeholder asset
        this.bikerGroup.addMultiple([this.leader, this.biker1, this.helmetGuy]);

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

        // --- Props / Interactables ---

        // Note (Hidden initially or just there? Story says he leaves it. Let's have it appear after dialogue)
        this.note = this.physics.add.sprite(750, 360, 'note');
        this.note.setVisible(false);
        this.interactables.add(this.note);
        this.note.name = 'note';

        // Vent
        this.vent = this.physics.add.sprite(850, 500, 'vent');
        this.interactables.add(this.vent);
        this.vent.name = 'vent';

        // --- Game State ---
        this.isThingActive = false;
        this.canMove = false;
        this.dialogueActive = false;
        this.introCompleted = false;

        // Start initial dialogue after a short delay
        this.time.delayedCall(1000, () => {
            this.events.emit('start-dialogue', introDialogue);
            this.dialogueActive = true;
        });

        // Player movement keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Switch Character Key
        this.input.keyboard.on('keydown-T', () => {
            if (this.canMove && this.introCompleted) {
                this.toggleCharacter();
            }
        });

        // Interaction Key
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.canMove && !this.dialogueActive) {
                this.checkInteractions();
            }
        });

        // --- Event Listeners ---
        this.events.on('dialogue-complete', () => {
            this.canMove = true;
            this.dialogueActive = false;

            // Special logic for end of intro
            if (!this.introCompleted) {
                this.introCompleted = true;
                this.note.setVisible(true); // Reveal note
                // Bikers leave (simple fade out for now)
                this.tweens.add({
                    targets: [this.leader, this.biker1, this.helmetGuy, this.shadow],
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => {
                        this.leader.destroy();
                        this.biker1.destroy();
                        this.helmetGuy.destroy();
                        this.shadow.destroy();
                    }
                });
            }
        });

        // Camera setup
        this.cameras.main.setBounds(0, 0, 960, 540);
        this.cameras.main.startFollow(this.wednesday, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.5);
    }

    toggleCharacter() {
        this.isThingActive = !this.isThingActive;

        if (this.isThingActive) {
            // Deploy Thing
            this.thing.setPosition(this.wednesday.x, this.wednesday.y + 10);
            this.thing.setVisible(true);
            this.cameras.main.startFollow(this.thing);
            this.wednesday.setAlpha(0.7); // Dim Wednesday
        } else {
            // Return to Wednesday
            this.thing.setVisible(false);
            this.cameras.main.startFollow(this.wednesday);
            this.wednesday.setAlpha(1);
        }
    }

    checkInteractions() {
        const player = this.isThingActive ? this.thing : this.wednesday;
        let interactionFound = false;

        this.physics.overlap(player, this.interactables, (playerSprite, interactable) => {
            if (interactionFound) return; // Only interact with one thing at a time

            if (interactable.name === 'note' && !this.isThingActive) {
                this.triggerDialogue(noteDialogue);
                interactionFound = true;
            } else if (interactable.name === 'vent') {
                if (this.isThingActive) {
                     this.triggerDialogue(thingVentDialogue);
                } else {
                     this.triggerDialogue(ventDialogue);
                }
                interactionFound = true;
            }
        });
    }

    triggerDialogue(dialogueData) {
        this.canMove = false;
        this.dialogueActive = true;
        // Stop movement immediately
        if (this.wednesday.body) this.wednesday.setVelocity(0);
        if (this.thing.body) this.thing.setVelocity(0);

        this.events.emit('start-dialogue', dialogueData);
    }

    update() {
        if (!this.canMove) {
            if (this.wednesday.body) this.wednesday.setVelocity(0);
            if (this.thing.body) this.thing.setVelocity(0);
            return;
        }

        const speed = this.isThingActive ? 250 : 160; // Thing is faster
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
