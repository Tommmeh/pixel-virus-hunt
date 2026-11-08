// The score, always on screen: how many of the PC's viruses / scams the player has caught.
// One slot per quest line (scams/questlines.ts); a slot lights up the moment the player falls for that one.
// Click it to open Quests.
import { useEffect, useRef, useState } from "react";
import { PixelIcon } from "../components/PixelIcon";
import { isCaught, QUEST_LINES, VIRUS_TOTAL, virusesCaught } from "../scams/questlines";
import { useScams } from "../scams/store";
import { wm } from "../system/windows";

export function VirusHud() {
  const { unlocked } = useScams();
  const caught = virusesCaught(unlocked);
  const last = useRef(caught);
  const [bump, setBump] = useState(false);

  // Celebrate each new catch with a little bounce.
  useEffect(() => {
    const isNew = caught > last.current;
    last.current = caught;
    if (!isNew) return undefined;
    setBump(true);
    const t = setTimeout(() => setBump(false), 900);
    return () => clearTimeout(t);
  }, [caught]);

  return (
    <button
      className={`virus-hud ${bump ? "is-bump" : ""} ${caught === VIRUS_TOTAL ? "is-all" : ""}`}
      data-tour="virus-hud"
      onClick={() => wm.open("quests")}
      aria-label={`Viruses caught: ${caught} of ${VIRUS_TOTAL}. Open Quests.`}
      title="Open Quests"
    >
      <span className="virus-hud-label">VIRUSES CAUGHT</span>
      <span className="virus-hud-count">
        <b>{caught}</b>/{VIRUS_TOTAL}
      </span>
      <span className="virus-hud-slots" aria-hidden>
        {QUEST_LINES.map((l) => (
          <span key={l.id} className={`virus-slot ${isCaught(l, unlocked) ? "is-caught" : ""}`}>
            <PixelIcon name={l.icon} size={16} />
          </span>
        ))}
      </span>
    </button>
  );
}
