import { updateVeilHeat } from "../state/worldState.js";

export function createCombatView(container, { player, world, encounter, onComplete }) {
  const element = document.createElement("div");
  element.className = "card";

  const heading = document.createElement("div");
  heading.innerHTML = `
    <h1>${encounter.name}</h1>
    <p>${encounter.briefing}</p>
  `;
  element.append(heading);

  const layout = document.createElement("div");
  layout.className = "flex-row";

  const boardPanel = document.createElement("div");
  boardPanel.className = "panel";
  boardPanel.style.flex = "2";

  const board = document.createElement("div");
  board.className = "log";
  board.style.height = "360px";
  board.style.fontFamily = "'Fira Code', monospace";
  boardPanel.append(board);

  const actionsPanel = document.createElement("div");
  actionsPanel.className = "panel";
  actionsPanel.style.flex = "1";

  const actionTitle = document.createElement("h2");
  actionTitle.textContent = "Actions";
  const actionButtons = document.createElement("div");
  actionButtons.className = "actions";
  actionsPanel.append(actionTitle, actionButtons);

  const statusPanel = document.createElement("div");
  statusPanel.className = "panel";
  statusPanel.style.flex = "1";

  const logPanel = document.createElement("div");
  logPanel.className = "panel";
  logPanel.style.flex = "1";
  const logTitle = document.createElement("h2");
  logTitle.textContent = "Battle Log";
  const logContainer = document.createElement("div");
  logContainer.className = "log";
  logPanel.append(logTitle, logContainer);

  layout.append(boardPanel, actionsPanel, statusPanel, logPanel);
  element.append(layout);

  const finishButton = document.createElement("button");
  finishButton.textContent = "Retreat";
  finishButton.addEventListener("click", () => {
    endEncounter({ success: false, summary: "Retreated before sealing the rift." });
  });
  element.append(finishButton);

  const battleState = initialiseBattle(encounter);

  render();
  queueNextTurn();

  function initialiseBattle(enc) {
    const actorList = [];
    enc.playerParty.forEach((member) => {
      actorList.push({
        id: member.id,
        name: member.name,
        team: "player",
        hp: member.hp,
        maxHp: member.hp,
        armor: member.armor ?? 0,
        initiative: member.initiative ?? 5,
        skills: member.skills
      });
    });
    enc.enemies.forEach((enemy) => {
      actorList.push({
        id: enemy.id,
        name: enemy.name,
        team: "enemy",
        hp: enemy.hp,
        maxHp: enemy.hp,
        armor: enemy.armor ?? 0,
        initiative: enemy.initiative ?? 5,
        skills: enemy.skills
      });
    });

    actorList.sort((a, b) => b.initiative - a.initiative);

    return {
      round: 1,
      turnIndex: 0,
      actors: actorList,
      ritualProgress: 0,
      ended: false
    };
  }

  function queueNextTurn() {
    if (battleState.ended) return;
    if (checkEndConditions()) return;
    const actor = nextLivingActor();
    if (!actor) return;

    if (actor.team === "player" && actor.id === "player") {
      presentPlayerOptions(actor);
    } else if (actor.team === "player") {
      executeCompanionTurn(actor);
    } else {
      executeEnemyTurn(actor);
    }
  }

  function nextLivingActor() {
    for (let i = 0; i < battleState.actors.length; i += 1) {
      const actor = battleState.actors[battleState.turnIndex % battleState.actors.length];
      battleState.turnIndex = (battleState.turnIndex + 1) % battleState.actors.length;
      if (actor.hp > 0) {
        return actor;
      }
    }
    battleState.round += 1;
    log(`— Round ${battleState.round} —`);
    battleState.turnIndex = 0;
    battleState.ritualProgress += 1;
    return nextLivingActor();
  }

  function presentPlayerOptions(actor) {
    actionButtons.innerHTML = "";
    addActionButton("Aether Strike", () => {
      const target = pickWeakestEnemy();
      if (!target) return;
      dealDamage(actor, target, 3);
      log(`${actor.name} strikes ${target.name} for 3 damage.`);
      queueNextTurn();
    });

    addActionButton("Veil Mend", () => {
      if (player.speciesResource.value <= 0) {
        log("Insufficient resource to channel.");
        return;
      }
      player.speciesResource.value -= 1;
      updateVeilHeat(world, -1);
      log(`${actor.name} weaves a stabilising sigil. Veil Heat decreases.`);
      queueNextTurn();
    });

    const signature = actor.skills?.find((skill) => skill.id !== "basic-strike" && skill.id !== "focus-shift");
    if (signature) {
      addActionButton(signature.name, () => {
        if (signature.resource && player.speciesResource.value <= 0) {
          log("You lack the required resource!");
          return;
        }
        if (signature.resource) {
          player.speciesResource.value = Math.max(0, player.speciesResource.value - 1);
        }
        const target = pickWeakestEnemy();
        if (signature.damage) {
          dealDamage(actor, target, signature.damage);
          log(`${signature.name} hits ${target.name} for ${signature.damage} damage.`);
        } else if (signature.heal) {
          healActor(actor, signature.heal);
          log(`${signature.name} restores ${signature.heal} HP.`);
        } else {
          log(`${signature.name} grants tactical momentum.`);
        }
        queueNextTurn();
      });
    }

    addActionButton("End Turn", () => {
      log(`${actor.name} holds position.`);
      queueNextTurn();
    });
  }

  function executeCompanionTurn(actor) {
    actionButtons.innerHTML = "<p>Companion acting...</p>";
    const target = pickWeakestEnemy();
    if (!target) {
      queueNextTurn();
      return;
    }
    dealDamage(actor, target, 4);
    log(`${actor.name} executes Riposte on ${target.name} for 4 damage.`);
    queueNextTurn();
  }

  function executeEnemyTurn(actor) {
    actionButtons.innerHTML = "<p>Enemy turn...</p>";
    const target = pickWeakestPlayer();
    if (!target) {
      queueNextTurn();
      return;
    }
    const damage = actor.skills?.[0]?.damage ?? 3;
    dealDamage(actor, target, damage);
    log(`${actor.name} lashes ${target.name} for ${damage} damage.`);
    queueNextTurn();
  }

  function addActionButton(label, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      handler();
      render();
    });
    actionButtons.append(button);
  }

  function dealDamage(source, target, amount) {
    if (!target) return;
    const mitigated = Math.max(0, amount - (target.armor ?? 0));
    target.hp = Math.max(0, target.hp - mitigated);
    if (target.hp <= 0) {
      log(`${target.name} is defeated.`);
    }
    render();
  }

  function healActor(actor, amount) {
    actor.hp = Math.min(actor.maxHp, actor.hp + amount);
    render();
  }

  function pickWeakestEnemy() {
    return battleState.actors
      .filter((actor) => actor.team === "enemy" && actor.hp > 0)
      .sort((a, b) => a.hp - b.hp)[0];
  }

  function pickWeakestPlayer() {
    return battleState.actors
      .filter((actor) => actor.team === "player" && actor.hp > 0)
      .sort((a, b) => a.hp - b.hp)[0];
  }

  function checkEndConditions() {
    const livingEnemies = battleState.actors.some((actor) => actor.team === "enemy" && actor.hp > 0);
    const livingPlayers = battleState.actors.some((actor) => actor.team === "player" && actor.hp > 0);

    if (!livingPlayers) {
      endEncounter({ success: false, summary: "Party incapacitated. Veil breach spreads." });
      return true;
    }

    if (!livingEnemies) {
      endEncounter({ success: true, summary: "Rift Wight dispersed. Campus saved for tonight." });
      return true;
    }

    if (battleState.round > encounter.roundsToHold) {
      endEncounter({ success: true, summary: "Held the ritual long enough for the wardens to arrive." });
      return true;
    }

    return false;
  }

  function endEncounter(result) {
    if (battleState.ended) return;
    battleState.ended = true;
    onComplete(result);
  }

  function log(message) {
    const timestamp = new Date().toLocaleTimeString();
    logContainer.textContent = `[${timestamp}] ${message}\n${logContainer.textContent}`.slice(0, 1400);
  }

  function render() {
    board.innerHTML = renderBoard(battleState);
    statusPanel.innerHTML = renderStatus(battleState, encounter, player, world);
  }

  return {
    element,
    destroy: () => {},
    update: () => {}
  };
}

function renderBoard(state) {
  const rows = state.actors
    .map((actor) => {
      const hpBar = "█".repeat(Math.ceil((actor.hp / actor.maxHp) * 10)).padEnd(10, "░");
      return `<div>${actor.team === "player" ? "🜂" : "☍"} <strong>${actor.name}</strong> [${hpBar}] ${actor.hp}/${actor.maxHp}</div>`;
    })
    .join("");
  return `<h2>Battlefield State</h2>${rows}`;
}

function renderStatus(state, encounter, player, world) {
  return `
    <h2>Encounter Status</h2>
    <p>Round: ${state.round} / ${encounter.roundsToHold}</p>
    <p>Veil Heat: ${world.veilHeat}</p>
    <p>Ritual Stabilisation: ${state.ritualProgress}/${encounter.roundsToHold}</p>
    <p>Species Resource: ${player.speciesResource.value}/${player.speciesResource.max}</p>
    <p>Win Condition: ${encounter.winCondition}</p>
  `;
}
