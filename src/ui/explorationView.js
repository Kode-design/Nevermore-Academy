import {
  isTileWalkable,
  updateVeilHeat,
  updateReputation,
  resolveQuestTrigger,
  advanceQuest
} from "../state/worldState.js";
import { ATTRIBUTE_LIST } from "../data/options.js";
import { renderIsometricScene } from "./isometricRenderer.js";

const MOVE_KEYS = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  w: { dx: 0, dy: -1 },
  s: { dx: 0, dy: 1 },
  a: { dx: -1, dy: 0 },
  d: { dx: 1, dy: 0 }
};

export function createExplorationView(container, { player, world, onEnterCombat, onRestart }) {
  const element = document.createElement("div");
  element.className = "card";

  const heading = document.createElement("div");
  heading.innerHTML = `
    <h1>Night Walk: Fell Keep Tramway</h1>
    <p>Use WASD or the arrow keys to explore. Interact with curios to influence Veil Heat and reputation.</p>
  `;
  element.append(heading);

  const flex = document.createElement("div");
  flex.className = "flex-row";

  const mapPanel = document.createElement("div");
  mapPanel.className = "panel";
  mapPanel.style.flex = "2";

  const canvasWrapper = document.createElement("div");
  canvasWrapper.className = "canvas-wrapper";

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 560;
  canvasWrapper.append(canvas);

  const toast = document.createElement("div");
  toast.className = "toast hidden";
  canvasWrapper.append(toast);

  const ctx = canvas.getContext("2d");

  mapPanel.append(canvasWrapper);

  const controlsRow = document.createElement("div");
  controlsRow.className = "actions";

  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.textContent = "Rebuild Character";
  resetButton.addEventListener("click", () => onRestart());
  controlsRow.append(resetButton);

  const combatButton = document.createElement("button");
  combatButton.type = "button";
  combatButton.textContent = "Force Combat";
  combatButton.addEventListener("click", () => onEnterCombat(world.combatTrigger.encounterId));
  controlsRow.append(combatButton);

  mapPanel.append(controlsRow);

  const infoPanel = document.createElement("div");
  infoPanel.className = "panel";
  infoPanel.innerHTML = renderInfoPanel(player, world);

  const logPanel = document.createElement("div");
  logPanel.className = "panel";
  const logTitle = document.createElement("h2");
  logTitle.textContent = "Veil Chronicle";
  const logContainer = document.createElement("div");
  logContainer.className = "log";
  logPanel.append(logTitle, logContainer);

  const questPanel = document.createElement("div");
  questPanel.className = "panel";
  questPanel.innerHTML = renderQuestPanel(world);

  flex.append(mapPanel, infoPanel, questPanel);

  const bottomRow = document.createElement("div");
  bottomRow.className = "flex-row";
  bottomRow.append(logPanel);

  const promptPanel = document.createElement("div");
  promptPanel.className = "panel hidden";
  bottomRow.append(promptPanel);

  element.append(flex, bottomRow);

  render();

  const keyHandler = (event) => {
    const move = MOVE_KEYS[event.key];
    if (!move) return;
    event.preventDefault();
    attemptMove(move.dx, move.dy);
  };

  window.addEventListener("keydown", keyHandler);

  function attemptMove(dx, dy) {
    const targetX = world.playerPosition.x + dx;
    const targetY = world.playerPosition.y + dy;
    if (!isTileWalkable(world, targetX, targetY)) {
      pushLog("The path is blocked by old Thornwork wards.");
      return;
    }
    world.playerPosition.x = targetX;
    world.playerPosition.y = targetY;
    pushLog(`You move to tile (${targetX}, ${targetY}).`);
    checkForInteractions();
    render();
  }

  function checkForInteractions() {
    const { x, y } = world.playerPosition;
    const questEntry = Object.entries(world.questTriggers).find(([, trigger]) => trigger.tile.x === x && trigger.tile.y === y);
    if (questEntry) {
      const [key, trigger] = questEntry;
      if (!world.resolvedTriggers.has(key)) {
        showPrompt(trigger, key);
        return;
      }
    }

    const combat = world.combatTrigger;
    if (combat && combat.tile.x === x && combat.tile.y === y && !world.resolvedTriggers.has(combat.encounterId)) {
      world.resolvedTriggers.add(combat.encounterId);
      pushLog(combat.description);
      onEnterCombat(combat.encounterId);
    }
  }

  function showPrompt(trigger, key) {
    promptPanel.classList.remove("hidden");
    promptPanel.innerHTML = `
      <h2>${trigger.title}</h2>
      <p>${trigger.description}</p>
      <div class="choices">
        ${trigger.options
          .map((opt) => `<button type="button" data-choice="${opt.id}">${opt.label}</button>`)
          .join("")}
      </div>
    `;
    promptPanel.querySelectorAll("button[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        resolveQuestTrigger(world, key);
        applyChoiceEffects(trigger, button.dataset.choice);
        promptPanel.classList.add("hidden");
        promptPanel.innerHTML = "";
        render();
      });
    });
  }

  function applyChoiceEffects(trigger, choiceId) {
    const option = trigger.options.find((opt) => opt.id === choiceId);
    if (!option) return;
    if (option.result?.heat) {
      updateVeilHeat(world, option.result.heat);
    }
    if (option.result?.rep) {
      updateReputation(world, option.result.rep, option.result.change ?? 1);
    }
    if (option.result?.reward) {
      pushLog(`Gained ${option.result.reward}.`);
    }
    advanceQuest(world, "veil-audit-101");
    player.recordChoice(`${trigger.title}: ${option.label}`);
  }

  function pushLog(entry) {
    const timestamp = new Date().toLocaleTimeString();
    const line = `[${timestamp}] ${entry}`;
    player.log.push({ type: "exploration", message: entry, timestamp: Date.now() });
    logContainer.textContent = `${line}\n${logContainer.textContent}`.slice(0, 1200);
  }

  function updateToast() {
    const note = world.notifications[0];
    if (!note) {
      toast.classList.add("hidden");
      toast.textContent = "";
      return;
    }
    toast.classList.remove("hidden");
    toast.textContent = note.message;
  }

  function render() {
    renderIsometricScene(ctx, world, {
      playerPosition: world.playerPosition,
      companionPosition: { x: world.playerPosition.x - 1, y: world.playerPosition.y }
    });
    infoPanel.innerHTML = renderInfoPanel(player, world);
    questPanel.innerHTML = renderQuestPanel(world);
    updateToast();
  }

  return {
    element,
    destroy: () => {
      window.removeEventListener("keydown", keyHandler);
    },
    update: () => {
      updateToast();
    }
  };
}

function renderInfoPanel(player, world) {
  return `
    <h2>${player.name}</h2>
    <p>${player.species} • ${player.background} • Aspiration: ${player.aspiration}</p>
    <div class="badge-row">
      <span class="badge">Veil Heat: ${world.veilHeat}</span>
      <span class="badge">Companion: ${world.companion}</span>
      <span class="badge">Resource: ${player.speciesResource.name} ${player.speciesResource.value}/${player.speciesResource.max}</span>
    </div>
    <h3>Attributes</h3>
    <div class="stat-block">
      ${ATTRIBUTE_LIST.map((attr) => `<div class="stat"><label>${attr.name}</label><span>${player.attributes[attr.id]}</span></div>`)
        .join("")}
    </div>
    <h3>Reputation</h3>
    <ul class="quest-log">
      ${Object.entries(world.reputation)
        .map(([faction, score]) => `<li>${faction}: ${score}</li>`)
        .join("")}
    </ul>
  `;
}

function renderQuestPanel(world) {
  return `
    <h2>Objectives</h2>
    <ul class="quest-log">
      ${world.questLog
        .map(
          (quest) => `
            <li>
              <strong>${quest.title}</strong><br />
              Stage ${quest.stage} / 3 ${quest.completed ? "(Complete)" : ""}
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}
