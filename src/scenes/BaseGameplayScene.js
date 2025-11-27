export default class BaseGameplayScene extends Phaser.Scene {
    constructor(key) {
        super(key);
    }

    createPlayer(x, y) {
        // Wednesday
        this.wednesday = this.physics.add.sprite(x, y, 'wednesday');
        this.wednesday.setCollideWorldBounds(true);
        this.wednesday.body.setSize(20, 10);
        this.wednesday.body.setOffset(6, 50);
        this.wednesday.setDepth(10);

        // Thing
        this.thing = this.physics.add.sprite(x, y, 'thing');
        this.thing.setVisible(false);
        this.thing.setCollideWorldBounds(true);
        this.thing.body.setSize(16, 16);
        this.thing.setDepth(10);

        // State
        this.isThingActive = false;
        this.canMove = true;
        this.dialogueActive = false; // Should be managed by listening to UI events

        // Camera
        this.cameras.main.startFollow(this.wednesday, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.5);

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-T', () => {
            if (this.canMove) this.toggleCharacter();
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.canMove && !this.dialogueActive) {
                this.handleInteraction();
            }
        });

        // Listen for dialogue events to pause/resume movement
        this.events.on('dialogue-start', () => {
            this.canMove = false;
            this.dialogueActive = true;
            this.stopPlayer();
        });

        // We assume the subclass or UIScene emits 'dialogue-complete'
        this.events.on('dialogue-complete', () => {
            this.canMove = true;
            this.dialogueActive = false;
        });
    }

    // Subclasses should call this in their create()
    setupInteractionGroup() {
        this.interactables = this.physics.add.group();
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

    updatePlayerMovement() {
        if (!this.canMove) {
            this.stopPlayer();
            return;
        }

        const speed = this.isThingActive ? 250 : 160;
        const activeSprite = this.isThingActive ? this.thing : this.wednesday;

        activeSprite.setVelocity(0);

        // Stop the inactive one
        if (this.isThingActive) this.wednesday.setVelocity(0);
        else if (this.thing.body) this.thing.setVelocity(0);

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

    stopPlayer() {
        if (this.wednesday && this.wednesday.body) this.wednesday.setVelocity(0);
        if (this.thing && this.thing.body) this.thing.setVelocity(0);
    }

    // Interaction Prompt Logic
    updateInteractionPrompt() {
        if (!this.interactables) return;

        const player = this.isThingActive ? this.thing : this.wednesday;
        let found = false;
        let promptText = '';

        this.physics.overlap(player, this.interactables, (playerSprite, interactable) => {
            if (found) return; // Prioritize one

            // Logic to check if this character can interact
            // We can add properties to interactables like 'requiredChar'
            // For now, assume generic.

            // Subclasses can override isValidInteraction(interactable)
            if (this.isValidInteraction(interactable)) {
                found = true;
                promptText = interactable.prompt || '[SPACE] Interact';
            }
        });

        if (found) {
            this.events.emit('show-prompt', promptText);
        } else {
            this.events.emit('hide-prompt');
        }
    }

    isValidInteraction(interactable) {
        // Default logic: Thing can do vents, Wed can do notes?
        // Or generic. Let's let subclasses decide or use properties.
        // For now, return true and let specific logic handle the ACTION.
        return true;
    }

    handleInteraction() {
        const player = this.isThingActive ? this.thing : this.wednesday;

        this.physics.overlap(player, this.interactables, (playerSprite, interactable) => {
            this.onInteract(interactable);
        });
    }

    // Abstract-ish method
    onInteract(interactable) {
        console.log('Interacted with', interactable);
    }

    update() {
        this.updatePlayerMovement();
        this.updateInteractionPrompt();
    }
}
