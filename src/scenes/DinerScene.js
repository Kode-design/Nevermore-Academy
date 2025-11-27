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

        // --- Game State Check ---
        this.introCompleted = GameManager.getFlag('introCompleted');
        this.isThingActive = false;
        this.canMove = this.introCompleted; // Move immediately if intro done
        this.dialogueActive = false;

        // --- Interaction Group ---
        this.interactables = this.physics.add.group();

        // --- Characters ---
        // Wednesday
        this.wednesday = this.physics.add.sprite(200, 300, 'wednesday');
        this.wednesday.setCollideWorldBounds(true);
        this.wednesday.body.setSize(20, 10);
        this.wednesday.body.setOffset(6, 50);
        this.wednesday.setDepth(10);

        // Thing (Initially inactive/invisible)
        this.thing = this.physics.add.sprite(200, 300, 'thing');
        this.thing.setVisible(false);
        this.thing.setCollideWorldBounds(true);
        this.thing.body.setSize(16, 16);
        this.thing.setDepth(10);

        // --- Dynamic Elements (Bikers/Intro) ---
        if (!this.introCompleted) {
            this.setupIntroSequence();
        } else {
            // Intro already done, skip bikers
        }

        // --- Props / Interactables ---

        // Note
        this.note = this.physics.add.sprite(750, 360, 'note');
        this.note.setVisible(this.introCompleted); // Visible if intro done
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
             // Only allow exit if intro is done
             if (GameManager.getFlag('introCompleted') && this.canMove) {
                 this.scene.start('MapScene');
             }
        });

        // --- Atmosphere Overlays ---
        this.setupLighting();

        // --- Input Handling ---
        this.setupInputs();

        // --- Event Listeners ---
        this.events.on('dialogue-complete', () => this.handleDialogueComplete());

        // Camera setup
        this.cameras.main.setBounds(0, 0, 960, 540);
        this.cameras.main.startFollow(this.wednesday, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.5);
    }

    setupIntroSequence() {
        // Bikers
        this.bikerGroup = this.add.group();
        this.leader = this.add.sprite(700, 350, 'biker_leader');
        this.biker1 = this.add.sprite(650, 320, 'biker');
        this.helmetGuy = this.add.sprite(750, 320, 'biker');

        this.leader.setDepth(9);
        this.biker1.setDepth(9);
        this.helmetGuy.setDepth(10);

        this.bikerGroup.addMultiple([this.leader, this.biker1, this.helmetGuy]);

        // Shadow Entity
        this.shadowEntity = this.add.sprite(750, 300, 'shadow_entity');
        this.shadowEntity.setAlpha(0.8);
        this.shadowEntity.setScale(1.2);
        this.shadowEntity.setDepth(8);
        this.shadowEntity.setBlendMode(Phaser.BlendModes.MULTIPLY);

        // Shadow Animation
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
            angle: { min: 200, max: 340 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 2000,
            frequency: 100,
            blendMode: 'MULTIPLY'
        });
        this.shadowParticles.setDepth(7);

        // Trigger Dialogue
        this.time.delayedCall(1000, () => {
            this.events.emit('start-dialogue', introDialogue);
            this.dialogueActive = true;
        });
    }

    setupLighting() {
        // Dark Overlay
        this.nightOverlay = this.add.rectangle(480, 270, 960, 540, 0x000022);
        this.nightOverlay.setAlpha(0.5);
        this.nightOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.nightOverlay.setDepth(100);

        // Lamp Light over the biker table
        this.tableLight = this.add.image(725, 340, 'light_mask');
        this.tableLight.setBlendMode(Phaser.BlendModes.ADD);
        this.tableLight.setAlpha(0.4);
        this.tableLight.setDepth(101);

        // Light flicker
        this.tweens.add({
            targets: this.tableLight,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: -1,
            repeatDelay: 5000,
            onRepeat: () => {
                this.tweens.getAllTweens().find(t => t.targets.includes(this.tableLight)).repeatDelay = Phaser.Math.Between(2000, 8000);
            }
        });
    }

    setupInputs() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-T', () => {
            // Allow T if intro is complete (or if we want to allow it earlier? Story says allow it later)
            // But we set introCompleted flag at end of dialogue.
            // If I return to scene, introCompleted is true.
            // If I am IN intro, introCompleted is false.
            if (this.canMove && GameManager.getFlag('introCompleted')) {
                this.toggleCharacter();
            }
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.canMove && !this.dialogueActive) {
                this.checkInteractions();
            }
        });
    }

    handleDialogueComplete() {
        this.canMove = true;
        this.dialogueActive = false;

        // End of Intro Logic
        if (!this.introCompleted) {
            this.introCompleted = true;
            GameManager.setFlag('introCompleted', true);
            GameManager.setFlag('tunnelsUnlocked', true); // Unlocks map location

            this.note.setVisible(true);

            // Despawn Bikers
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

            // Despawn Shadow
            this.tweens.add({
                targets: this.shadowEntity,
                alpha: 0,
                scale: 2,
                duration: 1500,
                onComplete: () => {
                    this.shadowEntity.destroy();
                    this.shadowParticles.stop();
                    this.time.delayedCall(2000, () => this.shadowParticles.destroy());
                }
            });
        }
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

    checkInteractions() {
        const player = this.isThingActive ? this.thing : this.wednesday;
        let interactionFound = false;

        this.physics.overlap(player, this.interactables, (playerSprite, interactable) => {
            if (interactionFound) return;

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
