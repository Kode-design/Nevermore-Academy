import math
import sys
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import pygame


pygame.init()

WIDTH, HEIGHT = 960, 540
FPS = 60
FONT = pygame.font.Font(pygame.font.get_default_font(), 24)
SMALL_FONT = pygame.font.Font(pygame.font.get_default_font(), 18)
TITLE_FONT = pygame.font.Font(pygame.font.get_default_font(), 48)

SCREEN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Nevermore Academy: New Arrival")
CLOCK = pygame.time.Clock()


class GameState:
    MENU = "menu"
    CHARACTER_CREATION = "character_creation"
    STORY = "story"
    PAUSED = "paused"


@dataclass
class Button:
    rect: pygame.Rect
    text: str
    callback: callable
    bg_color: Tuple[int, int, int] = (40, 40, 40)
    hover_color: Tuple[int, int, int] = (80, 80, 160)
    text_color: Tuple[int, int, int] = (230, 230, 230)

    def draw(self, surface: pygame.Surface):
        mouse_pos = pygame.mouse.get_pos()
        color = self.hover_color if self.rect.collidepoint(mouse_pos) else self.bg_color
        pygame.draw.rect(surface, color, self.rect, border_radius=8)
        label = FONT.render(self.text, True, self.text_color)
        surface.blit(label, label.get_rect(center=self.rect.center))

    def handle_event(self, event: pygame.event.Event):
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if self.rect.collidepoint(event.pos):
                self.callback()


HAIR_STYLES = [
    ("Short Fringe", (60, 60, 60)),
    ("Raven Waves", (20, 20, 20)),
    ("Moonlit Bob", (200, 200, 200)),
    ("Electric Shag", (90, 20, 120)),
    ("Sunset Plait", (220, 90, 40)),
]

RACES = [
    ("Werewolf", (140, 90, 70)),
    ("Vampire", (200, 200, 240)),
    ("Siren", (90, 140, 200)),
    ("Gorgon", (90, 180, 100)),
    ("Sorcerer", (170, 120, 200)),
]

OUTFITS = [
    ("Academy Uniform", (40, 40, 80)),
    ("Dueling Cloak", (60, 20, 100)),
    ("Raven Scout", (30, 70, 120)),
    ("Workshop Apron", (110, 70, 30)),
]


@dataclass
class CharacterConfig:
    name: str = "New Raven"
    hair_index: int = 0
    race_index: int = 0
    outfit_index: int = 0

    @property
    def hair(self):
        return HAIR_STYLES[self.hair_index]

    @property
    def race(self):
        return RACES[self.race_index]

    @property
    def outfit(self):
        return OUTFITS[self.outfit_index]


class CharacterCreator:
    def __init__(self, on_complete):
        self.config = CharacterConfig()
        self.on_complete = on_complete
        self.active_field = "name"
        self.text_buffer = self.config.name
        self.buttons: List[Button] = []
        self._build_buttons()

    def _build_buttons(self):
        start_button = Button(
            rect=pygame.Rect(WIDTH // 2 - 120, HEIGHT - 90, 240, 60),
            text="Enroll",
            callback=lambda: self.on_complete(self.config),
        )
        self.buttons = [start_button]

    def cycle_option(self, field: str, direction: int):
        if field == "hair":
            self.config.hair_index = (self.config.hair_index + direction) % len(HAIR_STYLES)
        elif field == "race":
            self.config.race_index = (self.config.race_index + direction) % len(RACES)
        elif field == "outfit":
            self.config.outfit_index = (self.config.outfit_index + direction) % len(OUTFITS)

    def handle_event(self, event: pygame.event.Event):
        if event.type == pygame.KEYDOWN:
            if self.active_field == "name":
                if event.key == pygame.K_BACKSPACE:
                    self.text_buffer = self.text_buffer[:-1]
                elif event.key == pygame.K_RETURN:
                    self.config.name = self.text_buffer or "New Raven"
                    self.active_field = "hair"
                else:
                    if len(self.text_buffer) < 18 and event.unicode.isprintable():
                        self.text_buffer += event.unicode
            else:
                if event.key == pygame.K_LEFT:
                    self.cycle_option(self.active_field, -1)
                elif event.key == pygame.K_RIGHT:
                    self.cycle_option(self.active_field, 1)
                elif event.key in (pygame.K_UP, pygame.K_DOWN):
                    fields = ["hair", "race", "outfit"]
                    idx = fields.index(self.active_field)
                    self.active_field = fields[(idx + (1 if event.key == pygame.K_DOWN else -1)) % len(fields)]
                elif event.key == pygame.K_RETURN:
                    self.on_complete(self.config)
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            for button in self.buttons:
                button.handle_event(event)

    def draw_preview(self, surface: pygame.Surface):
        preview_center = (WIDTH * 3 // 4, HEIGHT // 2)
        base_color = (220, 210, 200)
        race_color = self.config.race[1]
        outfit_color = self.config.outfit[1]
        hair_color = self.config.hair[1]

        body = pygame.Rect(0, 0, 120, 200)
        body.center = preview_center
        pygame.draw.rect(surface, outfit_color, body, border_radius=16)

        head = pygame.Rect(0, 0, 120, 120)
        head.center = (preview_center[0], preview_center[1] - 140)
        pygame.draw.rect(surface, race_color, head, border_radius=40)

        hair_rect = pygame.Rect(0, 0, 140, 80)
        hair_rect.center = (head.centerx, head.centery - 50)
        pygame.draw.rect(surface, hair_color, hair_rect, border_radius=20)

        face_rect = pygame.Rect(0, 0, 80, 60)
        face_rect.center = head.center
        pygame.draw.rect(surface, base_color, face_rect, border_radius=20)

        eye_color = (20, 20, 40)
        for offset in (-20, 20):
            eye = pygame.Rect(0, 0, 18, 18)
            eye.center = (face_rect.centerx + offset, face_rect.centery)
            pygame.draw.rect(surface, eye_color, eye, border_radius=9)

        smile = pygame.Rect(0, 0, 60, 12)
        smile.center = (face_rect.centerx, face_rect.centery + 24)
        pygame.draw.arc(surface, (120, 40, 40), smile.inflate(0, 30), math.pi / 8, math.pi - math.pi / 8, 4)

    def draw(self, surface: pygame.Surface):
        surface.fill((10, 10, 20))
        title = TITLE_FONT.render("Character Creation", True, (220, 220, 230))
        surface.blit(title, title.get_rect(midtop=(WIDTH // 2, 20)))

        instructions = SMALL_FONT.render("Type your name, then use arrow keys to customize. Press Enter to confirm.", True, (200, 200, 200))
        surface.blit(instructions, instructions.get_rect(midtop=(WIDTH // 2, 90)))

        panel_rect = pygame.Rect(60, 140, WIDTH // 2 - 120, HEIGHT - 220)
        pygame.draw.rect(surface, (30, 30, 60), panel_rect, border_radius=16)

        label_y = panel_rect.top + 30
        name_label = FONT.render("Name", True, (240, 240, 250))
        surface.blit(name_label, (panel_rect.left + 20, label_y))
        name_box = pygame.Rect(panel_rect.left + 20, label_y + 40, panel_rect.width - 40, 40)
        pygame.draw.rect(surface, (20, 20, 40), name_box, border_radius=8)
        name_text = FONT.render(self.text_buffer if self.active_field == "name" else self.config.name, True, (220, 220, 230))
        surface.blit(name_text, name_text.get_rect(midleft=(name_box.left + 10, name_box.centery)))

        option_fields = [
            ("hair", "Hair Style", HAIR_STYLES, self.config.hair_index),
            ("race", "Heritage", RACES, self.config.race_index),
            ("outfit", "Outfit", OUTFITS, self.config.outfit_index),
        ]

        for field, label, data, idx in option_fields:
            label_y += 100
            field_label = FONT.render(label, True, (220, 220, 230))
            surface.blit(field_label, (panel_rect.left + 20, label_y))
            option_box = pygame.Rect(panel_rect.left + 20, label_y + 40, panel_rect.width - 40, 40)
            pygame.draw.rect(surface, (20, 20, 40), option_box, border_radius=8, width=2 if self.active_field == field else 0)
            option_text = FONT.render(data[idx][0], True, data[idx][1])
            surface.blit(option_text, option_text.get_rect(center=option_box.center))

        self.draw_preview(surface)
        for button in self.buttons:
            button.draw(surface)


@dataclass
class StoryChoice:
    text: str
    next_id: Optional[str]
    consequence: Optional[str] = None


@dataclass
class StoryNode:
    node_id: str
    speaker: str
    text: str
    choices: List[StoryChoice] = field(default_factory=list)
    grants_item: Optional[str] = None
    emotion: Optional[str] = None


class StoryManager:
    def __init__(self):
        self.nodes: Dict[str, StoryNode] = {}
        self.current_node_id: Optional[str] = None
        self.completed_nodes: List[str] = []
        self.inventory: List[str] = []

    def add_node(self, node: StoryNode):
        self.nodes[node.node_id] = node

    def start(self, node_id: str):
        self.current_node_id = node_id

    def choose(self, choice_index: int):
        node = self.nodes[self.current_node_id]
        choice = node.choices[choice_index]
        if node.grants_item and node.node_id not in self.completed_nodes:
            self.inventory.append(node.grants_item)
        self.completed_nodes.append(node.node_id)
        if choice.consequence:
            self.inventory.append(choice.consequence)
        self.current_node_id = choice.next_id

    def get_current_node(self) -> Optional[StoryNode]:
        if self.current_node_id is None:
            return None
        return self.nodes.get(self.current_node_id)


class Player:
    def __init__(self, config: CharacterConfig):
        self.config = config
        self.width = 36
        self.height = 60
        self.x = 100
        self.y = HEIGHT - 200
        self.vel_x = 0
        self.vel_y = 0
        self.on_ground = False
        self.speed = 4.2
        self.jump_force = 11

    @property
    def rect(self):
        return pygame.Rect(int(self.x), int(self.y), self.width, self.height)

    def move(self, dx: float, dy: float):
        self.x += dx
        self.y += dy

    def update(self, level_rects: List[pygame.Rect]):
        keys = pygame.key.get_pressed()
        self.vel_x = 0
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            self.vel_x = -self.speed
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            self.vel_x = self.speed
        if (keys[pygame.K_SPACE] or keys[pygame.K_w] or keys[pygame.K_UP]) and self.on_ground:
            self.vel_y = -self.jump_force
            self.on_ground = False

        self.vel_y += 0.6
        if self.vel_y > 12:
            self.vel_y = 12

        self._apply_movement(level_rects, self.vel_x, 0)
        self._apply_movement(level_rects, 0, self.vel_y)

    def _apply_movement(self, level_rects: List[pygame.Rect], dx: float, dy: float):
        self.x += dx
        self.y += dy
        player_rect = self.rect
        self.on_ground = False
        for rect in level_rects:
            if player_rect.colliderect(rect):
                if dx > 0:
                    self.x = rect.left - self.width
                elif dx < 0:
                    self.x = rect.right
                if dy > 0:
                    self.y = rect.top - self.height
                    self.vel_y = 0
                    self.on_ground = True
                elif dy < 0:
                    self.y = rect.bottom
                    self.vel_y = 0
                player_rect = self.rect

    def draw(self, surface: pygame.Surface, offset: pygame.Vector2):
        body_rect = self.rect.move(-offset.x, -offset.y)
        pygame.draw.rect(surface, self.config.outfit[1], body_rect)
        head_rect = pygame.Rect(body_rect.x, body_rect.y - 24, body_rect.width, 24)
        pygame.draw.rect(surface, self.config.race[1], head_rect)
        hair_rect = pygame.Rect(head_rect.x, head_rect.y - 10, head_rect.width, 12)
        pygame.draw.rect(surface, self.config.hair[1], hair_rect)


@dataclass
class NPC:
    name: str
    rect: pygame.Rect
    node_id: str
    color: Tuple[int, int, int]

    def draw(self, surface: pygame.Surface, offset: pygame.Vector2):
        npc_rect = self.rect.move(-offset.x, -offset.y)
        pygame.draw.rect(surface, self.color, npc_rect)
        label = SMALL_FONT.render(self.name, True, (240, 240, 250))
        surface.blit(label, label.get_rect(midbottom=(npc_rect.centerx, npc_rect.top - 6)))


class Level:
    def __init__(self):
        self.platforms = self._build_platforms()
        self.scenery = self._build_scenery()

    def _build_platforms(self) -> List[pygame.Rect]:
        base = [pygame.Rect(-400, HEIGHT - 120, 2200, 120)]
        steps = [
            pygame.Rect(200, HEIGHT - 220, 180, 24),
            pygame.Rect(440, HEIGHT - 280, 160, 24),
            pygame.Rect(700, HEIGHT - 200, 220, 24),
            pygame.Rect(1020, HEIGHT - 260, 180, 24),
            pygame.Rect(1320, HEIGHT - 180, 220, 24),
        ]
        balconies = [
            pygame.Rect(1650, HEIGHT - 320, 300, 20),
            pygame.Rect(2050, HEIGHT - 240, 200, 20),
            pygame.Rect(2400, HEIGHT - 160, 400, 20),
        ]
        return base + steps + balconies

    def _build_scenery(self):
        lamps = []
        for i in range(-3, 15):
            x = i * 180 + 50
            lamps.append((pygame.Rect(x, HEIGHT - 250, 20, 130), (50, 50, 80)))
        return lamps

    def draw(self, surface: pygame.Surface, offset: pygame.Vector2):
        surface.fill((12, 8, 24))
        moon = pygame.Rect(200 - offset.x * 0.5, 120, 180, 180)
        pygame.draw.ellipse(surface, (230, 230, 240), moon)
        stars = [(i * 140 % 2000, (i * 87) % 480) for i in range(60)]
        for star in stars:
            pygame.draw.circle(surface, (220, 220, 255), (int(star[0] - offset.x * 0.5), star[1]), 2)

        for rect in self.platforms:
            pygame.draw.rect(surface, (30, 30, 70), rect.move(-offset.x, -offset.y))
        for rect, color in self.scenery:
            pygame.draw.rect(surface, color, rect.move(-offset.x, -offset.y))


class DialogueBox:
    def __init__(self):
        self.rect = pygame.Rect(40, HEIGHT - 200, WIDTH - 80, 160)
        self.active_choice = 0

    def draw(self, surface: pygame.Surface, node: StoryNode):
        pygame.draw.rect(surface, (10, 10, 30), self.rect, border_radius=16)
        pygame.draw.rect(surface, (70, 70, 140), self.rect, 2, border_radius=16)

        speaker_text = FONT.render(node.speaker, True, (220, 220, 240))
        surface.blit(speaker_text, (self.rect.left + 16, self.rect.top + 14))

        wrapped = wrap_text(node.text, FONT, self.rect.width - 32)
        for i, line in enumerate(wrapped[:4]):
            label = SMALL_FONT.render(line, True, (200, 200, 220))
            surface.blit(label, (self.rect.left + 16, self.rect.top + 52 + i * 22))

        for i, choice in enumerate(node.choices):
            color = (240, 240, 240) if i == self.active_choice else (170, 170, 200)
            choice_label = SMALL_FONT.render(f"{i + 1}. {choice.text}", True, color)
            surface.blit(choice_label, (self.rect.left + 16, self.rect.top + 140 + i * 24))

    def handle_input(self, node: StoryNode) -> Optional[int]:
        keys = pygame.key.get_pressed()
        if keys[pygame.K_UP]:
            self.active_choice = max(0, self.active_choice - 1)
        if keys[pygame.K_DOWN]:
            self.active_choice = min(len(node.choices) - 1, self.active_choice + 1)
        return None

    def handle_event(self, event: pygame.event.Event, node: StoryNode) -> Optional[int]:
        if event.type == pygame.KEYDOWN:
            if pygame.K_1 <= event.key <= pygame.K_9:
                idx = event.key - pygame.K_1
                if idx < len(node.choices):
                    return idx
            if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                return self.active_choice
            if event.key == pygame.K_UP:
                self.active_choice = max(0, self.active_choice - 1)
            if event.key == pygame.K_DOWN:
                self.active_choice = min(len(node.choices) - 1, self.active_choice + 1)
        return None


def wrap_text(text: str, font: pygame.font.Font, max_width: int) -> List[str]:
    words = text.split()
    lines: List[str] = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if font.size(test)[0] <= max_width:
            current = test
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


class StoryWorld:
    def __init__(self, config: CharacterConfig):
        self.config = config
        self.player = Player(config)
        self.level = Level()
        self.story = StoryManager()
        self.dialogue_box = DialogueBox()
        self.camera = pygame.Vector2(0, 0)
        self.active_npc: Optional[NPC] = None
        self.npcs = self._build_npcs()
        self._build_story()
        self.current_chapter = "orientation"
        self.chapter_objectives = self._build_objectives()
        self.dialogue_cooldown = 0

    def _build_npcs(self) -> List[NPC]:
        return [
            NPC("Principal Weems", pygame.Rect(600, HEIGHT - 180, 40, 80), "intro_welcome", (160, 120, 200)),
            NPC("Enid", pygame.Rect(900, HEIGHT - 180, 40, 80), "enid_room", (220, 160, 200)),
            NPC("Ajax", pygame.Rect(1300, HEIGHT - 180, 40, 80), "ajax_greenhouse", (150, 200, 150)),
            NPC("Yoko", pygame.Rect(1700, HEIGHT - 240, 40, 80), "yoko_duel", (200, 80, 80)),
            NPC("Wednesday", pygame.Rect(2300, HEIGHT - 180, 40, 80), "wednesday_pact", (60, 60, 80)),
            NPC("Bianca", pygame.Rect(2600, HEIGHT - 180, 40, 80), "bianca_finale", (80, 120, 200)),
        ]

    def _build_objectives(self) -> Dict[str, str]:
        return {
            "orientation": "Check in with Principal Weems in the courtyard.",
            "roommate": "Find your dorm room with Enid.",
            "greenhouse": "Help Ajax calm the sentient vines.",
            "duel": "Train with Yoko for the Nightshade trials.",
            "pact": "Discuss your visions with Wednesday.",
            "finale": "Confront the creeping prophecy with Bianca.",
        }

    def _build_story(self):
        name = self.config.name
        self.story.add_node(
            StoryNode(
                "intro_welcome",
                "Principal Weems",
                f"Welcome to Nevermore Academy, {name}. The campus senses potential swirling around you. Are you ready to embrace your legacy?",
                [
                    StoryChoice("I was born ready.", "weems_orientation", "confidence"),
                    StoryChoice("I'm mostly here for answers.", "weems_answers", "curiosity"),
                ],
                grants_item="Student Crest",
                emotion="warm",
            )
        )

        self.story.add_node(
            StoryNode(
                "weems_orientation",
                "Principal Weems",
                "Confidence is admired, but remember: hubris feeds the Hyde. Collect your schedule from Enid before classes begin.",
                [
                    StoryChoice("Where can I find her?", "enid_hint"),
                    StoryChoice("Consider it done.", None),
                ],
            )
        )

        self.story.add_node(
            StoryNode(
                "weems_answers",
                "Principal Weems",
                "Answers come with a price. Enid Sinclair holds your dorm key. She is incapable of keeping secrets—use that."
                ,
                [
                    StoryChoice("I'll head out.", None),
                    StoryChoice("Any other warnings?", "weems_warning"),
                ],
            )
        )

        self.story.add_node(
            StoryNode(
                "weems_warning",
                "Principal Weems",
                "Stay away from the Nightshade Library after curfew. Its books whisper to those who listen—and they will call your name soon enough.",
                [StoryChoice("Noted.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "enid_hint",
                "Principal Weems",
                "She decorates the courtyard steps with glitter every full moon. Follow the sparkles.",
                [StoryChoice("Thanks.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "enid_room",
                "Enid",
                "Roomie! I already picked out bunks. You're top bunk because it has better moonlight selfies. What's your vibe tonight?",
                [
                    StoryChoice("Excited to explore.", "enid_explore"),
                    StoryChoice("Nervous about fitting in.", "enid_reassure"),
                    StoryChoice("Hoping to understand my visions.", "enid_visions"),
                ],
                grants_item="Dorm Key",
            )
        )

        self.story.add_node(
            StoryNode(
                "enid_explore",
                "Enid",
                "Then we totally have to sneak to the greenhouse. Ajax says the vines sing when the stars align—tonight!",
                [StoryChoice("Lead the way!", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "enid_reassure",
                "Enid",
                "Hey, everyone here is freaky in their own way. That's our charm. Come decorate the dorm with me after you grab your schedule.",
                [StoryChoice("Thanks, Enid.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "enid_visions",
                "Enid",
                "Visions? Okay, that's intense. Wednesday might have advice, if she graces us with words longer than three syllables.",
                [StoryChoice("I'll talk to her soon.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "ajax_greenhouse",
                "Ajax",
                "These vines won't chill. They keep spelling ominous messages. Can you try communing with them?",
                [
                    StoryChoice("Touch the vines.", "ajax_touch", "vine_whisper"),
                    StoryChoice("Cast a calming charm.", "ajax_charm", "calming_aura"),
                ],
            )
        )

        self.story.add_node(
            StoryNode(
                "ajax_touch",
                "Ajax",
                "Whoa, they like you! They spelled 'PROTECT THE RAVEN'. Creepy, but encouraging?",
                [StoryChoice("What raven?", None), StoryChoice("I'll stay alert.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "ajax_charm",
                "Ajax",
                "Your aura soothed them. They braided themselves into a shield around the greenhouse door. You're kind of a big deal.",
                [StoryChoice("Glad to help.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "yoko_duel",
                "Yoko",
                "Nightshade trials start at dusk. Show me how you stand your ground.",
                [
                    StoryChoice("Ready to spar.", "yoko_spar", "duelist"),
                    StoryChoice("I'd rather strategize.", "yoko_strategy", "tactician"),
                ],
            )
        )

        self.story.add_node(
            StoryNode(
                "yoko_spar",
                "Yoko",
                "Fast reflexes. If you ever need backup, call me. Gorgons owe their allies a favor—petrifyingly useful.",
                [StoryChoice("Appreciated.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "yoko_strategy",
                "Yoko",
                "Smart. Nightshades respect brains. Come to the library tonight—we'll chart the prophecy before it charts us.",
                [StoryChoice("I'll be there.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "wednesday_pact",
                "Wednesday",
                "Visions haunt me too. Mine sharpen with pain. Yours?",
                [
                    StoryChoice("Mine respond to music.", "wednesday_music", "melody_focus"),
                    StoryChoice("They're triggered by danger.", "wednesday_danger", "danger_sense"),
                    StoryChoice("I haven't mastered them yet.", "wednesday_uncertain"),
                ],
                grants_item="Raven Sigil",
            )
        )

        self.story.add_node(
            StoryNode(
                "wednesday_music",
                "Wednesday",
                "Interesting. The Hyde once hummed a funeral dirge before attacks. I'll ask Thing to steal sheet music from the conservatory.",
                [StoryChoice("Thank you?", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "wednesday_danger",
                "Wednesday",
                "Then we invite danger. Meet me at the Nightshade library after midnight. Bring salt and resolve.",
                [StoryChoice("I'll be ready.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "wednesday_uncertain",
                "Wednesday",
                "Doubt is a parasite. We'll excise it together. Don't be late tonight.",
                [StoryChoice("Understood.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "bianca_finale",
                "Bianca",
                "The prophecy threads converge on you. Choose how Nevermore stands: melody, danger, or secrets?",
                [
                    StoryChoice("Let music bind the students.", "final_music"),
                    StoryChoice("Prepare for the coming danger.", "final_danger"),
                    StoryChoice("Guard the secrets of the Nightshades.", "final_secret"),
                ],
            )
        )

        self.story.add_node(
            StoryNode(
                "final_music",
                "Narrator",
                "You orchestrate a midnight symphony. The Hyde, lulled by harmony, slumbers. Nevermore thrives in shared melody.",
                [StoryChoice("Live the encore.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "final_danger",
                "Narrator",
                "You and Wednesday forge a pact of vigilance. The prophecy becomes a warning etched into the academy's crest.",
                [StoryChoice("Stand guard.", None)],
            )
        )

        self.story.add_node(
            StoryNode(
                "final_secret",
                "Narrator",
                "Knowledge is your shield. In hidden archives you safeguard the Nightshade tomes, shaping destiny through secrecy.",
                [StoryChoice("Guard the archives.", None)],
            )
        )

    def update(self, dt: float):
        if self.dialogue_cooldown > 0:
            self.dialogue_cooldown -= dt
        self.player.update(self.level.platforms)
        self.camera.x = self.player.x - WIDTH / 2
        self.camera.y = self.player.y - HEIGHT / 2
        self.camera.x = max(-300, min(self.camera.x, 2000))
        self.camera.y = max(-100, min(self.camera.y, 40))

        if self.dialogue_cooldown <= 0 and pygame.key.get_pressed()[pygame.K_e]:
            for npc in self.npcs:
                if self.player.rect.colliderect(npc.rect.inflate(20, 20)):
                    self.active_npc = npc
                    self.story.start(npc.node_id)
                    self.dialogue_box.active_choice = 0
                    self.dialogue_cooldown = 0.5
                    break

    def draw(self, surface: pygame.Surface):
        self.level.draw(surface, self.camera)
        for npc in self.npcs:
            npc.draw(surface, self.camera)
        self.player.draw(surface, self.camera)
        self._draw_hud(surface)
        if self.active_npc:
            node = self.story.get_current_node()
            if node:
                self.dialogue_box.draw(surface, node)
            else:
                self.active_npc = None

    def handle_event(self, event: pygame.event.Event):
        if self.active_npc:
            node = self.story.get_current_node()
            if node:
                choice_index = self.dialogue_box.handle_event(event, node)
                if choice_index is not None:
                    choice = node.choices[choice_index]
                    self.story.choose(choice_index)
                    next_node = self.story.get_current_node()
                    if choice.next_id is None or next_node is None:
                        self.advance_chapter(node.node_id)
                        self.active_npc = None
                        self.story.current_node_id = None
        elif event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            self.active_npc = None

    def advance_chapter(self, completed_node_id: str):
        sequence = [
            "intro_welcome",
            "enid_room",
            "ajax_greenhouse",
            "yoko_duel",
            "wednesday_pact",
            "bianca_finale",
        ]
        if completed_node_id in sequence:
            idx = sequence.index(completed_node_id)
            if idx + 1 < len(sequence):
                next_chapter = [
                    "roommate",
                    "greenhouse",
                    "duel",
                    "pact",
                    "finale",
                ]
                self.current_chapter = next_chapter[min(idx, len(next_chapter) - 1)]
            else:
                self.current_chapter = "epilogue"

    def _draw_hud(self, surface: pygame.Surface):
        panel = pygame.Rect(20, 20, 360, 140)
        pygame.draw.rect(surface, (10, 10, 30), panel, border_radius=12)
        pygame.draw.rect(surface, (70, 70, 140), panel, 2, border_radius=12)
        title = SMALL_FONT.render(f"Student: {self.config.name}", True, (220, 220, 240))
        surface.blit(title, (panel.left + 12, panel.top + 12))
        race = SMALL_FONT.render(f"Heritage: {self.config.race[0]}", True, (200, 200, 220))
        surface.blit(race, (panel.left + 12, panel.top + 36))
        objective_text = wrap_text(self.chapter_objectives.get(self.current_chapter, "Explore Nevermore."), SMALL_FONT, panel.width - 24)
        for i, line in enumerate(objective_text):
            surface.blit(SMALL_FONT.render(line, True, (180, 180, 220)), (panel.left + 12, panel.top + 70 + i * 20))

        inventory_label = SMALL_FONT.render("Keepsakes:", True, (200, 200, 220))
        surface.blit(inventory_label, (panel.left + 12, panel.bottom - 28))
        inv_preview = ", ".join(self.story.inventory[-2:]) or "--"
        surface.blit(SMALL_FONT.render(inv_preview, True, (170, 170, 210)), (panel.left + 110, panel.bottom - 28))


class Menu:
    def __init__(self, start_callback):
        self.buttons: List[Button] = []
        self.start_callback = start_callback
        self._build_buttons()

    def _build_buttons(self):
        self.buttons = [
            Button(pygame.Rect(WIDTH // 2 - 120, HEIGHT // 2 - 30, 240, 60), "Start", self.start_callback),
            Button(pygame.Rect(WIDTH // 2 - 120, HEIGHT // 2 + 50, 240, 60), "Quit", lambda: sys.exit()),
        ]

    def handle_event(self, event: pygame.event.Event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            for button in self.buttons:
                button.handle_event(event)
        elif event.type == pygame.KEYDOWN and event.key == pygame.K_RETURN:
            self.start_callback()

    def draw(self, surface: pygame.Surface):
        surface.fill((5, 5, 15))
        title = TITLE_FONT.render("Nevermore Academy", True, (220, 220, 240))
        surface.blit(title, title.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 150)))
        subtitle = SMALL_FONT.render("A Wednesday Universe Story", True, (200, 200, 220))
        surface.blit(subtitle, subtitle.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 100)))
        for button in self.buttons:
            button.draw(surface)
        hint = SMALL_FONT.render("Press Enter to begin your first night.", True, (160, 160, 200))
        surface.blit(hint, hint.get_rect(center=(WIDTH // 2, HEIGHT - 60)))


class NevermoreGame:
    def __init__(self):
        self.state = GameState.MENU
        self.menu = Menu(self.start_character_creation)
        self.character_creator: Optional[CharacterCreator] = None
        self.world: Optional[StoryWorld] = None

    def start_character_creation(self):
        self.character_creator = CharacterCreator(self.start_story)
        self.state = GameState.CHARACTER_CREATION

    def start_story(self, config: CharacterConfig):
        self.world = StoryWorld(config)
        self.state = GameState.STORY

    def run(self):
        running = True
        while running:
            dt = CLOCK.tick(FPS) / 1000
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif self.state == GameState.MENU:
                    self.menu.handle_event(event)
                elif self.state == GameState.CHARACTER_CREATION:
                    self.character_creator.handle_event(event)
                elif self.state == GameState.STORY:
                    self.world.handle_event(event)

            if self.state == GameState.MENU:
                self.menu.draw(SCREEN)
            elif self.state == GameState.CHARACTER_CREATION:
                self.character_creator.draw(SCREEN)
            elif self.state == GameState.STORY:
                keys = pygame.key.get_pressed()
                if keys[pygame.K_ESCAPE]:
                    self.state = GameState.MENU
                    continue
                self.world.update(dt)
                self.world.draw(SCREEN)

            pygame.display.flip()

        pygame.quit()


if __name__ == "__main__":
    NevermoreGame().run()
