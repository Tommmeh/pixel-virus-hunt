// Quest lines: how lesson cards are grouped into trophies on the Achievements shelf.
// A trophy unlocks when its line's `completeWhen` card is unlocked (via unlockScam in ./store) — there's no
// separate trophy state, so Start over / Reset clears trophies along with the cards.
// To add a quest line: write its LessonCards, add them to LESSON_CARDS (./cards.ts), then add an entry here.
import { AARON_CARDS, AARON_CARD_IDS } from "../storylines/aaron/cards";
import { ANISH_CARDS, ANISH_CARD_IDS } from "../storylines/anish/cards";
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
  /** The card whose unlock completes the line. */
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
    completeWhen: AARON_CARD_IDS.cleaned,
  },
  {
    id: "bank",
    name: "The Empty Account",
    icon: "bank",
    teaser: "Money's tight this month. Check your inbox...",
    cardIds: ANISH_CARDS.map((c) => c.id),
    completeWhen: ANISH_CARD_IDS.aftermath,
  },
  {
    id: "stocks",
    name: "The Hot Stock Tip",
    icon: "taskmgr",
    teaser: "A stock that's about to go to the moon...",
    cardIds: ZHUMING_CARDS.map((c) => c.id),
    completeWhen: ZHUMING_CARD_IDS.cleaned,
  },
  ...AI_PERSONAS.map((p) => ({
    id: p.id,
    name: p.card.name,
    icon: AI_ICONS[p.id] ?? "buddy",
    teaser: AI_TEASERS[p.id] ?? "Someone wants to chat on PingMe...",
    cardIds: [p.card.id],
    completeWhen: p.card.id,
  })),
];

type Unlocked = Record<string, number>;

export const isComplete = (line: QuestLine, unlocked: Unlocked) => line.completeWhen in unlocked;

export function progress(line: QuestLine, unlocked: Unlocked) {
  return { found: line.cardIds.filter((id) => id in unlocked).length, total: line.cardIds.length };
}

export const getQuestLine = (id: string) => QUEST_LINES.find((l) => l.id === id);
