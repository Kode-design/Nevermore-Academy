const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

const CHARACTER_PRESETS = {
  races: [
    {
      name: "Vampire",
      description: "Elegant child of midnight courts with an eye for secrets.",
      skin: 0xffdede,
      accent: 0x781d42,
      aura: "A faint chill accompanies you, and whispers hush when you pass."
    },
    {
      name: "Werewolf",
      description: "Fierce hearted pack guardian with restless energy.",
      skin: 0xfff0ce,
      accent: 0x9c5b28,
      aura: "Claw-marks scar your duffel; loyalty is written in every stride."
    },
    {
      name: "Sorcerer",
      description: "Arcane prodigy weaving sigils between breaths.",
      skin: 0xe9d7ff,
      accent: 0x3c1b99,
      aura: "Ribbons of latent magic twirl around your fingertips."
    },
    {
      name: "Siren",
      description: "Glimmering voice that tugs tide and will alike.",
      skin: 0xcff6ff,
      accent: 0x1d5a7a,
      aura: "Footsteps leave slick crescents as though from a receding wave."
    }
  ],
  hairstyles: [
    {
      name: "Midnight Bob",
      color: 0x1e1633,
      style: "bob",
      description: "Sharp, symmetrical, and sharper in attitude."
    },
    {
      name: "Silver Undercut",
      color: 0xb9d6f2,
      style: "undercut",
      description: "Sliced on the sides, comet-tail on top."
    },
    {
      name: "Ghost Braids",
      color: 0xf7e0ff,
      style: "braids",
      description: "Twin braids that float as though underwater."
    },
    {
      name: "Moon Mohawk",
      color: 0xfff27f,
      style: "mohawk",
      description: "A rebellious ridge glowing like lunar frost."
    }
  ],
  outfits: [
    {
      name: "Raven Uniform",
      primary: 0x1f1135,
      trim: 0x6a4fbf,
      description: "Traditional blazer with silver raven embroidery."
    },
    {
      name: "Nocturne Streetwear",
      primary: 0x222823,
      trim: 0x83a603,
      description: "Layered jacket with neon rune piping."
    },
    {
      name: "Spellcraft Robes",
      primary: 0x2b193d,
      trim: 0xe7bcf3,
      description: "Ink-dipped robes stitched with sigil thread."
    }
  ],
  voices: [
    {
      name: "Stoic",
      description: "Measured cadence, humor like obsidian."
    },
    {
      name: "Warm",
      description: "Gentle tone that dissolves tension."
    },
    {
      name: "Sharp",
      description: "Sarcasm sharpened to a silver edge."
    }
  ]
};

const globalState = {
  character: {
    race: 0,
    hairstyle: 0,
    outfit: 0,
    voice: 0,
    decisions: {}
  }
};

class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.queue = [];
    this.waitingForChoice = false;
    this.onComplete = null;

    const width = scene.scale.width;
    const height = scene.scale.height;

    this.container = scene.add.container(0, 0).setDepth(1000);
    this.container.setScrollFactor(0);

    const backdrop = scene.add.rectangle(
      width / 2,
      height - 110,
      width - 80,
      180,
      0x050109,
      0.85
    );
    backdrop.setStrokeStyle(3, 0x7645d8, 1);

    this.speakerText = scene.add
      .text(70, height - 190, "", {
        fontSize: 18,
        fontFamily: "Press Start 2P",
        color: "#f5ecff"
      })
      .setWordWrapWidth(width - 160);

    this.bodyText = scene.add
      .text(70, height - 160, "", {
        fontSize: 16,
        fontFamily: "Press Start 2P",
        color: "#f5ecff",
        lineSpacing: 10
      })
      .setWordWrapWidth(width - 160);

    this.optionTexts = [];

    this.container.add([backdrop, this.speakerText, this.bodyText]);
    this.container.setVisible(false);

    scene.input.keyboard.on("keydown-SPACE", () => {
      if (!this.container.visible) return;
      if (this.waitingForChoice) return;
      this.advance();
    });

    scene.input.on("pointerdown", () => {
      if (!this.container.visible) return;
      if (this.waitingForChoice) return;
      this.advance();
    });
  }

  play(script, onComplete = () => {}) {
    this.queue = Array.isArray(script) ? [...script] : [];
    this.onComplete = onComplete;
    this.container.setVisible(true);
    this.advance();
  }

  clearOptions() {
    this.optionTexts.forEach((opt) => opt.destroy());
    this.optionTexts = [];
  }

  showLine(line) {
    this.clearOptions();
    this.speakerText.setText(line.speaker ? `${line.speaker}` : "");
    this.bodyText.setText(line.text ? line.text : "");

    if (line.branches && line.branches.length) {
      this.waitingForChoice = true;
      line.branches.forEach((branch, index) => {
        const option = this.scene.add
          .text(90, this.scene.scale.height - 140 + index * 30, branch.text, {
            fontSize: 14,
            fontFamily: "Press Start 2P",
            color: "#ffffff",
            backgroundColor: "rgba(118,69,216,0.35)",
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
          })
          .setInteractive({ useHandCursor: true });

        option.on("pointerover", () => {
          option.setStyle({ backgroundColor: "rgba(118,69,216,0.65)" });
        });
        option.on("pointerout", () => {
          option.setStyle({ backgroundColor: "rgba(118,69,216,0.35)" });
        });
        option.on("pointerdown", () => {
          this.waitingForChoice = false;
          if (branch.onSelect) {
            branch.onSelect();
          }
          if (branch.next && branch.next.length) {
            this.queue = [...branch.next, ...this.queue];
          }
          this.advance();
        });

        this.optionTexts.push(option);
      });
    } else {
      this.waitingForChoice = false;
    }
  }

  advance() {
    if (!this.queue.length) {
      this.end();
      return;
    }
    const line = this.queue.shift();
    this.showLine(line);
  }

  end() {
    this.clearOptions();
    this.container.setVisible(false);
    if (typeof this.onComplete === "function") {
      this.onComplete();
    }
  }
}

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {}

  create() {
    this.createPixelTextures();
    this.scene.start("MenuScene");
  }

  createPixelTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x2e1f47, 1);
    g.fillRect(0, 0, 64, 16);
    g.generateTexture("platform", 64, 16);
    g.clear();

    g.fillStyle(0x16121f, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture("npc", 32, 32);
    g.clear();

    g.fillStyle(0x7645d8, 1);
    g.fillRect(0, 0, 12, 12);
    g.generateTexture("spark", 12, 12);
    g.clear();

    g.fillStyle(0x463075, 1);
    g.fillRect(0, 0, 960, 540);
    g.generateTexture("duskSky", 960, 540);
    g.clear();
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#050109");
    this.add
      .text(GAME_WIDTH / 2, 100, "NEVERMORE ORIENTATION", {
        fontFamily: "Press Start 2P",
        fontSize: 32,
        color: "#f5ecff"
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 170, "A Wednesday Universe Tale", {
        fontFamily: "Press Start 2P",
        fontSize: 14,
        color: "#a896ff"
      })
      .setOrigin(0.5);

    const startButton = this.add
      .text(GAME_WIDTH / 2, 260, "START ORIENTATION", {
        fontFamily: "Press Start 2P",
        fontSize: 18,
        color: "#ffffff",
        backgroundColor: "rgba(118,69,216,0.6)",
        padding: { left: 18, right: 18, top: 10, bottom: 10 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButton.on("pointerover", () => {
      startButton.setStyle({ backgroundColor: "rgba(118,69,216,0.9)" });
    });
    startButton.on("pointerout", () => {
      startButton.setStyle({ backgroundColor: "rgba(118,69,216,0.6)" });
    });
    startButton.on("pointerdown", () => {
      this.scene.start("CharacterScene");
    });

    const credits = this.add
      .text(GAME_WIDTH / 2, 360, "Created by You, Outcast Extraordinaire", {
        fontFamily: "Press Start 2P",
        fontSize: 12,
        color: "#d3c6ff"
      })
      .setOrigin(0.5)
      .setAlpha(0.7);

    this.tweens.add({
      targets: credits,
      alpha: { from: 0.5, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
  }
}

class CharacterScene extends Phaser.Scene {
  constructor() {
    super("CharacterScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#120a1e");

    this.add
      .text(GAME_WIDTH / 2, 50, "New Outcast Profile", {
        fontFamily: "Press Start 2P",
        fontSize: 24,
        color: "#f5ecff"
      })
      .setOrigin(0.5);

    this.previewContainer = this.add.container(GAME_WIDTH * 0.75, 260);
    this.previewBody = this.add.rectangle(0, 20, 60, 90, 0x1f1135).setOrigin(0.5);
    this.previewHead = this.add.rectangle(0, -30, 50, 50, 0xffddcc).setOrigin(0.5);
    this.previewHair = this.add.rectangle(0, -55, 60, 35, 0x1e1633).setOrigin(0.5);
    this.previewAccent = this.add.rectangle(0, 10, 64, 8, 0x7645d8).setOrigin(0.5);
    this.previewContainer.add([
      this.previewBody,
      this.previewHead,
      this.previewHair,
      this.previewAccent
    ]);

    this.character = globalState.character;

    this.createOptionBlock(
      120,
      130,
      "Race",
      CHARACTER_PRESETS.races,
      "race",
      (option) => this.describeRace(option)
    );
    this.createOptionBlock(
      120,
      260,
      "Hair",
      CHARACTER_PRESETS.hairstyles,
      "hairstyle",
      (option) => option.description
    );
    this.createOptionBlock(
      120,
      390,
      "Outfit",
      CHARACTER_PRESETS.outfits,
      "outfit",
      (option) => option.description
    );
    this.createOptionBlock(
      120,
      520,
      "Voice",
      CHARACTER_PRESETS.voices,
      "voice",
      (option) => option.description
    );

    const auraText = this.add
      .text(GAME_WIDTH * 0.62, 400, "", {
        fontFamily: "Press Start 2P",
        fontSize: 14,
        color: "#d9cfff",
        wordWrap: { width: 300 }
      })
      .setOrigin(0, 0.5);

    this.auraText = auraText;

    const startButton = this.add
      .text(GAME_WIDTH * 0.65, 480, "ENTER NEVERMORE", {
        fontFamily: "Press Start 2P",
        fontSize: 18,
        color: "#ffffff",
        backgroundColor: "rgba(118,69,216,0.6)",
        padding: { left: 16, right: 16, top: 8, bottom: 8 }
      })
      .setInteractive({ useHandCursor: true });

    startButton.on("pointerover", () => {
      startButton.setStyle({ backgroundColor: "rgba(118,69,216,0.9)" });
    });
    startButton.on("pointerout", () => {
      startButton.setStyle({ backgroundColor: "rgba(118,69,216,0.6)" });
    });
    startButton.on("pointerdown", () => {
      this.scene.start("CampusScene");
    });

    this.updatePreview();
  }

  createOptionBlock(x, y, label, options, key, describe) {
    const labelText = this.add.text(x, y - 40, label, {
      fontFamily: "Press Start 2P",
      fontSize: 16,
      color: "#f5ecff"
    });

    const display = this.add.text(x, y, "", {
      fontFamily: "Press Start 2P",
      fontSize: 14,
      color: "#d9cfff",
      wordWrap: { width: 360 }
    });

    const description = this.add.text(x, y + 36, "", {
      fontFamily: "Press Start 2P",
      fontSize: 12,
      color: "#9d8dcf",
      wordWrap: { width: 360 }
    });

    const left = this.add
      .text(x - 40, y, "<", {
        fontFamily: "Press Start 2P",
        fontSize: 16,
        color: "#ffffff"
      })
      .setInteractive({ useHandCursor: true });

    const right = this.add
      .text(x + 220, y, ">", {
        fontFamily: "Press Start 2P",
        fontSize: 16,
        color: "#ffffff"
      })
      .setInteractive({ useHandCursor: true });

    const updateTexts = () => {
      const index = this.character[key];
      const option = options[index];
      display.setText(option.name);
      description.setText(describe(option));
      this.updatePreview();
    };

    left.on("pointerdown", () => {
      this.character[key] =
        (this.character[key] - 1 + options.length) % options.length;
      updateTexts();
    });

    right.on("pointerdown", () => {
      this.character[key] = (this.character[key] + 1) % options.length;
      updateTexts();
    });

    updateTexts();
  }

  describeRace(race) {
    this.auraText.setText(race.aura);
    return race.description;
  }

  updatePreview() {
    const race = CHARACTER_PRESETS.races[this.character.race];
    const hair = CHARACTER_PRESETS.hairstyles[this.character.hairstyle];
    const outfit = CHARACTER_PRESETS.outfits[this.character.outfit];

    this.previewBody.setFillStyle(outfit.primary, 1);
    this.previewAccent.setFillStyle(outfit.trim, 1);
    this.previewHead.setFillStyle(race.skin, 1);
    this.previewHair.setFillStyle(hair.color, 1);

    const style = hair.style;
    if (style === "mohawk") {
      this.previewHair.setSize(30, 60);
      this.previewHair.y = -70;
    } else if (style === "undercut") {
      this.previewHair.setSize(55, 30);
      this.previewHair.y = -55;
    } else if (style === "braids") {
      this.previewHair.setSize(60, 35);
      this.previewHair.y = -55;
    } else {
      this.previewHair.setSize(60, 35);
      this.previewHair.y = -55;
    }
  }
}

class CampusScene extends Phaser.Scene {
  constructor() {
    super("CampusScene");
    this.player = null;
    this.cursors = null;
    this.dialogueManager = null;
    this.isInDialogue = false;
    this.questState = {
      orientationComplete: false,
      shrineInspected: false,
      nightshadeInvite: false
    };
  }

  create() {
    this.cameras.main.setBackgroundColor("#0a0612");

    this.physics.world.setBounds(0, 0, 2400, GAME_HEIGHT);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "duskSky").setScrollFactor(0.1);

    this.createEnvironment();
    this.createPlayer();
    this.createNPCs();

    this.dialogueManager = new DialogueManager(this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      interact: Phaser.Input.Keyboard.KeyCodes.E
    });

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, 2400, GAME_HEIGHT);

    this.input.keyboard.on("keydown-E", () => {
      if (this.isInDialogue) return;
      this.tryInteract();
    });

    this.startOrientation();
  }

  createEnvironment() {
    this.platforms = this.physics.add.staticGroup();

    const groundCount = 40;
    for (let i = 0; i < groundCount; i++) {
      this.platforms
        .create(i * 64 + 32, GAME_HEIGHT - 20, "platform")
        .refreshBody();
    }

    const ledgeLayout = [
      { x: 300, y: 380 },
      { x: 420, y: 320 },
      { x: 780, y: 360 },
      { x: 900, y: 280 },
      { x: 1280, y: 360 },
      { x: 1500, y: 280 },
      { x: 1880, y: 330 }
    ];

    ledgeLayout.forEach((ledge) => {
      this.platforms.create(ledge.x, ledge.y, "platform").refreshBody();
    });

    const lamplight = this.add.particles("spark");
    lamplight.createEmitter({
      x: { min: 0, max: 2400 },
      y: 40,
      speedY: { min: 10, max: 30 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2200,
      quantity: 2,
      blendMode: "ADD"
    });

    this.decor = this.add.group();

    const gate = this.add.rectangle(180, GAME_HEIGHT - 140, 160, 220, 0x2b213f);
    gate.setStrokeStyle(4, 0x7645d8);
    gate.setOrigin(0.5, 1);
    this.decor.add(gate);

    const ravenStatue = this.add.rectangle(1100, GAME_HEIGHT - 110, 70, 120, 0x1b1429);
    ravenStatue.setStrokeStyle(3, 0x6f48c9);
    this.decor.add(ravenStatue);
    ravenStatue.setData("type", "statue");
  }

  createPlayer() {
    const character = globalState.character;
    const race = CHARACTER_PRESETS.races[character.race];
    const hair = CHARACTER_PRESETS.hairstyles[character.hairstyle];
    const outfit = CHARACTER_PRESETS.outfits[character.outfit];

    const container = this.add.container(150, GAME_HEIGHT - 200);

    const body = this.add.rectangle(0, 16, 30, 44, outfit.primary);
    const trim = this.add.rectangle(0, 28, 26, 10, outfit.trim);
    const head = this.add.rectangle(0, -10, 26, 26, race.skin);
    const hairShape = this.add.rectangle(0, -28, 28, 18, hair.color);

    if (hair.style === "mohawk") {
      hairShape.setSize(12, 42);
      hairShape.y = -38;
    } else if (hair.style === "undercut") {
      hairShape.setSize(28, 16);
      hairShape.y = -26;
    } else if (hair.style === "braids") {
      hairShape.setSize(30, 26);
      hairShape.y = -24;
    }

    const eyes = this.add.rectangle(-6, -12, 6, 4, race.accent);
    const eyes2 = this.add.rectangle(6, -12, 6, 4, race.accent);

    container.add([hairShape, head, eyes, eyes2, body, trim]);

    this.physics.world.enable(container);
    container.body.setSize(26, 52);
    container.body.setOffset(-13, -26);
    container.body.setCollideWorldBounds(true);

    this.player = container;

    this.physics.add.collider(this.player, this.platforms);
  }

  createNPCs() {
    this.npcs = [];

    const weems = this.createNPC(260, GAME_HEIGHT - 220, "Headmistress Weems", {
      idle: "Her posture is immaculate even when alone.",
      intro: [
        {
          speaker: "Headmistress Weems",
          text: "Nevermore Academy welcomes you, outcast." 
        }
      ]
    });
    weems.data.set("id", "weems");
    weems.visible = false; // hidden after arrival
    const weemsLabel = weems.getData("label");
    if (weemsLabel) {
      weemsLabel.setVisible(false);
    }

    const enid = this.createNPC(820, GAME_HEIGHT - 220, "Enid Sinclair", {
      idle: "A swirl of pastel energy waiting to pounce.",
      intro: this.buildEnidScript()
    });
    enid.data.set("id", "enid");

    const wednesday = this.createNPC(1380, GAME_HEIGHT - 240, "Wednesday Addams", {
      idle: "She studies a raven feather like it's a prophecy.",
      intro: this.buildWednesdayScript()
    });
    wednesday.data.set("id", "wednesday");

    const statuePrompt = this.add.text(1070, GAME_HEIGHT - 200, "Raven Shrine", {
      fontFamily: "Press Start 2P",
      fontSize: 12,
      color: "#c1b3ff"
    });
    statuePrompt.setOrigin(0.5);
    statuePrompt.setData("type", "statueLabel");
    this.npcs.push(statuePrompt);
  }

  createNPC(x, y, name, scriptData) {
    const npcContainer = this.add.container(x, y);
    const body = this.add.rectangle(0, 16, 30, 46, 0x201531);
    const head = this.add.rectangle(0, -10, 28, 28, 0xf1d7ff);
    const accent = this.add.rectangle(0, 28, 20, 8, 0x7645d8);
    npcContainer.add([body, head, accent]);

    this.physics.world.enable(npcContainer);
    npcContainer.body.setAllowGravity(false);
    npcContainer.body.moves = false;

    const label = this.add.text(x, y - 60, name, {
      fontFamily: "Press Start 2P",
      fontSize: 12,
      color: "#ffffff"
    });
    label.setOrigin(0.5);

    npcContainer.setData("name", name);
    npcContainer.setData("script", scriptData);
    npcContainer.setData("label", label);

    this.npcs.push(npcContainer);
    return npcContainer;
  }

  buildEnidScript() {
    const character = globalState.character;
    return [
      {
        speaker: "Enid",
        text: "Omg! Fresh blood—sorry, metaphor! I'm Enid, your floor's social avalanche."
      },
      {
        speaker: "Enid",
        text: "I love your vibe. Are you more moonlit mystery or glitter chaos?",
        branches: [
          {
            text: "Mystery. Obscure mixtapes only.",
            onSelect: () => {
              character.decisions.enid = "mystery";
            },
            next: [
              {
                speaker: "Enid",
                text: "Nice! Wednesday pretends she isn't impressed, but she definitely is."
              }
            ]
          },
          {
            text: "Chaos. Let's howl on the quad!",
            onSelect: () => {
              character.decisions.enid = "chaos";
            },
            next: [
              {
                speaker: "Enid",
                text: "We have mandatory glitter raves every full moon now. You're invited."
              }
            ]
          }
        ]
      },
      {
        speaker: "Enid",
        text: "If you want dirt on the cliques, check the Raven shrine ahead. Whisper the school motto."
      }
    ];
  }

  buildWednesdayScript() {
    const character = globalState.character;
    return [
      {
        speaker: "Wednesday",
        text: "So you're the new arrival disrupting the gossip mill." 
      },
      {
        speaker: "Wednesday",
        text: "Your file says you're a " + CHARACTER_PRESETS.races[character.race].name + ". Prove it: what fuels you?",
        branches: [
          {
            text: "Discipline. Precision keeps the monsters in check.",
            onSelect: () => {
              character.decisions.wednesday = "discipline";
            },
            next: [
              {
                speaker: "Wednesday",
                text: "Hmph. Control is a language I speak. Meet me tonight at the Nightshade library."
              }
            ]
          },
          {
            text: "Curiosity. I want every secret this place hoards.",
            onSelect: () => {
              character.decisions.wednesday = "curiosity";
            },
            next: [
              {
                speaker: "Wednesday",
                text: "Curiosity is a blade. Point it wisely. The Nightshades await your questions." 
              }
            ]
          },
          {
            text: "Chaos. I thrive when things break.",
            onSelect: () => {
              character.decisions.wednesday = "chaos";
            },
            next: [
              {
                speaker: "Wednesday",
                text: "Destruction has its uses. I'll ensure you're pointed toward worthy targets." 
              }
            ]
          }
        ]
      },
      {
        speaker: "Wednesday",
        text: "Nightshade Society meets beneath the conservatory. The Raven statue is the door. Be punctual."
      }
    ];
  }

  startOrientation() {
    this.isInDialogue = true;

    const character = globalState.character;
    const race = CHARACTER_PRESETS.races[character.race];
    const hair = CHARACTER_PRESETS.hairstyles[character.hairstyle];

    const orientationScript = [
      {
        speaker: "Headmistress Weems",
        text: "Welcome to Nevermore Academy, where the peculiar becomes powerful."
      },
      {
        speaker: "Headmistress Weems",
        text: `A ${race.name.toLowerCase()} with ${hair.name.toLowerCase()} hair... exquisite. Tell me, how will you shape our halls?`,
        branches: [
          {
            text: "I'll observe from the shadows before I strike.",
            onSelect: () => {
              character.persona = "shadow";
              character.decisions.weems = "shadow";
            },
            next: [
              {
                speaker: "Headmistress Weems",
                text: "A measured answer. Wednesday will approve."
              }
            ]
          },
          {
            text: "I'll weave new alliances. Nevermore is stronger together.",
            onSelect: () => {
              character.persona = "alliance";
              character.decisions.weems = "alliance";
            },
            next: [
              {
                speaker: "Headmistress Weems",
                text: "Diplomacy. Enid will adore you, and the fangs may relent."
              }
            ]
          },
          {
            text: "I'll test every boundary until it bends.",
            onSelect: () => {
              character.persona = "rebel";
              character.decisions.weems = "rebel";
            },
            next: [
              {
                speaker: "Headmistress Weems",
                text: "Pray your curiosity doesn't awaken the Hyde." 
              }
            ]
          }
        ]
      },
      {
        speaker: "Headmistress Weems",
        text: "Collect your uniform from Enid Sinclair near the dorms. The Raven statue will test your intentions later."
      },
      {
        speaker: "Headmistress Weems",
        text: "Classes begin at moonrise. Try not to ignite the alchemy lab before then."
      }
    ];

    this.dialogueManager.play(orientationScript, () => {
      this.isInDialogue = false;
      this.questState.orientationComplete = true;
    });
  }

  tryInteract() {
    const interactables = this.npcs.filter((npc) => {
      if (npc.visible === false) {
        return false;
      }
      if (npc.getData && npc.getData("label")) {
        const container = npc;
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          container.x,
          container.y
        );
        return dist < 120;
      }
      if (npc.getData && npc.getData("type") === "statueLabel") {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          npc.x,
          npc.y
        );
        return dist < 140;
      }
      return false;
    });

    if (!interactables.length) {
      const statue = this.decor.getChildren().find((child) => child.getData("type") === "statue");
      if (statue) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, 1100, GAME_HEIGHT - 110);
        if (dist < 140) {
          this.inspectShrine();
        }
      }
      return;
    }

    const target = interactables[0];
    const script = target.getData("script");

    if (!script) {
      if (target.getData("type") === "statueLabel") {
        this.inspectShrine();
      }
      return;
    }

    if (target.getData("id") === "enid" && !this.questState.orientationComplete) {
      this.showFloatingText("Weems is waiting at the gate.");
      return;
    }

    this.isInDialogue = true;
    this.dialogueManager.play(script.intro, () => {
      this.isInDialogue = false;
      if (target.getData("id") === "enid") {
        this.questState.shrineInspected = false;
      }
      if (target.getData("id") === "wednesday") {
        this.questState.nightshadeInvite = true;
        this.showFloatingText("Nightshade library unlocked!", { duration: 3000 });
      }
    });
  }

  inspectShrine() {
    if (this.isInDialogue) return;

    const character = globalState.character;
    const persona = character.persona || "mystery";

    const secrets = {
      shadow: "The statue's beak tilts toward the catacombs. Shadows curl like welcoming fingers.",
      alliance: "Inscribed beneath the raven: 'Unity is the sharpest talon.'",
      rebel: "A mechanism clicks. The wings creak open to a stairwell pulsing with violet light.",
      mystery: "A whisper that sounds like your own voice beckons you below.",
      chaos: "A gust of feathers erupts, scattering notes that read 'Nightshades meet at midnight.'"
    };

    const script = [
      {
        speaker: "Raven Statue",
        text: secrets[persona] || secrets.mystery
      }
    ];

    this.isInDialogue = true;
    this.dialogueManager.play(script, () => {
      this.isInDialogue = false;
      this.questState.shrineInspected = true;
    });
  }

  showFloatingText(message, options = {}) {
    const duration = options.duration || 2000;
    const text = this.add.text(this.player.x, this.player.y - 80, message, {
      fontFamily: "Press Start 2P",
      fontSize: 12,
      color: "#ffffff",
      backgroundColor: "rgba(118,69,216,0.7)",
      padding: { left: 6, right: 6, top: 4, bottom: 4 }
    });
    text.setScrollFactor(1);
    text.setOrigin(0.5);
    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration,
      ease: "Sine.easeIn",
      onComplete: () => text.destroy()
    });
  }

  update() {
    if (!this.player) return;

    if (this.isInDialogue) {
      this.player.body.setVelocityX(0);
      return;
    }

    const speed = 170;
    const jumpVelocity = -360;

    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;

    if (left) {
      this.player.body.setVelocityX(-speed);
      this.player.setScale(-1, 1);
    } else if (right) {
      this.player.body.setVelocityX(speed);
      this.player.setScale(1, 1);
    } else {
      this.player.body.setVelocityX(0);
    }

    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.jump);

    if (jumpPressed && this.player.body.blocked.down) {
      this.player.body.setVelocityY(jumpVelocity);
    }

    // Prompt for interactions
    this.updatePrompts();
  }

  updatePrompts() {
    this.npcs.forEach((npc) => {
      const label = npc.getData ? npc.getData("label") : null;
      if (label) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
        label.setVisible(dist < 160);
        label.setText(`${npc.getData("name")}` + (dist < 100 ? " - Press E" : ""));
      }
      if (npc.getData && npc.getData("type") === "statueLabel") {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
        npc.setText(dist < 140 ? "Raven Shrine - Press E" : "Raven Shrine");
        npc.setVisible(dist < 200);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#050109",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 980 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, CharacterScene, CampusScene]
};

new Phaser.Game(config);
