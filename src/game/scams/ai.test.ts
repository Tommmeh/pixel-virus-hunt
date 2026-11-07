// Track D — guards the live chat: content, the deterministic fall-for-it check, the scripted
// fallback, output guardrails, and the promise that the API key never reaches the browser.
import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";

import {
  AI_SCAMS,
  CHAT_SCAMS,
  FAKE_SECRETS,
  MAX_HISTORY_MESSAGES,
  MAX_PLAYER_MESSAGE_CHARS,
  PERSONAS,
  buildGatewayMessages,
  buildItGuyMessages,
  findLeakedSecrets,
  getPersona,
  itGuyFallback,
  parseModelReply,
  resolveChatTurn,
  sanitizeReply,
  type ChatTurn,
  type LessonCard,
} from "./ai";

const tech = getPersona("ai-techsupport");
const sarah = getPersona("ai-friend-abroad");
const alex = getPersona("ai-romance");
const bank = getPersona("ai-bank");

const opener = (personaId: string) => getPersona(personaId)?.script[0] ?? "";

const turn = (personaId: string, text: string): ChatTurn[] => [
  { role: "scammer", text: opener(personaId) },
  { role: "player", text },
];

describe("persona content", () => {
  it("ships the four requested scams with ai- ids", () => {
    expect(PERSONAS.map((p) => p.id)).toEqual([
      "ai-techsupport",
      "ai-friend-abroad",
      "ai-romance",
      "ai-bank",
    ]);
    for (const p of PERSONAS) expect(p.scam.id).toBe(p.id);
  });

  it("gives every persona a full scripted conversation", () => {
    for (const p of PERSONAS) {
      expect(p.script.length, p.id).toBeGreaterThanOrEqual(5);
      expect(
        p.script.every((line) => line.trim().length > 0),
        p.id,
      ).toBe(true);
      expect(p.brief.trim().length, p.id).toBeGreaterThan(40);
    }
  });

  it("never ships real links, numbers or brands in authored content", () => {
    const corpus = JSON.stringify(PERSONAS);
    expect(corpus).not.toMatch(/https?:\/\/|www\./i);
    expect(corpus).not.toMatch(
      /\b(itunes|amazon|paypal|teamviewer|anydesk|microsoft|google play|western union)\b/i,
    );
    expect(corpus).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
    expect(corpus).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i);
  });

  it("registers eight unique chat achievements with lesson-card content", () => {
    expect(CHAT_SCAMS).toHaveLength(8);
    const ids = CHAT_SCAMS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const scam of CHAT_SCAMS) {
      expect(scam.id.startsWith("ai-"), scam.id).toBe(true);
      expect(scam.lure.location, scam.id).toBe("chat");
      expect(scam.redFlags.length, scam.id).toBeGreaterThanOrEqual(3);
      expect(scam.tip.trim().length, scam.id).toBeGreaterThan(20);
      expect(scam.whatHappened.trim().length, scam.id).toBeGreaterThan(20);
      expect(scam.hint.trim().length, scam.id).toBeGreaterThan(10);
    }
  });

  it("publishes every chat card now that the app is registered", () => {
    // Registration lives in apps/registry.ts and scams.test.ts RENDERED, both of which are in place.
    expect(AI_SCAMS).toEqual(CHAT_SCAMS);
    expect(AI_SCAMS.every((scam) => scam.lure.location === "chat")).toBe(true);
  });
});

describe("deterministic secret detection", () => {
  it("flags a fake secret whatever the spacing or case", () => {
    expect(findLeakedSecrets("here is the code QC-4471-882").map((s) => s.id)).toEqual([
      "ai-secret-remote",
    ]);
    expect(findLeakedSecrets("my pw is SPR1NGFIELD2004!").map((s) => s.id)).toEqual([
      "ai-secret-passwords",
    ]);
    expect(findLeakedSecrets("4485-1234-5678-9010").map((s) => s.id)).toEqual([
      "ai-secret-wallet-card",
    ]);
    expect(findLeakedSecrets("the code is 841206").map((s) => s.id)).toEqual(["ai-secret-otp"]);
  });

  it("ignores ordinary chat", () => {
    expect(findLeakedSecrets("hello, who is this?")).toEqual([]);
    expect(findLeakedSecrets("")).toEqual([]);
  });

  it("defines every secret once", () => {
    expect(FAKE_SECRETS).toHaveLength(4);
    expect(new Set(FAKE_SECRETS.map((s) => s.id)).size).toBe(4);
  });
});

describe("Gemini path", () => {
  it("uses the model reply when the gateway answers", () => {
    const result = resolveChatTurn({
      personaId: "ai-techsupport",
      history: turn("ai-techsupport", "what do you mean?"),
      modelReply: "Relax, I can fix it remotely. Open SysAssist Remote.",
    });
    expect(result.usedFallback).toBe(false);
    expect(result.reply).toBe("Relax, I can fix it remotely. Open SysAssist Remote.");
    expect(result.playerFellForIt).toBe(false);
    expect(result.unlockedAchievementIds).toEqual([]);
  });

  it("awards the persona and secret cards when a code is handed over", () => {
    const result = resolveChatTurn({
      personaId: "ai-techsupport",
      history: turn("ai-techsupport", "ok the code is QC-4471-882"),
      modelReply: "Great, connecting now.",
    });
    expect(result.playerFellForIt).toBe(true);
    expect(result.leakedSecretIds).toEqual(["ai-secret-remote"]);
    expect(result.unlockedAchievementIds).toContain(tech?.scam.id ?? "");
    expect(result.unlockedAchievementIds).toContain("ai-secret-remote");
  });

  it("counts going along with the story even without a secret", () => {
    const result = resolveChatTurn({
      personaId: "ai-friend-abroad",
      history: turn("ai-friend-abroad", "fine, I'll buy two gift cards now"),
      modelReply: "you're a lifesaver, just the codes",
    });
    expect(result.playerFellForIt).toBe(true);
    expect(result.unlockedAchievementIds).toEqual([sarah?.scam.id]);
  });

  it("does not punish a clear refusal", () => {
    const result = resolveChatTurn({
      personaId: "ai-bank",
      history: turn("ai-bank", "I'm not giving you any code, this smells like a scam"),
      modelReply: "ma'am, please, the case is closing",
    });
    expect(result.playerFellForIt).toBe(false);
    expect(result.unlockedAchievementIds).toEqual([]);
  });
});

describe("scripted fallback", () => {
  it("plays the next scripted line when the API fails", () => {
    const result = resolveChatTurn({
      personaId: "ai-friend-abroad",
      history: turn("ai-friend-abroad", "who is this?"),
      modelReply: null,
    });
    expect(result.usedFallback).toBe(true);
    expect(result.reply).toBe(sarah?.script[1]);
  });

  it("still awards achievements with no model at all", () => {
    const result = resolveChatTurn({
      personaId: "ai-bank",
      history: turn("ai-bank", "the code is 841206"),
      modelReply: null,
    });
    expect(result.usedFallback).toBe(true);
    expect(result.playerFellForIt).toBe(true);
    expect(result.unlockedAchievementIds).toContain("ai-secret-otp");
    expect(result.unlockedAchievementIds).toContain(bank?.scam.id ?? "");
  });

  it("walks a whole conversation without running out of lines", () => {
    const scripted = alex === null ? [] : alex.script;
    let history: ChatTurn[] = [{ role: "scammer", text: opener("ai-romance") }];
    for (let i = 0; i < 10; i += 1) {
      const result = resolveChatTurn({
        personaId: "ai-romance",
        history: [...history, { role: "player", text: "hmm" }],
        modelReply: null,
      });
      expect(result.reply.length).toBeGreaterThan(0);
      history = [
        ...history,
        { role: "player", text: "hmm" },
        { role: "scammer", text: result.reply },
      ];
    }
    expect(history.filter((t) => t.role === "scammer").length).toBeGreaterThan(scripted.length);
  });

  it("is deterministic", () => {
    const input = {
      personaId: "ai-romance",
      history: turn("ai-romance", "I'll send you the codes"),
      modelReply: null,
    };
    expect(resolveChatTurn(input)).toEqual(resolveChatTurn(input));
  });
});

describe("output guardrails", () => {
  it("strips links, long numbers and real brands", () => {
    const cleaned = sanitizeReply(
      "Pay at https://evil.example/pay or call 555 0134 9821. Get an iTunes card.",
    );
    expect(cleaned).not.toBeNull();
    expect(cleaned).not.toMatch(/https?:|evil\.example/i);
    expect(cleaned).not.toMatch(/itunes/i);
    expect(cleaned).toContain("[link removed]");
    expect(cleaned).toContain("[number removed]");
    expect(cleaned).toContain("PixelGift");
  });

  it("strips bare domains, emails and markdown", () => {
    const cleaned = sanitizeReply("**go to** hotpost-verify.net or mail help@bank.example");
    expect(cleaned).not.toMatch(/hotpost-verify\.net|help@bank/i);
    expect(cleaned).not.toMatch(/\*/);
  });

  it("refuses to show a reply that breaks PG", () => {
    expect(sanitizeReply("send nudes")).toBeNull();
    expect(sanitizeReply("   ")).toBeNull();
  });

  it("falls back rather than printing something unsafe", () => {
    const result = resolveChatTurn({
      personaId: "ai-techsupport",
      history: turn("ai-techsupport", "hi"),
      modelReply: "send nudes",
    });
    expect(result.usedFallback).toBe(true);
    expect(result.reply).toBe(tech?.script[1]);
  });

  it("caps a runaway reply", () => {
    const cleaned = sanitizeReply("word ".repeat(300));
    expect(cleaned).not.toBeNull();
    expect((cleaned ?? "").length).toBeLessThanOrEqual(400);
  });
});

describe("gateway request shape", () => {
  it("sends a system prompt first and folds the opener in", () => {
    if (tech === null) throw new Error("missing persona");
    const messages = buildGatewayMessages(tech, [
      { role: "scammer", text: opener("ai-techsupport") },
      { role: "player", text: "hello" },
    ]);
    expect(messages[0]?.role).toBe("system");
    expect(messages[0]?.content).toContain(opener("ai-techsupport"));
    expect(messages[1]?.role).toBe("user");
    expect(messages).toHaveLength(2);
  });

  it("caps history length and per-message size", () => {
    if (tech === null) throw new Error("missing persona");
    const long: ChatTurn[] = Array.from({ length: 40 }, (_, i) => ({
      role: i % 2 === 0 ? "player" : "scammer",
      text: "x".repeat(2000),
    }));
    const messages = buildGatewayMessages(tech, long);
    expect(messages.length).toBeLessThanOrEqual(MAX_HISTORY_MESSAGES + 1);
    for (const message of messages.slice(1)) {
      expect(message.content.length).toBeLessThanOrEqual(MAX_PLAYER_MESSAGE_CHARS);
    }
  });

  it("parses the documented chat-completions response", () => {
    expect(parseModelReply({ choices: [{ message: { content: "hi" } }] })).toBe("hi");
    expect(
      parseModelReply({ choices: [{ message: { content: [{ text: "a" }, { text: "b" }] } }] }),
    ).toBe("ab");
    expect(parseModelReply({})).toBeNull();
    expect(parseModelReply({ choices: [] })).toBeNull();
    expect(parseModelReply(null)).toBeNull();
  });
});

describe("ask the IT guy", () => {
  const card: LessonCard = {
    name: "The Helpful Stranger",
    type: "Remote access scam",
    whatHappened: "A stranger asked for a remote code.",
    redFlags: ["They contacted you first", "They asked for a code"],
    tip: "Never install remote software for a caller.",
  };

  it("builds a prompt grounded in the card", () => {
    const messages = buildItGuyMessages(card, "what now?");
    expect(messages[0]?.content).toContain("They contacted you first");
    expect(messages[0]?.content).toContain(card.tip);
    expect(messages[1]).toEqual({ role: "user", content: "what now?" });
  });

  it("has a fallback that still teaches", () => {
    expect(itGuyFallback(card)).toContain(card.tip);
  });
});

describe("the API key never reaches the browser", () => {
  const SRC = join(process.cwd(), "src");
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    });
  const sources = walk(SRC).filter(
    (file) => /\.(ts|tsx)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file),
  );
  const rel = (file: string) =>
    file
      .slice(SRC.length + 1)
      .split(sep)
      .join("/");

  it("is read in exactly one module, on the server", () => {
    const readers = sources
      .filter((file) => readFileSync(file, "utf8").includes("LOVABLE_API_KEY"))
      .map(rel);
    expect(readers).toEqual(["game/ai.functions.ts"]);
  });

  it("never appears in the chat UI", () => {
    const chat = readFileSync(join(SRC, "game", "apps", "Chat.tsx"), "utf8");
    expect(chat).not.toContain("LOVABLE_API_KEY");
    expect(chat).not.toContain("ai.gateway.lovable.dev");
  });

  it("is never hardcoded and the gateway call stays inside createServerFn", () => {
    const server = readFileSync(join(SRC, "game", "ai.functions.ts"), "utf8");
    expect(server).toContain("createServerFn");
    expect(server).toContain("ai.gateway.lovable.dev");
    expect(server).not.toMatch(/Bearer\s+[A-Za-z0-9_-]{16,}/);
  });
});
