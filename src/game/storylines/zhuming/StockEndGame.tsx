// The second way this storyline can end: Emma's email is the last thing the player reads.
import { formatMoney } from "../../components/ui";
import { setPhase } from "../../system/session";
import { wm } from "../../system/windows";
import { chequingBalance } from "./bank";

export function StockEndGame() {
  const debt = formatMoney(Math.abs(chequingBalance()));
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#f4f4f4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 32,
        textAlign: "center",
        zIndex: 9999,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 24,
          letterSpacing: 4,
          margin: 0,
          color: "#fff",
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
          color: "#ff5a5a",
        }}
      >
        MARGIN CALL
      </p>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 20,
          lineHeight: 1.7,
          maxWidth: 640,
          color: "#c9c9c9",
        }}
      >
        <p style={{ margin: "0 0 14px" }}>
          You closed the app. Ten seconds later it had spent everything: the current account, the
          savings, and nine times as much again that was never there.
        </p>
        <p style={{ margin: "0 0 14px" }}>
          Copperleaf says you owe {debt}. The position is worth pennies, RAM Holdings has stopped
          trading, and Kevin&apos;s number goes straight to voicemail.
        </p>
        <p style={{ margin: "0 0 14px" }}>
          Emma read the same statement hours ago. She has taken her name off the joint account, and
          she is not answering the phone tonight.
        </p>
        <p style={{ margin: 0 }}>
          Everyone who did this to you asked for the same thing in a different costume: your login,
          and then everything behind it.
        </p>
      </div>
      <button
        className="nes-btn is-error"
        onClick={() => {
          wm.closeAll();
          setPhase("boot");
        }}
      >
        Sign out
      </button>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 16, margin: 0, color: "#7d7d7d" }}>
        Sign out to go back to the start — the login screen has a reset.
      </p>
    </div>
  );
}
