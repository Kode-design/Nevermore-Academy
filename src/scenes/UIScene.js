class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.dialogVisible = false;

        // Container for dialog
        this.dialogContainer = this.add.container(0, 450);
        this.dialogContainer.setScrollFactor(0); // Fix to camera

        // Background
        const bg = this.add.image(400, 50, 'ui_box');
        this.dialogContainer.add(bg);

        // Text
        this.dialogText = this.add.text(220, 20, '', {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: 360 }
        });
        this.dialogContainer.add(this.dialogText);

        this.dialogContainer.setVisible(false);
    }

    showDialog(text) {
        this.dialogText.setText(text);
        this.dialogContainer.setVisible(true);
        this.dialogVisible = true;
    }

    hideDialog() {
        this.dialogContainer.setVisible(false);
        this.dialogVisible = false;
    }

    isDialogVisible() {
        return this.dialogVisible;
    }
}

export default UIScene;
