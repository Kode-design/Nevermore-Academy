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

        // Environment
        this.createEnvironment();

        // Player
        this.player = this.physics.add.sprite(100, 400, 'player');
        this.player.setCollideWorldBounds(true);

        // Cass (Rabbit)
        this.cass = this.physics.add.sprite(150, 420, 'rabbit');
        this.cass.setCollideWorldBounds(true);
        this.cass.setBounce(0.2);

        // Colliders
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.cass, this.platforms);

        // Door Interaction Zone
        this.door = this.add.image(800, 390, 'door');
        this.doorZone = this.add.zone(800, 390, 60, 100);
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
        // Floor
        for(let i=0; i<30; i++) {
            this.platforms.create(16 + i*32, 524, 'floor');
        }
        // Walls
        for(let i=0; i<15; i++) {
            this.platforms.create(16, 524 - i*32, 'wall');
            this.platforms.create(944, 524 - i*32, 'wall');
        }

        // Bed (Visual)
        this.add.rectangle(100, 450, 80, 40, 0x666666);
    }

    update() {
        if (this.inputBlocked) {
            this.player.setVelocityX(0);
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
        if (this.gameState.step === 'READY_TO_ANSWER' && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.inputBlocked = true;
            this.player.setVelocityX(0);

            this.events.emit('show-choices', {
                choices: [
                    { text: 'Answer the door', value: 'ANSWER' },
                    { text: 'Ignore it', value: 'IGNORE' },
                    { text: 'Peek with chain', value: 'PEEK' },
                    { text: 'Say: "If it\'s Calder..."', value: 'SAY_CALDER' }
                ],
                callback: (value) => this.handleDoorChoice(value)
            });
        }
    }

    handleDoorChoice(decision) {
        if (decision === 'ANSWER') {
             this.events.emit('show-dialogue', {
                 speaker: 'Narrator',
                 text: 'He opens the door. Marcia stands there holding a small plastic bag full of carrot slices.',
                 duration: 4000
             });

             this.time.delayedCall(4000, () => {
                 this.events.emit('show-dialogue', {
                     speaker: 'Marcia',
                     text: 'Hello. Your mother told my mother who told me that I may enter your home anytime I wish to visit your rabbit. So I have arrived. For the rabbit.',
                     duration: 6000
                 });

                 this.time.delayedCall(6500, () => {
                    this.events.emit('show-dialogue', {
                        speaker: 'Khristopher',
                        text: '...Hi, Marcia.',
                        duration: 3000
                    });

                    this.time.delayedCall(3500, () => {
                        this.events.emit('show-dialogue', {
                            speaker: 'Marcia',
                            text: 'I also come with offerings. These carrots were the second-most recommended vegetable.',
                            duration: 5000
                        });

                         this.time.delayedCall(5500, () => {
                             // Next choice block would go here
                             this.inputBlocked = false;
                             this.events.emit('show-notification', 'Demo End - See README for full story');
                         });
                    });
                 });
             });
        } else {
            this.events.emit('show-dialogue', {
                 speaker: 'Narrator',
                 text: 'Path WIP: You chose ' + decision,
                 duration: 3000
            });
            this.inputBlocked = false;
        }
    }
}
