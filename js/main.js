const GAME_WIDTH = 320;
const GAME_HEIGHT = 180;
const WORLD_WIDTH = 1280;
const ZOOM = 3;

const HERITAGE_INFO = {
  Vampire: {
    skin: '#f7d4ff',
    accent: '#8b1c5d',
    description: 'Elegant, nocturnal, and attuned to whispers carried on the moonlight.'
  },
  Werewolf: {
    skin: '#f4c59f',
    accent: '#a6683d',
    description: 'Fierce protectors with uncanny senses and restless energy.'
  },
  Siren: {
    skin: '#ccefff',
    accent: '#3ca4d7',
    description: 'Silver-voiced mystics who weave tides into melody and memory.'
  },
  Sorcerer: {
    skin: '#f9e9cf',
    accent: '#c08bfa',
    description: 'Arcane scholars obsessed with spellcraft and the unknown.'
  },
  Gorgon: {
    skin: '#b4d884',
    accent: '#618943',
    description: 'Stone-eyed strategists who can still a heartbeat with a glare.'
  },
  Psychic: {
    skin: '#e3d7ff',
    accent: '#7156ff',
    description: 'Seers slipping between moments to glimpse the future.'
  }
};

const HAIR_STYLES = [
  { key: 'raven-fringe', label: 'Raven Fringe' },
  { key: 'cascade-locks', label: 'Cascade Locks' },
  { key: 'shadow-shag', label: 'Shadow Shag' },
  { key: 'moon-braid', label: 'Moon Braid' }
];

const COLOR_PALETTE = {
  hair: ['#0d0d0d', '#4b2e83', '#ce3c7c', '#7c9cf6', '#f4d35e'],
  outfit: ['#3b2f73', '#54428e', '#342056', '#0d233b', '#6f2dbd'],
  accent: ['#f25f8b', '#3ddad7', '#ffd23f', '#c2f970', '#f49fbc']
};

const PERSONALITY_TRAITS = ['Curious', 'Stoic', 'Reckless', 'Witty'];

function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}

function getSkinColor(heritage) {
  return (HERITAGE_INFO[heritage] || HERITAGE_INFO.Psychic).skin;
}

function defaultProfile() {
  return {
    name: 'Astra',
    heritage: 'Psychic',
    hairStyle: HAIR_STYLES[0].key,
    hairColor: COLOR_PALETTE.hair[1],
    outfitColor: COLOR_PALETTE.outfit[0],
    accentColor: COLOR_PALETTE.accent[0],
    personality: PERSONALITY_TRAITS[0],
    notes: []
  };
}

function createHairPieces(scene, profile) {
  const color = Phaser.Display.Color.HexStringToColor(profile.hairColor).color;
  const pieces = [];
  const style = profile.hairStyle;

  const fringe = scene.add.rectangle(0, -32, 16, 8, color).setOrigin(0.5, 1);
  pieces.push(fringe);

  if (style === 'cascade-locks') {
    pieces.push(scene.add.rectangle(-6, -30, 6, 12, color).setOrigin(0.5, 1));
    pieces.push(scene.add.rectangle(6, -30, 6, 12, color).setOrigin(0.5, 1));
  } else if (style === 'shadow-shag') {
    pieces.push(scene.add.rectangle(0, -34, 18, 6, color).setOrigin(0.5, 1));
    pieces.push(scene.add.rectangle(-8, -26, 4, 10, color).setOrigin(0.5, 1));
    pieces.push(scene.add.rectangle(8, -26, 4, 10, color).setOrigin(0.5, 1));
  } else if (style === 'moon-braid') {
    pieces.push(scene.add.rectangle(0, -36, 10, 6, color).setOrigin(0.5, 1));
    pieces.push(scene.add.rectangle(0, -22, 6, 12, color).setOrigin(0.5, 1));
    pieces.push(scene.add.circle(0, -14, 3, color));
  } else {
    pieces.push(scene.add.rectangle(-7, -28, 4, 10, color).setOrigin(0.5, 1));
    pieces.push(scene.add.rectangle(7, -28, 4, 10, color).setOrigin(0.5, 1));
  }

  return pieces;
}

function createAvatar(scene, profile, options = {}) {
  const config = Object.assign({ x: 0, y: 0, scale: 3, withPhysics: false }, options);
  const container = scene.add.container(config.x, config.y);

  const outfitColor = Phaser.Display.Color.HexStringToColor(profile.outfitColor).color;
  const accentColor = Phaser.Display.Color.HexStringToColor(profile.accentColor).color;
  const skinColor = Phaser.Display.Color.HexStringToColor(getSkinColor(profile.heritage)).color;

  const boots = scene.add.rectangle(0, 0, 14, 6, accentColor).setOrigin(0.5, 1);
  const legs = scene.add.rectangle(0, -6, 12, 12, outfitColor).setOrigin(0.5, 1);
  const torso = scene.add.rectangle(0, -18, 16, 18, outfitColor).setOrigin(0.5, 1);
  const sash = scene.add.rectangle(0, -18, 12, 6, accentColor).setOrigin(0.5, 1);
  const collar = scene.add.rectangle(0, -30, 10, 4, accentColor).setOrigin(0.5, 1);
  const head = scene.add.rectangle(0, -34, 14, 14, skinColor).setOrigin(0.5, 1);

  container.add([boots, legs, torso, sash, collar, head]);

  const eyeColor = profile.heritage === 'Vampire' ? 0xff3366 : 0x1ef0ff;
  const eyeLeft = scene.add.rectangle(-3, -40, 2, 2, eyeColor).setOrigin(0.5, 1);
  const eyeRight = scene.add.rectangle(3, -40, 2, 2, eyeColor).setOrigin(0.5, 1);
  container.add([eyeLeft, eyeRight]);

  const mouth = scene.add.rectangle(0, -36, 6, 1, 0x000000).setOrigin(0.5, 1);
  container.add(mouth);

  container.avatarParts = { boots, legs, torso, sash, collar, head, eyes: [eyeLeft, eyeRight], hair: [], mouth };
  updateAvatar(scene, container, profile);

  container.setScale(config.scale);
  container.setSize(18 * config.scale, 40 * config.scale);

  if (config.withPhysics) {
    scene.physics.add.existing(container);
    const body = container.body;
    body.setSize(16 * config.scale, 36 * config.scale);
    body.setOffset(-8 * config.scale, -36 * config.scale);
    body.setCollideWorldBounds(true);
  }

  return container;
}

function updateAvatar(scene, container, profile) {
  const outfitColor = Phaser.Display.Color.HexStringToColor(profile.outfitColor).color;
  const accentColor = Phaser.Display.Color.HexStringToColor(profile.accentColor).color;
  const skinColor = Phaser.Display.Color.HexStringToColor(getSkinColor(profile.heritage)).color;

  container.avatarParts.legs.fillColor = outfitColor;
  container.avatarParts.torso.fillColor = outfitColor;
  container.avatarParts.sash.fillColor = accentColor;
  container.avatarParts.collar.fillColor = accentColor;
  container.avatarParts.head.fillColor = skinColor;
  container.avatarParts.boots.fillColor = accentColor;

  const eyeColor = profile.heritage === 'Vampire' ? 0xff3366 : profile.heritage === 'Gorgon' ? 0x76ff76 : 0x1ef0ff;
  container.avatarParts.eyes.forEach(eye => (eye.fillColor = eyeColor));

  if (container.avatarParts.hair) {
    container.avatarParts.hair.forEach(part => part.destroy());
  }

  container.avatarParts.hair = createHairPieces(scene, profile);
  container.avatarParts.hair.forEach(part => container.add(part));
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    const title = this.add.text(width / 2, height / 2 - 30, 'Nevermore Academy', {
      fontFamily: 'Press Start 2P',
      fontSize: '12px',
      color: '#e0d5ff',
      align: 'center'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: title.y - 3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(width / 2, height / 2 + 10, 'Press ENTER to enroll', {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      color: '#9cb3ff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 36, 'Move: Arrow Keys  Jump: Up  Interact: E/Space', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#6c7bd9'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('CharacterScene');
    });
  }
}

class CharacterScene extends Phaser.Scene {
  constructor() {
    super('CharacterScene');
  }

  init() {
    this.profile = defaultProfile();
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x090b1a);

    this.preview = createAvatar(this, this.profile, { x: GAME_WIDTH - 60, y: GAME_HEIGHT - 20, scale: 2.5 });

    this.add.text(24, 16, 'Student File', {
      fontFamily: 'Press Start 2P',
      fontSize: '10px',
      color: '#f2e9ff'
    });

    this.fields = [
      { label: 'Name', key: 'name', type: 'text' },
      { label: 'Heritage', key: 'heritage', type: 'options', options: Object.keys(HERITAGE_INFO) },
      { label: 'Hair Style', key: 'hairStyle', type: 'options', options: HAIR_STYLES.map(s => s.key) },
      { label: 'Hair Color', key: 'hairColor', type: 'options', options: COLOR_PALETTE.hair },
      { label: 'Outfit', key: 'outfitColor', type: 'options', options: COLOR_PALETTE.outfit },
      { label: 'Accent', key: 'accentColor', type: 'options', options: COLOR_PALETTE.accent },
      { label: 'Personality', key: 'personality', type: 'options', options: PERSONALITY_TRAITS }
    ];

    this.selectedField = 0;
    this.fieldTexts = this.fields.map((field, index) => {
      const text = this.add.text(24, 40 + index * 18, '', {
        fontFamily: 'Press Start 2P',
        fontSize: '7px',
        color: '#aeb6ff'
      });
      text.setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        this.selectedField = index;
        this.refreshFields();
      });
      return text;
    });

    this.infoText = this.add.text(24, GAME_HEIGHT - 58, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#9bd7ff',
      wordWrap: { width: 180 }
    });

    this.startText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'Commence Semester (Enter)', {
      fontFamily: 'Press Start 2P',
      fontSize: '7px',
      color: '#f6b8ff'
    }).setOrigin(0.5);
    this.startText.setInteractive({ useHandCursor: true });
    this.startText.on('pointerdown', () => this.beginJourney());

    this.input.keyboard.on('keydown', event => this.handleKey(event));
    this.refreshFields();
  }

  handleKey(event) {
    if (event.code === 'ArrowUp') {
      this.selectedField = (this.selectedField - 1 + this.fields.length) % this.fields.length;
      this.refreshFields();
      return;
    }
    if (event.code === 'ArrowDown') {
      this.selectedField = (this.selectedField + 1) % this.fields.length;
      this.refreshFields();
      return;
    }

    const field = this.fields[this.selectedField];
    if (!field) return;

    if (field.type === 'options') {
      if (event.code === 'ArrowLeft') {
        this.cycleField(field, -1);
      } else if (event.code === 'ArrowRight') {
        this.cycleField(field, 1);
      }
    } else if (field.type === 'text') {
      if (event.code === 'Backspace') {
        this.profile[field.key] = this.profile[field.key].slice(0, -1);
      } else if (event.key.length === 1 && /[a-zA-Z\s'-]/.test(event.key) && this.profile[field.key].length < 12) {
        this.profile[field.key] += event.key.toUpperCase();
      }
    }

    if (event.code === 'Enter') {
      this.beginJourney();
    }

    this.refreshFields();
  }

  cycleField(field, direction) {
    const options = field.options;
    const currentIndex = options.indexOf(this.profile[field.key]);
    const nextIndex = (currentIndex + direction + options.length) % options.length;
    this.profile[field.key] = options[nextIndex];

    if (field.key === 'heritage') {
      const heritage = HERITAGE_INFO[this.profile.heritage];
      if (heritage?.accent) {
        this.profile.accentColor = heritage.accent;
      }
    }
  }

  refreshFields() {
    this.fieldTexts.forEach((text, index) => {
      const field = this.fields[index];
      let value = this.profile[field.key];
      if (field.key === 'hairStyle') {
        const style = HAIR_STYLES.find(s => s.key === value);
        value = style ? style.label : value;
      }
      const prefix = index === this.selectedField ? '> ' : '  ';
      text.setText(`${prefix}${field.label}: ${value}`);
      text.setColor(index === this.selectedField ? '#f6b8ff' : '#aeb6ff');
    });

    const heritage = HERITAGE_INFO[this.profile.heritage];
    this.infoText.setText(`${(this.profile.name || 'Unnamed').toUpperCase()} THE ${this.profile.heritage}\n` +
      `${heritage ? heritage.description : ''}\nPersona: ${this.profile.personality}`);

    updateAvatar(this, this.preview, this.profile);
  }

  beginJourney() {
    if (!this.profile.name || this.profile.name.trim().length === 0) {
      this.profile.name = 'Astra';
    }
    this.registry.set('profile', deepClone(this.profile));
    this.scene.start('CampusScene');
  }
}

class DialogueManager {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.handlers = {};

    const margin = 8;
    this.box = scene.add.rectangle(margin + 8, GAME_HEIGHT - 50, GAME_WIDTH - margin * 2, 60, 0x120f23)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x5d4cc9, 0.6)
      .setVisible(false);

    this.nameText = scene.add.text(margin + 12, GAME_HEIGHT - 46, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '7px',
      color: '#f6b8ff'
    }).setScrollFactor(0).setVisible(false);

    this.mainText = scene.add.text(margin + 12, GAME_HEIGHT - 36, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#d7d9ff',
      wordWrap: { width: GAME_WIDTH - margin * 2 - 20, useAdvancedWrap: true },
      lineSpacing: 2
    }).setScrollFactor(0).setVisible(false);

    this.hintText = scene.add.text(GAME_WIDTH - margin - 10, GAME_HEIGHT - 10, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#7f8cff'
    }).setOrigin(1, 1).setScrollFactor(0).setVisible(false);

    this.optionTexts = [];

    scene.input.keyboard.on('keydown', event => this.handleKey(event));
  }

  show(node, handlers = {}) {
    this.currentNode = node;
    this.handlers = handlers;
    this.active = true;

    this.box.setVisible(true);
    this.nameText.setVisible(Boolean(node.speaker));
    this.mainText.setVisible(true);
    this.hintText.setVisible(true);

    this.nameText.setText(node.speaker || '');
    this.mainText.setText(node.text || '');

    this.optionTexts.forEach(text => text.destroy());
    this.optionTexts = [];

    if (node.options && node.options.length) {
      this.selectedOption = 0;
      node.options.forEach((option, index) => {
        const optionText = this.scene.add.text(this.box.x + 12, this.box.y + 30 + index * 12, `${index + 1}) ${option.text}`, {
          fontFamily: 'Press Start 2P',
          fontSize: '6px',
          color: '#9bd7ff'
        }).setScrollFactor(0);
        optionText.setInteractive({ useHandCursor: true });
        optionText.on('pointerover', () => this.highlightOption(index));
        optionText.on('pointerdown', () => this.chooseOption(index));
        this.optionTexts.push(optionText);
      });
      this.highlightOption(this.selectedOption);
      this.hintText.setText('Enter/Space to confirm');
    } else {
      this.hintText.setText('Space to continue');
    }
  }

  highlightOption(index) {
    if (!this.optionTexts.length) return;
    this.selectedOption = index;
    this.optionTexts.forEach((text, idx) => {
      text.setColor(idx === index ? '#f6b8ff' : '#9bd7ff');
    });
  }

  chooseOption(index) {
    if (!this.currentNode || !this.currentNode.options) return;
    const option = this.currentNode.options[index];
    if (!option) return;
    if (this.handlers.onSelect) {
      this.handlers.onSelect(option);
    }
  }

  advance() {
    if (this.handlers.onAdvance) {
      this.handlers.onAdvance(this.currentNode);
    }
  }

  close() {
    this.active = false;
    this.box.setVisible(false);
    this.nameText.setVisible(false);
    this.mainText.setVisible(false);
    this.hintText.setVisible(false);
    this.optionTexts.forEach(text => text.destroy());
    this.optionTexts = [];
    if (this.handlers.onComplete) {
      this.handlers.onComplete(this.currentNode);
    }
    this.currentNode = null;
  }

  handleKey(event) {
    if (!this.active) return;
    if (this.currentNode.options && this.currentNode.options.length) {
      if (event.code === 'ArrowUp') {
        this.highlightOption((this.selectedOption - 1 + this.currentNode.options.length) % this.currentNode.options.length);
      } else if (event.code === 'ArrowDown') {
        this.highlightOption((this.selectedOption + 1) % this.currentNode.options.length);
      } else if (event.code === 'Enter' || event.code === 'Space') {
        this.chooseOption(this.selectedOption);
      } else if (/Digit[1-9]/.test(event.code)) {
        const index = parseInt(event.code.replace('Digit', ''), 10) - 1;
        if (index >= 0) {
          this.chooseOption(index);
        }
      }
    } else if (event.code === 'Space' || event.code === 'Enter') {
      this.advance();
    }
  }
}

const STORY_NODES = {
  introGate: {
    speaker: 'Headmistress Mircalla',
    text: scene => `Welcome to Nevermore, ${scene.profile.name}. We relish an unsettling talent. What brings you beyond the iron gate?`,
    options: [
      {
        text: 'The mystery calls to me. I want to belong among the strange.',
        setFlag: { personality: 'bold' },
        next: 'introBold'
      },
      {
        text: 'Keep your monsters honest and I'll keep my schedule tidy.',
        setFlag: { personality: 'wry' },
        next: 'introWry'
      },
      {
        text: 'My gift spiraled out of control. I need mastery.',
        setFlag: { personality: 'focused' },
        next: 'introFocused'
      }
    ]
  },
  introBold: {
    speaker: 'Headmistress Mircalla',
    text: 'Spoken like a true misfit. Nevermore thrives on fearless hearts.',
    next: 'introTour'
  },
  introWry: {
    speaker: 'Headmistress Mircalla',
    text: 'A practical soul? How refreshing. Just do not file a complaint when the gargoyles wink.',
    next: 'introTour'
  },
  introFocused: {
    speaker: 'Headmistress Mircalla',
    text: 'Then we will give you structure. Power without focus is a tragedy we avoid.',
    next: 'introTour'
  },
  introTour: {
    speaker: 'Headmistress Mircalla',
    text: 'Take this hex-braided bracelet. It will tingle whenever the campus shifts. Find your chaperones—Yara by the Siren fountain and Quentin near the lupine training green.',
    next: 'introNarrator'
  },
  introNarrator: {
    speaker: 'Narrator',
    text: scene => `${scene.profile.name} steps through the creaking gates as ravens explode from the trees. Nevermore breathes you in.`,
    end: scene => scene.enterExploration()
  },
  yaraGreeting: {
    speaker: 'Yara Tidewell',
    text: 'New currents ripple around you. I am Yara, your Siren liaison. Do you prefer harmonies or secrets?',
    options: [
      {
        text: 'Secrets. They keep me afloat.',
        effect: scene => scene.addJournalNote('Yara entrusted you with secret hand signs.'),
        setFlag: { yaraBond: 'secrets' },
        next: 'yaraOffer'
      },
      {
        text: 'Harmonies. Teach me to sing storms quiet.',
        effect: scene => scene.addJournalNote('Yara promised a late-night choir under the glass dome.'),
        setFlag: { yaraBond: 'songs' },
        next: 'yaraOffer'
      }
    ]
  },
  yaraOffer: {
    speaker: 'Yara Tidewell',
    text: "Tonight the fountain's glow dims. Meet me after curfew if you crave the academy's truest voice.",
    end: scene => scene.completeYara()
  },
  quentinGreeting: {
    speaker: 'Quentin Hale',
    text: 'Fresh blood? Relax. I only bite bad manners. What pace do you run under a full moon?',
    options: [
      {
        text: 'I sprint. Outrun the shadows or get swallowed.',
        effect: scene => scene.addJournalNote('Quentin respects your hunger for speed.'),
        setFlag: { quentinBond: 'speed' },
        next: 'quentinOffer'
      },
      {
        text: 'I listen. The moon leads; I follow.',
        effect: scene => scene.addJournalNote('Quentin invites you to moonlit tracking lessons.'),
        setFlag: { quentinBond: 'listen' },
        next: 'quentinOffer'
      }
    ]
  },
  quentinOffer: {
    speaker: 'Quentin Hale',
    text: "Swing by the training green after dusk. We'll test your stride when the pack howls.",
    end: scene => scene.completeQuentin()
  },
  statueVision: {
    speaker: 'Rook Statue',
    text: scene => `Stone eyes flare violet. Choose what Nevermore will make of you, ${scene.profile.name}.`,
    options: [
      {
        text: 'Join Yara beneath the fountain and master whispered conspiracies.',
        setFlag: { faction: 'chorus' },
        next: 'endingChorus'
      },
      {
        text: "Run with Quentin's pack and guard the moonlit border.",
        setFlag: { faction: 'pack' },
        next: 'endingPack'
      },
      {
        text: 'Forge a path alone. Let Nevermore adapt to you.',
        setFlag: { faction: 'rogue' },
        next: 'endingRogue'
      }
    ]
  },
  endingChorus: {
    speaker: 'Narrator',
    text: scene => `That night, ${scene.profile.name} slips beneath the fountain, singing counter-melodies with Yara as the water rises. The academy learns a new rhythm.`,
    end: scene => scene.concludeStory('chorus')
  },
  endingPack: {
    speaker: 'Narrator',
    text: scene => `Under argent moonlight, ${scene.profile.name} bounds beside Quentin. Together you trace invisible wards that keep Nevermore safe.`,
    end: scene => scene.concludeStory('pack')
  },
  endingRogue: {
    speaker: 'Narrator',
    text: scene => `${scene.profile.name} carves sigils into the old stone alone. The campus shifts to accommodate an ambition it cannot predict.`,
    end: scene => scene.concludeStory('rogue')
  }
};

class CampusScene extends Phaser.Scene {
  constructor() {
    super('CampusScene');
  }

  init(data) {
    this.profile = data?.profile || deepClone(this.registry.get('profile') || defaultProfile());
    this.storyFlags = { metYara: false, metQuentin: false };
  }

  create() {
    this.cameras.main.setBackgroundColor('#090b1a');

    this.createBackground();
    this.createWorld();
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);

    this.player = createAvatar(this, this.profile, { x: 40, y: 120, scale: 2.5, withPhysics: true });
    this.player.body.setDragX(600);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 40);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.dialogue = new DialogueManager(this);

    this.journalEntries = [];
    this.journalText = this.add.text(8, 8, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#9bd7ff',
      lineSpacing: 2
    }).setScrollFactor(0);

    this.goalText = this.add.text(GAME_WIDTH / 2, 18, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '7px',
      color: '#f6b8ff'
    }).setOrigin(0.5, 0).setScrollFactor(0);

    this.interactPrompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 70, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#f49fbc'
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    this.npcs = [];
    this.createNPCs();

    this.platforms.forEach(platform => {
      this.physics.add.collider(this.player, platform);
    });

    this.openStoryNode('introGate');
  }

  createBackground() {
    const sky = this.add.rectangle(0, 0, WORLD_WIDTH, GAME_HEIGHT, 0x090b1a).setOrigin(0, 0);
    sky.setScrollFactor(0);

    this.moon = this.add.circle(60, 40, 20, 0xf6e5ff).setScrollFactor(0.1);
    this.clouds = this.add.group();
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.rectangle(Phaser.Math.Between(0, WORLD_WIDTH), Phaser.Math.Between(20, 80), 60, 12, 0x1c1f3a)
        .setAlpha(0.6);
      cloud.setScrollFactor(0.3);
      this.clouds.add(cloud);
    }
  }

  createWorld() {
    this.platforms = [];
    this.groundLayer = this.add.layer();

    const ground = this.add.rectangle(WORLD_WIDTH / 2, GAME_HEIGHT - 10, WORLD_WIDTH, 40, 0x1a1533);
    this.physics.add.existing(ground, true);
    this.platforms.push(ground);

    const balcony = this.add.rectangle(320, GAME_HEIGHT - 60, 80, 12, 0x221a40);
    this.physics.add.existing(balcony, true);
    this.platforms.push(balcony);

    const rooftop = this.add.rectangle(860, GAME_HEIGHT - 70, 120, 12, 0x241c47);
    this.physics.add.existing(rooftop, true);
    this.platforms.push(rooftop);

    this.decorGroup = this.add.group();
    for (let x = 80; x < WORLD_WIDTH; x += 160) {
      const tree = this.add.rectangle(x, GAME_HEIGHT - 40, 24, 80, 0x14202e);
      tree.setOrigin(0.5, 1);
      tree.setDepth(-1);
      this.decorGroup.add(tree);
    }

    this.statue = this.add.rectangle(1040, GAME_HEIGHT - 28, 20, 48, 0x4b4c7a);
    this.add.text(this.statue.x, this.statue.y - 36, 'ROOK', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#9bd7ff'
    }).setOrigin(0.5);
    this.physics.add.existing(this.statue, true);
    this.platforms.push(this.statue);
  }

  createNPCs() {
    const yaraProfile = {
      name: 'Yara',
      heritage: 'Siren',
      hairStyle: 'cascade-locks',
      hairColor: '#7c9cf6',
      outfitColor: '#143a66',
      accentColor: '#3ddad7',
      personality: 'Mellifluous'
    };
    const yara = createAvatar(this, yaraProfile, { x: 260, y: GAME_HEIGHT - 32, scale: 2.3 });
    yara.setDepth(5);
    this.add.text(yara.x, yara.y - 70, 'Yara', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#9bd7ff'
    }).setOrigin(0.5);
    this.npcs.push({ sprite: yara, node: 'yaraGreeting', name: 'Yara Tidewell', flag: 'metYara' });

    const quentinProfile = {
      name: 'Quentin',
      heritage: 'Werewolf',
      hairStyle: 'shadow-shag',
      hairColor: '#0d0d0d',
      outfitColor: '#3b2f73',
      accentColor: '#f25f8b',
      personality: 'Guarded'
    };
    const quentin = createAvatar(this, quentinProfile, { x: 620, y: GAME_HEIGHT - 28, scale: 2.3 });
    quentin.setDepth(5);
    this.add.text(quentin.x, quentin.y - 70, 'Quentin', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#f49fbc'
    }).setOrigin(0.5);
    this.npcs.push({ sprite: quentin, node: 'quentinGreeting', name: 'Quentin Hale', flag: 'metQuentin' });

    this.npcs.forEach(npc => {
      this.physics.add.existing(npc.sprite, true);
      this.platforms.push(npc.sprite);
    });
  }

  addJournalNote(note) {
    if (!this.journalEntries.includes(note)) {
      this.journalEntries.push(note);
      this.updateJournal();
    }
  }

  updateJournal() {
    const lines = ['Journal'];
    this.journalEntries.slice(-4).forEach(entry => lines.push(`- ${entry}`));
    this.journalText.setText(lines.join('\n'));
  }

  setGoal(text) {
    this.goalText.setText(text);
  }

  openStoryNode(nodeId) {
    const node = this.resolveNode(nodeId);
    this.dialogue.show(node, {
      onSelect: option => this.applyOption(option),
      onAdvance: () => this.advanceNode(node),
      onComplete: () => {
        if (node.end) {
          node.end(this);
        }
      }
    });
  }

  resolveNode(nodeId) {
    const raw = STORY_NODES[nodeId];
    if (!raw) {
      return { speaker: 'Narrator', text: '...the story hiccups. (Missing node)' };
    }
    const node = {
      speaker: typeof raw.speaker === 'function' ? raw.speaker(this) : raw.speaker,
      text: typeof raw.text === 'function' ? raw.text(this) : raw.text,
      options: null,
      next: raw.next,
      end: raw.end
    };
    if (raw.options) {
      node.options = raw.options
        .filter(option => (option.condition ? option.condition(this) : true))
        .map(option => ({
          ...option,
          text: typeof option.text === 'function' ? option.text(this) : option.text,
          next: option.next,
          setFlag: option.setFlag,
          effect: option.effect
        }));
    }
    return node;
  }

  applyOption(option) {
    if (option.setFlag) {
      Object.keys(option.setFlag).forEach(key => {
        this.storyFlags[key] = option.setFlag[key];
      });
    }
    if (option.effect) {
      option.effect(this);
    }

    if (option.next) {
      const nextId = typeof option.next === 'function' ? option.next(this) : option.next;
      if (nextId) {
        this.openStoryNode(nextId);
        return;
      }
    }

    this.dialogue.close();
  }

  advanceNode(node) {
    if (node.next) {
      const nextId = typeof node.next === 'function' ? node.next(this) : node.next;
      if (nextId) {
        this.openStoryNode(nextId);
        return;
      }
    }
    this.dialogue.close();
  }

  enterExploration() {
    this.setGoal('Find Yara and Quentin');
    this.addJournalNote('Headmistress Mircalla gave you a hex bracelet.');
    this.ready = true;
  }

  completeYara() {
    if (!this.storyFlags.metYara) {
      this.storyFlags.metYara = true;
      this.addJournalNote('Yara trusts you enough for a clandestine meeting.');
      this.checkFinale();
    }
  }

  completeQuentin() {
    if (!this.storyFlags.metQuentin) {
      this.storyFlags.metQuentin = true;
      this.addJournalNote('Quentin marked you for the next moon patrol.');
      this.checkFinale();
    }
  }

  checkFinale() {
    if (this.storyFlags.metYara && this.storyFlags.metQuentin) {
      this.setGoal('Approach the rook statue.');
      this.addJournalNote('The hex bracelet hums near the courtyard statue.');
    }
  }

  concludeStory(path) {
    let epilogue;
    if (path === 'chorus') {
      epilogue = 'You weave conspiracies into symphonies. Nevermore hums your tune.';
    } else if (path === 'pack') {
      epilogue = 'You prowl the ramparts, loyal to the pack and the moon.';
    } else {
      epilogue = 'You redraw the lines of the academy with unapologetic intent.';
    }
    this.addJournalNote(epilogue);
    this.setGoal('Semester One: Destiny forged.');
  }

  update() {
    if (!this.player) return;

    this.handleMovement();
    this.handleInteractions();
    this.animateClouds();
  }

  handleMovement() {
    if (this.dialogue.active) {
      this.player.body.setVelocityX(0);
      return;
    }

    const speed = 110;
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.setScale(-Math.abs(this.player.scaleX), this.player.scaleY);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.setScale(Math.abs(this.player.scaleX), this.player.scaleY);
    } else {
      this.player.body.setVelocityX(0);
    }

    if ((this.cursors.up.isDown || this.cursors.space?.isDown) && this.player.body.blocked.down) {
      this.player.body.setVelocityY(-210);
    }
  }

  handleInteractions() {
    if (!this.ready) return;
    let nearest = null;
    let minDistance = 999;
    this.npcs.forEach(npc => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = npc;
      }
    });

    let prompt = '';
    let targetNode = null;

    if (nearest && minDistance < 40) {
      const alreadyMet = this.storyFlags[nearest.flag];
      if (!alreadyMet) {
        prompt = `Press E to speak with ${nearest.name.split(' ')[0]}`;
        targetNode = nearest.node;
      }
    }

    const statueDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.statue.x, this.statue.y);
    if (this.storyFlags.metYara && this.storyFlags.metQuentin && statueDistance < 50) {
      prompt = 'Press E to touch the rook statue';
      targetNode = 'statueVision';
    }

    if (prompt) {
      this.interactPrompt.setText(prompt).setVisible(true);
      if ((Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) && !this.dialogue.active) {
        this.openStoryNode(targetNode);
      }
    } else {
      this.interactPrompt.setVisible(false);
    }
  }

  animateClouds() {
    this.clouds.children.iterate(cloud => {
      cloud.x -= 0.1;
      if (cloud.x < -40) {
        cloud.x = WORLD_WIDTH + 40;
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: ZOOM
  },
  backgroundColor: '#090b1a',
  scene: [MenuScene, CharacterScene, CampusScene]
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});
