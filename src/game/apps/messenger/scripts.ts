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
