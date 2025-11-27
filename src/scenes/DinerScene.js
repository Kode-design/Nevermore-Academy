import { introDialogue, noteDialogue, ventDialogue, thingVentDialogue } from '../data/dialogues.js';
import GameManager from '../managers/GameManager.js';

export default class DinerScene extends Phaser.Scene {
    constructor() {
        super('DinerScene');
    }

    create() {
        // --- Background & Atmosphere ---
        const bg = this.add.image(480, 270, 'diner_bg');
        bg.setDisplaySize(960, 540);
        this.physics.world.setBounds(0, 0, 960, 540);

        // Night Overlay (Dark Blue Vignette)
        const nightOverlay = this.add.rectangle(480, 270, 960, 540, 0x000033);
        nightOverlay.setAlpha(0.6);
        nightOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
        nightOverlay.setDepth(100); // Above background/characters? No, above bg, but maybe below UI?
        // Actually, if we want it to darken characters too, it needs to be above them.
        // Let's set depth later or manage layers. For now, let's keep it simply added last or high depth.
        // Wait, standard Phaser rendering order depends on add order.
        // If I add it now, it's behind characters added later.
        // I should add characters, THEN the overlay? Or use a container.
        // Better: Add it at the end with high depth, but exclude the "Light" areas?
        // Let's add it at the very end of create() with depth.

        // Light Mask for Table
        // We want a light that cuts through the darkness.
        // In simple Phaser 3 without a pipeline, we can just use an ADD blend mode sprite on top of the dark overlay?
        // Or place the light BEHIND the dark overlay and use a mask?
        // Simplest "Fake Lighting":
        // 1. Scene
        // 2. Characters
        // 3. Dark Overlay (Multiply)
        // 4. Light Sprite (Add) -> This will brighten the area, counteracting the multiply slightly or adding tint.

        // --- Interaction Group ---
        this.interactables = this.physics.add.group();

        // --- Characters ---
        // Wednesday
        this.wednesday = this.physics.add.sprite(200, 300, 'wednesday');
        this.wednesday.setCollideWorldBounds(true);
        this.wednesday.body.setSize(20, 10);
        this.wednesday.body.setOffset(6, 50); // Small hitbox at feet
        this.wednesday.setDepth(10);

        // Thing (Initially inactive/invisible)
        this.thing = this.physics.add.sprite(200, 300, 'thing');
        this.thing.setVisible(false);
        this.thing.setCollideWorldBounds(true);
        this.thing.body.setSize(16, 16);
        this.thing.setDepth(10);

        // Bikers
        this.bikerGroup = this.add.group();
        this.leader = this.add.sprite(700, 350, 'biker_leader');
        this.biker1 = this.add.sprite(650, 320, 'biker');
        this.helmetGuy = this.add.sprite(750, 320, 'biker'); // Placeholder asset

        this.leader.setDepth(9);
        this.biker1.setDepth(9);
        this.helmetGuy.setDepth(10); // Helmet guy in front or same as Wed

        this.bikerGroup.addMultiple([this.leader, this.biker1, this.helmetGuy]);

        // --- Shadow Entity (The Gloom-Wraith) ---
        // Replacing the circle shadow with the entity sprite
        this.shadowEntity = this.add.sprite(750, 300, 'shadow_entity');
        this.shadowEntity.setAlpha(0.8);
        this.shadowEntity.setScale(1.2);
        this.shadowEntity.setDepth(8); // Behind the biker
        this.shadowEntity.setBlendMode(Phaser.BlendModes.MULTIPLY); // Darken whatever is behind it

        // Shadow Animation (Floating)
        this.tweens.add({
            targets: this.shadowEntity,
            y: 290,
            alpha: 0.6,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Shadow Particles
        this.shadowParticles = this.add.particles(0, 0, 'smoke_particle', {
            x: 750,
            y: 300,
            speed: { min: 10, max: 30 },
            angle: { min: 200, max: 340 }, // Upwards/Left
            scale: { start: 1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 2000,
            frequency: 100,
            blendMode: 'MULTIPLY'
        });
        this.shadowParticles.setDepth(7);

        // --- Props / Interactables ---

        // Note
        this.note = this.physics.add.sprite(750, 360, 'note');
        this.note.setVisible(false);
        this.interactables.add(this.note);
        this.note.name = 'note';
        this.note.setDepth(9);

        // Vent
        this.vent = this.physics.add.sprite(850, 500, 'vent');
        this.interactables.add(this.vent);
        this.vent.name = 'vent';
        this.vent.setDepth(5);

        // Exit Zone (Invisible Door) - Left Side
        this.exitZone = this.add.rectangle(50, 300, 50, 100, 0xff0000, 0); // Transparent
        this.physics.add.existing(this.exitZone, true); // Static body
        this.physics.add.overlap(this.wednesday, this.exitZone, () => {
             if (this.introCompleted && this.canMove) {
                 this.scene.start('MapScene');
             } else if (!this.introCompleted) {
                 // Hint to finish intro?
             }
        });

        // --- Atmosphere Overlays ---
        // Dark Overlay
        this.nightOverlay = this.add.rectangle(480, 270, 960, 540, 0x000022);
        this.nightOverlay.setAlpha(0.5);
        this.nightOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.nightOverlay.setDepth(100);

        // Lamp Light over the biker table
        this.tableLight = this.add.image(725, 340, 'light_mask');
        this.tableLight.setBlendMode(Phaser.BlendModes.ADD);
        this.tableLight.setAlpha(0.4);
        this.tableLight.setDepth(101); // On top of the dark overlay to "cut through"

        // Light flicker
        this.tweens.add({
            targets: this.tableLight,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: -1,
            repeatDelay: 5000, // Flicker occasionally
            onRepeat: () => {
                // Randomize flicker delay
                this.tweens.getAllTweens().find(t => t.targets.includes(this.tableLight)).repeatDelay = Phaser.Math.Between(2000, 8000);
            }
        });


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

                // Unlock Tunnels
                GameManager.setFlag('tunnelsUnlocked', true);

                // Bikers leave
                this.tweens.add({
                    targets: [this.leader, this.biker1, this.helmetGuy],
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => {
                        this.leader.destroy();
                        this.biker1.destroy();
                        this.helmetGuy.destroy();
                    }
                });

                // Shadow Entity Dissolve Effect
                this.tweens.add({
                    targets: this.shadowEntity,
                    alpha: 0,
                    scale: 2, // Expand as it dissipates
                    duration: 1500,
                    onComplete: () => {
                        this.shadowEntity.destroy();
                        this.shadowParticles.stop(); // Stop emitting
                        // Destroy particles after lifespan
                        this.time.delayedCall(2000, () => this.shadowParticles.destroy());
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
