import { useEffect, useState } from "react";
import { MALWARE, SCENARIOS } from "./data";
import { computeScore, isMalwareCleared, useGame } from "./state";

export function TitleScreen() {
  const { dispatch } = useGame();
  return (
    <div className="screen">
      <div className="nes-container is-dark with-title is-centered max-w-2xl">
        <p className="title">C:\&gt; VIRUSHNT.EXE</p>
        <h1 className="mb-6 text-3xl leading-relaxed">Virus Hunt</h1>
        <p className="mb-8 text-xs leading-loose">Play. Get Infected. Stay Safe.</p>
        <p className="mb-8 text-[10px] leading-loose text-muted-foreground">
          It's 2004. Use your PC like normal. If something feels off later... investigate.
        </p>
        <button className="nes-btn is-primary" onClick={() => dispatch({ type: "START", now: Date.now() })}>Start</button>
      </div>
    </div>
  );
}

export function DebriefScreen() {
  const { state, dispatch } = useGame();
  return (
    <div className="screen">
      <div className="nes-container with-title max-w-3xl bg-card" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <p className="title">Debrief</p>
        {state.infections.length === 0 ? (
          <p className="text-xs leading-loose">Perfect run! You made every safe choice — your PC was never infected.</p>
        ) : (
          MALWARE.filter((m) => state.infections.includes(m.id)).map((m) => {
            const sc = SCENARIOS.find((s) => s.infects === m.id)!;
            const cleared = isMalwareCleared(state, m.id);
            return (
              <div key={m.id} className="nes-container mb-4 text-[10px] leading-loose">
                <p className={cleared ? "text-success" : "text-destructive"}>{cleared ? "[REMOVED]" : "[STILL ACTIVE]"} {m.realName}</p>
                <p>Type: {m.type}</p>
                <p>Your choice: "{sc.risky}"</p>
                <p>What happened: {m.whatHappened}</p>
                <p>Hid as: {m.components.map((c) => c.name).join(", ")}</p>
                <p>Antivirus could detect it: {m.detectableByAV ? "Yes" : "No"}</p>
                <p className="text-primary">Prevention: {m.tip}</p>
              </div>
            );
          })
        )}
        <button className="nes-btn is-primary mt-2" onClick={() => dispatch({ type: "SHOW_SCORE" })}>See score</button>
      </div>
    </div>
  );
}

interface HS { score: number; rating: string; date: string }
export function ScoreScreen() {
  const { state, dispatch } = useGame();
  const s = computeScore(state);
  const [scores, setScores] = useState<HS[]>([]);
  useEffect(() => {
    const prev: HS[] = JSON.parse(localStorage.getItem("virushunt-scores") || "[]");
    const next = [...prev, { score: s.score, rating: s.rating, date: new Date().toLocaleDateString() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    localStorage.setItem("virushunt-scores", JSON.stringify(next));
    setScores(next);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="screen">
      <div className="nes-container is-dark with-title max-w-2xl text-[11px] leading-loose">
        <p className="title">Results</p>
        <p>Viruses removed: {s.found} / {s.total}</p>
        <p>Time taken: {Math.floor(s.seconds / 60)}m {s.seconds % 60}s</p>
        <p>False removals: {s.falseRemovals}</p>
        <p>Risky choices: {s.riskyChoices} / {SCENARIOS.length}</p>
        <p>Score: {s.score}</p>
        <p className="my-4 text-2xl">Safety rating: {s.rating}</p>
        <p className="mb-2">High scores</p>
        <ol className="mb-4">
          {scores.map((h, i) => <li key={i}>{i + 1}. {h.score} ({h.rating}) — {h.date}</li>)}
        </ol>
        <button className="nes-btn is-success" onClick={() => dispatch({ type: "RESTART" })}>Play again</button>
      </div>
    </div>
  );
}
