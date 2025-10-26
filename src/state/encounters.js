export function getEncounter(encounterId, player) {
  switch (encounterId) {
    case "tram-wight":
      return {
        id: "tram-wight",
        name: "Tram Wight Disturbance",
        briefing:
          "A spectral invigilator has manifested from the cracked tram wards. Hold it off long enough to patch the veil.",
        mapWidth: 6,
        mapHeight: 6,
        playerParty: buildPlayerParty(player),
        enemies: [
          {
            id: "wight",
            name: "Rift Wight",
            hp: 14,
            armor: 1,
            initiative: 8,
            skills: [
              {
                id: "scorch-bolt",
                name: "Scorch Bolt",
                effect: "Deal 3 fire damage at range 3.",
                damage: 3
              }
            ]
          }
        ],
        winCondition: "Reduce the wight to 0 HP or survive 6 rounds while the ritual completes.",
        roundsToHold: 6
      };
    default:
      return {
        id: "skirmish",
        name: "Training Skirmish",
        briefing: "A sparring bout against illusory prefects.",
        mapWidth: 5,
        mapHeight: 5,
        playerParty: buildPlayerParty(player),
        enemies: [
          { id: "dummy", name: "Illusory Prefect", hp: 10, armor: 0, initiative: 5, skills: [] }
        ],
        winCondition: "Reduce the foe to 0 HP.",
        roundsToHold: 4
      };
  }
}

function buildPlayerParty(player) {
  const base = {
    id: "player",
    name: player.name,
    hp: 16,
    armor: 0,
    initiative: 9 + player.attributes.grace,
    speciesResource: player.speciesResource,
    skills: buildSignatureSkills(player)
  };

  const companion = {
    id: "companion",
    name: "Isolde Thatch",
    hp: 18,
    armor: 1,
    initiative: 8,
    skills: [
      {
        id: "night-parry",
        name: "Night Parry",
        description: "Grant ally +2 Guard and counter if attacked.",
        type: "support"
      },
      {
        id: "riposte",
        name: "Riposte",
        description: "Deal 4 piercing damage to an adjacent foe.",
        damage: 4
      }
    ]
  };

  return [base, companion];
}

function buildSignatureSkills(player) {
  const core = [
    {
      id: "basic-strike",
      name: "Aether Strike",
      description: "Deal 3 damage to an adjacent foe.",
      damage: 3,
      cost: 0
    },
    {
      id: "focus-shift",
      name: "Veil Mend",
      description: "Channel energies to reduce Veil Heat by 1.",
      utility: "heat-",
      cost: 1
    }
  ];

  switch (player.species) {
    case "Vampire":
      core.push({
        id: "predator-lunge",
        name: "Predator Lunge",
        description: "Spend Hunger to deal 5 damage and apply Expose.",
        damage: 5,
        cost: 1,
        resource: "Hunger"
      });
      break;
    case "Witch":
      core.push({
        id: "binding-circle",
        name: "Binding Circle",
        description: "Spend Tithe to root an enemy for 1 round.",
        control: "root",
        cost: 1,
        resource: "Tithe"
      });
      break;
    case "Werewolf":
      core.push({
        id: "feral-rush",
        name: "Feral Rush",
        description: "Gain Feral stance, increasing damage by 2 this round.",
        buff: "+2 damage",
        cost: 1,
        resource: "Moon"
      });
      break;
    case "Siren":
      core.push({
        id: "echoing-song",
        name: "Echoing Song",
        description: "Spend Breath to heal allies 3 and inflict Muffle.",
        heal: 3,
        control: "muffle",
        cost: 1,
        resource: "Breath"
      });
      break;
    default:
      core.push({
        id: "steadfast-guard",
        name: "Steadfast Guard",
        description: "Gain Guard 2 and grant it to an ally.",
        buff: "guard",
        cost: 1
      });
  }

  return core;
}
