import { STARTING_ATTRIBUTES } from "../data/options.js";

export class PlayerCharacter {
  constructor({ name, species, background, aspiration, attributes }) {
    this.name = name || "New Initiate";
    this.species = species;
    this.background = background;
    this.aspiration = aspiration;
    this.attributes = attributes ? { ...attributes } : { ...STARTING_ATTRIBUTES };
    this.speciesResource = createSpeciesResource(species);
    this.level = 1;
    this.skillPicks = [];
    this.log = [];
  }

  adjustAttribute(attributeId, delta) {
    if (!this.attributes[attributeId]) return;
    const newValue = Math.max(0, this.attributes[attributeId] + delta);
    this.attributes[attributeId] = newValue;
    this.log.push({
      type: "attribute",
      message: `${attributeId.toUpperCase()} ${delta > 0 ? "+" : ""}${delta}`,
      timestamp: Date.now()
    });
  }

  recordChoice(message) {
    this.log.push({ type: "choice", message, timestamp: Date.now() });
  }
}

function createSpeciesResource(species) {
  switch (species) {
    case "Vampire":
      return { name: "Hunger", value: 2, max: 5, description: "Feed to empower strikes." };
    case "Witch":
      return { name: "Tithe", value: 0, max: 6, description: "Ritual costs paid in sleep and memory." };
    case "Werewolf":
      return { name: "Moon", value: 1, max: 6, description: "Stress builds toward Feral stance." };
    case "Siren":
      return { name: "Breath", value: 4, max: 6, description: "Sustain vocals without triggering Echo." };
    default:
      return { name: "Focus", value: 3, max: 6, description: "Generalist reserve of arcane effort." };
  }
}
