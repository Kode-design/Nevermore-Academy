export const SPECIES_OPTIONS = [
  {
    id: "vampire",
    name: "Vampire",
    resource: "Hunger",
    description: "Elegant predators balancing restraint with power. Feed to stave off Scorch."
  },
  {
    id: "witch",
    name: "Witch",
    resource: "Tithe",
    description: "Scholars of ritual costs who gamble with Backwash for massive spell swings."
  },
  {
    id: "werewolf",
    name: "Werewolf",
    resource: "Moon",
    description: "Resilient brawlers who unleash Feral stance when stress peaks."
  },
  {
    id: "siren",
    name: "Siren",
    resource: "Breath",
    description: "Voice-weavers who manage Echo backlash while controlling the field."
  }
];

export const BACKGROUND_OPTIONS = [
  "City Latchkey",
  "Old Accord Scion",
  "Transfer From Abroad",
  "Ward-Breaker's Kid",
  "Choir Probation"
];

export const ASPIRATION_OPTIONS = [
  "Keeper",
  "Rebel",
  "Scholar",
  "Diplomat"
];

export const ATTRIBUTE_LIST = [
  { id: "resolve", name: "Resolve", description: "Steel your will, resist fear, break domination." },
  { id: "cunning", name: "Cunning", description: "Trickery, critical strikes, locks, and gambits." },
  { id: "aptitude", name: "Aptitude", description: "Spellcraft potency, crafting insight, ritual skill." },
  { id: "grace", name: "Grace", description: "Initiative, evasive footwork, song finesse." },
  { id: "might", name: "Might", description: "Melee force, grapples, carrying capacity." },
  { id: "sense", name: "Sense", description: "Perception, tracking, glamour detection." }
];

export const STARTING_ATTRIBUTES = {
  resolve: 2,
  cunning: 2,
  aptitude: 2,
  grace: 2,
  might: 2,
  sense: 2
};

export const COMPANION_LIBRARY = [
  {
    id: "isolde",
    name: "Isolde Thatch",
    species: "Vampire",
    role: "Duelist",
    description: "Riposte expert juggling old blood contracts.",
    signature: "Night Parry",
    passive: "Draw Cut – counterattack when allies are flanked."
  },
  {
    id: "bram",
    name: "Bram Oakes",
    species: "Werewolf",
    role: "Forward",
    description: "Tank whose Moon meter surges under pressure.",
    signature: "Iron Howl",
    passive: "Pack Stance – grants Warded to adjacent allies at start of combat."
  },
  {
    id: "tamsin",
    name: "Tamsin Broke",
    species: "Witch",
    role: "Cartographer",
    description: "Puzzle-solver mapping hidden wards.",
    signature: "Map the Unseen",
    passive: "Waypoint – reveals traps on reveal tiles."
  },
  {
    id: "oriel",
    name: "Oriel Tide",
    species: "Siren",
    role: "Mediator",
    description: "Voice-healer bridging factions.",
    signature: "Lullaby Cadence",
    passive: "Stillwater – reduces Echo backlash for the party."
  }
];

export const SKILL_LIBRARY = {
  umbra: [
    {
      id: "shadow-step",
      name: "Shadow Step",
      summary: "Swap places with your shadow within 3 tiles.",
      resource: "Hunger"
    },
    {
      id: "gloom-mark",
      name: "Gloom Mark",
      summary: "Mark a foe; allies deal +2 damage.",
      resource: "None"
    }
  ],
  wards: [
    {
      id: "binding-circle",
      name: "Binding Circle",
      summary: "Immobilise an enemy for one round.",
      resource: "Tithe"
    }
  ],
  necrobotany: [
    {
      id: "grave-moss",
      name: "Grave-Moss Patch",
      summary: "Create difficult terrain that heals allies.",
      resource: "Reagent"
    }
  ],
  martial: [
    {
      id: "thorn-hook",
      name: "Thorn Hook",
      summary: "Pull a target 2 tiles and apply Bleed.",
      resource: "Stamina"
    }
  ],
  social: [
    {
      id: "accord-leverage",
      name: "Accord Leverage",
      summary: "Open unique dialogue route with Faculty.",
      resource: "Favor"
    }
  ]
};

export const QUESTS = {
  tutorial: {
    id: "veil-audit-101",
    name: "Veil Audit 101",
    summary: "Patch the minor rift in the tram station before faculty oversight arrives.",
    steps: [
      "Inspect the malfunctioning tram rune.",
      "Decide whether to cover up the incident or file a formal report.",
      "Seal the rift through a tactical encounter."
    ],
    reward: "Unlock Ward: Aegis, Faculty reputation or Guile boost depending on choice."
  },
  patrol: {
    id: "evening-patrol",
    name: "Lantern Patrol",
    summary: "Demonstrate Veil stewardship on your first sanctioned patrol.",
    steps: [
      "Reach the Hollowmere pooling grounds.",
      "Disperse the glamoured smugglers without raising Veil Heat above 3.",
      "Report back or hide the evidence."
    ],
    reward: "Reagents, companion trust, Veil Heat adjustment."
  }
};
