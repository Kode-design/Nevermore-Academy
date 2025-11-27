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
        this.walls.create(400, 100, null).setSize(800, 200).setVisible(false);

        // Hazard Zone
        this.sludgeZone = this.add.rectangle(400, 575, 800, 50, 0x00ff00, 0);
        this.physics.add.existing(this.sludgeZone, true);

        // --- Parent Setup ---
        this.createPlayer(50, 300); // Start position
        this.setupInteractionGroup();

        // --- Puzzle Elements ---

        // Gate
        this.gateOpen = GameManager.getFlag('gateOpened');

        // If gate is open, we can modify initial state
        const gateX = 600;
        const gateY = this.gateOpen ? 100 : 300;
        const gateAlpha = this.gateOpen ? 0.5 : 1;

        this.gate = this.physics.add.staticSprite(gateX, gateY, 'gate');
        this.gate.setSize(32, 200);
        this.gate.setAlpha(gateAlpha);

        if (this.gateOpen) {
            this.gate.disableBody(true, false);
        } else {
            this.physics.add.collider(this.wednesday, this.gate);
            this.physics.add.collider(this.thing, this.gate);
        }

        // Rat Hole
        this.ratHole = this.physics.add.sprite(500, 184, 'rat_hole');
        this.ratHole.setDepth(5);
        this.interactables.add(this.ratHole);
        this.ratHole.name = 'rat_hole';
        this.ratHole.prompt = '[SPACE] Enter Hole';

        // Switch
        const switchTexture = this.gateOpen ? 'switch_on' : 'switch_off';
        this.switch = this.physics.add.sprite(650, 100, switchTexture);
        this.interactables.add(this.switch);
        this.switch.name = 'switch';
        this.switch.prompt = '[SPACE] Pull Lever';
        this.switch.setDepth(1);

        // Inner Rat Hole
        this.ratHoleInner = this.physics.add.sprite(500, 120, 'rat_hole');
        this.ratHoleInner.setAlpha(0.5);
        this.interactables.add(this.ratHoleInner);
        this.ratHoleInner.name = 'rat_hole_inner';
        this.ratHoleInner.prompt = '[SPACE] Exit';

        // Colliders
        this.physics.add.collider(this.wednesday, this.walls);
        this.physics.add.collider(this.thing, this.walls);

        // Sludge Interaction
        this.physics.add.overlap([this.wednesday, this.thing], this.sludgeZone, (player) => {
             player.setVelocity(player.body.velocity.x * 0.5, player.body.velocity.y * 0.5);
        });

        // Exit Zone (To Map)
        this.exitZone = this.add.rectangle(10, 300, 20, 100, 0xff0000, 0);
        this.physics.add.existing(this.exitZone, true);
        this.physics.add.overlap(this.wednesday, this.exitZone, () => {
            if (!this.isThingActive && this.canMove) {
                this.scene.start('MapScene');
            }
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
                 GameManager.setFlag('metShadow', true); // Using this flag for 'first visit' logic for now
             });
        }
    }

    onInteract(interactable) {
        if (interactable.name === 'rat_hole') {
            if (this.isThingActive) {
                this.thing.setPosition(500, 130);
                this.cameras.main.pan(500, 130, 500);
            } else {
                this.triggerDialogue([{ name: 'Wednesday', text: "I can't fit in there. It's Thing-sized." }]);
            }
        } else if (interactable.name === 'rat_hole_inner') {
            if (this.isThingActive) {
                this.thing.setPosition(500, 210);
            }
        } else if (interactable.name === 'switch') {
            if (this.isThingActive) {
                this.toggleGate();
            } else {
                // Unreachable
            }
        }
    }

    toggleGate() {
        if (this.gateOpen) return;
        this.gateOpen = true;
        GameManager.setFlag('gateOpened', true);

        this.switch.setTexture('switch_on');

        this.tweens.add({
            targets: this.gate,
            y: 100,
            alpha: 0.5,
            duration: 1000,
            onComplete: () => {
                this.gate.disableBody(true, false);
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
