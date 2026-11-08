import { setPhase } from "../system/session";
import { wm } from "../system/windows";

/** Shown once the player has read the bank's "review your balance" mail and there's nothing left. */
export function EndGame() {
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
        BANKRUPT
      </p>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 20,
          lineHeight: 1.7,
          maxWidth: 620,
          color: "#c9c9c9",
        }}
      >
        <p style={{ margin: "0 0 14px" }}>The bank was right. There was nothing left to check.</p>
        <p style={{ margin: "0 0 14px" }}>
          Your savings are gone, there is $2.45 left in Everyday Checking, and the rent is still
          unpaid. Emma is at her mum&apos;s and she isn&apos;t answering.
        </p>
        <p style={{ margin: "0 0 14px" }}>
          Every message that did this asked for the same thing in a different costume: your login
          details.
        </p>
        <p style={{ margin: 0 }}>None of this was real — the money, the people, the bank.</p>
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
