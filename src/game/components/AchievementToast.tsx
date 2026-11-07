import { useEffect } from "react";
import { getScam } from "../scams";
import { useGame } from "../state";
import { useDesktop } from "../desktop-context";
import { PixelIcon } from "./PixelIcon";
import { playUnlock } from "./sound";

/** Bottom-right "Achievement unlocked" toast. Shows for state.lastUnlock, auto-hides after 4s. */
export function AchievementToast() {
  const { state, dispatch } = useGame();
  const { openApp } = useDesktop();
  const scam = state.lastUnlock ? getScam(state.lastUnlock) : undefined;

  useEffect(() => {
    if (!state.lastUnlock) return;
    if (!state.muted) playUnlock();
    const t = setTimeout(() => dispatch({ type: "DISMISS_TOAST" }), 4000);
    return () => clearTimeout(t);
  }, [state.lastUnlock]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!scam) return null;
  return (
    <button
      key={scam.id}
      className="toast"
      onClick={() => {
        dispatch({ type: "DISMISS_TOAST" });
        openApp("achievements");
      }}
    >
      <PixelIcon name="trophy" size={32} />
      <span className="flex flex-col gap-1 text-left">
        <span className="text-[8px] opacity-80">Achievement unlocked!</span>
        <span className="text-[10px]">{scam.name}</span>
      </span>
    </button>
  );
}
