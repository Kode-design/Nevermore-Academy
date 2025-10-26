# Morrowfell Academy – Game Design Scaffold

## Vision
Morrowfell Academy is an isometric 2D, party-based RPG that blends narrative agency with tactical combat inside a secretive finishing school for supernatural prodigies. Players navigate the academy's politics, the pressures of a fragile magical Veil, and the tangled loyalties of their companions while mastering hybrid builds that mix arcane disciplines, martial trickery, and social leverage.

## Core Pillars
- **Roleplay-first storytelling:** Branching dialogue drives relationship shifts, institutional reputation, and the rising **Veil Heat**—a measure of how suspicious the city becomes of supernatural incidents.
- **Tactical party combat:** Turn-based, grid encounters leverage species-specific resource meters (Hunger, Moon, Tithe, Breath, Strain) and environmental interactions.
- **Expressive builds:** Characters invest across multiple skill trees, combining magic schools, martial styles, and social talents to craft bespoke tactics.

## Primary Loop
```
Explore → Converse → Accept Quests → Manage Party & Resources → Tactical Encounters → Level & Craft → Patch the Veil / Face Consequences → New Leads
```

## Camera & Controls
- Isometric 2D presentation using a 32px base tile (scales cleanly to 48px/64px).
- 8-direction movement mapped to WASD or mouse click-to-move.
- Single interact key surfaces a radial action menu; right-click provides inspection.
- Combat layers a visible grid overlay with optional accessibility toggles.

## Character Creation
1. **Species:** Vampire, Witch, Werewolf, Siren, and unlockable Human Adept.
2. **Background (pick one):** City Latchkey, Old Accord Scion, Transfer From Abroad, Ward-Breaker’s Kid, Choir Probation.
3. **Aspiration (pick one):** Keeper, Rebel, Scholar, Diplomat — influences story beats and companion alignment checks.
4. **Look & Voice:** Pixel-layer customization with three text/SFX voice tones.

## Core Attributes
- **Resolve:** Willpower, fear resistance, control checks.
- **Cunning:** Trickery, critical chance, lock manipulation.
- **Aptitude:** Spell potency, crafting proficiency.
- **Grace:** Initiative, evasion, vocal finesse.
- **Might:** Melee damage, carry capacity.
- **Sense:** Perception, tracking, glamour detection.

## Species Resources & Quirks
| Species | Resource | Notes |
| --- | --- | --- |
| Vampire | **Hunger** | Rises nightly, fuels empowered skills; sunlight stacks **Scorch**; must feed via volunteers or synth blood. |
| Witch | **Tithe** | Spellcasting costs sleep/memory/time; overcasting triggers **Backwash** debuffs. |
| Werewolf | **Moon** | Builds under stress; threshold unlocks **Feral** stance with powerful but volatile moves. |
| Siren | **Breath** | Spent on vocal abilities; overuse around mortals risks **Echo** backlash. |
| Human Adept | **Strain** | Channels wards through mundane bodies; overexertion causes **Tear**, spiking Veil Heat. |

## Skill Trees
Players mix any of the following trees, unlocking a point and an attribute pip per level and a keystone every third level.

### Arcane & Support
- **Umbra:** Shadow Step (swap with shadow, 1 tile), Gloom Mark (allied bonus damage).
- **Wards & Writs:** Sigil: Aegis (cone cover), Binding Circle (immobilize).
- **Necrobotany:** Hemlock Dart (poison), Grave-Moss Patch (healing terrain).
- **Bestiary Arts:** Control and debuff against monsters.
- **Night Alchemy:** Craft bombs, tonics, tinctures.

### Martial Disciplines
- **Raven Dueling:** Riposte Stance, Night Parry counters.
- **Thornwork:** Bleeds, locks, and area denial via living bramble constructs.
- **Barrow Guard:** Tanking, taunts, and protective formations.

### Social Schools
- **Diplomacy:** Accord Leverage dialogues, faction negotiation.
- **Intimidation:** Predator aura and fear-based crowd control.
- **Guile:** Lies, forgery, rumor acquisition.
- **Performance:** Songs, rally effects, siren resonance.

## Dialogue & Progression Systems
- **Attribute/skill checks** gate dialogue options, shortcuts, and companion reactions.
- **Reputation tracks** include Faculty, Lantern Society, Keywrights, Blood Ethics Circle, and City Wardens.
- **Veil Heat** is a global meter reflecting exposure; elevated Heat introduces patrols, investigations, and sanctions while low Heat unlocks covert operations.

## Party Composition
- Active party: player + up to three companions (benched members earn 50% XP).
- Companions possess personal **Convictions** tied to the player’s Aspiration; fulfilling arcs unlocks a **Signature Skill** and **Support Passive**.
- **Synergy tags** encourage cross-discipline combos (e.g., Wet + Lightning Song → **Stun**, Bleed + Predator Focus → **Expose**).

## Combat Overview
- Initiative is determined by Grace; each character receives two actions (move/skill/interact) and free swaps/shouts.
- Cover values (half/full) derived from environmental props and ward sigils.
- Status set-ups and flanking yield **Advantage** or **Expose** states.
- Environmental tiles (water, hedges, grave-soil, bell zones) modify abilities.
- Encounters support multiple win states: defeat, escape, ritual completion, or hold-out.
- Non-lethal takedowns are default—lethal force on campus incurs sanctions.

### Status Glossary
Bleed, Poison, Chill, Scorch, Silence, Muffle, Root, Stun, Taunt, Shroud, Expose, Warded, Feral, Mesmerized, Echo, Backwash.

## Economy & Crafting
- Each level grants 1 skill point + 1 attribute pip; keystones unlock every three levels.
- Crafting suites: Night Alchemy benches (bombs/tonics), Thornwork lockpicks/keys, Ward Ink consumables.
- Currencies: Crowns (mundane), Favors (social leverage), Reagents (crafting), and rare Barrow Scrip (spectral bargains).

## Gear Slots & Tags
- Slots: Main-hand, Off-hand, Attire, Charm, Relic (species-bound).
- Weapons carry tags (Pierce, Rend, Blunt, Hex, Song, Sigil); armor emphasizes resistances over raw stats.

## Activities & Time of Day
- **Day:** Attend classes for passive buffs, take side jobs, or engage in tutoring mini-games.
- **Evening:** Tackle quests, patrols, clubs, romance scenes, or training.
- **Curfew (2 a.m.):** Campus layout shifts to roguelite corridors; getting caught triggers detention micro-quests.

## Act I Zone List
The Fell Keep · Thornwork Conservatory · Barrow Steps & Crypt Library · Hollowmere Pool · Ashgate Waterworks · Duskmark Spire Roofs · Old Tram Tunnels.

## Companion Roster (Act I)
- **Isolde Thatch (Vampire Duelist):** Blood contract drama. Signature — *Night Parry* (negate + counter).
- **Bram Oakes (Werewolf Forward):** Wrestles with Moon surges. Signature — *Iron Howl* (team Warded + Taunt).
- **Tamsin Broke (Witch Cartographer):** Puzzle solver. Signature — *Map the Unseen* (reveals traps/secret tiles).
- **Oriel Tide (Siren Mediator):** Controller/healer. Signature — *Lullaby Cadence* (AoE Muffle + heal).
- **Knock (Faceless Custodian):** Hidden recruit. Signature — *Mop & Mirror* (slide enemies, cleanse terrain).

## Sample Quest Beats
1. **Veil Audit 101 (Tutorial):** Seal a rift in the tram station, unlock Ward: Aegis & Shadow Step; choose between cover-up (Guile) or official report (Faculty rep).
2. **Missing Crates (First Party Mission):** Investigate a synthetic blood heist; branch toward siren smugglers or Blood Ethics mole; features water channels + bell pylons arena.
3. **The Fifth Crest (Mystery Thread):** Dialogue-heavy investigation of a banned discipline with puzzle locks.

## First-Hour Vertical Slice
1. Intro dialogue & species/background selection; immediate skill check (Cunning or Diplomacy).
2. Campus tour culminating in a mini-combat within maintenance tunnels (two starter skills).
3. Recruit one of two companions to round out the first squad.
4. Evening patrol introduces Veil Heat, a basic crafting recipe, and fast-travel unlock.

## Aesthetic Direction
- Palette of charcoal, heather, bone, tarnished silver, and ember accents.
- 32×48 pixel character sprites with expressive silhouettes and subtle idle loops per species.
- Screen-space rain, soft dithering for fog, and bell SFX doubling as UI cues.

## Accessibility Options
Combat speed slider · Colorblind-safe status icons · Content toggles (e.g., stylized feeding) · Readable fonts · Adjustable subtitle timing · Quick-save anywhere outside combat.
