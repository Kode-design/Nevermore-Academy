class GameManager {
    constructor() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        GameManager.instance = this;

        // Game State
        this.flags = {
            introCompleted: false,
            tunnelsUnlocked: false,
            metShadow: false,
            gateOpened: false
        };

        this.inventory = [];
        this.currentLocation = 'DinerScene';
    }

    setFlag(flag, value) {
        this.flags[flag] = value;
    }

    getFlag(flag) {
        return this.flags[flag];
    }

    addItem(item) {
        if (!this.inventory.includes(item)) {
            this.inventory.push(item);
        }
    }

    hasItem(item) {
        return this.inventory.includes(item);
    }
}

const instance = new GameManager();
export default instance;
