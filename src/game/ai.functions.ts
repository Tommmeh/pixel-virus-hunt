// Track D — server-only AI calls. Named `ai.functions.ts` rather than living in `src/server/`
// because TanStack Start's import protection denies client imports matching `**/server/**`.
//
// LOVABLE_API_KEY is read from the server environment in this module only. `createServerFn`
// compiles each handler into a server RPC and strips it from the client bundle, so the key is
// never sent to the browser. Nothing here returns the key, logs it, or echoes request bodies.
//
// Gateway: Lovable's OpenAI-compatible endpoint, documented at
// https://docs.lovable.dev/features/ai-chat (model ids use the `google/` form).
// Override the model per deployment with LOVABLE_CHAT_MODEL.

import { createServerFn } from "@tanstack/react-start";

import {
  buildGatewayMessages,
  buildItGuyMessages,
  getPersona,
  itGuyFallback,
  MAX_MODEL_TOKENS,
  MAX_PLAYER_MESSAGE_CHARS,
  parseModelReply,
  resolveChatTurn,
  sanitizeReply,
  type ChatTurn,
  type ChatTurnResult,
  type GatewayMessage,
  type LessonCard,
} from "@/game/scams/ai";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
/** Current recommended Gemini chat model on Lovable's gateway. */
const DEFAULT_MODEL = "google/gemini-3.8-flash";
const REQUEST_TIMEOUT_MS = 12_000;

function readEnv(name: string): string | undefined {
  const scope = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const value = scope.process?.env?.[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * One call to the gateway. Returns null for every failure mode (no key, timeout, non-2xx,
 * unexpected body) so callers fall back to the scripted persona lines.
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
      // Status only: never log the body, it can echo the prompt.
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
    const text = turn.text.slice(0, MAX_PLAYER_MESSAGE_CHARS);
    if (text.trim().length === 0) continue;
    history.push({ role: turn.role, text });
  }

  return { personaId: raw.personaId, history };
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator(parseChatInput)
  .handler(async ({ data }): Promise<ChatTurnResult> => {
    const persona = getPersona(data.personaId);
    if (persona === null) {
      return {
        reply: "This contact is offline.",
        playerFellForIt: false,
        usedFallback: true,
        leakedSecretIds: [],
        unlockedAchievementIds: [],
      };
    }

    const modelReply = await callGateway(buildGatewayMessages(persona, data.history));
    // resolveChatTurn owns the deterministic fall-for-it check and the output guardrails, so the
    // Gemini path and the offline path can never disagree about what happened.
    return resolveChatTurn({ personaId: persona.id, history: data.history, modelReply });
  });

type ItGuyInput = LessonCard & { question: string };

function parseItGuyInput(input: unknown): ItGuyInput {
  if (input === null || typeof input !== "object") throw new Error("Invalid request");
  const raw = input as {
    name?: unknown;
    type?: unknown;
    whatHappened?: unknown;
    redFlags?: unknown;
    tip?: unknown;
    question?: unknown;
  };
  const text = (value: unknown, max: number) =>
    typeof value === "string" ? value.slice(0, max) : "";
  const redFlags = Array.isArray(raw.redFlags)
    ? raw.redFlags
        .filter((flag): flag is string => typeof flag === "string")
        .slice(0, 8)
        .map((flag) => flag.slice(0, 300))
    : [];
  return {
    name: text(raw.name, 120),
    type: text(raw.type, 160),
    whatHappened: text(raw.whatHappened, 600),
    redFlags,
    tip: text(raw.tip, 600),
    question: text(raw.question, MAX_PLAYER_MESSAGE_CHARS),
  };
}

/**
 * "Ask the IT guy" on an unlocked achievement card. Always returns text: the card's own red
 * flags when the model is unavailable, so the button can never dead-end.
 */
export const askItGuy = createServerFn({ method: "POST" })
  .validator(parseItGuyInput)
  .handler(async ({ data }): Promise<{ answer: string; usedFallback: boolean }> => {
    const card: LessonCard = {
      name: data.name,
      type: data.type,
      whatHappened: data.whatHappened,
      redFlags: data.redFlags,
      tip: data.tip,
    };
    const raw = await callGateway(buildItGuyMessages(card, data.question));
    const answer = raw === null ? null : sanitizeReply(raw);
    if (answer === null) return { answer: itGuyFallback(card), usedFallback: true };
    return { answer, usedFallback: false };
  });
