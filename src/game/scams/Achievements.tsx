// Track D — the Achievements app. This is where the lesson lives: the player is never warned while
// they are being scammed, and finds out what happened only here, after the fact.
import { useState } from "react";
import { askItGuy } from "../ai.functions";
import { AI_SCAMS, itGuyFallback, type LessonCard } from "./ai";
import { useScams } from "./store";

function CardView({ card }: { card: LessonCard }) {
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
        <b>{card.name}</b> <small>({card.type})</small>
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

/** Lists the lesson cards. Locked ones stay hidden so they cannot spoil a scam the player has not
 * met yet. */
export function Achievements() {
  const state = useScams();
  const unlocked = AI_SCAMS.filter((c) => c.id in state.unlocked);

  return (
    <div className="p-2">
      <p className="mb-2">
        <b>Scam lessons learned:</b> {unlocked.length} / {AI_SCAMS.length}
      </p>
      {unlocked.length === 0 ? (
        <p>
          Nothing here yet. Lessons unlock after you have been caught out - that is the point: you
          find out afterwards, not while it is happening.
        </p>
      ) : (
        unlocked.map((card) => <CardView key={card.id} card={card} />)
      )}
    </div>
  );
}
