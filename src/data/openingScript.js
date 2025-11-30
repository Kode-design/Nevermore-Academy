export const openingScript = {
    // Initial Sequence handled by GameScene manually for now (Ding Dong timing),
    // but we can start the interactive part from the door choice.

    door_choice: {
        id: 'door_choice',
        type: 'choice',
        choices: [
            { text: 'Answer the door', next: 'path_answer' },
            { text: 'Ignore it', next: 'path_ignore' },
            { text: 'Peek with chain', next: 'path_peek' },
            { text: 'Say: "If it\'s Calder..."', next: 'path_comedy' }
        ]
    },

    // --- PATH 1: ANSWER ---
    path_answer: {
        id: 'path_answer',
        events: ['marcia_enter'],
        speaker: 'Narrator',
        text: 'He opens the door. Marcia stands there holding a small plastic bag full of carrot slices.',
        next: 'marcia_intro'
    },
    marcia_intro: {
        speaker: 'Marcia',
        text: 'Hello. Your mother told my mother who told me that I may enter your home anytime I wish to visit your rabbit. So I have arrived. For the rabbit.',
        next: 'kris_hi'
    },
    kris_hi: {
        speaker: 'Khristopher',
        text: '...Hi, Marcia.',
        next: 'marcia_offer'
    },
    marcia_offer: {
        speaker: 'Marcia',
        text: 'I also come with offerings. These carrots were the second-most recommended vegetable.',
        next: 'marcia_enter_req'
    },
    marcia_enter_req: {
        speaker: 'Marcia',
        text: 'Not important. May I enter?',
        next: 'choice_response_marcia'
    },
    choice_response_marcia: {
        type: 'choice',
        choices: [
            { text: 'Yeah, come in.', next: 'resp_A' },
            { text: 'My parents aren’t home.', next: 'resp_B' },
            { text: 'You… can’t just show up unannounced.', next: 'resp_C' },
            { text: 'Are you bribing my rabbit?', next: 'resp_D' },
            { text: 'Did you rehearse that speech?', next: 'resp_E' }
        ]
    },

    // Response A
    resp_A: {
        speaker: 'Khristopher',
        text: 'Yeah, come in.',
        events: ['marcia_walk_in_further'],
        next: 'resp_A_marcia'
    },
    resp_A_marcia: {
        speaker: 'Marcia',
        text: 'Thank you for your hospitality. Your home smells like detergent and sadness.',
        next: 'resp_A_kris'
    },
    resp_A_kris: {
        speaker: 'Khristopher',
        text: '...Thanks?',
        next: 'resp_A_marcia_2'
    },
    resp_A_marcia_2: {
        speaker: 'Marcia',
        text: 'Not an insult. Just data.',
        next: 'end_demo'
    },

    // --- PATH 2: IGNORE ---
    path_ignore: {
        id: 'path_ignore',
        speaker: 'Narrator',
        text: 'It’s silent.',
        next: 'ignore_marcia_1'
    },
    ignore_marcia_1: {
        speaker: 'Marcia (Hallway)',
        text: 'I know you are home because your rabbit made a vocalization of greeting.',
        next: 'ignore_silence'
    },
    ignore_silence: {
        speaker: 'Narrator',
        text: 'Silence.',
        next: 'ignore_marcia_2'
    },
    ignore_marcia_2: {
        speaker: 'Marcia (Hallway)',
        text: 'I will leave the carrots here. They are for him. Not for ants.',
        events: ['item_carrots'],
        next: 'end_demo'
    },

    // --- PATH 3: PEEK ---
    path_peek: {
        id: 'path_peek',
        speaker: 'Narrator',
        text: 'Khristopher opens the door just a crack. Marcia is practicing.',
        events: ['door_open_crack'],
        next: 'peek_marcia_1'
    },
    peek_marcia_1: {
        speaker: 'Marcia',
        text: 'Hello Khristopher, I have arrived to see your rabbit—No. Too robotic. Try again.',
        next: 'choice_peek'
    },
    choice_peek: {
        type: 'choice',
        choices: [
            { text: 'Open door mid-practice', next: 'peek_interrupt' },
            { text: 'Let her finish', next: 'peek_finish' },
            { text: 'Close the door silently', next: 'peek_close' }
        ]
    },
    peek_interrupt: {
        speaker: 'Khristopher',
        text: 'You good?',
        events: ['marcia_jump'],
        next: 'peek_interrupt_marcia'
    },
    peek_interrupt_marcia: {
        speaker: 'Marcia',
        text: 'OH! You opened prematurely.',
        next: 'end_demo'
    },

    // --- OTHER ---
    path_comedy: {
        speaker: 'Khristopher',
        text: 'If it’s Calder again asking for sugar, I swear—',
        next: 'end_demo'
    },

    end_demo: {
        speaker: 'System',
        text: 'Demo End. Relationship updated.',
        events: ['end_demo_event']
    }
};
