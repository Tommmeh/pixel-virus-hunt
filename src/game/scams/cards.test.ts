// Every lesson card (Gemini chats + storylines) must be unique and complete for the Achievements app.
import { describe, expect, it } from "vitest";
import { AARON_CARDS } from "../storylines/aaron/cards";
import { ANISH_CARDS } from "../storylines/anish/cards";
import { USB_CARDS } from "../storylines/usb/cards";
import { AI_SCAMS } from "./ai";
import { LESSON_CARDS } from "./cards";

describe("lesson cards", () => {
  it("include the chat scams and every storyline", () => {
    expect(LESSON_CARDS).toHaveLength(
      AI_SCAMS.length + AARON_CARDS.length + ANISH_CARDS.length + USB_CARDS.length,
    );
  });

  it("have unique ids", () => {
    const ids = LESSON_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("have everything the Achievements app shows", () => {
    for (const c of LESSON_CARDS) {
      expect(c.name.trim(), c.id).not.toBe("");
      expect(c.type.trim(), c.id).not.toBe("");
      expect(c.whatHappened.trim(), c.id).not.toBe("");
      expect(c.tip.trim(), c.id).not.toBe("");
      expect(c.redFlags.length, c.id).toBeGreaterThan(0);
    }
  });

  it("storyline cards are prefixed with their storyline", () => {
    for (const c of AARON_CARDS) expect(c.id.startsWith("aaron-"), c.id).toBe(true);
  });
});
