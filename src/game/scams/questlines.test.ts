import { describe, expect, it } from "vitest";
import { AARON_CARD_IDS } from "../storylines/aaron/cards";
import { ANISH_CARDS } from "../storylines/anish/cards";
import { LESSON_CARDS } from "./cards";
import {
  getQuestLine,
  isCaught,
  isComplete,
  progress,
  QUEST_LINES,
  VIRUS_TOTAL,
  virusesCaught,
} from "./questlines";

describe("quest lines (trophies)", () => {
  it("has one trophy each for PhotoWorm, the bank line, the USB line and every chat scammer", () => {
    expect(QUEST_LINES.map((l) => l.id)).toEqual([
      "photoworm",
      "bank",
      "usb",
      "stocks",
      "ai-techsupport",
      "ai-friend-abroad",
      "ai-romance",
      "ai-bank",
    ]);
    const ids = QUEST_LINES.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("puts every lesson card in exactly one quest line", () => {
    const owners = LESSON_CARDS.map(
      (c) => QUEST_LINES.filter((l) => l.cardIds.includes(c.id)).length,
    );
    expect(owners.every((n) => n === 1)).toBe(true);
    const known = new Set(LESSON_CARDS.map((c) => c.id));
    for (const l of QUEST_LINES) {
      for (const id of l.cardIds) expect(known.has(id), `${l.id}: ${id}`).toBe(true);
      expect(l.cardIds, l.id).toContain(l.completeWhen);
      expect(l.teaser.trim(), l.id).not.toBe("");
    }
  });

  it("stays a silhouette until the line's final card, while counting clues found", () => {
    const worm = getQuestLine("photoworm")!;
    const partial = { [AARON_CARD_IDS.hackedFriend]: 1, [AARON_CARD_IDS.download]: 2 };
    expect(isComplete(worm, partial)).toBe(false);
    expect(progress(worm, partial)).toEqual({ found: 2, total: 5 });
    expect(isComplete(worm, { ...partial, [AARON_CARD_IDS.cleaned]: 3 })).toBe(true);
  });

  it("the bank line has its own cards and completes on the aftermath", () => {
    const bank = getQuestLine("bank")!;
    expect(bank.cardIds).toEqual(ANISH_CARDS.map((c) => c.id));
    expect(bank.completeWhen).toBe("bank-aftermath");
    for (const c of ANISH_CARDS) expect(c.id.startsWith("bank-"), c.id).toBe(true);
  });

  it("the virus counter: one per quest line, caught the moment you fall for it", () => {
    expect(VIRUS_TOTAL).toBe(QUEST_LINES.length);
    for (const l of QUEST_LINES) expect(l.cardIds, l.id).toContain(l.caughtWhen);
    expect(virusesCaught({})).toBe(0);
    const worm = getQuestLine("photoworm")!;
    // Seeing Mum's post isn't catching it; running the PhotoViewer is.
    expect(isCaught(worm, { [AARON_CARD_IDS.hackedFriend]: 1 })).toBe(false);
    expect(isCaught(worm, { [AARON_CARD_IDS.download]: 1 })).toBe(true);
    expect(virusesCaught({ [AARON_CARD_IDS.download]: 1, "ai-romance": 2 })).toBe(2);
  });

  it("every quest says where it starts (the virus counter's slots take you there)", () => {
    for (const l of QUEST_LINES) {
      expect(l.start, l.id).toBeTruthy();
      if (l.id.startsWith("ai-")) expect(l.start).toEqual({ kind: "chat", contact: l.id });
    }
    expect(getQuestLine("photoworm")!.start).toEqual({
      kind: "site",
      url: "http://www.friendspace.com/",
    });
    expect(getQuestLine("usb")!.start.kind).toBe("folder");
  });
});
