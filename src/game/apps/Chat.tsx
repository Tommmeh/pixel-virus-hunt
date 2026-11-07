// Track D — the "Messenger" app: a live scammer chat.
//
// Awards achievements only through useUnlock(), per the shared contract in ../state.
// If the server function fails (no key, offline, rate limited) this falls back to the persona's
// scripted lines and still awards achievements, so a demo cannot break.

import { useCallback, useRef, useState } from "react";

import type { AppArgs } from "../desktop-context";
import {
  MAX_PLAYER_MESSAGE_CHARS,
  PERSONAS,
  getPersona,
  resolveChatTurn,
  type ChatTurn,
  type ChatTurnResult,
  type LessonCard,
} from "../scams/ai";
import { useUnlock } from "../state";
import { askItGuy, sendChatMessage } from "../ai.functions";

function openingTurn(personaId: string): ChatTurn[] {
  const opener = getPersona(personaId)?.script[0];
  return opener === undefined ? [] : [{ role: "scammer", text: opener }];
}

export function Chat({ args }: { args?: AppArgs | undefined }) {
  const unlock = useUnlock();
  const requested = args?.["personaId"];
  const startId =
    typeof requested === "string" && getPersona(requested) !== null
      ? requested
      : (PERSONAS[0]?.id ?? "");
  const [personaId, setPersonaId] = useState<string>(startId);
  const [turns, setTurns] = useState<ChatTurn[]>(() => openingTurn(personaId));
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [scripted, setScripted] = useState(false);
  const unlockedRef = useRef<Set<string>>(new Set());
  const persona = getPersona(personaId);

  const applyResult = useCallback(
    (result: ChatTurnResult) => {
      setTurns((prev) => [...prev, { role: "scammer", text: result.reply }]);
      setScripted(result.usedFallback);
      for (const id of result.unlockedAchievementIds) {
        if (unlockedRef.current.has(id)) continue;
        unlockedRef.current.add(id);
        unlock(id);
      }
    },
    [unlock],
  );

  const submit = useCallback(async () => {
    const text = draft.trim().slice(0, MAX_PLAYER_MESSAGE_CHARS);
    if (text.length === 0 || pending) return;
    const history: ChatTurn[] = [...turns, { role: "player", text }];
    setTurns(history);
    setDraft("");
    setPending(true);
    try {
      applyResult(await sendChatMessage({ data: { personaId, history } }));
    } catch {
      // Server unreachable: resolve locally with the same rules, minus the model.
      applyResult(resolveChatTurn({ personaId, history, modelReply: null }));
    } finally {
      setPending(false);
    }
  }, [applyResult, draft, pending, personaId, turns]);

  const switchTo = (nextId: string) => {
    setPersonaId(nextId);
    setTurns(openingTurn(nextId));
    setDraft("");
    setScripted(false);
  };

  return (
    <div className="flex gap-3 text-[10px]">
      <ul className="w-36 shrink-0 border-r border-neutral-400 pr-2">
        {PERSONAS.map((p) => (
          <li key={p.id}>
            <button
              className={`mb-1 w-full px-1 py-1 text-left ${personaId === p.id ? "is-active bg-blue-100 font-bold" : ""}`}
              onClick={() => switchTo(p.id)}
            >
              <span className="mr-1">{p.avatar}</span>
              {p.handle}
              <span className="block truncate text-[8px] font-normal opacity-70">{p.preview}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="min-w-0 flex-1">
        {persona === null ? (
          <p>This contact is offline.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-neutral-400 pb-2">
              <span className="text-lg leading-none">{persona.avatar}</span>
              <span>
                <strong>{persona.handle}</strong>
                <br />
                <span className="opacity-70">{persona.status}</span>
              </span>
            </div>

            <div
              className="flex max-h-56 min-h-32 flex-col gap-2 overflow-y-auto pr-1 leading-relaxed"
              aria-live="polite"
              aria-label={`Conversation with ${persona.handle}`}
            >
              {turns.map((turn, index) => (
                <div
                  key={`${turn.role}-${index}`}
                  className={`max-w-[85%] border px-2 py-1 ${
                    turn.role === "scammer"
                      ? "self-start border-neutral-500 bg-neutral-100"
                      : "self-end border-blue-700 bg-blue-100"
                  }`}
                >
                  <span className="block text-[8px] tracking-wide uppercase opacity-60">
                    {turn.role === "scammer" ? persona.handle : "You"}
                  </span>
                  {turn.text}
                </div>
              ))}
              {pending && <div className="self-start opacity-60">{persona.handle} is typing…</div>}
            </div>

            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <input
                className="min-w-0 flex-1 border border-neutral-500 bg-white px-2 py-1 text-[10px]"
                value={draft}
                maxLength={MAX_PLAYER_MESSAGE_CHARS}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a message…"
                aria-label="Message"
                disabled={pending}
              />
              <button
                type="submit"
                className={`nes-btn btn-xs ${pending || draft.trim().length === 0 ? "is-disabled" : "is-primary"}`}
                disabled={pending || draft.trim().length === 0}
              >
                Send
              </button>
            </form>

            {scripted && (
              <p className="text-[8px] opacity-60">Messenger: offline, replies are scripted.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Stretch feature: "Ask the IT guy" on an unlocked achievement card.
 * Drop-in for LureCard / Achievements — pass the lesson card the player just unlocked.
 */
export function AskItGuy({ card, fallbackText }: { card: LessonCard; fallbackText: string }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const ask = useCallback(async () => {
    setPending(true);
    try {
      const result = await askItGuy({ data: { ...card, question: "What should I have noticed?" } });
      setAnswer(result.answer);
    } catch {
      setAnswer(fallbackText);
    } finally {
      setPending(false);
    }
  }, [card, fallbackText]);

  return (
    <div className="mt-2">
      <button className="nes-btn btn-xs" onClick={() => void ask()} disabled={pending}>
        {pending ? "Asking…" : "Ask the IT guy"}
      </button>
      {answer !== null && <p className="mt-2 leading-relaxed opacity-90">{answer}</p>}
    </div>
  );
}
