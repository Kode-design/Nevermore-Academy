import GameManager from '../managers/GameManager.js';
import BaseGameplayScene from './BaseGameplayScene.js';

export default class TunnelScene extends BaseGameplayScene {
    constructor() {
        super('TunnelScene');
    }

    create() {
        // Background
        this.add.image(400, 300, 'tunnel_bg');
        this.physics.world.setBounds(0, 0, 800, 600);

        // Ground
        this.ground = this.physics.add.staticGroup();
        this.ground.create(400, 580, null).setSize(800, 40).setVisible(false);

        // Parent Setup
        this.createPlayer(50, 500);
        this.physics.add.collider(this.wednesday, this.ground);
        this.physics.add.collider(this.thing, this.ground);

        this.setupInteractionGroup();

        // Scene needs UIScene to be active? It likely persists.
        const uiScene = this.scene.get('UIScene');

        // Handlers
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

        // Cleanup
        this.events.once('shutdown', () => {
            this.events.off('show-prompt', this.onShowPrompt);
            this.events.off('hide-prompt', this.onHidePrompt);
            uiScene.events.off('dialogue-complete', this.onDialogueComplete);
        });

        // Initial Message (One time)
        if (!GameManager.getFlag('metShadow')) {
             this.time.delayedCall(500, () => {
                 this.triggerDialogue([
                     { name: 'Wednesday', text: "The tunnels. Damp, dark, and smelling of centuries of regret." },
                     { name: 'Wednesday', text: "Perfect." }
                 ]);
             });
        }
    }

    triggerDialogue(dialogueData) {
        this.scene.get('UIScene').events.emit('start-dialogue', dialogueData);
        this.events.emit('dialogue-start');
    }
}
