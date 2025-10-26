const TILE_LEGEND = {
  "#": "wall",
  ".": "floor",
  "q": "quest",
  "c": "combat",
  "r": "ritual"
};

const RAW_MAP = [
  "##########",
  "#..q....##",
  "#..###...#",
  "#....c...#",
  "#..##....#",
  "#.r....###",
  "#....#...#",
  "##...#...#",
  "#...q....#",
  "##########"
];

const QUEST_TRIGGERS = {
  quest1: {
    id: "tram-inspection",
    title: "Inspect the Tram Rune",
    tile: { x: 3, y: 1 },
    description:
      "A cracked ward hums under the tram rail. You can file a report (Faculty) or jury-rig a glamour (Guile).",
    options: [
      { id: "report", label: "File a report (Faculty +1, Veil Heat -1)", result: { rep: "Faculty", change: 1, heat: -1 } },
      { id: "cover", label: "Forge CCTV cover-up (Guile, Veil Heat +0)", result: { rep: "Guile", change: 1, heat: 0 } }
    ]
  },
  quest2: {
    id: "hidden-cache",
    title: "Smugglers' Cache",
    tile: { x: 4, y: 8 },
    description:
      "Crates of synthetic blood hidden beneath glamours. Investigate quietly or seize them for evidence?",
    options: [
      { id: "investigate", label: "Investigate quietly (Veil Heat -1)", result: { heat: -1, reward: "Reagents" } },
      { id: "seize", label: "Seize evidence loudly (Veil Heat +2, gain Favors)", result: { heat: 2, reward: "Favors" } }
    ]
  }
};

const COMBAT_TRIGGER = {
  tile: { x: 5, y: 3 },
  encounterId: "tram-wight",
  description: "A rift-warped wight emerges from the tram fog!"
};

export function buildInitialWorldState() {
  const tiles = [];
  for (let y = 0; y < RAW_MAP.length; y += 1) {
    const row = [];
    for (let x = 0; x < RAW_MAP[y].length; x += 1) {
      const symbol = RAW_MAP[y][x];
      row.push({
        type: TILE_LEGEND[symbol] ?? "floor",
        discovered: symbol !== "#"
      });
    }
    tiles.push(row);
  }

  return {
    mapWidth: RAW_MAP[0].length,
    mapHeight: RAW_MAP.length,
    tiles,
    playerPosition: { x: 2, y: 7 },
    companion: "Isolde Thatch",
    veilHeat: 1,
    reputation: {
      Faculty: 0,
      "Lantern Society": 0,
      "Blood Ethics Circle": 0
    },
    questLog: [
      {
        id: "veil-audit-101",
        title: "Veil Audit 101",
        stage: 1,
        completed: false
      }
    ],
    resolvedTriggers: new Set(),
    questTriggers: QUEST_TRIGGERS,
    combatTrigger: COMBAT_TRIGGER,
    notifications: []
  };
}

export function isTileWalkable(world, x, y) {
  if (y < 0 || y >= world.mapHeight || x < 0 || x >= world.mapWidth) return false;
  const tile = world.tiles[y][x];
  return tile.type !== "wall";
}

export function updateVeilHeat(world, delta) {
  const newHeat = Math.max(0, world.veilHeat + delta);
  world.veilHeat = newHeat;
  if (delta !== 0) {
    world.notifications.push({
      id: `heat-${Date.now()}`,
      message: `Veil Heat ${delta > 0 ? "+" : ""}${delta}. Current: ${newHeat}.`,
      expiresAt: Date.now() + 5000
    });
  }
}

export function updateReputation(world, faction, delta) {
  if (!world.reputation[faction]) {
    world.reputation[faction] = 0;
  }
  world.reputation[faction] += delta;
  world.notifications.push({
    id: `rep-${Date.now()}`,
    message: `${faction} reputation ${delta > 0 ? "+" : ""}${delta}.`,
    expiresAt: Date.now() + 5000
  });
}

export function resolveQuestTrigger(world, triggerId) {
  world.resolvedTriggers.add(triggerId);
}

export function advanceQuest(world, questId) {
  const quest = world.questLog.find((q) => q.id === questId);
  if (!quest) return;
  quest.stage += 1;
  if (quest.stage > 3) {
    quest.completed = true;
    world.notifications.push({
      id: `quest-${Date.now()}`,
      message: `${quest.title} completed!`,
      expiresAt: Date.now() + 6000
    });
  }
}

export function pruneNotifications(world) {
  const now = Date.now();
  world.notifications = world.notifications.filter((note) => note.expiresAt > now);
}
