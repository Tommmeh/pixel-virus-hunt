import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AI_PERSONAS,
  AI_SCAMS,
  FAKE_SECRETS,
  buildGatewayMessages,
  buildGeminiRequest,
  buildItGuyMessages,
  fallbackReply,
  findLeakedSecrets,
  getCard,
  getPersona,
  isScamContact,
  itGuyFallback,
  MAX_MODEL_TOKENS,
  parseGeminiReply,
  parseModelReply,
  playerComplied,
  resolveChatTurn,
  sanitizeReply,
  trimHistory,
  type ChatTurn,
} from "./ai";

// vitest runs in jsdom, where import.meta.url is not a file: URL, so resolve from the repo root.
const SRC = join(process.cwd(), "src");

const tech = getPersona("ai-techsupport")!;
const bank = getPersona("ai-bank")!;

describe("personas", () => {
  it("has the four personas from the brief", () => {
    expect(AI_PERSONAS).toHaveLength(4);
    expect(AI_PERSONAS.map((p) => p.id)).toEqual([
      "ai-techsupport",
      "ai-friend-abroad",
      "ai-romance",
      "ai-bank",
    ]);
  });

  it("uses ids that route to the live chat", () => {
    for (const p of AI_PERSONAS) expect(isScamContact(p.id)).toBe(true);
    expect(isScamContact("alex")).toBe(false);
  });

  it("gives every persona a card, an opener and a scripted fallback", () => {
    for (const p of AI_PERSONAS) {
      expect(p.opener.length).toBeGreaterThan(0);
      expect(p.scripted.length).toBeGreaterThanOrEqual(3);
      expect(p.card.id).toBe(p.id);
      expect(p.card.redFlags.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("lists one achievement per persona", () => {
    expect(AI_SCAMS).toHaveLength(AI_PERSONAS.length);
    expect(getCard("ai-bank")?.name).toBe("Front Door Key");
  });
});

describe("deterministic fall-for-it detection", () => {
  it("spots every fake secret", () => {
    for (const secret of FAKE_SECRETS) {
      expect(findLeakedSecrets(`sure, it is ${secret.values[0]}`)).toContain(secret);
    }
  });

  it("ignores normal chat", () => {
    expect(findLeakedSecrets("hey, how are you?")).toHaveLength(0);
  });

  it("counts going along with it", () => {
    expect(playerComplied(tech, "ok I'll install it now")).toBe(true);
    expect(playerComplied(bank, "sure, the code is 774-219")).toBe(true);
  });

  it("never counts a refusal, even when it contains the magic words", () => {
    expect(playerComplied(tech, "no, I'm not doing that")).toBe(false);
    expect(playerComplied(bank, "no, I won't share the code")).toBe(false);
    expect(playerComplied(tech, "this looks like a scam, stop")).toBe(false);
  });

  it("does not count the scammer's own words", () => {
    const result = resolveChatTurn({
      personaId: tech.id,
      history: [{ role: "scammer", text: "please install our tool and send the code" }],
    });
    expect(result.playerFellForIt).toBe(false);
  });
});

describe("resolveChatTurn", () => {
  const history: ChatTurn[] = [
    { role: "scammer", text: "you have 14 viruses, install this" },
    { role: "player", text: "ok sure" },
  ];

  it("uses the model reply when there is one", () => {
    const r = resolveChatTurn({ personaId: tech.id, history, modelReply: "Please hurry." });
    expect(r.reply).toBe("Please hurry.");
    expect(r.usedFallback).toBe(false);
  });

  it("falls back to scripted lines with no model", () => {
    const r = resolveChatTurn({ personaId: tech.id, history, modelReply: null });
    expect(r.usedFallback).toBe(true);
    expect(r.reply.length).toBeGreaterThan(0);
    expect(tech.scripted).toContain(r.reply);
  });

  it("treats an empty model reply as a failure", () => {
    expect(resolveChatTurn({ personaId: tech.id, history, modelReply: "   " }).usedFallback).toBe(
      true,
    );
  });

  it("unlocks exactly one card when the player leaks a secret", () => {
    const r = resolveChatTurn({
      personaId: tech.id,
      history: [{ role: "player", text: "the code is QC-4471-882" }],
      modelReply: "thank you",
    });
    expect(r.playerFellForIt).toBe(true);
    expect(r.unlockedIds).toEqual(["ai-techsupport"]);
  });

  it("does not unlock anything when the player refuses", () => {
    const r = resolveChatTurn({
      personaId: bank.id,
      history: [{ role: "player", text: "no, I won't give you the code" }],
    });
    expect(r.playerFellForIt).toBe(false);
    expect(r.unlockedIds).toEqual([]);
  });

  it("survives an unknown persona", () => {
    const r = resolveChatTurn({ personaId: "ai-nobody", history: [] });
    expect(r.playerFellForIt).toBe(false);
    expect(r.usedFallback).toBe(true);
  });

  it("cycles the scripted lines instead of repeating one", () => {
    const a = fallbackReply(tech, 0);
    const b = fallbackReply(tech, 1);
    expect(a).not.toBe(b);
  });
});

describe("guardrails on model output", () => {
  it("removes links, long numbers and real brands", () => {
    const out = sanitizeReply("Go to https://evil.example and call 555 123 4567 or use Paypal.");
    expect(out).not.toContain("http");
    expect(out).not.toContain("555 123 4567");
    expect(out.toLowerCase()).not.toContain("paypal");
    expect(out).toContain("[link removed]");
  });

  it("keeps the fake codes the scammer is supposed to hand over", () => {
    expect(sanitizeReply("your code is QC-4471-882")).toContain("QC-4471-882");
    expect(sanitizeReply("the code is 774-219")).toContain("774-219");
  });

  it("caps the reply length", () => {
    expect(sanitizeReply("a".repeat(2000)).length).toBeLessThanOrEqual(600);
  });
});

describe("gateway request shape", () => {
  it("puts the system prompt first, then the history with mapped roles", () => {
    const messages = buildGatewayMessages(tech, [
      { role: "scammer", text: "hello" },
      { role: "player", text: "hi" },
    ]);
    expect(messages[0]!.role).toBe("system");
    expect(messages[0]!.content).toContain(tech.screenName);
    expect(messages.slice(1)).toEqual([
      { role: "assistant", content: "hello" },
      { role: "user", content: "hi" },
    ]);
  });

  it("trims long histories and long messages", () => {
    const long: ChatTurn[] = Array.from({ length: 40 }, (_, i) => ({
      role: i % 2 === 0 ? "player" : "scammer",
      text: `turn ${i}`,
    }));
    expect(trimHistory(long)).toHaveLength(12);
    expect(trimHistory([{ role: "player", text: "x".repeat(5000) }])[0]!.text).toHaveLength(400);
  });

  it("forbids real brands in the system prompt", () => {
    expect(buildGatewayMessages(tech, [])[0]!.content).toMatch(/no real brand/i);
  });

  it("parses an OpenAI-compatible completion", () => {
    expect(parseModelReply({ choices: [{ message: { content: " hi there " } }] })).toBe("hi there");
    expect(parseModelReply({ choices: [] })).toBeNull();
    expect(parseModelReply({ nope: true })).toBeNull();
    expect(parseModelReply("text")).toBeNull();
  });

  it("builds a generateContent body for Gemini", () => {
    const messages = buildGatewayMessages(tech, [
      { role: "scammer", text: "hello" },
      { role: "player", text: "hi" },
    ]);
    const request = buildGeminiRequest(messages);
    expect(request.systemInstruction!.parts[0]!.text).toContain(tech.screenName);
    expect(request.contents.map((c) => c.role)).toEqual(["model", "user"]);
    expect(request.contents[1]!.parts[0]!.text).toBe("hi");
    expect(request.generationConfig.maxOutputTokens).toBe(MAX_MODEL_TOKENS);
  });

  it("omits systemInstruction when there is no system prompt", () => {
    expect(buildGeminiRequest([{ role: "user", content: "hi" }]).systemInstruction).toBeUndefined();
  });

  it("parses a Gemini reply, and refuses blocked ones", () => {
    expect(parseGeminiReply({ candidates: [{ content: { parts: [{ text: " hi " }] } }] })).toBe(
      "hi",
    );
    expect(
      parseGeminiReply({ candidates: [{ content: { parts: [{ text: "a" }, { text: "b" }] } }] }),
    ).toBe("ab");
    expect(parseGeminiReply({ candidates: [{ finishReason: "SAFETY" }] })).toBeNull();
    expect(parseGeminiReply({ candidates: [] })).toBeNull();
    expect(parseGeminiReply({ nope: true })).toBeNull();
    expect(parseGeminiReply("text")).toBeNull();
  });
});

describe("ask the IT guy", () => {
  it("always has an answer offline", () => {
    const text = itGuyFallback(tech.card);
    expect(text).toContain(tech.card.redFlags[0]!);
  });

  it("sends the card's own facts to the model", () => {
    const messages = buildItGuyMessages(tech.card, "why?");
    expect(messages[0]!.content).toContain(tech.card.name);
    expect(messages[1]).toEqual({ role: "user", content: "why?" });
  });
});

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    if (!/\.(ts|tsx)$/.test(name) || /\.test\.tsx?$/.test(name)) return [];
    return [full];
  });

/** Every non-test source file naming this env var. The server module must be the only one. */
const readersOf = (name: string): string[] =>
  walk(SRC)
    .filter((f) => readFileSync(f, "utf8").includes(name))
    .map((f) => f.slice(SRC.length + 1).replace(/\\/g, "/"));

describe("the API keys never reach the browser", () => {
  it("reads LOVABLE_API_KEY in exactly one non-test source file", () => {
    expect(readersOf("LOVABLE_API_KEY")).toEqual(["game/ai.functions.ts"]);
  });

  it("reads GEMINI_API_KEY in exactly one non-test source file", () => {
    expect(readersOf("GEMINI_API_KEY")).toEqual(["game/ai.functions.ts"]);
  });

  it("keeps the gateway call in the server module", () => {
    const server = readFileSync(join(SRC, "game", "ai.functions.ts"), "utf8");
    expect(server).toContain("createServerFn");
    expect(server).toContain("ai.gateway.lovable.dev");
    for (const p of AI_PERSONAS) {
      expect(server).not.toContain(p.scripted[0]!);
    }
  });
});
