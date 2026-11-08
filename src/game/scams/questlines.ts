// Quest lines: one per virus / scam on the PC. They drive two things:
//  - the VIRUS COUNTER (the game's score): a line counts as "caught" the moment the player falls for it
//    (its `caughtWhen` card unlocks);
//  - the QUESTS shelf: the line's trophy unlocks when its `completeWhen` card does, and opens its lessons.
// Everything is read from the existing unlockScam cards (./store), so Start over / Reset clears it all.
// To add a quest line: write its LessonCards, add them to LESSON_CARDS (./cards.ts), then add an entry here.
import { AARON_CARDS, AARON_CARD_IDS } from "../storylines/aaron/cards";
import { ANISH_CARDS, ANISH_CARD_IDS } from "../storylines/anish/cards";
import { USB_CARDS, USB_CARD_IDS } from "../storylines/usb/cards";
import { ZHUMING_CARDS, ZHUMING_CARD_IDS } from "../storylines/zhuming/cards";
import { AI_PERSONAS } from "./ai";

export interface QuestLine {
  id: string;
  /** Shown once the trophy is unlocked. */
  name: string;
  /** PixelIcon name for the trophy's emblem. */
  icon: string;
  /** A vague hint shown on the silhouette, so it never spoils the scam. */
  teaser: string;
  /** Lesson cards in story order. */
  cardIds: string[];
  /** The card that unlocks when the player falls for it: the virus / scam is "caught" (counts toward the score). */
  caughtWhen: string;
  /** The card whose unlock completes the line (its trophy on the Quests shelf). */
  completeWhen: string;
}

const AI_ICONS: Record<string, string> = {
  "ai-techsupport": "phone",
  "ai-friend-abroad": "buddy",
  "ai-romance": "heart",
  "ai-bank": "lock",
};

const AI_TEASERS: Record<string, string> = {
  "ai-techsupport": "A stranger who really wants to help...",
  "ai-friend-abroad": "An old friend in a spot of trouble...",
  "ai-romance": "Someone new who seems too good to be true...",
  "ai-bank": "An urgent alert from 'security'...",
};

export const QUEST_LINES: QuestLine[] = [
  {
    id: "photoworm",
    name: "PhotoWorm",
    icon: "worm",
    teaser: "Something odd is going around FriendSpace...",
    cardIds: AARON_CARDS.map((c) => c.id),
    caughtWhen: AARON_CARD_IDS.download, // ran the "PhotoViewer"
    completeWhen: AARON_CARD_IDS.cleaned,
  },
  {
    id: "bank",
    name: "The Empty Account",
    icon: "bank",
    teaser: "Money's tight this month. Check your inbox...",
    cardIds: ANISH_CARDS.map((c) => c.id),
    caughtWhen: ANISH_CARD_IDS.giftCard, // signed in on the fake gift-card page
    completeWhen: ANISH_CARD_IDS.aftermath,
  },
  {
    id: "usb",
    name: "The USB Stick",
    icon: "usb",
    teaser: "There's a new file next to your photos...",
    cardIds: USB_CARDS.map((c) => c.id),
    caughtWhen: USB_CARD_IDS.doubleExtension, // opened holiday_03.jpg.exe
    completeWhen: USB_CARD_IDS.cleaned,
  },
  {
    id: "stocks",
    name: "The Hot Stock Tip",
    icon: "taskmgr",
    teaser: "A stock that's about to go to the moon...",
    cardIds: ZHUMING_CARDS.map((c) => c.id),
    caughtWhen: ZHUMING_CARD_IDS.app, // installed the trading app
    completeWhen: ZHUMING_CARD_IDS.cleaned,
  },
  ...AI_PERSONAS.map((p) => ({
    id: p.id,
    name: p.card.name,
    icon: AI_ICONS[p.id] ?? "buddy",
    teaser: AI_TEASERS[p.id] ?? "Someone wants to chat on PingMe...",
    cardIds: [p.card.id],
    caughtWhen: p.card.id, // went along with the scammer
    completeWhen: p.card.id,
  })),
];

type Unlocked = Record<string, number>;

export const isComplete = (line: QuestLine, unlocked: Unlocked) => line.completeWhen in unlocked;

/** Fell for it (or already finished it). */
export const isCaught = (line: QuestLine, unlocked: Unlocked) =>
  line.caughtWhen in unlocked || isComplete(line, unlocked);

/** The score: how many of the viruses / scams on the PC the player has caught. */
export const virusesCaught = (unlocked: Unlocked) =>
  QUEST_LINES.filter((l) => isCaught(l, unlocked)).length;

export const VIRUS_TOTAL = QUEST_LINES.length;

export function progress(line: QuestLine, unlocked: Unlocked) {
  return { found: line.cardIds.filter((id) => id in unlocked).length, total: line.cardIds.length };
}

export const getQuestLine = (id: string) => QUEST_LINES.find((l) => l.id === id);
