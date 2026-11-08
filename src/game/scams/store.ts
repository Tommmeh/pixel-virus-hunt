// Track D — unlocked lesson cards and the live scammer conversations.
// Kept in its own store so it does not collide with the scripted Messenger threads ("vh-chat"),
// and so the Stage 2 achievement port can read it without touching this file.
import { createStore } from "../system/store";
import type { ChatTurn } from "./ai";

export interface ScamState {
  /** Card id -> when it was unlocked. */
  unlocked: Record<string, number>;
  /** Persona id -> the conversation so far. */
  threads: Record<string, ChatTurn[]>;
}

export const scamStore = createStore<ScamState>("vh-scams", { unlocked: {}, threads: {} });
export const useScams = scamStore.use;

export const getThread = (personaId: string): ChatTurn[] =>
  scamStore.get().threads[personaId] ?? [];

/** Record a lesson card. Silent on purpose: the player is never told off at the moment of the
 * mistake, and nothing pops up. Returns true the first time only. */
export function unlockScam(cardId: string, now = Date.now()): boolean {
  if (cardId in scamStore.get().unlocked) return false;
  scamStore.set((s) => ({ ...s, unlocked: { ...s.unlocked, [cardId]: now } }));
  return true;
}

export const isUnlocked = (cardId: string) => cardId in scamStore.get().unlocked;

export const unlockedCount = () => Object.keys(scamStore.get().unlocked).length;

export function appendTurns(personaId: string, turns: ChatTurn[]) {
  if (turns.length === 0) return;
  scamStore.set((s) => ({
    ...s,
    threads: { ...s.threads, [personaId]: [...(s.threads[personaId] ?? []), ...turns] },
  }));
}

export function resetThread(personaId: string) {
  scamStore.set((s) => {
    const threads = { ...s.threads };
    delete threads[personaId];
    return { ...s, threads };
  });
}

/** Trophies the player has already opened in Quests (drives the "NEW!" tag). */
export const trophySeenStore = createStore<{ seen: Record<string, true> }>("vh-trophies-seen", {
  seen: {},
});

export function markTrophySeen(questId: string) {
  if (trophySeenStore.get().seen[questId]) return;
  trophySeenStore.set((s) => ({ seen: { ...s.seen, [questId]: true } }));
}
