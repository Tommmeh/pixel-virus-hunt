import { useEffect } from "react";
import { questStore, type QuestFlags } from "../system/quests";

/**
 * A short scene break between the two stages: the screen goes dark, holds "THREE DAYS LATER",
 * then gets out of the way so Marcus's message can arrive.
 */
export function ThreeDaysLater() {
  const { stage2Started, stage2CaptionSeen } = questStore.use();

  useEffect(() => {
    if (!stage2Started || stage2CaptionSeen) return;
    const t = setTimeout(
      () => questStore.set((s: QuestFlags) => ({ ...s, stage2CaptionSeen: true })),
      5_200,
    );
    return () => clearTimeout(t);
  }, [stage2Started, stage2CaptionSeen]);

  if (!stage2Started || stage2CaptionSeen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        display: "grid",
        placeItems: "center",
        zIndex: 8000,
        pointerEvents: "none",
        animation: "vh-fade-in 700ms ease both, vh-fade-out 1s ease 4.1s both",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          letterSpacing: 3,
          color: "#fff",
          margin: 0,
        }}
      >
        THREE DAYS LATER
      </p>
    </div>
  );
}
