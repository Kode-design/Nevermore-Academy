export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
    }

    create() {
        this.dialogueActive = false;

        // --- Interaction Prompt ---
        this.promptText = this.add.text(480, 500, '', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setOrigin(0.5);
        this.promptText.setVisible(false);

        // --- Dialogue UI ---
        this.dialogueContainer = this.add.container(0, 0);
        this.dialogueContainer.setVisible(false);

        // Background box
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.8);
        graphics.fillRect(50, 400, 860, 120);
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeRect(50, 400, 860, 120);

        this.dialogueContainer.add(graphics);

        // Text objects
        this.nameText = this.add.text(70, 410, '', {
            fontSize: '20px',
            fill: '#aa88ff',
            fontStyle: 'bold'
        });

        this.messageText = this.add.text(70, 440, '', {
            fontSize: '18px',
            fill: '#ffffff',
            wordWrap: { width: 820 }
        });

        this.dialogueContainer.add(this.nameText);
        this.dialogueContainer.add(this.messageText);

        // Input to advance
        this.input.keyboard.on('keydown-SPACE', this.advanceDialogue, this);
        this.input.on('pointerdown', this.advanceDialogue, this);

        // Listen for events from any active scene
        // Since scenes are started/stopped, we need a robust way to listen.
        // We can listen to the global game events or attach to specific scenes when they launch.
        // For simplicity, let's assume the active gameplay scene emits to this scene instance if they have a reference,
        // OR we listen to the SceneManager. But simplest is:
        // Gameplay scenes do `this.scene.get('UIScene').events.emit(...)`

        this.events.on('start-dialogue', this.startDialogue, this);
        this.events.on('show-prompt', this.showPrompt, this);
        this.events.on('hide-prompt', this.hidePrompt, this);
    }

    showPrompt(text) {
        if (!this.dialogueActive) {
            this.promptText.setText(text);
            this.promptText.setVisible(true);
        }
    }

    hidePrompt() {
        this.promptText.setVisible(false);
    }

    startDialogue(script) {
        if (!script || !Array.isArray(script) || script.length === 0) {
            console.error('UIScene: Invalid dialogue script received', script);
            this.endDialogue(); // Immediately end to unfreeze player
            return;
        }

        this.script = script;
        this.currentIndex = 0;
        this.dialogueActive = true;
        this.dialogueContainer.setVisible(true);
        this.hidePrompt(); // Hide prompt during dialogue
        this.showLine();

        // Notify current scene (we need to know who sent it, or broadcast)
        // Ideally the sender handles their own state, but we need to signal completion.
    }

    showLine() {
        if (this.currentIndex < this.script.length) {
            const line = this.script[this.currentIndex];
            this.nameText.setText(line.name);
            this.messageText.setText(line.text);
        } else {
            this.endDialogue();
        }
    }

    advanceDialogue() {
        if (!this.dialogueActive) return;

        this.currentIndex++;
        if (this.currentIndex < this.script.length) {
            this.showLine();
        } else {
            this.endDialogue();
        }
    }

    endDialogue() {
        this.dialogueActive = false;
        this.dialogueContainer.setVisible(false);
        // Emit global event or check which scene is active?
        // Let's emit a global event that gameplay scenes listen to.
        // Or better, UIScene emits 'dialogue-complete' on itself, and others listen to UIScene.
        this.events.emit('dialogue-complete');
    }
}
