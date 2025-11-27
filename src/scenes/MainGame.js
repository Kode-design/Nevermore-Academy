import Phaser from 'phaser';

export default class MainGame extends Phaser.Scene {
    constructor() {
        super('MainGame');
    }

    create() {
        // Map Setup
        this.physics.world.setBounds(0, 0, 1600, 1200);
        this.add.tileSprite(0, 0, 1600, 1200, 'floor').setOrigin(0);

        // Player
        this.player = this.physics.add.sprite(400, 300, 'wednesday');
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.2);

        // Enemies Group
        this.enemies = this.physics.add.group({
            bounceX: 1,
            bounceY: 1,
            collideWorldBounds: true
        });

        // Collectibles
        this.pages = this.physics.add.group();

        // Walls
        this.walls = this.physics.add.staticGroup();
        this.createLevel();

        // Thing (Projectile)
        this.things = this.physics.add.group({
            defaultKey: 'thing',
            maxSize: 5
        });

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // UI
        this.score = 0;
        this.socialBattery = 100;

        this.scene.launch('GameUI');

        // Colliders
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.enemies, this.enemies);

        this.physics.add.overlap(this.player, this.pages, this.collectPage, null, this);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.things, this.enemies, this.stunEnemy, null, this);
        this.physics.add.collider(this.things, this.walls, (thing) => thing.disableBody(true, true));

        // Spawn Entities
        this.spawnEnemies(20);
        this.spawnPages(10);
    }

    update(time, delta) {
        // Player Movement
        const speed = 250;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.setVelocityY(speed);
        }

        // Thing Ability
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.throwThing();
        }

        // Enemy AI
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isStunned) return;

            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);

            if (dist < 250) {
                // Chase
                this.physics.moveToObject(enemy, this.player, 100);
            } else {
                // Wander if stopped
                if (enemy.body.speed < 10) {
                     enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
                }
            }
        });
    }

    createLevel() {
        // Create random walls but avoid center
        for (let i = 0; i < 30; i++) {
            let x = Phaser.Math.Between(100, 1500);
            let y = Phaser.Math.Between(100, 1100);

            // Avoid spawn area
            while (Phaser.Math.Distance.Between(x, y, 400, 300) < 200) {
                x = Phaser.Math.Between(100, 1500);
                y = Phaser.Math.Between(100, 1100);
            }

            this.walls.create(x, y, 'wall').refreshBody();
        }
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(100, 1500);
            let y = Phaser.Math.Between(100, 1100);

            // Ensure not too close to player
            while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 300) {
                x = Phaser.Math.Between(100, 1500);
                y = Phaser.Math.Between(100, 1100);
            }

            const enemy = this.enemies.create(x, y, 'enid');
            enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
            enemy.setBounce(1);
        }
    }

    spawnPages(count) {
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(50, 1550);
            let y = Phaser.Math.Between(50, 1150);

            // Avoid walls
            // Simplistic check, just random placement for now
            this.pages.create(x, y, 'page');
        }
    }

    collectPage(player, page) {
        page.disableBody(true, true);
        this.score++;
        this.events.emit('updateScore', this.score);

        if (this.score >= 10) {
            this.scene.stop('GameUI');
            this.scene.start('GameOver', { won: true, score: this.score });
        }
    }

    hitEnemy(player, enemy) {
        if (enemy.isStunned) return;

        // Knockback
        if (player.body.touching.none && enemy.body.touching.none) return; // Prevent weird overlap bugs

        this.cameras.main.shake(100, 0.01);
        this.socialBattery -= 10;
        this.events.emit('updateBattery', this.socialBattery);

        // Push back
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        player.body.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);

        // Temporary invulnerability or just knockback?
        // Let's just rely on knockback separating them

        if (this.socialBattery <= 0) {
            this.scene.stop('GameUI');
            this.scene.start('GameOver', { won: false, score: this.score });
        }
    }

    throwThing() {
        // Limit fire rate?
        const thing = this.things.get(this.player.x, this.player.y);
        if (thing) {
            thing.setActive(true);
            thing.setVisible(true);
            thing.enableBody(true, this.player.x, this.player.y, true, true);

            // Aim towards mouse
            const pointer = this.input.activePointer;
            // Adjust for camera scroll
            const worldPoint = pointer.positionToCamera(this.cameras.main);

            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);

            this.physics.velocityFromRotation(angle, 600, thing.body.velocity);
            thing.setRotation(angle);

            // Auto destroy after 1 sec
            this.time.delayedCall(1000, () => {
                thing.disableBody(true, true);
            });
        }
    }

    stunEnemy(thing, enemy) {
        thing.disableBody(true, true);

        if (enemy.isStunned) return;

        enemy.isStunned = true;
        enemy.setTint(0x555555);

        const originalVelX = enemy.body.velocity.x;
        const originalVelY = enemy.body.velocity.y;
        enemy.setVelocity(0, 0);

        this.time.delayedCall(2000, () => {
            if (enemy.active) {
                enemy.isStunned = false;
                enemy.clearTint();
                // Resume random movement or chase will pick it up
                enemy.setVelocity(originalVelX, originalVelY);
            }
        });
    }
}
