// Chat threads. Contact lines are stored with future timestamps so "typing..." delays survive
// closing the window: a message is shown once `at <= now`.
import { emit } from "../../system/events";
import { getPerson } from "../../system/people";
import { createStore } from "../../system/store";
import { getNode, getScript } from "./scripts";

export interface ChatMsg {
  from: "me" | "them";
  text: string;
  at: number;
  nudge?: boolean;
}

export interface Thread {
  started: boolean;
  node: string | null;
  msgs: ChatMsg[];
  /** Number of contact messages the player has seen. */
  seen: number;
}

export const chatStore = createStore<{ threads: Record<string, Thread> }>("vh-chat", {
  threads: {},
});
export const useChat = chatStore.use;

export const emptyThread = (): Thread => ({ started: false, node: null, msgs: [], seen: 0 });

const FIRST_DELAY = 900;
const LINE_GAP = 1600;

function queueLines(contact: string, nodeId: string, from: number): ChatMsg[] {
  const script = getScript(contact);
  const node = script && getNode(script, nodeId);
  if (!node) return [];
  return node.them.map((text, i) => ({
    from: "them" as const,
    text,
    at: from + FIRST_DELAY + i * LINE_GAP,
    ...(i === 0 && node.nudge ? { nudge: true } : {}),
  }));
}

export function startConversation(contact: string, now = Date.now()) {
  const script = getScript(contact);
  if (!script) return;
  chatStore.set((s) => {
    const t = s.threads[contact] ?? emptyThread();
    if (t.started) return s;
    const msgs = [...t.msgs, ...queueLines(contact, script.start, now)];
    return {
      threads: { ...s.threads, [contact]: { ...t, started: true, node: script.start, msgs } },
    };
  });
}

/** Picks up an existing thread again with a later script node (a second beat with the same person). */
export function continueConversation(contact: string, nodeId: string, now = Date.now()) {
  const script = getScript(contact);
  if (!script) return;
  chatStore.set((s) => {
    const t = s.threads[contact] ?? emptyThread();
    if (t.node === nodeId) return s;
    const msgs = [...t.msgs, ...queueLines(contact, nodeId, now)];
    return {
      threads: { ...s.threads, [contact]: { ...t, started: true, node: nodeId, msgs } },
    };
  });
}

export function choose(contact: string, index: number, now = Date.now()) {
  const script = getScript(contact);
  const t = chatStore.get().threads[contact];
  if (!script || !t?.node) return;
  const node = getNode(script, t.node);
  const choice = node?.choices[index];
  if (!node || !choice) return;
  const mine: ChatMsg = { from: "me", text: choice.text, at: now };
  const theirs = choice.next ? queueLines(contact, choice.next, now + 400) : [];
  chatStore.set((s) => ({
    threads: {
      ...s.threads,
      [contact]: { ...t, node: choice.next, msgs: [...t.msgs, mine, ...theirs] },
    },
  }));
  emit({ type: "chat.reply", contact, text: choice.text, node: node.id });
}

export const visible = (t: Thread, now: number) => t.msgs.filter((m) => m.at <= now);
export const theirVisibleCount = (t: Thread, now: number) =>
  t.msgs.filter((m) => m.from === "them" && m.at <= now).length;
export const isTyping = (t: Thread, now: number) => t.msgs.some((m) => m.at > now);

export function markSeen(contact: string, now = Date.now()) {
  const t = chatStore.get().threads[contact];
  if (!t) return;
  const n = theirVisibleCount(t, now);
  if (n !== t.seen)
    chatStore.set((s) => ({ threads: { ...s.threads, [contact]: { ...t, seen: n } } }));
}

export const chatKey = (contact: string) => `chat:${contact}`;
export const chatTitle = (contact: string) =>
  `${getPerson(contact)?.name ?? contact} - Conversation`;

/** Emit chat.message events as contact lines become visible (called by MessengerService). */
export function announce(contact: string, msg: ChatMsg) {
  emit({ type: "chat.message", contact, text: msg.text });
}
