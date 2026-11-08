// The other way this storyline can end: the bank holds the all-in and the money never leaves.
import { formatMoney } from "../../components/ui";
import { resetStory } from "../../shell/startOver";
import { setPhase } from "../../system/session";
import { wm } from "../../system/windows";
import { zhumingStore } from "./story";

export function StockGoodEnd() {
  const { keptAmount } = zhumingStore.use();
  const kept = formatMoney(keptAmount);

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
        PROTECTED
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
          RBC held the payment. StockLadder asked for every penny in both accounts at once, to a
          company nobody had ever heard of, and the transfer stopped there — a phone call and a
          confirmation before a single pound moved.
        </p>
        <p style={{ margin: "0 0 14px" }}>
          <strong>{kept}</strong> is still in your account. RAM Holdings went to pennies anyway:
          there was never a group, never a price target, and Kevin&apos;s number goes straight to
          voicemail.
        </p>
        <p style={{ margin: 0 }}>
          The difference was one question asked before the money left instead of three days after:
          does this payment look like me? Banks that check, stop. Banks that don&apos;t, apologise.
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
