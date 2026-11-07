// Track D — Gemini-powered scams (chat personas). Ids must start with "ai-".
// Lures with location "chat" are rendered by the Chat app (Track D). Until that app is registered,
// keep this list empty — scams.test.ts checks every used location has a renderer.
import type { Scam } from "../types";

export const AI_SCAMS: Scam[] = [];
