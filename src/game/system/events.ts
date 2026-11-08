// System event bus. Apps emit what the player does; Stage 2 questlines will subscribe to these.
import { useEffect, useRef } from "react";

export type SystemEvent =
  | { type: "app.open"; app: string }
  | { type: "site.visit"; url: string; host: string; secure: boolean }
  | { type: "search"; query: string }
  | { type: "mail.signin"; ok: boolean }
  | { type: "mail.open"; id: string; from: string }
  | { type: "mail.send"; to: string; subject: string }
  | { type: "bank.login"; ok: boolean }
  | { type: "bank.transfer"; to: string; amount: number }
  | { type: "social.post"; text: string }
  | { type: "social.friend"; person: string; accepted: boolean }
  | { type: "chat.message"; contact: string; text: string }
  | { type: "chat.reply"; contact: string; text: string; node: string }
  | { type: "file.open"; path: string }
  | { type: "file.save"; path: string }
  | { type: "drive.open"; drive: string }
  | { type: "settings.change"; key: string }
  | { type: "session.login" }
  | { type: "session.logoff" }
  // --- Minigames ---
  | { type: "mines.clear"; level: number }
  // --- Storylines (Stage 2) ---
  | { type: "threat.detected"; id: string }
  | { type: "threat.removed"; id: string }
  | { type: "story.stage"; story: string; stage: string }
  | { type: "story.complete"; story: string };

type Handler = (e: SystemEvent) => void;
const handlers = new Set<Handler>();

/** Most recent events (newest last) — handy for debugging and for quest engines. */
export const eventLog: SystemEvent[] = [];

export function emit(e: SystemEvent) {
  eventLog.push(e);
  if (eventLog.length > 100) eventLog.shift();
  handlers.forEach((h) => {
    try {
      h(e);
    } catch (err) {
      console.error("event handler failed", err);
    }
  });
}

export function onEvent(h: Handler) {
  handlers.add(h);
  return () => {
    handlers.delete(h);
  };
}

/** Subscribe a component to system events. */
export function useSystemEvent(h: Handler) {
  const ref = useRef(h);
  ref.current = h;
  useEffect(() => onEvent((e) => ref.current(e)), []);
}
