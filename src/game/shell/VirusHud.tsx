// The score, always on screen: how many of the PC's viruses / scams the player has caught.
// It doubles as the guide: each slot is one quest line (scams/questlines.ts). Click a slot you haven't caught
// yet and it takes you to where that one starts; click a caught one to read what it taught you.
import { useEffect, useRef, useState } from "react";
import { openScamChat } from "../apps/messenger/Messenger";
import { PixelIcon } from "../components/PixelIcon";
import {
  isCaught,
  QUEST_LINES,
  VIRUS_TOTAL,
  virusesCaught,
  type QuestLine,
} from "../scams/questlines";
import { useDemo } from "../demo/store";
import { useScams } from "../scams/store";
import { post as postStockTip } from "../storylines/zhuming/story";
import { wm } from "../system/windows";

/** Take the player to where a quest begins. */
export function goToQuestStart(line: QuestLine) {
  const s = line.start;
  // The stock tip normally appears a minute after login: don't make the player wait for it.
  if (line.id === "stocks") postStockTip();
  if (s.kind === "site") wm.open("webvoyager", { url: s.url });
  else if (s.kind === "folder") wm.open("explorer", { path: s.path });
  else openScamChat(s.contact); // same as clicking them in PingMe's buddy list
}

/** Read a caught quest's lessons. */
export function openQuestLessons(line: QuestLine) {
  wm.open("quests", { line: line.id, at: String(Date.now()) });
}

export function VirusHud() {
  const { unlocked } = useScams();
  const demo = useDemo(); // in the tutorial, Scout drives: the slots don't jump anywhere
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
    <div
      className={`virus-hud ${bump ? "is-bump" : ""} ${caught === VIRUS_TOTAL ? "is-all" : ""}`}
      data-tour="virus-hud"
      role="group"
      aria-label={`Viruses caught: ${caught} of ${VIRUS_TOTAL}`}
    >
      <span className="virus-hud-label">VIRUSES CAUGHT</span>
      <span className="virus-hud-count">
        <b>{caught}</b>/{VIRUS_TOTAL}
      </span>
      <span className="virus-hud-slots">
        {QUEST_LINES.map((l) => {
          const got = isCaught(l, unlocked);
          return (
            <button
              key={l.id}
              className={`virus-slot ${got ? "is-caught" : ""}`}
              title={got ? `${l.name}: read what it taught you` : `${l.teaser} (click to go there)`}
              aria-label={
                got
                  ? `${l.name}, caught. Read the lessons.`
                  : `Uncaught virus. Go to where it starts.`
              }
              disabled={demo}
              onClick={() => (got ? openQuestLessons(l) : goToQuestStart(l))}
            >
              <PixelIcon name={l.icon} size={16} />
            </button>
          );
        })}
      </span>
    </div>
  );
}
