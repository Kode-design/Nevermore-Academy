# Nevermore Academy: New Arrival

A 2D pixel-inspired side-scrolling adventure built with [Phaser 3](https://phaser.io/) where you arrive as the newest student at Nevermore Academy. Shape your supernatural identity, befriend or spar with iconic classmates, and decide the fate of your first night on campus through branching dialogue.

## Features
- **Retro presentation:** Pixel-art inspired characters, parallax backgrounds, and chiptune-style color palette managed through CSS (`style.css`).
- **Guided onboarding:** Title menu with options to start a new game, continue, or view controls (`MainMenuScene`).
- **Character creator:** Pick your origin (Vampire, Werewolf, Siren, Sorcerer, Psychic, Human), hairstyle, outfit palette, and accessory before entering the academy (`CharacterCreationScene`).
- **Side-scrolling exploration:** Walk, jump, and interact with classmates across the quad, courtyard, and dormitory in the campus scene (`CampusScene`).
- **Interactive narrative:** Engage in dialogue trees with Wednesday, Enid, and other Nevermore figures, influencing your standing and unlocking unique endings (`DialogueSystem`).
- **Branching finale:** Align with the Nightshade Society, aid Principal Weems, or pursue a rogue course of your own based on choices gathered through the night (`FinaleScene`).

## Controls
- **Arrow keys / A & D:** Move left and right
- **Space / W / Up Arrow:** Jump
- **E / Enter / Space (when prompted):** Interact with NPCs and confirm menu selections
- **Escape:** Open the pause overlay (resume, settings, exit)

## Getting Started
1. Ensure you have a modern browser that supports ES6 modules (Chrome, Firefox, Edge, or Safari).
2. Clone the repository and open `index.html` directly in the browser **or** serve the project through a lightweight HTTP server:
   ```bash
   npx serve .
   ```
3. The game canvas will mount inside the `#game-container` div and automatically preload assets and narrative data from `js/main.js`.

## Project Structure
```
├── index.html       # Entry point that loads Phaser and boots the game
├── style.css        # Retro UI theming and layout scaffolding
├── js/
│   └── main.js      # All game scenes, assets, and narrative content
└── README.md        # Project documentation (this file)
```

## Extending the Game
- Add new playable archetypes or cosmetic options by editing the `characterOptions` definitions in `CharacterCreationScene` (inside `js/main.js`).
- Expand the campus with more zones by appending scene maps and collision layers within the `CampusScene` configuration.
- Introduce additional branching outcomes by updating the dialogue graphs consumed by the `DialogueSystem` and `FinaleScene`.
- Swap or enhance pixel art by replacing textures in the `assets` section of `main.js` or by loading external spritesheets.

## Acknowledgements
Nevermore Academy, Wednesday Addams, and associated characters belong to their respective rights holders. This project is a fan-made tribute with no commercial intent.
