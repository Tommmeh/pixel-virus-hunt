// Track D — server-only Gemini calls.
//
// This lives at src/game/ai.functions.ts rather than src/server/ai.ts because TanStack Start's
// import protection denies any client import that resolves inside a `server/` directory, and the
// browser has to import these createServerFn stubs. The handlers themselves are compiled into
// server RPCs and stripped from the client bundle.
//
// LOVABLE_API_KEY is read from the environment on the server only. Nothing here returns the key,
// logs it, or echoes a request body back to the browser.
import { createServerFn } from "@tanstack/react-start";
import {
  buildGatewayMessages,
  buildItGuyMessages,
  getCard,
  getPersona,
  itGuyFallback,
  MAX_MODEL_TOKENS,
  MAX_PLAYER_CHARS,
  parseModelReply,
  resolveChatTurn,
  sanitizeReply,
  type ChatTurn,
  type ChatTurnResult,
  type GatewayMessage,
  type LessonCard,
} from "@/game/scams/ai";

/** Lovable's OpenAI-compatible AI gateway. */
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
/** Gemini chat model on the gateway: this is the gateway's own documented chat default.
 * Set LOVABLE_CHAT_MODEL (e.g. google/gemini-3.8-flash) to move to a newer one. */
const DEFAULT_MODEL = "google/gemini-3.7-flash";
const REQUEST_TIMEOUT_MS = 12_000;

function readEnv(name: string): string | undefined {
  const scope = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const value = scope.process?.env?.[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * One gateway call. Returns null for every failure mode (no key, timeout, non-2xx, odd body) so
 * callers fall back to the scripted persona lines and the demo never breaks.
 */
async function callGateway(messages: GatewayMessage[]): Promise<string | null> {
  const apiKey = readEnv("LOVABLE_API_KEY");
  if (apiKey === undefined) return null;
  const model = readEnv("LOVABLE_CHAT_MODEL") ?? DEFAULT_MODEL;

  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: MAX_MODEL_TOKENS,
        temperature: 0.85,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Status only: the body can echo the prompt.
      console.warn(`[ai] gateway returned ${response.status}`);
      return null;
    }
    return parseModelReply(await response.json());
  } catch (error) {
    const reason = error instanceof Error ? error.name : "unknown";
    console.warn(`[ai] gateway call failed (${reason})`);
    return null;
  }
}

function parseChatInput(input: unknown): { personaId: string; history: ChatTurn[] } {
  if (input === null || typeof input !== "object") throw new Error("Invalid chat input");
  const raw = input as { personaId?: unknown; history?: unknown };
  if (typeof raw.personaId !== "string") throw new Error("Invalid chat input");
  if (!Array.isArray(raw.history)) throw new Error("Invalid chat input");

  const history: ChatTurn[] = [];
  for (const entry of raw.history) {
    if (entry === null || typeof entry !== "object") continue;
    const turn = entry as { role?: unknown; text?: unknown };
    if (turn.role !== "player" && turn.role !== "scammer") continue;
    if (typeof turn.text !== "string") continue;
    const text = turn.text.slice(0, MAX_PLAYER_CHARS);
    if (text.trim().length === 0) continue;
    history.push({ role: turn.role, text });
  }
  return { personaId: raw.personaId, history };
}

/**
 * One turn of a live scammer chat. The model writes the reply; `resolveChatTurn` owns the
 * fall-for-it verdict and the guardrails, so Gemini and the offline path can never disagree.
 */
export const sendChatMessage = createServerFn({ method: "POST" })
  .validator(parseChatInput)
  .handler(async ({ data }): Promise<ChatTurnResult> => {
    const persona = getPersona(data.personaId);
    if (!persona) {
      return {
        reply: "This contact is offline.",
        playerFellForIt: false,
        usedFallback: true,
        unlockedIds: [],
      };
    }
    const modelReply = await callGateway(buildGatewayMessages(persona, data.history));
    return resolveChatTurn({ personaId: persona.id, history: data.history, modelReply });
  });

interface ItGuyInput extends LessonCard {
  question: string;
}

function parseItGuyInput(input: unknown): ItGuyInput {
  if (input === null || typeof input !== "object") throw new Error("Invalid request");
  const raw = input as Record<string, unknown>;
  const text = (value: unknown, max: number) =>
    typeof value === "string" ? value.slice(0, max) : "";
  const redFlags = Array.isArray(raw["redFlags"])
    ? raw["redFlags"]
        .filter((f): f is string => typeof f === "string")
        .slice(0, 8)
        .map((f) => f.slice(0, 300))
    : [];
  return {
    id: text(raw["id"], 80),
    name: text(raw["name"], 120),
    type: text(raw["type"], 160),
    whatHappened: text(raw["whatHappened"], 600),
    redFlags,
    tip: text(raw["tip"], 600),
    question: text(raw["question"], MAX_PLAYER_CHARS),
  };
}

/**
 * "Ask the IT guy" on an unlocked lesson card. Always answers: the card's own red flags when the
 * model is unavailable.
 */
export const askItGuy = createServerFn({ method: "POST" })
  .validator(parseItGuyInput)
  .handler(async ({ data }): Promise<{ answer: string; usedFallback: boolean }> => {
    const card: LessonCard = {
      id: data.id,
      name: data.name,
      type: data.type,
      whatHappened: data.whatHappened,
      redFlags: data.redFlags,
      tip: data.tip,
    };
    // Prefer the game's own copy if this is one of ours, so the model cannot be fed a fake card.
    const known = getCard(card.id) ?? card;
    const raw = await callGateway(buildItGuyMessages(known, data.question));
    const answer = raw === null ? "" : sanitizeReply(raw);
    if (answer.length === 0) return { answer: itGuyFallback(known), usedFallback: true };
    return { answer, usedFallback: false };
  });
