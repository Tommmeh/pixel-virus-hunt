import { useEffect, useRef } from "react";
import { playNudge } from "../../components/sound";
import { useNow } from "../../components/ui";
import { getPerson } from "../../system/people";
import { useSettings } from "../../system/settings";
import { activeKey, useWindows, wm, type Win } from "../../system/windows";
import { getNode, getScript } from "./scripts";
import {
  choose,
  emptyThread,
  isTyping,
  markSeen,
  theirVisibleCount,
  useChat,
  visible,
} from "./store";

/** One conversation window with a contact. */
export function Chat({ win }: { win: Win }) {
  const contact = win.args?.["contact"] ?? "";
  const person = getPerson(contact);
  const s = useSettings();
  const { threads } = useChat();
  const t = threads[contact] ?? emptyThread();
  const typing = isTyping(t, Date.now());
  const now = useNow(typing ? 300 : 1500);
  const shown = visible(t, now);
  const isActive = activeKey(useWindows()) === win.key;
  const logRef = useRef<HTMLDivElement>(null);

  const theirs = theirVisibleCount(t, now);
  useEffect(() => {
    if (isActive) markSeen(contact, now);
  }, [isActive, theirs, contact]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [shown.length, typing]);

  if (!person) return <p className="p-3">Contact not found.</p>;
  const script = getScript(contact);
  const node = script && t.node ? getNode(script, t.node) : undefined;
  const canReply = !!node && !isTyping(t, now) && node.choices.length > 0;

  return (
    <div className="pm-chat">
      <div className="pm-chat-to">
        To: <b>{person.screenName}</b> &lt;{person.email}&gt;
      </div>
      <div className="pm-chat-body">
        <div className="pm-log" ref={logRef}>
          {shown.map((m, i) => (
            <div key={i} className={`pm-msg ${m.from === "me" ? "is-me" : ""}`}>
              <span className="pm-msg-who">
                {m.from === "me" ? s.userName : person.screenName} says:
              </span>
              <span className={`nes-balloon ${m.from === "me" ? "from-right" : "from-left"}`}>
                {m.nudge && <i>[{person.screenName} sent you a nudge!] </i>}
                {m.text}
              </span>
            </div>
          ))}
          {shown.length === 0 && !isTyping(t, now) && (
            <p className="pm-hint">Pick something to say below.</p>
          )}
        </div>
        <div className="pm-pics">
          <span className="pm-pic">{person.avatar}</span>
          <span className="pm-pic">{s.avatar}</span>
        </div>
      </div>
      <div className="pm-typing">
        {isTyping(t, now) ? `${person.screenName} is typing a message...` : " "}
      </div>
      <div className="pm-reply">
        {canReply ? (
          node!.choices.map((c, i) => (
            <button
              key={i}
              className="nes-btn is-small pm-choice"
              onClick={() => choose(contact, i)}
            >
              {c.text}
            </button>
          ))
        ) : (
          <p className="pm-ended">
            {isTyping(t, now) ? " " : t.node === null && t.started ? "Conversation ended." : " "}
          </p>
        )}
        <button
          className="nes-btn is-warning is-small pm-nudge"
          onClick={() => {
            playNudge();
            wm.shake(win.key);
          }}
        >
          Nudge
        </button>
      </div>
    </div>
  );
}
