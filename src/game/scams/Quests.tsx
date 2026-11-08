// The Quests app: a trophy shelf with one trophy per quest line (one per virus / scam). This is where the lesson lives:
// the player is never warned while they are being scammed, and finds out what happened only here.
// Locked trophies are black silhouettes (no spoilers); finishing a quest line turns it gold, and
// clicking it opens that line's lesson cards.
import { useEffect, useState } from "react";
import type { Win } from "../system/windows";
import { askItGuy } from "../ai.functions";
import { PixelIcon } from "../components/PixelIcon";
import { itGuyFallback, type LessonCard } from "./ai";
import { getLessonCard } from "./cards";
import {
  getQuestLine,
  isCaught,
  isComplete,
  progress,
  QUEST_LINES,
  type QuestLine,
} from "./questlines";
import { markTrophySeen, trophySeenStore, useScams } from "./store";

function CardView({ card, step }: { card: LessonCard; step: number }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  async function ask() {
    setAsking(true);
    try {
      const res = await askItGuy({ data: { ...card, question: "Why did this work on me?" } });
      setAnswer(res.answer);
    } catch {
      setAnswer(itGuyFallback(card));
    }
    setAsking(false);
  }

  return (
    <div className="nes-container is-rounded is-dark mb-3">
      <p className="mb-1">
        <b>
          {step}. {card.name}
        </b>{" "}
        <small>({card.type})</small>
      </p>
      <p className="mb-2">{card.whatHappened}</p>
      <p className="mb-1">
        <b>Red flags</b>
      </p>
      <ul className="nes-list is-disc mb-2">
        {card.redFlags.map((flag) => (
          <li key={flag}>{flag}</li>
        ))}
      </ul>
      <p className="mb-2">
        <b>What to do instead:</b> {card.tip}
      </p>
      {answer === null ? (
        <button
          className="nes-btn is-small is-primary"
          onClick={() => void ask()}
          disabled={asking}
        >
          {asking ? "Asking..." : "Ask the IT guy"}
        </button>
      ) : (
        <div className="nes-balloon from-left">
          <b>IT guy:</b> {answer}
        </div>
      )}
    </div>
  );
}

/** Trophy cup with the quest line's emblem underneath. */
function Trophy({ line, size = 48 }: { line: QuestLine; size?: number }) {
  return (
    <span className="trophy-art" aria-hidden>
      <PixelIcon name="trophy" size={size} />
      <PixelIcon name={line.icon} size={Math.round(size / 2)} className="trophy-emblem" />
    </span>
  );
}

function TrophyTile({
  line,
  unlocked,
  isNew,
  onOpen,
}: {
  line: QuestLine;
  unlocked: Record<string, number>;
  isNew: boolean;
  onOpen: () => void;
}) {
  const done = isComplete(line, unlocked);
  const { found, total } = progress(line, unlocked);
  if (!done) {
    return (
      <div className="trophy-tile is-locked" title="Finish this quest line to unlock">
        <Trophy line={line} />
        <b className="trophy-name">???</b>
        <span className="trophy-teaser">{line.teaser}</span>
        {total > 1 && (
          <span className="trophy-progress">
            {found}/{total} clues found
          </span>
        )}
      </div>
    );
  }
  return (
    <button className="trophy-tile is-done" onClick={onOpen}>
      {isNew && <span className="trophy-new">NEW!</span>}
      <Trophy line={line} />
      <b className="trophy-name">{line.name}</b>
      <span className="trophy-teaser">
        {total} lesson{total > 1 ? "s" : ""}. Click to read
      </span>
    </button>
  );
}

function QuestDetail({
  line,
  unlocked,
  onBack,
}: {
  line: QuestLine;
  unlocked: Record<string, number>;
  onBack: () => void;
}) {
  const done = isComplete(line, unlocked);
  // A finished quest shows every lesson; one still in progress shows the lessons found so far.
  const cards = line.cardIds
    .filter((id) => done || id in unlocked)
    .map(getLessonCard)
    .filter((c): c is LessonCard => !!c);
  return (
    <div className="trophy-detail">
      <button className="nes-btn is-small" onClick={onBack}>
        ◀ All trophies
      </button>
      <div className="trophy-detail-head">
        <Trophy line={line} size={64} />
        <div>
          <p className="trophy-detail-title">{line.name}</p>
          <p className="trophy-detail-sub">
            {done
              ? "Virus caught and cleaned up. Here's what happened."
              : "Caught! Clean it up to finish this quest and unlock the rest."}
          </p>
        </div>
      </div>
      {cards.map((card, i) => (
        <CardView key={card.id} card={card} step={i + 1} />
      ))}
    </div>
  );
}

export function Quests({ win }: { win?: Win } = {}) {
  const { unlocked } = useScams();
  const { seen } = trophySeenStore.use();
  const wanted = win?.args?.["line"] ?? null;
  const at = win?.args?.["at"];
  const [openId, setOpenId] = useState<string | null>(wanted);
  // Opened from a slot of the virus counter: jump straight to that quest's lessons.
  useEffect(() => {
    if (wanted) setOpenId(wanted);
  }, [wanted, at]);
  const open = openId ? getQuestLine(openId) : undefined;

  if (open && isCaught(open, unlocked)) {
    return (
      <div className="p-2 ach-scroll">
        <QuestDetail line={open} unlocked={unlocked} onBack={() => setOpenId(null)} />
      </div>
    );
  }

  const done = QUEST_LINES.filter((l) => isComplete(l, unlocked)).length;
  return (
    <div className="p-2 trophy-shelf ach-scroll">
      <div className="trophy-head">
        <p>
          <b>Quests done</b> {done} / {QUEST_LINES.length}
        </p>
        <progress
          className="nes-progress is-warning"
          value={done}
          max={QUEST_LINES.length}
          aria-label="Quests done"
        />
      </div>
      <div className="trophy-grid">
        {QUEST_LINES.map((line) => (
          <TrophyTile
            key={line.id}
            line={line}
            unlocked={unlocked}
            isNew={!seen[line.id]}
            onOpen={() => {
              markTrophySeen(line.id);
              setOpenId(line.id);
            }}
          />
        ))}
      </div>
      <p className="trophy-foot">
        {done === 0
          ? "Every quest hides a virus or a scam. Catch it, see it through, and its trophy unlocks here with the lesson behind it."
          : "Finish a quest line to turn its silhouette into a trophy."}
      </p>
    </div>
  );
}
