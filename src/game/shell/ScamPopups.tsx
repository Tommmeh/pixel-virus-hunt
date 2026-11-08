// Adware-style scam popups. They start only once Marcus has offered to lend money for the rent,
// and they come thick and fast once the VideoVault trial has hold of the bank details.
import { useEffect, useRef } from "react";
import { SCAM_ADS } from "../apps/misc/scams";
import { chatStore } from "../apps/messenger/store";
import { questStore } from "../system/quests";
import { windowStore, wm } from "../system/windows";

const FIRST_DELAY = 15_000;
/** Before the bank details go: once in a while, 30–60s apart. */
const SLOW: [number, number] = [30_000, 60_000];
/** After the third email: relentless, 15–30s apart. */
const FAST: [number, number] = [15_000, 30_000];
/** Don't bury the desktop in windows. */
const MAX_OPEN = 4;

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a);

const talkedAboutRent = () => {
  const t = chatStore.get().threads["marcus"];
  return !!t?.started && t.node === null;
};

export function ScamPopups() {
  const nextAt = useRef(0);
  const seq = useRef(0);

  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now();
      // Stage 2 isn't about the adware any more — the popups stop when the story moves on.
      if (questStore.get().stage2Started) return;
      if (!talkedAboutRent()) return;
      if (!nextAt.current) {
        nextAt.current = now + FIRST_DELAY;
        return;
      }
      if (now < nextAt.current) return;

      const ramped = questStore.get().videoVaultSignedIn;
      nextAt.current = now + between(ramped ? FAST : SLOW);

      const open = windowStore.get().wins.filter((w) => w.app === "scampopup").length;
      if (open >= MAX_OPEN) return;

      const n = ++seq.current;
      const ad = SCAM_ADS[Math.floor(Math.random() * SCAM_ADS.length)] ?? SCAM_ADS[0]!;
      wm.open("scampopup", { n: String(n) }, { key: `scampopup:${n}`, title: ad.title });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return null;
}
