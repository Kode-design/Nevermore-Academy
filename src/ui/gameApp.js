import { PlayerCharacter } from "../state/playerCharacter.js";
import { buildInitialWorldState, pruneNotifications, advanceQuest } from "../state/worldState.js";
import { getEncounter } from "../state/encounters.js";
import { createCharacterCreationView } from "./characterCreationView.js";
import { createExplorationView } from "./explorationView.js";
import { createCombatView } from "./combatView.js";

export class GameApp {
  constructor(root) {
    this.root = root;
    this.world = buildInitialWorldState();
    this.player = null;
    this.currentView = null;
    this.phase = "character";

    this.gotoCharacterCreation();

    this.tickInterval = window.setInterval(() => {
      pruneNotifications(this.world);
      if (this.currentView && typeof this.currentView.update === "function") {
        this.currentView.update();
      }
    }, 500);
  }

  destroy() {
    if (this.currentView?.destroy) {
      this.currentView.destroy();
    }
    window.clearInterval(this.tickInterval);
  }

  gotoCharacterCreation() {
    this.phase = "character";
    this.render((container) =>
      createCharacterCreationView(container, {
        onComplete: (data) => this.startExploration(data)
      })
    );
  }

  startExploration(data) {
    this.player = new PlayerCharacter(data);
    this.world = buildInitialWorldState();
    this.phase = "exploration";
    this.render((container) =>
      createExplorationView(container, {
        player: this.player,
        world: this.world,
        onEnterCombat: (encounterId) => this.startCombat(encounterId),
        onRestart: () => this.gotoCharacterCreation()
      })
    );
  }

  startCombat(encounterId) {
    this.phase = "combat";
    const encounter = getEncounter(encounterId, this.player);
    this.render((container) =>
      createCombatView(container, {
        player: this.player,
        world: this.world,
        encounter,
        onComplete: (result) => this.finishCombat(encounterId, result)
      })
    );
  }

  finishCombat(encounterId, result) {
    if (result?.success) {
      advanceQuest(this.world, "veil-audit-101");
      this.world.notifications.push({
        id: `encounter-${Date.now()}`,
        message: `${result.summary}`,
        expiresAt: Date.now() + 6000
      });
    }
    this.phase = "exploration";
    this.render((container) =>
      createExplorationView(container, {
        player: this.player,
        world: this.world,
        onEnterCombat: (id) => this.startCombat(id),
        onRestart: () => this.gotoCharacterCreation()
      })
    );
  }

  render(factory) {
    if (this.currentView?.destroy) {
      this.currentView.destroy();
    }
    this.root.innerHTML = "";
    const { element, destroy, update } = factory(this.root);
    this.root.append(element);
    this.currentView = { destroy, update };
  }
}
