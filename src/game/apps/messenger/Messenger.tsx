import { PixelIcon } from "../../components/PixelIcon";
import { useNow } from "../../components/ui";
import { PEOPLE, type Presence } from "../../system/people";
import { updateSettings, useSettings, type Settings } from "../../system/settings";
import { wm } from "../../system/windows";
import { chatKey, chatTitle, startConversation, theirVisibleCount, useChat } from "./store";
import { AI_PERSONAS } from "../../scams/ai";
import { ZHUMING_CONTACT, ZHUMING_PERSON } from "../../storylines/zhuming/contact";
import { useZhuming } from "../../storylines/zhuming/story";

const STATUS_LABEL: Record<Presence, string> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
};

export function openChat(contact: string) {
  startConversation(contact);
  wm.open("chat", { contact }, { key: chatKey(contact), title: chatTitle(contact) });
}

/** Open a conversation with one of the ai- scammers (no script: the reply comes from Gemini). */
export function openScamChat(personaId: string) {
  const p = AI_PERSONAS.find((x) => x.id === personaId);
  wm.open(
    "chat",
    { contact: personaId },
    { key: `chat:${personaId}`, title: `${p?.screenName ?? personaId} - Conversation` },
  );
}

/** The PingMe buddy list. */
export function Messenger() {
  const s = useSettings();
  const { threads } = useChat();
  const now = useNow(1000);
  const groups: { label: string; people: typeof PEOPLE }[] = [
    { label: "Online", people: PEOPLE.filter((p) => p.status !== "offline") },
    { label: "Offline", people: PEOPLE.filter((p) => p.status === "offline") },
  ];
  // Zhuming's storyline: Kevin only shows up once the player adds him from his Daily Byte post.
  const { stage } = useZhuming();
  const added = stage === "added" || stage === "installed" || stage === "cleaned";
  const storyThread = threads[ZHUMING_CONTACT];
  const storyUnread = storyThread ? theirVisibleCount(storyThread, now) - storyThread.seen : 0;
  return (
    <div className="pingme">
      <div className="pm-me">
        <span className="pm-avatar">{s.avatar}</span>
        <div>
          <b>{s.userName}</b>
          <select
            className="pm-status"
            value={s.chatStatus}
            onChange={(e) =>
              updateSettings({ chatStatus: e.target.value as Settings["chatStatus"] })
            }
            aria-label="My status"
          >
            <option value="online">(Online)</option>
            <option value="away">(Away)</option>
            <option value="busy">(Busy)</option>
            <option value="offline">(Appear Offline)</option>
          </select>
        </div>
      </div>
      <div className="pm-list">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="pm-group">
              ▾ {g.label} ({g.people.length})
            </div>
            {g.people.map((p) => {
              const t = threads[p.id];
              const unread = t ? theirVisibleCount(t, now) - t.seen : 0;
              return (
                <button
                  key={p.id}
                  className="pm-contact"
                  onDoubleClick={() => openChat(p.id)}
                  onKeyDown={(e) => e.key === "Enter" && openChat(p.id)}
                  title={`${p.name} <${p.email}>`}
                >
                  <span className={`pm-dot is-${p.status}`} />
                  <span className="pm-name">
                    {p.screenName}{" "}
                    <small>
                      ({STATUS_LABEL[p.status]}) {p.personalMessage && `- ${p.personalMessage}`}
                    </small>
                  </span>
                  {unread > 0 && <span className="pm-badge">{unread}</span>}
                </button>
              );
            })}
          </div>
        ))}
        {added && (
          <div>
            <div className="pm-group">▾ Recent (1)</div>
            <button
              className="pm-contact"
              onDoubleClick={() => openChat(ZHUMING_CONTACT)}
              onKeyDown={(e) => e.key === "Enter" && openChat(ZHUMING_CONTACT)}
              title={`${ZHUMING_PERSON.name} <${ZHUMING_PERSON.email}>`}
            >
              <span className={`pm-dot is-${ZHUMING_PERSON.status}`} />
              <span className="pm-name">
                {ZHUMING_PERSON.screenName}{" "}
                <small>(Online) - {ZHUMING_PERSON.personalMessage}</small>
              </span>
              {storyUnread > 0 && <span className="pm-badge">{storyUnread}</span>}
            </button>
          </div>
        )}
        <div>
          <div className="pm-group">▾ Unknown ({AI_PERSONAS.length})</div>
          {AI_PERSONAS.map((p) => (
            <button
              key={p.id}
              className="pm-contact"
              onDoubleClick={() => openScamChat(p.id)}
              onKeyDown={(e) => e.key === "Enter" && openScamChat(p.id)}
              title={`${p.screenName} <${p.email}>`}
            >
              <span className="pm-dot is-online" />
              <span className="pm-name">
                {p.screenName} <small>(Online) - {p.blurb}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="pm-foot">
        <PixelIcon name="buddy" size={16} /> Double-click a contact to chat
      </div>
    </div>
  );
}
