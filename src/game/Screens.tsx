import { useState } from "react";
import { PixelIcon } from "./components/PixelIcon";
import { SCAMS } from "./scams";
import { useGame } from "./state";

export function TitleScreen() {
  const { state, dispatch } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const got = SCAMS.filter((s) => state.unlocked[s.id]).length;

  return (
    <div className="screen">
      <div className="nes-container is-dark with-title is-centered max-w-2xl">
        <p className="title">C:\&gt; VIRUSHNT.EXE</p>
        <div className="mb-4 flex justify-center gap-3">
          <PixelIcon name="computer" size={48} />
          <PixelIcon name="warning" size={48} />
          <PixelIcon name="trophy" size={48} />
        </div>
        <h1 className="mb-6 text-3xl leading-relaxed">Virus Hunt</h1>
        <p className="mb-6 text-xs leading-loose">Get Infected. Collect Them All. Stay Safe.</p>
        <p className="mb-6 text-[10px] leading-loose opacity-80">
          It's 2004 and this PC is all yours. Click on things, open the emails, browse the web.
          Every scam you fall for unlocks an achievement. Better here than on your real computer.
        </p>
        {got > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-[10px]">
              {got} / {SCAMS.length} scams collected
            </p>
            <progress
              className="nes-progress is-success"
              value={got}
              max={SCAMS.length}
              style={{ height: 16 }}
            />
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button className="nes-btn is-primary" onClick={() => dispatch({ type: "START" })}>
            {got > 0 ? "Continue" : "Start"}
          </button>
          {got > 0 &&
            (confirmReset ? (
              <button
                className="nes-btn is-error"
                onClick={() => {
                  dispatch({ type: "RESET_PROGRESS" });
                  setConfirmReset(false);
                }}
              >
                Really reset?
              </button>
            ) : (
              <button className="nes-btn" onClick={() => setConfirmReset(true)}>
                Reset progress
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
