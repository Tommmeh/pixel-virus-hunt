// Scripted PingMe conversations: the contact says `them` lines, the player picks one of `choices`.
// `next: null` ends the conversation. Stage 2 can add quest conversations the same way.
export interface ChatChoice {
  text: string;
  next: string | null;
}

export interface ChatNode {
  id: string;
  them: string[];
  choices: ChatChoice[];
  /** Contact nudges the player when this node arrives. */
  nudge?: boolean;
}

export interface ChatScript {
  contact: string;
  start: string;
  /** If set, the contact starts the conversation this many ms after logging in. */
  opensAfterMs?: number;
  /**
   * Extra entry points for later beats with the same contact. These are only reached via
   * `continueConversation`, never by tapping through the conversation.
   */
  entries?: string[];
  nodes: ChatNode[];
}

export const SCRIPTS: ChatScript[] = [
  {
    contact: "alex",
    start: "hi",
    opensAfterMs: 25_000,
    nodes: [
      {
        id: "hi",
        them: ["hey!! u there?", "did u get my email about level 7"],
        nudge: true,
        choices: [
          { text: "yeah! how did you beat the boss?", next: "boss" },
          { text: "not yet, what's up?", next: "whatsup" },
        ],
      },
      {
        id: "boss",
        them: ["save ur shields till the 3rd phase", "then spam the laser. ez"],
        choices: [
          { text: "nice, I'll try that tonight", next: "tonight" },
          { text: "I'm still stuck on level 5 lol", next: "level5" },
        ],
      },
      {
        id: "whatsup",
        them: ["just bored. homework is so boring", "wanna play galaxy blasters later?"],
        choices: [
          { text: "sure, after dinner", next: "tonight" },
          { text: "can't, got the history essay", next: "essay" },
        ],
      },
      {
        id: "level5",
        them: ["haha level 5 is the worst", "go left at the asteroid field, trust me"],
        choices: [{ text: "thanks!", next: "tonight" }],
      },
      {
        id: "essay",
        them: ["ugh same. priya said she's nearly done hers", "ok gl!"],
        choices: [{ text: "cya", next: null }],
      },
      {
        id: "tonight",
        them: ["cool cool. brb mum's calling me for dinner"],
        choices: [{ text: "ok cya", next: null }],
      },
    ],
  },
  {
    contact: "priya",
    start: "open",
    nodes: [
      {
        id: "open",
        them: [],
        choices: [
          { text: "hey Priya! how's the art project going?", next: "art" },
          { text: "did you finish the history essay?", next: "history" },
        ],
      },
      {
        id: "art",
        them: [
          "Hi {name}! It's going well",
          "Can you bring the trip photos on Friday? I think they're on your USB stick",
        ],
        choices: [
          { text: "yep, they're in the Photos folder on it", next: "photos" },
          { text: "I'll check tonight", next: "photos" },
        ],
      },
      {
        id: "history",
        them: [
          "Almost! Just the conclusion left.",
          "My revision notes helped a lot. Did you make any?",
        ],
        choices: [
          { text: "yeah, they're on my USB stick", next: "photos" },
          { text: "not yet...", next: "photos" },
        ],
      },
      {
        id: "photos",
        them: ["Great, thanks! See you tomorrow :)"],
        choices: [{ text: "see you!", next: null }],
      },
    ],
  },
  {
    contact: "sam",
    start: "open",
    nodes: [
      {
        id: "open",
        them: [],
        choices: [
          { text: "hey cuz, good game last night?", next: "game" },
          { text: "are you coming to Grandma's on Sunday?", next: "sunday" },
        ],
      },
      {
        id: "game",
        them: ["(auto-reply) I'm at practice, back later!", "back now - yeah we won 54-48!!"],
        choices: [{ text: "nice one!!", next: "sunday" }],
      },
      {
        id: "sunday",
        them: ["yep, see you at Grandma's. bring Galaxy Blasters?"],
        choices: [
          { text: "definitely", next: null },
          { text: "only if you bring snacks", next: null },
        ],
      },
    ],
  },
  {
    contact: "mum",
    start: "open",
    nodes: [
      {
        id: "open",
        them: [],
        choices: [
          { text: "hi Mum, what's for dinner?", next: "dinner" },
          { text: "Mum, can I stay up late tonight?", next: "late" },
        ],
      },
      {
        id: "dinner",
        them: ["Hello love! Spaghetti tonight.", "Don't forget Grandma is coming on Sunday x"],
        choices: [{ text: "ok thanks Mum!", next: null }],
      },
      {
        id: "late",
        them: ["Only if your homework is done!", "And don't spend all night on that computer x"],
        choices: [
          { text: "it's done, promise", next: null },
          { text: "almost done...", next: null },
        ],
      },
    ],
  },
  {
    contact: "emma",
    start: "rent",
    entries: ["rent2"],
    nodes: [
      {
        id: "rent",
        them: [
          "Jamie? Are you at the computer?",
          "The rent went out this morning and it bounced. We're £340 short.",
        ],
        nudge: true,
        choices: [
          { text: "What? I thought we had enough this month", next: "enough" },
          { text: "How bad is it?", next: "bad" },
        ],
      },
      {
        id: "enough",
        them: [
          "So did I. The electric bill came in bigger than we thought.",
          "I've already spent the shopping money on it and it's only Tuesday.",
        ],
        choices: [{ text: "I'm sorry. I'll sort something out", next: "plan" }],
      },
      {
        id: "bad",
        them: [
          "£340, plus a £25 late fee if it's not in by Friday.",
          "I've been moving money around all morning and there's nothing left to move.",
        ],
        choices: [{ text: "We'll find it somehow", next: "plan" }],
      },
      {
        id: "plan",
        them: [
          "I'm not angry at you. I'm just tired of counting pennies every single week.",
          "Can you look at the account tonight and see what we've actually got?",
        ],
        choices: [
          { text: "Yeah. I'm on it, I promise", next: "goodnight" },
          { text: "I'll find the money by Friday", next: "goodnight" },
        ],
      },
      {
        id: "goodnight",
        them: ["Thank you ❤️", "I'm off to bed. Don't be up too late x"],
        choices: [{ text: "Night, love you", next: null }],
      },
      // Second beat, started by VideoVault's sign-in (see shell/QuestFlow.tsx): the prize mail
      // only arrives once Jamie has been through this and still won't take Marcus's money.
      {
        id: "rent2",
        them: [
          "Jamie. Are you still up?",
          "I rang Marcus this afternoon. I asked him to lend us the money.",
          "He said yes straight away. He'd have done it weeks ago if it was him asking.",
        ],
        nudge: true,
        choices: [
          { text: "You went behind my back?", next: "behind" },
          { text: "I told you I'd sort it", next: "sort" },
        ],
      },
      {
        id: "behind",
        them: [
          "Behind your back? I'm trying to keep a roof over our heads.",
          "He's your best friend, Jamie. He's not a stranger and he's not a charity case.",
        ],
        choices: [
          { text: "I don't want people knowing our business", next: "knows" },
          { text: "I know. I'm sorry", next: "sorry" },
        ],
      },
      {
        id: "sort",
        them: [
          "Sort it how? You said that last month and the month before.",
          "I've been through the account twice tonight. There's nothing left to move.",
        ],
        choices: [
          { text: "I've got a way to get the money", next: "way" },
          { text: "I'll find something. I always do", next: "find" },
        ],
      },
      {
        id: "knows",
        them: [
          "What business? We're £340 short and the rent's already bounced.",
          "Everyone already knows. The only person pretending otherwise is you.",
        ],
        choices: [{ text: "That's not fair", next: "worried" }],
      },
      {
        id: "sorry",
        them: [
          "Don't be sorry, be sensible. Sorry doesn't pay the landlord.",
          "He's sat on £400 he doesn't need. He offered it before I even finished asking.",
        ],
        choices: [{ text: "I'll think about it", next: "worried" }],
      },
      {
        id: "way",
        them: [
          "What way? What have you done?",
          "Jamie, tell me you haven't signed up for something stupid.",
        ],
        choices: [{ text: "It's nothing. It's fine", next: "worried" }],
      },
      {
        id: "find",
        them: [
          "Find it from where? There's nothing left to sell and I'm not asking my mum again.",
          "I'm not being cruel. I'm frightened, that's all.",
        ],
        choices: [{ text: "It'll be alright", next: "worried" }],
      },
      {
        id: "worried",
        them: [
          "I lay awake last night adding it up again. It doesn't work. However I do it, it doesn't work.",
          "I'm not shouting at you. I'm scared, and I'm tired of being the only one who says so.",
        ],
        choices: [
          { text: "Don't worry. I've got it covered", next: "stubborn" },
          { text: "I'm scared too, you know", next: "soft" },
        ],
      },
      {
        id: "stubborn",
        them: [
          "You always say that. Then you sit at that computer until 2am and nothing changes.",
          "Help is right there, Jamie. Marcus is right there. He's not going to think less of you.",
        ],
        choices: [
          { text: "I'm not taking his money", next: "final" },
          { text: "It's my job to provide. I'll handle it", next: "final" },
        ],
      },
      {
        id: "soft",
        them: [
          "Then let him help us. Please. It's one phone call.",
          "He's not keeping score. He's known you fifteen years.",
        ],
        choices: [
          { text: "I said no. I'll sort it myself", next: "final" },
          { text: "Alright. I'll think about it", next: "final" },
        ],
      },
      {
        id: "final",
        them: [
          "Fine. Have it your way.",
          "But if it's not in by Friday I'm ringing him myself, and I won't be asking this time.",
          "Goodnight. I love you, even when you're impossible.",
        ],
        choices: [{ text: "Night, Emma. Love you too", next: null }],
      },
    ],
  },
  {
    contact: "marcus",
    start: "lend",
    entries: ["threeDays", "checkin"],
    nodes: [
      {
        id: "lend",
        them: ["alright mate? you about?", "Emma rang me earlier. Said you're behind on the rent"],
        nudge: true,
        choices: [
          { text: "She told you that?", next: "told" },
          { text: "We're fine, honestly", next: "fine" },
        ],
      },
      {
        id: "told",
        them: [
          "yeah. she sounded really worried",
          "look, I've got £400 sat in savings doing nothing. take it, pay me back whenever",
        ],
        choices: [
          { text: "That's kind but we don't need it", next: "refuse" },
          { text: "No. I'll sort it myself", next: "proud" },
        ],
      },
      {
        id: "fine",
        them: [
          "don't give me that. I know what skint looks like",
          "I've got £400 I can lend you. seriously, it's no trouble",
        ],
        choices: [
          { text: "No thanks, we'll manage", next: "refuse" },
          { text: "I appreciate it but no", next: "proud" },
        ],
      },
      {
        id: "refuse",
        them: [
          "mate, it's not charity. it's a loan",
          "Emma says she doesn't know where the money's coming from",
        ],
        choices: [
          { text: "I'll get it. I've got a plan", next: "plan" },
          { text: "Just drop it, yeah?", next: "drop" },
        ],
      },
      {
        id: "proud",
        them: [
          "you're doing that thing where you'd rather drown than ask for help",
          "I've known you fifteen years. just let me help",
        ],
        choices: [
          { text: "I said no. We're fine", next: "plan" },
          { text: "I'm not taking your money", next: "drop" },
        ],
      },
      {
        id: "plan",
        them: [
          "ok. but the offer doesn't expire",
          "if it gets to Friday and you're still short, you ring me. promise?",
        ],
        choices: [
          { text: "Fine. I'll ring you", next: "goodbye" },
          { text: "It won't come to that", next: "goodbye" },
        ],
      },
      {
        id: "drop",
        them: ["alright, alright. I'll shut up about it", "but ring me if it changes. I mean it"],
        choices: [{ text: "Yeah. Thanks, Marcus", next: "goodbye" }],
      },
      {
        id: "goodbye",
        them: ["no worries. look after yourself, yeah?", "and say hi to Emma for me"],
        choices: [{ text: "Will do. See you", next: null }],
      },
      // Stage 2, started after the bad ending (see shell/QuestFlow.tsx).
      {
        id: "threeDays",
        them: [
          "morning mate. you about?",
          "emma rang me. she told me what happened to the account",
          "i'm not going to say i told you so. i'm just sorry",
          "listen — email your bank. don't ring them. you want it in writing",
        ],
        nudge: true,
        choices: [
          { text: "What do I even say to them?", next: "saywhat" },
          { text: "They'll just say it's my own fault", next: "fault" },
        ],
      },
      {
        id: "saywhat",
        them: [
          "short and boring. what happened, when, how much, and ask for their fraud team",
          "and don't send it to an address you got second-hand. take it off their own contact page",
          "it's support@copperleafbank.com — that's the one printed on their site",
          "then be a pain about it. they only move when you don't go away",
        ],
        choices: [{ text: "Alright. I'll email them now", next: "after" }],
      },
      {
        id: "fault",
        them: [
          "maybe. they'll try that on, they always do",
          "email them anyway and ask for the fraud team. support@copperleafbank.com, off their contact page",
          "keep every reply. don't let them close it quietly",
        ],
        choices: [{ text: "Okay. Email, not phone", next: "after" }],
      },
      {
        id: "after",
        them: [
          "good. and for what it's worth, they'll probably only give you part of it back",
          "take it anyway. then we talk about banks",
        ],
        choices: [{ text: "Thanks Marcus", next: null }],
      },
      {
        id: "checkin",
        them: [
          "did the bank ever ring you?",
          "been thinking about it all morning, didn't want to nag",
        ],
        choices: [{ text: "They gave me some of it back", next: "back" }],
      },
      {
        id: "back",
        them: [
          "how much?",
          "45%? that's more than i thought you'd get out of them",
          "right. switch accounts. rbc would never let that happen — they ring you before money leaves, not three days after",
          "install it from here and set it up properly: www.rbc.com/switch",
        ],
        choices: [
          { text: "Installing it now", next: "install" },
          { text: "You really think it'll make a difference?", next: "difference" },
        ],
      },
      {
        id: "install",
        them: [
          "good. do it before you talk yourself out of it",
          "and next time you're short on rent, just ask me. that's all i've been trying to say",
        ],
        choices: [{ text: "I will. Thanks mate", next: null }],
      },
      {
        id: "difference",
        them: [
          "yeah. rbc checks payments it doesn't recognise and rings you first",
          "it's slower where it matters. that's the whole point",
          "www.rbc.com/switch — install it and i'll stop going on about it",
        ],
        choices: [{ text: "Alright, installing it", next: null }],
      },
    ],
  },
  {
    contact: "jordan",
    start: "open",
    nodes: [
      {
        id: "open",
        them: [],
        choices: [{ text: "hey, what time is the match on Saturday?", next: "match" }],
      },
      {
        id: "match",
        them: ["10am at Riverside Park. you coming to watch?"],
        choices: [
          { text: "yeah I'll be there!", next: null },
          { text: "can't this week, good luck!", next: null },
        ],
      },
    ],
  },
];

export const getScript = (contact: string) => SCRIPTS.find((s) => s.contact === contact);
export const getNode = (script: ChatScript, id: string) => script.nodes.find((n) => n.id === id);
