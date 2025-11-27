export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
    }

    create() {
        this.dialogueActive = false;

        // Container for dialogue UI
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

        // Listen for events
        const gameScene = this.scene.get('DinerScene');
        gameScene.events.on('start-dialogue', this.startDialogue, this);
    }

    startDialogue(script) {
        this.script = script;
        this.currentIndex = 0;
        this.dialogueActive = true;
        this.dialogueContainer.setVisible(true);
        this.showLine();
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
        const gameScene = this.scene.get('DinerScene');
        gameScene.events.emit('dialogue-complete');
    }
}
