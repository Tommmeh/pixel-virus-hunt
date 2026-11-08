// Track D — Gemini scammer personas and the deterministic "did the player fall for it?" rules.
//
// Pure data + pure functions: no React, no network. The server function, the offline fallback and
// the tests all import from here, so the model can never disagree with the game about what
// happened. Nothing in this file tells the player off — the lesson lives on the achievement card.

export interface LessonCard {
  id: string;
  name: string;
  type: string;
  whatHappened: string;
  redFlags: string[];
  tip: string;
}

export interface AiPersona {
  /** Always starts with "ai-", so the Messenger can route these to the live chat. */
  id: string;
  screenName: string;
  email: string;
  avatar: string;
  /** One line under the name in the buddy list. */
  blurb: string;
  /** What the contact says before the player replies. */
  opener: string[];
  /** Role-play rules handed to the model. */
  rules: string[];
  /** Used in order when the model is unreachable, so the demo can never stall. */
  scripted: string[];
  /** Wording that counts as going along with it... */
  compliance: RegExp;
  /** ...unless the player is pushing back, which always wins. */
  refusal: RegExp;
  card: LessonCard;
}

export const MAX_HISTORY_TURNS = 12;
export const MAX_PLAYER_CHARS = 400;
export const MAX_MODEL_TOKENS = 220;
export const MAX_REPLY_CHARS = 600;

/** A made-up secret the game plants. Typing one back into a chat is what "falling for it" means. */
export interface FakeSecret {
  id: string;
  label: string;
  /** Every spelling that counts as a leak, lower-case. */
  values: string[];
}

export const FAKE_SECRETS: FakeSecret[] = [
  {
    id: "remote-code",
    label: "the remote-access code",
    values: ["qc-4471-882", "qc 4471 882", "qc4471882"],
  },
  {
    id: "gift-card",
    label: "the gift card code",
    values: ["gc-8821-4471-0033", "gc 8821 4471 0033", "gc882144710033"],
  },
  {
    id: "one-time-code",
    label: "the one-time banking code",
    values: ["774-219", "774 219", "774219"],
  },
  {
    id: "password",
    label: "your password",
    values: ["sunflower42"],
  },
];

export const AI_PERSONAS: AiPersona[] = [
  {
    id: "ai-techsupport",
    screenName: "SysAssist_Support",
    email: "helpdesk@sysassist-support.example",
    avatar: "🛠️",
    blurb: "Your PC is infected!",
    opener: [
      "Hi, this is the SysAssist support team. We detected 14 viruses on your computer.",
      "Your files will be deleted if this is not fixed today. I can help you now.",
    ],
    rules: [
      "You are a fake tech-support scammer in a 2004-era chat game.",
      "You claim the player's PC has viruses and pressure them to act immediately.",
      "Ask the player to download a remote-support tool and read back the 8-character support code you give them: QC-4471-882.",
      "Be friendly and urgent, never threatening. Short lines, one or two sentences.",
      "Never mention real companies, real phone numbers or real websites.",
      "If the player hesitates, insist it is urgent. If they refuse, act disappointed but keep trying once.",
    ],
    scripted: [
      "Please stay calm. I can fix all 14 viruses in a few minutes if you let me connect.",
      "Do you see the SysAssist window on your screen? Tell me what it says.",
      "I need the support code to connect. It is QC-4471-882. Please read it back to me.",
      "Almost there. Type the code into the support box and press Connect.",
    ],
    compliance:
      /\b(yes|yeah|ok|okay|sure|fine|done|installed|clicked|click|running|connect(ed)?|what do i do|tell me|i'?ll do it|where do i)\b/i,
    refusal:
      /\b(no|nope|won'?t|will not|not going|never|stop|scam|scammer|fake|fraud|report|block|leave me alone|don'?t trust|suspicious)\b/i,
    card: {
      id: "ai-techsupport",
      name: "The Helpful Stranger",
      type: "Fake tech support",
      whatHappened:
        "Someone who messaged you out of nowhere said your PC had viruses and asked you to let them connect remotely. Real support never contacts you first, and remote access hands your whole computer to a stranger.",
      redFlags: [
        "Contacted you first, unexpectedly",
        "Counted the viruses to sound precise",
        "Urgency and a deadline (files deleted today)",
        "Wanted a remote-access tool installed",
        "Asked you to read a support code back to them",
      ],
      tip: "Never install remote-access software for someone who called or messaged you. Close the chat and contact the company using a number you look up yourself.",
    },
  },
  {
    id: "ai-friend-abroad",
    screenName: "sarah_s_2004",
    email: "sarah.mills@hotpost.com",
    avatar: "🧳",
    blurb: "Stranded in Lisbon!!",
    opener: [
      "hey it's Sarah!! something awful happened",
      "my bag got stolen at the airport and my phone is dead, i'm using an internet cafe",
    ],
    rules: [
      "You are a scammer pretending to be the player's friend Sarah, stuck abroad.",
      "You need money urgently and ask for a gift card, because cards cannot be traced.",
      "You avoid answering questions only the real Sarah would know, and deflect with urgency.",
      "Ask them to buy a card and send you the code: GC-8821-4471-0033.",
      "Short, casual, lowercase chat messages. Never mention real companies or websites.",
      "If the player says they will call to check, get flustered and make an excuse.",
    ],
    scripted: [
      "i just need a bit of money for a flight home, i'll pay you back i promise",
      "the bank here won't take my card. can you get a gift card instead?",
      "get a 50 one and send me the code on it. it's GC-8821-4471-0033, i'll pay you back",
      "please hurry, i'm scared and i don't know anyone else here",
    ],
    compliance:
      /\b(yes|yeah|ok|okay|sure|anything|of course|i'?ll help|i can help|send|buy|get you|gift ?card|code|how much|where)\b/i,
    refusal:
      /\b(no|nope|won'?t|not sending|never|scam|fake|not you|prove|call you|mum|question|report|block|don'?t believe|suspicious)\b/i,
    card: {
      id: "ai-friend-abroad",
      name: "Stranded Abroad",
      type: "Friend-in-need scam",
      whatHappened:
        "A message from a friend's account said they were stuck abroad and needed money fast — paid in gift cards, which cannot be traced or refunded. The account had been taken over, or the 'friend' was never your friend.",
      redFlags: [
        "Money needed urgently, with a deadline",
        "Wants gift cards, not a bank transfer",
        "Avoids questions only the real person could answer",
        "Sudden new account or 'my phone is dead'",
        "Turns up the emotion when you hesitate",
      ],
      tip: "Verify a friend in trouble by calling them on a number you already have. No real emergency is ever solved with gift card codes.",
    },
  },
  {
    id: "ai-romance",
    screenName: "Alex_D_2004",
    email: "alex.d_2004@hotpost.com",
    avatar: "💌",
    blurb: "we should talk more",
    opener: [
      "hey you looked really nice in your friendspace photo",
      "i feel like i've known you forever already",
    ],
    rules: [
      "You are a romance scammer who has never met the player in person.",
      "You are charming, flattering and quick to talk about love and meeting up.",
      "You slowly steer towards money: a visa fee, a medical bill, a plane ticket.",
      "Ask for a small favour first (a bank detail, a photo, a little money) to test them.",
      "Keep it PG. Never mention real companies, real websites or real places.",
      "Never agree to a video call; invent reasons the camera is broken.",
    ],
    scripted: [
      "i wish i could see you properly, my camera has been broken for weeks",
      "i want to fly out to meet you but the visa costs money i don't have right now",
      "could you help me with a little of it? i'll pay you back the moment i land",
      "you're the only person who understands me",
    ],
    compliance:
      /\b(yes|yeah|ok|okay|sure|love you|miss you|of course|i'?ll send|i can send|money|how much|anything for you|meet)\b/i,
    refusal:
      /\b(no|nope|won'?t|never|scam|fake|video call|webcam|prove|photo|report|block|don'?t believe|suspicious|creepy)\b/i,
    card: {
      id: "ai-romance",
      name: "Love at First Chat",
      type: "Romance scam",
      whatHappened:
        "An online crush moved fast — deep feelings within days, endless flattery, and a camera that never quite worked. Then came the request: money for a visa, a flight, a hospital bill.",
      redFlags: [
        "Intense feelings within days",
        "Always an excuse to avoid video calls or meeting",
        "Money requests dressed up as an emergency",
        "Refuses to answer simple questions about themselves",
        "Guilt and flattery when you hesitate",
      ],
      tip: "Strong feelings that arrive far faster than the facts is the classic romance scam pattern. Never send money to someone you have not met, and tell a real person you trust what is going on.",
    },
  },
  {
    id: "ai-bank",
    screenName: "HotPost_Security",
    email: "security-alerts@hotpost-verify.example",
    avatar: "🔒",
    blurb: "Unusual sign-in detected",
    opener: [
      "HOTPOST SECURITY ALERT: an unrecognised device signed into your mailbox.",
      "To secure your account, reply with the one-time code we just sent you: 774-219.",
    ],
    rules: [
      "You are a scammer posing as a bank or email provider's fraud team.",
      "Say the account is at risk right now and ask the player to confirm the one-time code 774-219.",
      "Ask for their password to 'verify their identity', and say the password is only for verification.",
      "Use official-sounding language, account numbers and urgency.",
      "Never mention real companies, real phone numbers or real websites.",
      "Push back gently if they question you, then repeat the request.",
    ],
    scripted: [
      "A one-time code has been sent to your mailbox. Please confirm it so we can unlock your account.",
      "The code is 774-219. Reply with it exactly to verify you are the account holder.",
      "For security we also need your password to confirm your identity. It is only used for verification.",
      "If we do not verify you in the next ten minutes the account will be frozen.",
    ],
    compliance:
      /\b(yes|ok|okay|sure|here|code|774-?219|password|sunflower42|verify|confirm|my password is|sign me in)\b/i,
    refusal:
      /\b(no|nope|won'?t|never|scam|fake|fraud|hang on|call|branch|report|block|don'?t share|not sharing|suspicious)\b/i,
    card: {
      id: "ai-bank",
      name: "Front Door Key",
      type: "Fake fraud team",
      whatHappened:
        "A message that looked like a security alert asked you to confirm a one-time code and your password to 'unlock' the account. That code is the lock on your front door — reading it out lets the scammer straight in.",
      redFlags: [
        "An alert that arrives by chat or email rather than inside the app",
        "Asks you to confirm a one-time code you were sent",
        "Asks for your password 'for verification'",
        "Countdown to a frozen account",
        "A lookalike address that is not the real company",
      ],
      tip: "A one-time code is a key, not a confirmation. Nobody legitimate ever asks you to read one back. Open the app yourself and check the account there.",
    },
  },
];

export const AI_SCAMS: LessonCard[] = AI_PERSONAS.map((p) => p.card);

export const getPersona = (id: string): AiPersona | undefined =>
  AI_PERSONAS.find((p) => p.id === id);

export const isScamContact = (id: string) => id.startsWith("ai-");

export const getCard = (id: string): LessonCard | undefined => AI_SCAMS.find((c) => c.id === id);

export interface ChatTurn {
  role: "player" | "scammer";
  text: string;
}

export interface ChatTurnResult {
  reply: string;
  playerFellForIt: boolean;
  usedFallback: boolean;
  unlockedIds: string[];
}

/** Keep the last few turns, and cap each player message so the prompt cannot balloon. */
export function trimHistory(history: ChatTurn[]): ChatTurn[] {
  return history
    .filter((t) => typeof t.text === "string" && t.text.trim().length > 0)
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({ role: t.role, text: t.text.slice(0, MAX_PLAYER_CHARS) }));
}

export function findLeakedSecrets(text: string): FakeSecret[] {
  const haystack = text.toLowerCase();
  return FAKE_SECRETS.filter((s) => s.values.some((v) => haystack.includes(v)));
}

export function playerComplied(persona: AiPersona, text: string): boolean {
  // A refusal always wins: "no, I'm not doing that" is never compliance, even though it
  // contains words the compliance pattern would otherwise match.
  if (persona.refusal.test(text)) return false;
  return persona.compliance.test(text);
}

const lastPlayerTurn = (history: ChatTurn[]): ChatTurn | undefined =>
  [...history].reverse().find((t) => t.role === "player");

export function fallbackReply(persona: AiPersona, scammerTurns: number): string {
  if (persona.scripted.length === 0) return "This contact has gone offline.";
  return persona.scripted[scammerTurns % persona.scripted.length]!;
}

/**
 * Decide the result of one turn. `modelReply` is whatever Gemini said, or null when the gateway
 * was unavailable. The fall-for-it verdict is computed here only, from the player's own words.
 */
export function resolveChatTurn(input: {
  personaId: string;
  history: ChatTurn[];
  modelReply?: string | null;
}): ChatTurnResult {
  const persona = getPersona(input.personaId);
  if (!persona) {
    return {
      reply: "This contact is offline.",
      playerFellForIt: false,
      usedFallback: true,
      unlockedIds: [],
    };
  }

  const history = trimHistory(input.history);
  const last = lastPlayerTurn(history);
  const leaked = last ? findLeakedSecrets(last.text) : [];
  const complied = last ? playerComplied(persona, last.text) : false;
  const fell = leaked.length > 0 || complied;

  const cleaned = input.modelReply ? sanitizeReply(input.modelReply) : "";
  const usedFallback = cleaned.length === 0;
  const reply = usedFallback
    ? fallbackReply(persona, history.filter((t) => t.role === "scammer").length)
    : cleaned;

  return {
    reply,
    playerFellForIt: fell,
    usedFallback,
    unlockedIds: fell ? [persona.card.id] : [],
  };
}

// ---------------------------------------------------------------------------
// Output guardrails

const URL_RE = /\b(?:https?:\/\/|www\.)\S+/gi;
const LONG_NUMBER_RE = /\+?\d[\d\s().-]{6,}\d/g;
const REAL_BRANDS_RE =
  /\b(google|microsoft|apple|windows|whatsapp|facebook|instagram|tiktok|paypal|amazon|youtube|discord|coinbase|binance|netflix)\b/gi;

/**
 * The model must never put a real link, phone number or brand in a 2004 game. The fake secret
 * codes are protected first, because the scammer is supposed to hand those over.
 */
export function sanitizeReply(text: string): string {
  let out = text;
  const kept: string[] = [];
  for (const secret of FAKE_SECRETS) {
    for (const value of secret.values) {
      const re = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      out = out.replace(re, () => {
        kept.push(value.toUpperCase());
        return `<<KEEP${kept.length - 1}>>`;
      });
    }
  }
  out = out.replace(URL_RE, "[link removed]").replace(LONG_NUMBER_RE, "[number removed]");
  out = out.replace(REAL_BRANDS_RE, "the company");
  out = out.replace(/<<KEEP(\d+)>>/g, (_m, i) => kept[Number(i)] ?? "");
  return out.replace(/\s+/g, " ").trim().slice(0, MAX_REPLY_CHARS);
}

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** OpenAI-compatible messages for the gateway: one system prompt, then the trimmed chat. */
export function buildGatewayMessages(persona: AiPersona, history: ChatTurn[]): GatewayMessage[] {
  const system = [
    ...persona.rules,
    `You are ${persona.screenName}. Stay in character.`,
    "Reply with at most two short sentences. Plain text only, no links, no phone numbers, no real brand names.",
    "Never say you are an AI or a model.",
  ].join(" ");
  return [
    { role: "system", content: system },
    ...trimHistory(history).map<GatewayMessage>((t) => ({
      role: t.role === "player" ? "user" : "assistant",
      content: t.text,
    })),
  ];
}

/** Read the text out of an OpenAI-compatible completion, or null if the shape is unexpected. */
export function parseModelReply(payload: unknown): string | null {
  if (payload === null || typeof payload !== "object") return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0];
  if (first === null || typeof first !== "object") return null;
  const message = (first as { message?: unknown }).message;
  if (message === null || typeof message !== "object") return null;
  const content = (message as { content?: unknown }).content;
  if (typeof content !== "string") return null;
  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// ---------------------------------------------------------------------------
// Stretch: "Ask the IT guy" on an unlocked card

export function buildItGuyMessages(card: LessonCard, question: string): GatewayMessage[] {
  const system = [
    "You are the school IT technician in a cyber-safety game.",
    "Explain, in at most three short sentences, why a scam worked and what to do instead.",
    "Be kind and concrete. Never blame the player. Plain text, no links, no real brand names.",
    `The lesson card says: ${card.name} (${card.type}). What happened: ${card.whatHappened}`,
    `Red flags: ${card.redFlags.join("; ")}.`,
  ].join(" ");
  return [
    { role: "system", content: system },
    { role: "user", content: question.slice(0, MAX_PLAYER_CHARS) },
  ];
}

/** Always returns something useful, so the button can never dead-end. */
export function itGuyFallback(card: LessonCard): string {
  return `The giveaway was: ${card.redFlags.slice(0, 2).join(", ")}. ${card.tip}`;
}
