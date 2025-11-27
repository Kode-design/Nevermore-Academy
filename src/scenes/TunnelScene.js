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
        this.events.on('show-prompt', (text) => uiScene.events.emit('show-prompt', text));
        this.events.on('hide-prompt', () => uiScene.events.emit('hide-prompt'));

        uiScene.events.on('dialogue-complete', () => {
             if (this.scene.isActive()) {
                 this.events.emit('dialogue-complete');
             }
        });

        // Initial Message (One time)
        if (!GameManager.getFlag('metShadow')) { // Just reusing a flag for "visited tunnels" or make new one
             // Actually let's just show it every time for now or check a local flag?
             // Let's assume always for now, or just once per session.
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
