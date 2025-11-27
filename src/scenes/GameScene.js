import UIScene from './UIScene.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Game State
        this.gameState = {
            spokenToEnid: false,
            foundBook: false,
            doorUnlocked: false
        };

        // Launch UI Scene
        this.scene.launch('UIScene');
        this.uiScene = this.scene.get('UIScene');

        // Create Map
        this.createMap();

        // Create Player
        this.createPlayer();

        // Create NPCs
        this.createNPCs();

        // Camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(0, 0, 15 * 32, 10 * 32);
        this.physics.world.setBounds(0, 0, 15 * 32, 10 * 32);

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Interaction
        this.input.keyboard.on('keydown-SPACE', () => {
            this.handleInteraction();
        });
        this.input.keyboard.on('keydown-E', () => {
            this.handleInteraction();
        });
    }

    createMap() {
        // Simple map layout
        // 0: Floor, 1: Wall, 2: Bookshelf, 3: Door
        const level = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 1], // Target shelf at index 12 (approx x=400)
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2, 3, 1], // Door at bottom right
            [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
        ];

        this.walls = this.physics.add.staticGroup();
        this.interactables = this.physics.add.staticGroup();

        const tileSize = 32;

        for (let y = 0; y < level.length; y++) {
            for (let x = 0; x < level[y].length; x++) {
                const tileID = level[y][x];
                const posX = x * tileSize + tileSize / 2;
                const posY = y * tileSize + tileSize / 2;

                this.add.image(posX, posY, 'tiles', 0); // Floor

                if (tileID === 1) { // Wall
                    const wall = this.walls.create(posX, posY, 'tiles', 1);
                    wall.body.updateFromGameObject();
                } else if (tileID === 2) { // Bookshelf
                    const shelf = this.interactables.create(posX, posY, 'tiles', 2);
                    shelf.body.updateFromGameObject();

                    // Mark the specific bookshelf (Row 1, Index 12)
                    if (y === 1 && x === 12) {
                        shelf.setData('id', 'target_shelf');
                    } else {
                        shelf.setData('id', 'shelf');
                    }
                } else if (tileID === 3) { // Door
                    const door = this.interactables.create(posX, posY, 'tiles', 3);
                    door.setData('id', 'door');
                    door.body.updateFromGameObject();
                    this.door = door;
                }
            }
        }
    }

    createPlayer() {
        // Start near entrance (x=7, y=9 is entrance)
        const startX = 7 * 32 + 16;
        const startY = 8 * 32 + 16;

        this.player = this.physics.add.sprite(startX, startY, 'wednesday');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.interactables);
    }

    createNPCs() {
        // Enid at x=3, y=5
        const x = 3 * 32 + 16;
        const y = 5 * 32 + 16;
        this.enid = this.physics.add.sprite(x, y, 'enid');
        this.enid.setImmovable(true);
        this.physics.add.collider(this.player, this.enid);
    }

    handleInteraction() {
        if (this.uiScene.isDialogVisible()) {
            this.uiScene.hideDialog();

            // Check if we need to perform actions after dialog closes
            if (this.gameState.doorUnlocked && this.door.active) {
                this.door.disableBody(true, true);
            }
            return;
        }

        // Check distance to Enid
        const distEnid = Phaser.Math.Distance.BetweenPoints(this.player, this.enid);
        if (distEnid < 50) {
            this.interactEnid();
            return;
        }

        // Check distance to interactables
        let nearest = null;
        let minDist = 50;

        this.interactables.getChildren().forEach(obj => {
            const dist = Phaser.Math.Distance.BetweenPoints(this.player, obj);
            if (dist < minDist) {
                minDist = dist;
                nearest = obj;
            }
        });

        if (nearest) {
            this.interactObject(nearest);
        }
    }

    interactEnid() {
        if (!this.gameState.spokenToEnid) {
            this.uiScene.showDialog("Enid: Wednesday! I saw a suspicious book on the top-right shelf. It was glowing purple!");
            this.gameState.spokenToEnid = true;
        } else {
            this.uiScene.showDialog("Enid: Did you check the top-right shelf yet?");
        }
    }

    interactObject(obj) {
        const id = obj.getData('id');

        if (id === 'shelf') {
            this.uiScene.showDialog("Just some boring history books about Jericho.");
        } else if (id === 'target_shelf') {
            if (!this.gameState.spokenToEnid) {
                this.uiScene.showDialog("A collection of encyclopedias. Nothing interesting.");
            } else if (!this.gameState.foundBook) {
                this.uiScene.showDialog("You found 'The Nightshade Code'! A small key falls out.");
                this.gameState.foundBook = true;
            } else {
                this.uiScene.showDialog("The shelf is empty where the book was.");
            }
        } else if (id === 'door') {
            if (!this.gameState.foundBook) {
                this.uiScene.showDialog("It's locked. Looks like it needs a key.");
            } else {
                this.uiScene.showDialog("The key fits! The door clicks open.");
                this.gameState.doorUnlocked = true;
            }
        }
    }

    winGame() {
        if (this.gameState.won) return;
        this.gameState.won = true;

        this.add.text(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y, 'MYSTERY SOLVED', {
            fontFamily: 'Courier New',
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#000000'
        }).setOrigin(0.5);
        this.physics.pause();
    }

    update() {
        // Win Condition Check
        if (this.gameState.doorUnlocked && !this.door.active) {
            // Door is at y index 8 (approx 272). If player goes below that.
            if (this.player.y > 9 * 32) {
                this.winGame();
            }
        }

        if (this.uiScene && this.uiScene.isDialogVisible()) {
            this.player.body.setVelocity(0);
            return;
        }

        const speed = 150;
        this.player.body.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.body.setVelocityY(speed);
        }

        this.player.body.velocity.normalize().scale(speed);
    }
}

export default GameScene;
