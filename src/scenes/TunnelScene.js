import GameManager from '../managers/GameManager.js';
import BaseGameplayScene from './BaseGameplayScene.js';

export default class TunnelScene extends BaseGameplayScene {
    constructor() {
        super('TunnelScene');
    }

    create() {
        // --- Background & World ---
        this.add.image(400, 300, 'tunnel_bg');
        this.physics.world.setBounds(0, 0, 800, 600);

        // --- Walls & Geometry ---
        this.walls = this.physics.add.staticGroup();

        // North Wall (Top of playable area)
        // Playable area starts around y=200
        this.walls.create(400, 100, null).setSize(800, 200).setVisible(false);

        // Sludge/Water (Bottom)
        // Only trigger overlap, not solid collision for now, or solid to prevent walking in?
        // Let's make it a hazard zone
        this.sludgeZone = this.add.rectangle(400, 575, 800, 50, 0x00ff00, 0);
        this.physics.add.existing(this.sludgeZone, true);

        // --- Parent Setup ---
        this.createPlayer(50, 300); // Start position
        this.setupInteractionGroup();

        // --- Puzzle Elements ---

        // Gate (Blocks Path at x=600)
        this.gate = this.physics.add.staticSprite(600, 300, 'gate');
        this.gate.setSize(32, 200); // Height of walkable area
        this.physics.add.collider(this.wednesday, this.gate);
        this.physics.add.collider(this.thing, this.gate);

        // Rat Hole (x=500, y=190 - On the north wall)
        this.ratHole = this.physics.add.sprite(500, 184, 'rat_hole');
        this.ratHole.setDepth(5);
        this.interactables.add(this.ratHole);
        this.ratHole.name = 'rat_hole';
        this.ratHole.prompt = '[SPACE] Enter Hole';

        // Secret Switch (Behind the wall)
        // Area: y=50 to 150.
        this.switch = this.physics.add.sprite(650, 100, 'switch_off');
        this.interactables.add(this.switch);
        this.switch.name = 'switch';
        this.switch.prompt = '[SPACE] Pull Lever';
        this.switch.setDepth(1); // Behind wall visual if we had one, but here bg is flat.

        // Inner Rat Hole (To exit secret area)
        this.ratHoleInner = this.physics.add.sprite(500, 120, 'rat_hole');
        this.ratHoleInner.setAlpha(0.5); // darker inside
        this.interactables.add(this.ratHoleInner);
        this.ratHoleInner.name = 'rat_hole_inner';
        this.ratHoleInner.prompt = '[SPACE] Exit';

        // Colliders
        this.physics.add.collider(this.wednesday, this.walls);
        this.physics.add.collider(this.thing, this.walls);

        // Sludge Interaction
        this.physics.add.overlap(this.wednesday, this.sludgeZone, () => {
             // Slow down or dialogue
             this.wednesday.setVelocity(this.wednesday.body.velocity.x * 0.5, this.wednesday.body.velocity.y * 0.5);
        });

        // --- UI & Event Handling ---
        const uiScene = this.scene.get('UIScene');

        this.onShowPrompt = (text) => uiScene.events.emit('show-prompt', text);
        this.onHidePrompt = () => uiScene.events.emit('hide-prompt');
        this.onDialogueComplete = () => {
             if (this.scene.isActive()) {
                 this.events.emit('dialogue-complete');
             }
        };

        this.events.on('show-prompt', this.onShowPrompt);
        this.events.on('hide-prompt', this.onHidePrompt);
        uiScene.events.on('dialogue-complete', this.onDialogueComplete);

        this.events.once('shutdown', () => {
            this.events.off('show-prompt', this.onShowPrompt);
            this.events.off('hide-prompt', this.onHidePrompt);
            uiScene.events.off('dialogue-complete', this.onDialogueComplete);
        });

        // --- Initial Dialogue ---
        if (!GameManager.getFlag('metShadow')) {
             this.time.delayedCall(500, () => {
                 this.triggerDialogue([
                     { name: 'Wednesday', text: "The tunnels. Damp, dark, and smelling of centuries of regret." },
                     { name: 'Wednesday', text: "A gate blocks the path. Typical." },
                     { name: 'Wednesday', text: "I can't fit through those pipes, but Thing might." }
                 ]);
             });
        }
    }

    onInteract(interactable) {
        if (interactable.name === 'rat_hole') {
            if (this.isThingActive) {
                // Teleport Thing to secret area
                this.thing.setPosition(500, 130);
                this.cameras.main.pan(500, 130, 500); // Focus on new area
            } else {
                this.triggerDialogue([{ name: 'Wednesday', text: "I can't fit in there. It's Thing-sized." }]);
            }
        } else if (interactable.name === 'rat_hole_inner') {
            if (this.isThingActive) {
                // Teleport back
                this.thing.setPosition(500, 210);
            }
        } else if (interactable.name === 'switch') {
            if (this.isThingActive) {
                this.toggleGate();
            } else {
                // Wednesday shouldn't be able to reach here anyway
            }
        }
    }

    toggleGate() {
        if (this.gateOpen) return;
        this.gateOpen = true;

        this.switch.setTexture('switch_on');

        // Animate Gate opening (slide up or fade)
        this.tweens.add({
            targets: this.gate,
            y: 100, // Move up
            alpha: 0.5,
            duration: 1000,
            onComplete: () => {
                this.gate.disableBody(true, false); // Disable collision but keep visible (moved)
            }
        });

        this.triggerDialogue([
            { name: 'Thing', text: "(Click-clack!)" },
            { name: 'Wednesday', text: "Adequate work. The path is clear." }
        ]);
    }

    triggerDialogue(dialogueData) {
        this.scene.get('UIScene').events.emit('start-dialogue', dialogueData);
        this.events.emit('dialogue-start');
    }
}
