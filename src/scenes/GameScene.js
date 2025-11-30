import { openingScript } from '../data/openingScript.js';
import DialogueManager from '../managers/DialogueManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.gameState = {
            step: 'INTRO_START',
            relationship: { marcia: 0 },
            inventory: []
        };
    }

    create() {
        this.scene.launch('UIScene');

        // Initialize Dialogue Manager
        this.dialogueManager = new DialogueManager(this, openingScript);
        this.events.on('script-event', this.handleScriptEvent, this);

        // Environment & Camera
        this.createEnvironment();

        // Player
        this.player = this.physics.add.sprite(100, 400, 'player');
        this.player.setCollideWorldBounds(true);

        // Marcia (Initially in Hallway)
        this.marcia = this.physics.add.sprite(1050, 400, 'marcia');
        this.marcia.setCollideWorldBounds(true);
        this.marcia.setFlipX(true); // Face door

        // Cass (Rabbit)
        this.cass = this.physics.add.sprite(150, 420, 'rabbit');
        this.cass.setCollideWorldBounds(true);
        this.cass.setBounce(0.2);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.marcia, this.platforms);
        this.physics.add.collider(this.cass, this.platforms);

        // Door Interaction Zone
        this.door = this.add.image(944, 460, 'door');
        this.doorZone = this.add.zone(944, 460, 60, 100);
        this.physics.add.existing(this.doorZone, true);

        this.physics.add.overlap(this.player, this.doorZone, this.handleDoorOverlap, null, this);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Start Script
        this.time.delayedCall(2000, this.runIntroScript, [], this);

        this.inputBlocked = true;
    }

    createEnvironment() {
        this.platforms = this.physics.add.staticGroup();

        // World Bounds & Camera
        this.physics.world.setBounds(0, 0, 1600, 540);
        this.cameras.main.setBounds(0, 0, 1600, 540);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Apartment 1 Floor (0-960)
        for(let i=0; i<30; i++) {
            this.platforms.create(16 + i*32, 524, 'floor');
        }
        // Hallway Floor (960-1600)
        for(let i=30; i<50; i++) {
             this.platforms.create(16 + i*32, 524, 'floor').setTint(0x999999);
        }

        // Walls (Apt 1 Left)
        for(let i=0; i<15; i++) {
            this.platforms.create(16, 524 - i*32, 'wall');
        }

        // Walls (Apt 1 Right / Hallway Divider) - Gap for Door
        for(let i=0; i<15; i++) {
            if (i > 3) {
                this.platforms.create(944, 524 - i*32, 'wall');
            }
        }

        // Hallway Right End
        for(let i=0; i<15; i++) {
            this.platforms.create(1584, 524 - i*32, 'wall');
        }

        // Bed (Visual)
        this.add.rectangle(100, 450, 80, 40, 0x666666);
    }

    update() {
        if (this.inputBlocked) {
            this.player.setVelocityX(0);
            if(this.player.anims) this.player.anims.stop();
            return;
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

        // Rabbit Random Hops
        if (Math.random() < 0.01 && this.cass.body.touching.down) {
            this.cass.setVelocityY(-150);
            this.cass.setVelocityX(Math.random() > 0.5 ? 50 : -50);
        }
    }

    runIntroScript() {
        // Ding Dong 1
        this.events.emit('show-notification', 'SFX: DING DONG');

        this.time.delayedCall(2000, () => {
             this.events.emit('show-dialogue', {
                 speaker: 'Khristopher',
                 text: '...You’ve got to be kidding me.',
                 duration: 3000
             });

             this.time.delayedCall(4000, () => {
                 this.events.emit('show-notification', 'SFX: DING DONG');

                 this.time.delayedCall(2000, () => {
                     this.events.emit('show-dialogue', {
                         speaker: 'Khristopher',
                         text: 'Alright, alright. I’m going.',
                         duration: 3000
                     });

                     this.time.delayedCall(3000, () => {
                         this.inputBlocked = false;
                         this.events.emit('show-notification', 'Objective: Answer the Door');
                         this.gameState.step = 'READY_TO_ANSWER';
                     });
                 });
             });
        });
    }

    handleDoorOverlap() {
        // Debounce or check state to prevent multiple triggers
        if (this.gameState.step === 'READY_TO_ANSWER' && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.inputBlocked = true;
            this.player.setVelocityX(0);

            // Start the interactive script part
            this.dialogueManager.start('door_choice');
        }
    }

    handleScriptEvent(event) {
        if (event === 'marcia_enter') {
            this.tweens.add({
                 targets: this.marcia,
                 x: 880, // Enter room
                 duration: 1500,
                 ease: 'Power1',
                 onComplete: () => {
                     this.marcia.setFlipX(false);
                 }
            });
        }
        else if (event === 'marcia_walk_in_further') {
            this.tweens.add({
                targets: this.marcia,
                x: 600, // Move deeper into room
                duration: 2000,
                ease: 'Power1'
            });
        }
        else if (event === 'item_carrots') {
            this.gameState.inventory.push('Carrots');
            this.events.emit('show-notification', 'Item Acquired: Bag of Carrots');
        }
        else if (event === 'marcia_jump') {
             this.tweens.add({
                targets: this.marcia,
                y: this.marcia.y - 50,
                yoyo: true,
                duration: 200
             });
        }
    }
}
