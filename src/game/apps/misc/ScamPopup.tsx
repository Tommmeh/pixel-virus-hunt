import { useEffect } from "react";
import { playDing } from "../../components/sound";
import { wm, type Win } from "../../system/windows";
import { SCAM_ADS } from "./scams";

/** One popup ad window. The number picks the advert, so every window differs. */
export function ScamPopup({ win }: { win: Win }) {
  const n = Number(win.args?.["n"] ?? "0");
  const ad = SCAM_ADS[n % SCAM_ADS.length] ?? SCAM_ADS[0]!;

  useEffect(() => {
    playDing();
  }, []);

  return (
    <div
      style={{
        padding: 14,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily: "var(--font-body)",
        fontSize: 18,
      }}
    >
      <div
        style={{
          background: "#2b1b4a",
          color: "#ffd23f",
          border: "3px solid #212529",
          padding: "8px 10px",
          fontFamily: "var(--font-sans)",
          fontSize: 9,
          letterSpacing: 1,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        {ad.heading}
      </div>
      <p style={{ margin: 0, lineHeight: 1.5 }}>{ad.body}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "auto" }}>
        <button
          className="nes-btn is-warning is-small"
          onClick={() => {
            wm.close(win.key);
            wm.open("webvoyager", { url: ad.url });
          }}
        >
          {ad.cta}
        </button>
        <button className="nes-btn is-small" onClick={() => wm.close(win.key)}>
          No thanks
        </button>
      </div>
    </div>
  );
}
