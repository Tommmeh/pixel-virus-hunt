// Runs Aaron's storyline while the desktop is up (mounted in shell/Desktop.tsx).
import { useEffect } from "react";
import { useSystemEvent } from "../../system/events";
import { windowStore } from "../../system/windows";
import {
  aaronStore,
  clean,
  click,
  FIRST_POPUP_MS,
  openPopupKeys,
  PHISH_HOST,
  popupDelay,
  post,
  POST_AFTER_MS,
  spawnPopup,
  SWARM_SPAWN_MS,
  THREAT_ID,
} from "./story";

const spawn = () => spawnPopup(window.innerWidth, window.innerHeight);

export function AaronService() {
  const { stage, popups, infectedAt } = aaronStore.use();

  // 1. Mum's post appears a while after logging in.
  useEffect(() => {
    if (stage !== "idle") return;
    const t = setTimeout(() => post(), POST_AFTER_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // 1b + 5. React to what the player does.
  useSystemEvent((e) => {
    if (e.type === "site.visit" && e.host === PHISH_HOST) click();
    if (e.type === "threat.removed" && e.id === THREAT_ID) clean();
  });

  // 3. Pop-ups: the first one a while after the infection, then faster and faster.
  useEffect(() => {
    if (stage !== "infected") return;
    const wait =
      popups === 0 ? Math.max(0, infectedAt + FIRST_POPUP_MS - Date.now()) : popupDelay(popups);
    const t = setTimeout(spawn, wait);
    return () => clearTimeout(t);
  }, [stage, popups, infectedAt]);

  // 4. Swarm: pop-ups pile up, and every one the player closes comes back as two.
  useEffect(() => {
    if (stage !== "swarm") return;
    let alive = true;
    if (openPopupKeys().length < 2) {
      spawn();
      spawn();
    }
    const interval = setInterval(spawn, SWARM_SPAWN_MS);
    let prev = new Set(openPopupKeys());
    const unsubscribe = windowStore.subscribe(() => {
      const now = new Set(openPopupKeys());
      const closed = [...prev].filter((k) => !now.has(k)).length;
      prev = now;
      if (closed === 0) return;
      setTimeout(() => {
        if (!alive || aaronStore.get().stage !== "swarm") return;
        for (let i = 0; i < closed * 2; i++) spawn();
      }, 250);
    });
    return () => {
      alive = false;
      clearInterval(interval);
      unsubscribe();
    };
  }, [stage]);

  return null;
}
