import { getCallStep } from "../../storylines/bankCall";
import { PixelIcon } from "../../components/PixelIcon";
import { chooseCallOption, usePhone } from "./store";

/** The landline on the desk. During stage 2 it rings with Copperleaf's Disputes team. */
export function Phone() {
  const { ringing, active, over, waiting, step, log } = usePhone();
  const choices = step ? (getCallStep(step)?.choices ?? []) : [];

  const status = ringing
    ? "Incoming call…"
    : active
      ? "Connected — Copperleaf Bank"
      : over
        ? "Call ended"
        : "No calls";

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", background: "#2b2b2b" }}
    >
      <div
        style={{
          padding: "6px 10px",
          background: "#111",
          color: "#8fe38f",
          fontFamily: "var(--font-body)",
          fontSize: 18,
          borderBottom: "3px solid #000",
        }}
      >
        <PixelIcon name="phone" size={18} /> {status}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontFamily: "var(--font-body)",
          fontSize: 18,
          lineHeight: 1.5,
        }}
      >
        {log.length === 0 && !ringing && !over && (
          <p style={{ color: "#bbb", margin: 0 }}>
            Nobody is on the line. The bank said they would ring you about the case.
          </p>
        )}
        {ringing && <p style={{ color: "#ffd866", margin: 0 }}>The phone is ringing…</p>}
        {log.map((line, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              alignSelf: line.who === "me" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "4px 8px",
              background:
                line.who === "me" ? "#243b53" : line.who === "note" ? "transparent" : "#1b1b1b",
              color: line.who === "me" ? "#dcefff" : line.who === "note" ? "#8a8a8a" : "#e6e6e6",
              fontStyle: line.who === "note" ? "italic" : "normal",
            }}
          >
            {line.text}
          </p>
        ))}
        {active && !waiting && !over && (
          <p style={{ color: "#8a8a8a", margin: 0 }}>
            <em>…please hold…</em>
          </p>
        )}
      </div>

      <div
        style={{
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          background: "#1b1b1b",
        }}
      >
        {active && waiting && choices.length > 0 ? (
          choices.map((c, i) => (
            <button
              key={c.next + i}
              className="nes-btn is-primary is-small"
              onClick={() => chooseCallOption(i)}
            >
              {c.text}
            </button>
          ))
        ) : over ? (
          <p style={{ color: "#8a8a8a", margin: 0, fontFamily: "var(--font-body)", fontSize: 16 }}>
            The case is closed. The payment will show in your online banking.
          </p>
        ) : (
          !active && (
            <p
              style={{ color: "#8a8a8a", margin: 0, fontFamily: "var(--font-body)", fontSize: 16 }}
            >
              {ringing ? "Answering…" : "Waiting for the bank to call back."}
            </p>
          )
        )}
      </div>
    </div>
  );
}
