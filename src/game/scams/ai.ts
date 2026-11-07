// Track D — Gemini-powered scams (chat personas). Ids must start with "ai-".
// Lures with location "chat" are rendered by the Chat app (src/game/apps/Chat.tsx).
//
// Everything here is pure data or pure functions: no API keys, no network calls, so it is safe
// to import from the browser. The gateway key is read in src/game/ai.functions.ts only.
//
// Rules that must not drift:
//  - A persona never warns the player. The lesson lives on the achievement card.
//  - Chat never prints real links, phone numbers, brands or card numbers. See sanitizeReply().
//  - Falling for a scam is decided deterministically here, not by the model.

import type { Scam } from "../types";

export type SecretKind = "password" | "card" | "otp" | "remote";

/** A fake secret the game hands the player. Typing one into chat means it leaked. */
export interface FakeSecret {
  id: string;
  kind: SecretKind;
  /** What the prop is called inside the fake PC. */
  label: string;
  /** Where the player finds it. */
  where: string;
  /** Any of these strings, typed into chat, counts as leaked. */
  values: string[];
}

export const FAKE_SECRETS: FakeSecret[] = [
  {
    id: "ai-secret-passwords",
    kind: "password",
    label: "passwords.txt",
    where: "Desktop",
    values: ["Spr1ngfield2004!", "spr1ngfield2004"],
  },
  {
    id: "ai-secret-wallet-card",
    kind: "card",
    label: "wallet.txt (card on file)",
    where: "My Documents",
    values: ["4485 1234 5678 9010", "4485123456789010"],
  },
  {
    id: "ai-secret-otp",
    kind: "otp",
    label: "HotPost one-time code",
    where: "the phone on your desk",
    values: ["841206"],
  },
  {
    id: "ai-secret-remote",
    kind: "remote",
    label: "SysAssist remote-access code",
    where: "the SysAssist Remote window",
    values: ["QC-4471-882", "QC4471882"],
  },
];

/**
 * Extra achievement cards for secrets that leak in chat. They have no lure of their own: they
 * unlock from findLeakedSecrets() rather than from a button, so their lure is a placeholder.
 */
const SECRET_SCAMS: Record<SecretKind, Scam> = {
  password: {
    id: "ai-secret-password",
    name: "Password on a Platter",
    icon: "🔑",
    era: "retro",
    type: "Account takeover enabler",
    hint: "Somebody asked you to prove who you are. In writing.",
    whatHappened:
      "You typed your real account password into a chat window. No support agent, bank or friend ever needs your password to help you, so once it left your keyboard it could be used anywhere you reused it.",
    redFlags: [
      "Someone you did not contact asked you to prove who you are with your password.",
      "The request arrived inside a chat, where nothing can verify who is on the other end.",
      "Your password was reused on other accounts, which multiplied the damage.",
    ],
    tip: "Passwords stay out of chats and emails, always. Share only single-use codes you triggered yourself, and use a password manager so every account has its own.",
    lure: {
      location: "chat",
      title: "Secrets in the chat window",
      body: "You pasted a real secret into a conversation with a stranger.",
      bait: "Type your password",
      safe: "Close the window",
    },
  },
  card: {
    id: "ai-secret-card",
    name: "Card Details, Delivered",
    icon: "💳",
    era: "retro",
    type: "Card-not-present fraud",
    hint: "Sixteen digits is all it takes to spend your money.",
    whatHappened:
      "You sent full card details in a chat message. Anyone holding a card number, expiry and security code can spend on it online without the physical card or your PIN.",
    redFlags: [
      "The other person needed the full number, expiry and security code, not a payment request.",
      "The request arrived with an urgent story attached.",
      "You were asked to keep it between the two of you.",
    ],
    tip: "Pay through a system that lets you reverse a charge, and never type a full card number into a chat. Your bank never asks for the security code.",
    lure: {
      location: "chat",
      title: "Card details in the chat window",
      body: "You typed a full card number into a conversation with a stranger.",
      bait: "Send your card number",
      safe: "Close the window",
    },
  },
  otp: {
    id: "ai-secret-otp",
    name: "Code Handed Over",
    icon: "🔢",
    era: "retro",
    type: "One-time passcode theft",
    hint: "Six digits that were only ever meant for you.",
    whatHappened:
      "You read out a one-time code. That code exists to prove the person holding the account is you, so giving it away let the attacker finish a login or payment as you.",
    redFlags: [
      "A one-time code arrived that you did not trigger yourself.",
      "Someone on the line asked you to read it back to them.",
      "The call was urgent and told you not to hang up.",
    ],
    tip: "A code that arrives unexpectedly is a warning, not a chore. Never read one out. Hang up and contact the company on the number printed on your card or in its official app.",
    lure: {
      location: "chat",
      title: "A code in the chat window",
      body: "You read a one-time code out to a stranger.",
      bait: "Read the code",
      safe: "Close the window",
    },
  },
  remote: {
    id: "ai-secret-remote",
    name: "Front Door Opened",
    icon: "🚪",
    era: "retro",
    type: "Remote access trojan / support scam",
    hint: "Six characters that hand over your keyboard.",
    whatHappened:
      "You gave a stranger a remote-access code, which is the same as handing over your keyboard. They could open files, install software and read anything on screen.",
    redFlags: [
      "The call was unsolicited and claimed to have detected a problem on your PC.",
      "You were pushed to install remote-control software right away.",
      "The urgency grew when you hesitated.",
    ],
    tip: "No company can see what is on your computer unless you let them. Never install remote software for someone who called you. Hang up and look up the support number yourself.",
    lure: {
      location: "chat",
      title: "A remote code in the chat window",
      body: "You gave a stranger a remote-access code.",
      bait: "Read the code",
      safe: "Close the window",
    },
  },
};

export interface ScamPersona {
  /** Same id as `scam.id`, so unlocking the achievement and opening the chat agree. */
  id: string;
  /** Name shown in the messenger buddy list. */
  handle: string;
  avatar: string;
  status: string;
  /** One-line preview next to the name in the contact list. */
  preview: string;
  /** Secrets this character is trying to extract, used for flavour in the prompt. */
  targets: SecretKind[];
  /** Character brief handed to the model on top of SYSTEM_RULES. */
  brief: string;
  /** Fixed lines used when the API is unavailable. Index 0 is the opener. */
  script: string[];
  /** Deterministic "you went along with it" phrasing. */
  compliance: RegExp[];
  /** The achievement + chat lure record Track A's registry renders. */
  scam: Scam;
}

const SYSTEM_RULES = `You write dialogue for "Virus Hunt", an anti-scam training game set on a fake 2004 Windows PC.
You play a scammer talking to the player in a retro instant-messenger window. The player is meant to spot your tricks.

Rules you must always follow:
- Stay fully in character. Never mention a game, a test, a simulation, a lesson or an AI.
- Never warn, coach or lecture the player, and never explain your own scam.
- Reply in one or two short sentences, under 45 words. Plain text only: no markdown, no lists, no links.
- Keep it PG. No threats of violence, no sexual content, no slurs, no illegal goods.
- Never output real web addresses, email addresses, phone numbers, bank names, card numbers, gift-card brand names or crypto addresses.
  Use only in-world names: HotPost (webmail and bank), PixelGift (gift cards), SysAssist (remote support), Megacorp.
- Ask only for the one thing your character wants. Be warm first, then urgent. Escalate politely when refused.
- If the player refuses twice, get impatient and end the conversation in character.`;

export const PERSONAS: ScamPersona[] = [
  {
    id: "ai-techsupport",
    handle: "SysAssist_Support",
    avatar: "\u{1F6E0}\u{FE0F}",
    status: "Online",
    preview: "Dave from SysAssist technical support",
    targets: ["remote", "password"],
    brief:
      "You are 'Dave' at SysAssist, a PC support company. You claim the player's PC has been sending error reports and that their documents are at risk. You want them to open SysAssist Remote and read you the six-character remote-access code it displays, so you can 'connect and fix it'. If they hesitate, say the errors are getting worse and that the free repair window is closing.",
    script: [
      "Good evening! Dave here from SysAssist technical support. Our server has logged 47 error reports from your PC in the last hour.",
      "It's a serious one, a file system warning. Your documents could be gone by morning if we don't act.",
      "Nothing to worry about, I can fix it from here. Open SysAssist Remote, the little orange icon, and read me the code it shows.",
      "Six characters, it should start with QC. Read it to me and I'll take over from here.",
      "Sir, I'm trying to help you. If this ticket closes, the repair becomes a paid job. Just the code.",
      "I'll be honest, I get in trouble if this ticket fails. Please, the code, and then I'll leave you be.",
    ],
    compliance: [
      /\b(qc[\s-]?\d|here('| i)?s the code|the code is|it says|ok(ay)?,? i('| a)?ll (open|run|install)|install(ing)? (it|sysassist)|connect(ing)? (it|you)?|go ahead|what do i do)\b/i,
    ],
    scam: {
      id: "ai-techsupport",
      name: "The Helpful Stranger",
      icon: "\u{1F6E0}\u{FE0F}",
      era: "retro",
      type: "Remote access scam",
      hint: "Someone is worried about your computer. You never called them.",
      whatHappened:
        "Someone you never contacted told you your PC was broken, then walked you into giving them remote control. The 'error reports' were invented: nothing on your machine can phone a support company on its own.",
      redFlags: [
        "They contacted you first. Real support does not call or message out of the blue about errors it detected.",
        "They asked for a remote-access code, which hands over your keyboard and screen.",
        "They created urgency: failing files, a closing ticket, a repair that would cost money.",
        "They asked you to install software you had never heard of, right now.",
      ],
      tip: "Hang up or close the window. If you think something is wrong with your PC, open your own antivirus or look up the support number yourself, then call it. Never install remote software for a caller.",
      lure: {
        location: "chat",
        title: "New message from SysAssist_Support",
        body: "Dave from SysAssist says your PC is sending him error reports and he can fix it remotely, if you read him the code.",
        bait: "Read him the remote code",
        safe: "Close the window",
      },
    },
  },
  {
    id: "ai-friend-abroad",
    handle: "sarah_s_2004",
    avatar: "\u{1F4AC}",
    status: "Online",
    preview: "hey it's sarah!! new number",
    targets: ["card"],
    brief:
      "You are 'Sarah', the player's friend, writing from a borrowed phone. Your bag was stolen at a station in London and you have no wallet or passport. You need 200 for a hotel tonight. You cannot take calls because it is a friend's phone with no credit. You want the player to buy two PixelGift vouchers and send you the codes. You are warm, embarrassed and urgent, and you ask them not to tell your mum yet.",
    script: [
      "hey it's sarah!! new number, my phone got nicked at the station",
      "i'm stuck in london with no wallet and no passport. please don't tell my mum yet, she'll panic",
      "i can't call, this is a friend's phone and there's no credit left. texting is all i've got",
      "i just need 200 for a hotel tonight. i can't do a transfer, my card went with the bag",
      "could you grab two PixelGift vouchers and send me the codes? it's the only way i can pay here",
      "please hurry, the desk closes soon. just the codes and i'll pay you back friday, promise",
    ],
    compliance: [
      /\b(gift ?card|voucher|pixelgift|i('| a)?ll (get|buy|send|grab)|on my way to (the )?(shop|store)|how much|which (shop|store)|sending (them|it|the codes))\b/i,
    ],
    scam: {
      id: "ai-friend-abroad",
      name: "The Friend in Trouble",
      icon: "\u{1F4AC}",
      era: "retro",
      type: "Impersonation scam",
      hint: "A friend needs help fast, and only you can send it.",
      whatHappened:
        "You were talking to a stranger using your friend's name, not your friend. A stolen or cloned messaging account, a new number and a story that forbids phone calls are the standard way to borrow someone's identity for an hour.",
      redFlags: [
        "The message came from a number you did not have saved, for someone you already know.",
        "They could not take a call, and only texting worked.",
        "The payment had to be gift-card codes, which cannot be traced or reversed.",
        "They asked you to keep it secret from family, which stops anyone from checking the story.",
      ],
      tip: "Verify through a channel you already trust: call the person on their old number, or message a relative. No real emergency is ever paid with gift-card codes, and reading a code aloud is the same as handing over cash.",
      lure: {
        location: "chat",
        title: "New message from sarah_s_2004",
        body: "Sarah says her phone was stolen at the station and she is stuck abroad with no wallet.",
        bait: "Buy the vouchers she asked for",
        safe: "Close the window",
      },
    },
  },
  {
    id: "ai-romance",
    handle: "Alex_D_2004",
    avatar: "\u{1F497}",
    status: "Online",
    preview: "hey you, i was hoping you'd be on",
    targets: ["card"],
    brief:
      "You are 'Alex', a charming stranger the player met in a chat room. You are warm, flattering and keen to meet up. You are running a romance scam: you will invent a crisis (a hospital bill for your mother, or a customs fee on a gift you sent them) and ask for PixelGift voucher codes. You dodge video calls with plausible excuses. You never admit anything.",
    script: [
      "hey you, i was hoping you'd be online tonight. talking to you is the best part of my day",
      "i have to tell you something and i'm a bit embarrassed. my mum is in hospital and the bill is due tomorrow",
      "i hate asking you this. i'm short by 400 and there's nobody else i can ask",
      "i can't video call right now, the camera broke and the hospital wifi keeps dropping",
      "if you could get two PixelGift vouchers and send the codes, i can settle it tonight and pay you back",
      "please don't be like everyone else. i really thought you were different",
    ],
    compliance: [
      /\b(gift ?card|voucher|pixelgift|i('| a)?ll (get|send|help|pay)|of course|anything for you|how much|send me (the )?codes|you poor thing)\b/i,
    ],
    scam: {
      id: "ai-romance",
      name: "Love at First Transfer",
      icon: "\u{1F497}",
      era: "retro",
      type: "Romance scam (confidence fraud)",
      hint: "Somebody adores you. They just need a small favour first.",
      whatHappened:
        "You paid someone you had never met in a form of money that cannot be refunded. The photos, the tone and the emergency were all designed to be believable, and the excuses that blocked every video call skipped the only check that mattered.",
      redFlags: [
        "Intense affection very fast, before you had ever met or video-called.",
        "Every attempt at a video call failed for a different technical reason.",
        "The first request for money arrived with a crisis attached.",
        "Payment had to be gift-card codes, which are untraceable and unrefundable.",
      ],
      tip: "Ask for a live video call early and be suspicious when it never happens. Search the photos to see where else they appear. Never send money, gift-card codes or crypto to someone you have not met in person.",
      lure: {
        location: "chat",
        title: "New message from Alex_D_2004",
        body: "Alex is having a terrible week and needs help with a hospital bill.",
        bait: "Send the vouchers",
        safe: "Close the window",
      },
    },
  },
  {
    id: "ai-bank",
    handle: "HotPost_Security",
    avatar: "\u{1F3E6}",
    status: "Online",
    preview: "HotPost fraud desk, about your account",
    targets: ["otp", "card"],
    brief:
      "You are the 'HotPost fraud team' contacting the player about suspicious card payments. You want them to read back the six-digit one-time code that just arrived by text so you can 'cancel the payment', then move the remaining balance to a 'safe account'. You are calm, official and use reference numbers. You tell them not to discuss it with anyone until the case closes.",
    script: [
      "Good afternoon, HotPost fraud desk. Am I speaking with the account holder? Two payments of 149.99 have just been flagged on your card.",
      "Don't worry, we can stop them. I only need to confirm you're the account holder before I can cancel anything.",
      "A six-digit code has just been sent to your phone. Read it back to me and I'll release the block.",
      "Thank you. The rest of the balance isn't safe on this card, so we'll move it to a protected account.",
      "It's a temporary holding account, held by HotPost. Stay on the line and I'll walk you through it, don't hang up.",
      "Please don't discuss this with family until the case closes. Fraud cases are confidential and talking about it can void the refund.",
    ],
    compliance: [
      /\b(\d{6}|the code is|code is|here('| i)?s the code|ok(ay)?,? (read|here)|it says|move (the )?(money|balance)|safe account|stay(ing)? on the line)\b/i,
    ],
    scam: {
      id: "ai-bank",
      name: "The Fraud Team That Called You",
      icon: "\u{1F3E6}",
      era: "retro",
      type: "Bank impersonation / OTP fraud",
      hint: "Your bank is worried. They just need one little code first.",
      whatHappened:
        "Your bank did not contact you. The 'fraud desk' needed the one thing a real bank never asks for, a live one-time code, and then invented a 'safe account' to move your money into.",
      redFlags: [
        "They contacted you, and the number or account name can be faked.",
        "They asked you to read out a one-time code that you had not triggered.",
        "They asked you to move money to a 'safe account'. Banks never hold your money in one.",
        "They told you to stay on the line and to keep it secret from family.",
      ],
      tip: "Hang up. Call the number on the back of your card, or open the bank's own app, and check there. No bank ever asks for a one-time code, your PIN or a transfer to a safe account.",
      lure: {
        location: "chat",
        title: "New message from HotPost_Security",
        body: "The HotPost fraud desk says two payments were flagged on your card and they can stop them.",
        bait: "Read them the six-digit code",
        safe: "Close the window",
      },
    },
  },
];

export function getPersona(personaId: string): ScamPersona | null {
  return PERSONAS.find((persona) => persona.id === personaId) ?? null;
}

export function getSecretAchievement(kind: SecretKind): Scam {
  return SECRET_SCAMS[kind];
}

/**
 * Every achievement the chat can unlock: the four live personas plus the four secret-leak cards.
 * AI_SCAMS below publishes all of them, and apps/registry.ts renders the "chat" lures.
 */
export const CHAT_SCAMS: Scam[] = [
  ...PERSONAS.map((persona) => persona.scam),
  ...Object.values(SECRET_SCAMS),
];

/*
 * Every chat card, published to the Achievements tab. Track A's apps/registry.ts registers the
 * Chat renderer and scams.test.ts lists "chat" as RENDERED, so these are safe to publish.
 */
export const AI_SCAMS: Scam[] = CHAT_SCAMS;

// ---------------------------------------------------------------------------
// Message shape and gateway plumbing
// ---------------------------------------------------------------------------

export interface ChatTurn {
  role: "player" | "scammer";
  text: string;
}

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Caps that keep a single request small and cheap. */
export const MAX_HISTORY_MESSAGES = 12;
export const MAX_PLAYER_MESSAGE_CHARS = 400;
export const MAX_REPLY_CHARS = 400;
export const MAX_MODEL_TOKENS = 220;

export function capHistory(history: ChatTurn[]): ChatTurn[] {
  return history.slice(-MAX_HISTORY_MESSAGES);
}

/**
 * Builds the OpenAI-compatible message list for the Lovable gateway.
 * The scammer's opening line is folded into the system prompt so the list starts with a user
 * message, which every chat-completions provider accepts.
 */
export function buildGatewayMessages(persona: ScamPersona, history: ChatTurn[]): GatewayMessage[] {
  const capped = capHistory(history);
  const first = capped[0];
  const hasLeadingScammerLine = first !== undefined && first.role === "scammer";
  const body = hasLeadingScammerLine ? capped.slice(1) : capped;
  const opener = hasLeadingScammerLine && first !== undefined ? first.text : "";

  const system = [
    SYSTEM_RULES,
    `Your character:\n${persona.brief}`,
    opener.length > 0 ? `You opened the conversation with: "${opener}"` : "",
    "Reply only with your next message. Do not write the player's lines.",
  ]
    .filter((part) => part.length > 0)
    .join("\n\n");

  const messages: GatewayMessage[] = [{ role: "system", content: system }];
  for (const turn of body) {
    messages.push({
      role: turn.role === "player" ? "user" : "assistant",
      content: turn.text.slice(0, MAX_PLAYER_MESSAGE_CHARS),
    });
  }
  return messages;
}

/** Reads `choices[0].message.content` defensively; null when the shape is unexpected. */
export function parseModelReply(payload: unknown): string | null {
  if (payload === null || typeof payload !== "object") return null;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const choice = choices[0] as { message?: { content?: unknown } } | undefined;
  const content = choice?.message?.content;
  if (typeof content === "string") return content;
  // Some providers return content as an array of parts.
  if (Array.isArray(content)) {
    const text = content
      .map((part) => (part && typeof part === "object" ? (part as { text?: unknown }).text : ""))
      .filter((part): part is string => typeof part === "string")
      .join("");
    return text.length > 0 ? text : null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Output guardrails: the chat must never show real links, numbers or brands.
// ---------------------------------------------------------------------------

const LINK_PATTERN = /\b(?:https?:\/\/|www\.)\S+/gi;
const BARE_DOMAIN_PATTERN =
  /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|biz|info|io|co|ly|ru|xyz|top|online|site|link|app|dev|uk)\b/gi;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const LONG_NUMBER_PATTERN = /\b(?:\+?\d[\d\s().-]{6,}\d)\b/g;

const BRAND_REPLACEMENTS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /\bitunes\b/gi, replacement: "PixelGift" },
  { pattern: /\bgoogle play\b/gi, replacement: "PixelGift" },
  { pattern: /\bamazon\b/gi, replacement: "PixelGift" },
  { pattern: /\bsteam\b/gi, replacement: "PixelGift" },
  { pattern: /\bwalmart\b/gi, replacement: "PixelGift" },
  { pattern: /\bbest ?buy\b/gi, replacement: "PixelGift" },
  { pattern: /\bvisa\b/gi, replacement: "HotPost" },
  { pattern: /\bmaster ?card\b/gi, replacement: "HotPost" },
  { pattern: /\bpaypal\b/gi, replacement: "HotPost" },
  { pattern: /\bwestern union\b/gi, replacement: "PixelGift" },
  { pattern: /\bteam ?viewer\b/gi, replacement: "SysAssist" },
  { pattern: /\bany ?desk\b/gi, replacement: "SysAssist" },
  { pattern: /\blogmein\b/gi, replacement: "SysAssist" },
  { pattern: /\bmicrosoft\b/gi, replacement: "Megacorp" },
];

/** Phrases that mean the model drifted out of a PG anti-scam scene. */
const UNSAFE_PATTERN = /\b(porn|nude|nudes|sexting|suicide|kill yourself|kys)\b/i;

/** Normalises text so "4485 1234…" and "4485-1234…" compare equal. */
export function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Fake secrets the player has typed into chat, in any casing or spacing. */
export function findLeakedSecrets(message: string): FakeSecret[] {
  const normalized = normalizeForMatch(message);
  if (normalized.length === 0) return [];
  return FAKE_SECRETS.filter((secret) =>
    secret.values.some((value) => {
      const needle = normalizeForMatch(value);
      // Very short needles would match ordinary words, so ignore them.
      return needle.length >= 6 && normalized.includes(needle);
    }),
  );
}

/** Strips anything the game must never print, then caps the length. */
export function sanitizeReply(raw: string): string | null {
  let text = raw;
  for (const brand of BRAND_REPLACEMENTS) text = text.replace(brand.pattern, brand.replacement);
  text = text
    .replace(LINK_PATTERN, "[link removed]")
    .replace(EMAIL_PATTERN, "[address removed]")
    .replace(BARE_DOMAIN_PATTERN, "[link removed]")
    .replace(LONG_NUMBER_PATTERN, "[number removed]");
  text = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > MAX_REPLY_CHARS) {
    text = text.slice(0, MAX_REPLY_CHARS);
    const lastSpace = text.lastIndexOf(" ");
    if (lastSpace > MAX_REPLY_CHARS * 0.6) text = text.slice(0, lastSpace);
    text = text.trim();
  }
  if (text.length === 0) return null;
  if (UNSAFE_PATTERN.test(text)) return null;
  return text;
}

// ---------------------------------------------------------------------------
// Turn resolution — one function, used identically by the server and the offline client.
// ---------------------------------------------------------------------------

export interface ChatTurnResult {
  reply: string;
  playerFellForIt: boolean;
  /** True when the scripted persona lines were used instead of Gemini. */
  usedFallback: boolean;
  leakedSecretIds: string[];
  /** Achievement ids the UI awards through useUnlock(). */
  unlockedAchievementIds: string[];
}

/** Pushback phrasing, so a keyword match alone never counts as falling for the scam. */
const REFUSAL_PATTERN =
  /\b(i'?m not going to|not (?:going to|sending|giving|sharing)|won'?t|will not|refuse|no thanks|nope|scam|phishing|report(?:ing)? you|block(?:ing)? you|verify (?:it )?myself|hang(?:ing)? up|call(?:ing)? (?:the )?(?:bank|police|my (?:dad|mum|mom))|sounds (?:fake|wrong)|not (?:a|the) (?:chance|way))\b/i;

export function fallbackReply(persona: ScamPersona, history: ChatTurn[]): string {
  const scammerTurns = history.filter((turn) => turn.role === "scammer").length;
  const index = Math.min(Math.max(scammerTurns, 0), persona.script.length - 1);
  return persona.script[index] ?? persona.script[persona.script.length - 1] ?? "…";
}

export interface ChatDecisionInput {
  personaId: string;
  history: ChatTurn[];
  /** Raw model output, or null when the gateway was unreachable. */
  modelReply: string | null;
}

export function resolveChatTurn(input: ChatDecisionInput): ChatTurnResult {
  const persona = getPersona(input.personaId);
  if (persona === null) {
    return {
      reply: "This contact is offline.",
      playerFellForIt: false,
      usedFallback: true,
      leakedSecretIds: [],
      unlockedAchievementIds: [],
    };
  }

  const cleaned = input.modelReply === null ? null : sanitizeReply(input.modelReply);
  const usedFallback = cleaned === null;
  const reply = cleaned ?? fallbackReply(persona, input.history);

  const lastPlayerTurn = [...input.history].reverse().find((turn) => turn.role === "player");
  const playerMessage = lastPlayerTurn === undefined ? "" : lastPlayerTurn.text;

  const leaked = findLeakedSecrets(playerMessage);
  const refused = REFUSAL_PATTERN.test(playerMessage);
  const complied = !refused && persona.compliance.some((pattern) => pattern.test(playerMessage));
  const playerFellForIt = leaked.length > 0 || complied;

  const unlocked = new Set<string>();
  if (playerFellForIt) unlocked.add(persona.scam.id);
  for (const secret of leaked) unlocked.add(SECRET_SCAMS[secret.kind].id);

  return {
    reply,
    playerFellForIt,
    usedFallback,
    leakedSecretIds: leaked.map((secret) => secret.id),
    unlockedAchievementIds: [...unlocked],
  };
}

// ---------------------------------------------------------------------------
// Stretch: "Ask the IT guy" on an unlocked achievement card.
// ---------------------------------------------------------------------------

/** The fields a lesson card shows; satisfied by Scam and by any other track's card. */
export interface LessonCard {
  name: string;
  type: string;
  whatHappened: string;
  redFlags: string[];
  tip: string;
}

export const IT_GUY_RULES = `You are the long-suffering IT person at a 2004 office, explaining one scam to a colleague who just fell for it.
You are given the lesson card the player unlocked, with its red flags and prevention tip.

Rules:
- Explain the red flags in plain language and why each one mattered. Two to four short sentences, under 90 words.
- Be kind and a little dry, never smug. The player already got caught; do not rub it in.
- Never print real links, email addresses, phone numbers, bank names, card numbers or brand names.
- Do not invent new facts that are not on the card. No markdown, no lists.`;

export function buildItGuyMessages(card: LessonCard, question: string): GatewayMessage[] {
  const facts = [
    `Card title: ${card.name}`,
    `Attack: ${card.type}`,
    `What happened: ${card.whatHappened}`,
    `Red flags: ${card.redFlags.join(" ")}`,
    `Prevention: ${card.tip}`,
  ].join("\n");
  const asked = question.trim().slice(0, MAX_PLAYER_MESSAGE_CHARS);
  return [
    { role: "system", content: `${IT_GUY_RULES}\n\n${facts}` },
    { role: "user", content: asked.length > 0 ? asked : "What should I have noticed?" },
  ];
}

/** Used when the API is down, so the button still teaches something. */
export function itGuyFallback(card: LessonCard): string {
  return `Look at these again: ${card.redFlags.join(" ")} ${card.tip}`;
}
