// Runs Aaron's storyline while the desktop is up (mounted in shell/Desktop.tsx).
import { useEffect } from "react";
import { useDemo } from "../../demo/store";
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

/** The guided demo runs the same story, just quicker (Scout posts the link himself). */
const DEMO_FIRST_POPUP_MS = 4_000;
const DEMO_SPEED = 0.4;

export function AaronService() {
  const { stage, popups, infectedAt } = aaronStore.use();
  const demo = useDemo();

  // 1. Mum's post appears a while after logging in.
  useEffect(() => {
    if (stage !== "idle" || demo) return;
    const t = setTimeout(() => post(), POST_AFTER_MS);
    return () => clearTimeout(t);
  }, [stage, demo]);

  // 1b + 5. React to what the player does.
  useSystemEvent((e) => {
    // Opening FriendSpace before the timer: Mum's post is already at the top of the feed ("Just now").
    if (e.type === "site.visit" && e.host === "www.friendspace.com" && !demo)
      post(Date.now(), false);
    if (e.type === "site.visit" && e.host === PHISH_HOST) click();
    if (e.type === "threat.removed" && e.id === THREAT_ID) clean();
  });

  // 3. Pop-ups: the first one a while after the infection, then faster and faster.
  useEffect(() => {
    if (stage !== "infected") return;
    const first = demo ? DEMO_FIRST_POPUP_MS : FIRST_POPUP_MS;
    const wait =
      popups === 0
        ? Math.max(0, infectedAt + first - Date.now())
        : popupDelay(popups) * (demo ? DEMO_SPEED : 1);
    const t = setTimeout(spawn, wait);
    return () => clearTimeout(t);
  }, [stage, popups, infectedAt, demo]);

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
