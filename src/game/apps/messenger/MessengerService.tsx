// Runs while the desktop is up: contacts who start chats, balloons for new messages, nudges.
import { useEffect, useRef } from "react";
import { playDing, playNudge } from "../../components/sound";
import { notify } from "../../system/notify";
import { getPerson } from "../../system/people";
import { settingsStore } from "../../system/settings";
import { wm } from "../../system/windows";
import { SCRIPTS } from "./scripts";
import {
  announce,
  chatKey,
  chatStore,
  chatTitle,
  startConversation,
  theirVisibleCount,
} from "./store";

export function MessengerService() {
  const announced = useRef<Record<string, number> | null>(null);

  // Contacts who open a conversation by themselves.
  useEffect(() => {
    const timers = SCRIPTS.filter((s) => s.opensAfterMs !== undefined).map((s) =>
      setTimeout(() => {
        if (settingsStore.get().chatStatus === "offline") return;
        startConversation(s.contact);
      }, s.opensAfterMs),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Watch for contact messages becoming visible.
  useEffect(() => {
    const now0 = Date.now();
    if (!announced.current) {
      announced.current = Object.fromEntries(
        Object.entries(chatStore.get().threads).map(([c, t]) => [c, theirVisibleCount(t, now0)]),
      );
    }
    const tick = setInterval(() => {
      const now = Date.now();
      const seen = announced.current!;
      for (const [contact, t] of Object.entries(chatStore.get().threads)) {
        const theirs = t.msgs.filter((m) => m.from === "them" && m.at <= now);
        const before = seen[contact] ?? 0;
        if (theirs.length <= before) continue;
        seen[contact] = theirs.length;
        const fresh = theirs.slice(before);
        fresh.forEach((m) => announce(contact, m));
        const last = fresh[fresh.length - 1]!;
        const key = chatKey(contact);
        if (fresh.some((m) => m.nudge)) {
          playNudge();
          if (wm.isOpen(key)) wm.shake(key);
        }
        if (!wm.isActive(key)) {
          playDing();
          if (wm.isOpen(key)) wm.flash(key);
          const p = getPerson(contact);
          notify({
            title: "PingMe Messenger",
            text: `${p?.screenName ?? contact} says: ${last.text}`,
            icon: "buddy",
            open: { app: "chat", args: { contact }, key, title: chatTitle(contact) },
          });
        }
      }
    }, 700);
    return () => clearInterval(tick);
  }, []);

  return null;
}
