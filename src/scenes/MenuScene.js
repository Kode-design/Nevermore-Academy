class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.text(width / 2, height / 3, 'Wednesday:', {
            fontFamily: 'Courier New',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 3 + 40, 'The Nightshade Secret', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#800080'
        }).setOrigin(0.5);

        const startText = this.add.text(width / 2, height * 0.7, 'Press SPACE to Start', {
            fontFamily: 'Courier New',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Blink effect
        this.tweens.add({
            targets: startText,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}

export default MenuScene;
