export default class DialogueManager {
    constructor(scene, script) {
        this.scene = scene; // GameScene reference
        this.script = script;
        this.currentNode = null;
    }

    start(nodeId) {
        if (this.script[nodeId]) {
            this.playNode(nodeId);
        } else {
            console.warn('Dialogue node not found:', nodeId);
            // Release control if script ends unexpectedly
            this.scene.inputBlocked = false;
            this.scene.events.emit('hide-dialogue');
        }
    }

    playNode(nodeId) {
        this.currentNode = this.script[nodeId];
        if (!this.currentNode) return;

        // Handle Events
        if (this.currentNode.events) {
            this.currentNode.events.forEach(event => {
                this.scene.events.emit('script-event', event);
            });
        }

        // Handle Choice
        if (this.currentNode.type === 'choice') {
            // Choices handle their own flow via callback
            // We map the script choices to the format UIScene expects
            const uiChoices = this.currentNode.choices.map(c => ({
                text: c.text,
                value: c.next
            }));

            this.scene.events.emit('show-choices', {
                choices: uiChoices,
                callback: (nextId) => this.start(nextId)
            });
        }
        // Handle Dialogue
        else if (this.currentNode.text) {
             // Calculate duration based on text length (approx 50ms per char)
             // Min 2s, Max 6s
             const duration = Math.min(6000, Math.max(2000, this.currentNode.text.length * 60));

             this.scene.events.emit('show-dialogue', {
                 speaker: this.currentNode.speaker || '',
                 text: this.currentNode.text,
                 duration: duration
             });

             // Schedule next node
             this.scene.time.delayedCall(duration + 500, () => {
                 if (this.currentNode.next) {
                     this.start(this.currentNode.next);
                 } else {
                     // End of chain
                     this.scene.events.emit('hide-dialogue');
                     this.scene.inputBlocked = false;
                     this.scene.events.emit('script-complete');
                 }
             });
        }
    }
}
