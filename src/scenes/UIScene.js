export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.dialogueContainer = this.add.container(0, 400);
        this.dialogueContainer.setVisible(false);

        // Dialogue Box Background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRect(0, 0, 960, 140);
        this.dialogueContainer.add(bg);

        // Speaker Text
        this.speakerText = this.add.text(20, 20, 'Name', {
            fontFamily: 'Courier',
            fontSize: '24px',
            color: '#ffff00'
        });
        this.dialogueContainer.add(this.speakerText);

        // Content Text
        this.contentText = this.add.text(20, 60, 'Dialogue goes here...', {
            fontFamily: 'Courier',
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: 920 }
        });
        this.dialogueContainer.add(this.contentText);

        // Event Listeners
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('show-dialogue', this.handleShowDialogue, this);
        gameScene.events.on('hide-dialogue', this.handleHideDialogue, this);
        gameScene.events.on('show-choices', this.handleShowChoices, this);
        gameScene.events.on('show-notification', this.handleNotification, this);

        this.choicesContainer = this.add.container(0, 0);
        this.choicesContainer.setVisible(false);
    }

    handleShowDialogue({ speaker, text, duration }) {
        this.dialogueContainer.setVisible(true);
        this.speakerText.setText(speaker);
        this.contentText.setText(text);

        if (duration) {
            this.time.delayedCall(duration, () => {
                this.handleHideDialogue();
            });
        }
    }

    handleHideDialogue() {
        this.dialogueContainer.setVisible(false);
    }

    handleShowChoices({ choices, callback }) {
        this.choicesContainer.removeAll(true);
        this.choicesContainer.setVisible(true);

        // Background for choices to block input
        const bg = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.7);
        bg.setInteractive(); // Block clicks
        this.choicesContainer.add(bg);

        let y = 150;
        choices.forEach((choice, index) => {
            const btn = this.add.text(480, y, `${index + 1}. ${choice.text}`, {
                fontFamily: 'Courier',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => btn.setStyle({ color: '#ffff00' }))
            .on('pointerout', () => btn.setStyle({ color: '#ffffff' }))
            .on('pointerdown', () => {
                this.choicesContainer.setVisible(false);
                callback(choice.value);
            });

            this.choicesContainer.add(btn);
            y += 60;
        });
    }

    handleNotification(text) {
        const notif = this.add.text(480, 100, text, {
            fontFamily: 'Courier',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: notif,
            y: 50,
            alpha: 0,
            duration: 2000,
            onComplete: () => notif.destroy()
        });
    }
}
