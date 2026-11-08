// Track D — the live scammer conversation. Same window chrome as the scripted PingMe chat, but the
// contact's replies come from Gemini through a server function, with the scripted lines as fallback.
import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../../ai.functions";
import {
  getPersona,
  MAX_PLAYER_CHARS,
  resolveChatTurn,
  type ChatTurn,
  type ChatTurnResult,
} from "../../scams/ai";
import { appendTurns, unlockScam, useScams } from "../../scams/store";
import { useSettings } from "../../system/settings";

/** A conversation with one of the "ai-" scammer personas. */
export function AiChat({ contact }: { contact: string }) {
  const persona = getPersona(contact);
  const s = useSettings();
  const state = useScams();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const turns = state.threads[contact] ?? [];

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns.length, busy]);

  if (!persona) return <p className="p-3">Contact not found.</p>;

  async function send() {
    if (!persona) return;
    const text = draft.trim().slice(0, MAX_PLAYER_CHARS);
    if (text.length === 0 || busy) return;
    setDraft("");
    setBusy(true);
    const history: ChatTurn[] = [...turns, { role: "player", text }];
    appendTurns(persona.id, [{ role: "player", text }]);

    let result: ChatTurnResult;
    try {
      result = await sendChatMessage({ data: { personaId: persona.id, history } });
    } catch {
      // Offline, no key, or the gateway is unhappy: the same deterministic rules run locally.
      result = resolveChatTurn({ personaId: persona.id, history, modelReply: null });
    }

    appendTurns(persona.id, [{ role: "scammer", text: result.reply }]);
    // Silent on purpose. The lesson appears later on the achievements card, never here.
    if (result.playerFellForIt) result.unlockedIds.forEach((id) => unlockScam(id));
    setOffline(result.usedFallback);
    setBusy(false);
  }

  return (
    <div className="pm-chat">
      <div className="pm-chat-to">
        To: <b>{persona.screenName}</b> &lt;{persona.email}&gt;
      </div>
      <div className="pm-chat-body">
        <div className="pm-log" ref={logRef}>
          {turns.length === 0 &&
            persona.opener.map((line, i) => (
              <div key={`opener-${i}`} className="pm-msg">
                <span className="pm-msg-who">{persona.screenName} says:</span>
                <span className="nes-balloon from-left">{line}</span>
              </div>
            ))}
          {turns.map((m, i) => (
            <div key={i} className={`pm-msg ${m.role === "player" ? "is-me" : ""}`}>
              <span className="pm-msg-who">
                {m.role === "player" ? s.userName : persona.screenName} says:
              </span>
              <span className={`nes-balloon ${m.role === "player" ? "from-right" : "from-left"}`}>
                {m.text}
              </span>
            </div>
          ))}
          {busy && <p className="pm-hint">{persona.screenName} is typing a message...</p>}
        </div>
        <div className="pm-pics">
          <span className="pm-pic">{persona.avatar}</span>
          <span className="pm-pic">{s.avatar}</span>
        </div>
      </div>
      <div className="pm-typing">
        {offline ? "Connection lost - replies are scripted from here." : " "}
      </div>
      <div className="pm-reply">
        <input
          className="nes-input is-small"
          value={draft}
          maxLength={MAX_PLAYER_CHARS}
          placeholder="Type a message"
          aria-label="Message"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
        />
        <button className="nes-btn is-primary is-small" onClick={() => void send()} disabled={busy}>
          Send
        </button>
      </div>
    </div>
  );
}
