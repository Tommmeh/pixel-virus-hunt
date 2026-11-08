import { questStore } from "../system/quests";
import { setPhase } from "../system/session";
import { wm } from "../system/windows";
import { resetStory } from "./startOver";

const money = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Stage 2's ending: the money is partly back, the habit has changed, and the screen goes white. */
export function GoodEnd() {
  const { refundAmount } = questStore.use();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        color: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 32,
        textAlign: "center",
        zIndex: 9999,
        animation: "vh-fade-in 3s ease both",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 24,
          letterSpacing: 4,
          margin: 0,
        }}
      >
        THE END
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          letterSpacing: 2,
          margin: 0,
          color: "#1f7a4d",
        }}
      >
        RECOVERED
      </p>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 20,
          lineHeight: 1.7,
          maxWidth: 640,
        }}
      >
        <p style={{ margin: "0 0 14px" }}>
          {refundAmount > 0 ? (
            <>
              Copperleaf paid back <strong>{money(refundAmount)}</strong> — 45% of what was taken.
              The rest is gone, and it isn&apos;t coming back.
            </>
          ) : (
            <>Copperleaf paid back part of what was taken. The rest is gone.</>
          )}
        </p>
        <p style={{ margin: "0 0 14px" }}>
          RBC is installed. It isn&apos;t magic — it checks payments against your usual pattern and
          rings you before money leaves, which is exactly where the last bank was quiet.
        </p>
        <p style={{ margin: 0 }}>
          The money took an afternoon of emails to claw back. The rule took one sentence: nobody
          legitimate asks for your online banking password. Not a shop, not a prize, not a video
          site, not your friend&apos;s link.
        </p>
      </div>
      <button
        className="nes-btn is-success"
        onClick={() => {
          resetStory();
          wm.closeAll();
          setPhase("boot");
        }}
      >
        Start over from the beginning
      </button>
    </div>
  );
}
