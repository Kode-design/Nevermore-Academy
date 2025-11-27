import { introDialogue, noteDialogue, ventDialogue, thingVentDialogue } from '../data/dialogues.js';
import GameManager from '../managers/GameManager.js';
import BaseGameplayScene from './BaseGameplayScene.js';

export default class DinerScene extends BaseGameplayScene {
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

        // --- Parent Setup (Player, Inputs, Camera) ---
        this.createPlayer(200, 300);
        this.setupInteractionGroup();

        // Override canMove based on intro
        this.canMove = this.introCompleted;

        // --- Listen for UI Events ---
        const uiScene = this.scene.get('UIScene');

        // Define handlers for cleanup
        this.onShowPrompt = (text) => uiScene.events.emit('show-prompt', text);
        this.onHidePrompt = () => uiScene.events.emit('hide-prompt');
        this.onDialogueComplete = () => {
             if (this.scene.isActive()) {
                 this.events.emit('dialogue-complete');
                 this.handleDialogueComplete();
             }
        };

        // Attach listeners
        this.events.on('show-prompt', this.onShowPrompt);
        this.events.on('hide-prompt', this.onHidePrompt);
        uiScene.events.on('dialogue-complete', this.onDialogueComplete);

        // Cleanup on shutdown
        this.events.once('shutdown', () => {
            this.events.off('show-prompt', this.onShowPrompt);
            this.events.off('hide-prompt', this.onHidePrompt);
            uiScene.events.off('dialogue-complete', this.onDialogueComplete);
        });

        // --- Dynamic Elements (Bikers/Intro) ---
        if (!this.introCompleted) {
            this.setupIntroSequence();
        }

        // --- Props / Interactables ---

        // Note
        this.note = this.physics.add.sprite(750, 360, 'note');
        this.note.setVisible(this.introCompleted);
        this.interactables.add(this.note);
        this.note.name = 'note';
        this.note.prompt = '[SPACE] Inspect Note';
        this.note.setDepth(9);

        // Vent
        this.vent = this.physics.add.sprite(850, 500, 'vent');
        this.interactables.add(this.vent);
        this.vent.name = 'vent';
        this.vent.prompt = '[SPACE] Enter Vent';
        this.vent.setDepth(5);

        // Exit Zone (Invisible Door) - Left Side
        this.exitZone = this.add.rectangle(50, 300, 50, 100, 0xff0000, 0);
        this.physics.add.existing(this.exitZone, true);
        this.physics.add.overlap(this.wednesday, this.exitZone, () => {
             if (GameManager.getFlag('introCompleted') && this.canMove && !this.isThingActive) {
                 this.scene.start('MapScene');
             }
        });

        // --- Atmosphere Overlays ---
        this.setupLighting();
    }

    // Override Interaction Handler
    onInteract(interactable) {
        if (interactable.name === 'note' && !this.isThingActive) {
            this.triggerDialogue(noteDialogue);
        } else if (interactable.name === 'vent') {
            if (this.isThingActive) {
                 this.triggerDialogue(thingVentDialogue);
            } else {
                 this.triggerDialogue(ventDialogue);
            }
        }
    }

    triggerDialogue(dialogueData) {
        this.scene.get('UIScene').events.emit('start-dialogue', dialogueData);
        this.events.emit('dialogue-start');
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
            this.triggerDialogue(introDialogue);
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
                // Safety check for targets to prevent crashes
                const tween = this.tweens.getAllTweens().find(t => t.targets && t.targets.includes(this.tableLight));
                if (tween) tween.repeatDelay = Phaser.Math.Between(2000, 8000);
            }
        });
    }

    handleDialogueComplete() {
        // End of Intro Logic
        if (!this.introCompleted) {
            this.introCompleted = true;
            GameManager.setFlag('introCompleted', true);
            GameManager.setFlag('tunnelsUnlocked', true);

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
}
