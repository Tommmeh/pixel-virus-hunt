import { useEffect, useRef, useState } from "react";
import { deposit } from "./copperleaf/store";
import { unlockScam } from "../../../scams/store";
import { ANISH_CARD_IDS } from "../../../storylines/anish/cards";
import { startConversation } from "../../messenger/store";
import { useBrowser } from "../BrowserContext";
import type { PageUrl } from "../url";

const BASE = "http://www.adrewards.com";
const AD_SECONDS = 1; // 30-second ad

/** Fake "sponsored ad" that plays for 5 minutes then pays $5 to the checking account. */
function WatchPage() {
  const { navigate } = useBrowser();
  const [secondsLeft, setSecondsLeft] = useState(AD_SECONDS);
  const [phase, setPhase] = useState<"watching" | "done">("watching");
  const [collected, setCollected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "watching") return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("done");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = Math.round(((AD_SECONDS - secondsLeft) / AD_SECONDS) * 100);

  function handleCollect() {
    if (collected) return;
    setCollected(true);
    deposit({ account: "chk", amount: 5, desc: "ADREWARDS - AD PAYOUT" });
    unlockScam(ANISH_CARD_IDS.easyMoney); // silent: the lesson waits in Achievements

    // The money landing is what reminds Emma how short they are this month.
    setTimeout(() => startConversation("emma"), 2_500);

    // The Amazing gift-card phish follows the conversation with Emma — see shell/QuestFlow.tsx.

    // Navigate to Copperleaf Bank so the user sees the $5 transaction
    navigate("https://www.copperleafbank.com/accounts");
  }

  return (
    <div style={{ padding: 24, maxWidth: 560, margin: "0 auto", fontFamily: "var(--font-body)", fontSize: 20 }}>
      <div
        style={{
          background: "#ff6600",
          color: "#fff",
          padding: "10px 18px",
          fontFamily: "var(--font-sans)",
          fontSize: 10,
          letterSpacing: 1,
          marginBottom: 16,
          boxShadow: "0 4px 0 #212529",
        }}
      >
        ★ AdRewards — Earn Cash for Your Attention ★
      </div>

      <div
        style={{
          background: "#000",
          color: "#0f0",
          border: "4px solid #212529",
          padding: 20,
          marginBottom: 16,
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          textAlign: "center",
        }}
      >
        {phase === "watching" ? (
          <>
            <div style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "#ff0", marginBottom: 4 }}>
              🎬 NOW PLAYING: SPONSOR AD
            </div>
            <div
              style={{
                fontSize: 48,
                fontFamily: "var(--font-sans)",
                color: "#0f0",
                textShadow: "0 0 8px #0f0",
              }}
            >
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 16, opacity: 0.8 }}>
              BUY BRAND NEW BRAND PRODUCTS™ — ONLY AT BRAND STORE!
            </div>
            <div style={{ width: "100%", background: "#333", height: 12, border: "2px solid #555", marginTop: 8 }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "#0f0",
                  transition: "width 1s linear",
                }}
              />
            </div>
            <div style={{ fontSize: 14, color: "#aaa" }}>{pct}% — please keep this page open</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 24, color: "#ff0", fontFamily: "var(--font-sans)" }}>✓ AD COMPLETE</div>
            <div style={{ fontSize: 16, color: "#0f0" }}>Thank you for watching!</div>
          </>
        )}
      </div>

      {phase === "done" && !collected && (
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: 12, color: "#1f4d3d", fontFamily: "var(--font-sans)", fontSize: 10 }}>
            Your $5.00 reward is ready to collect!
          </p>
          <button className="nes-btn is-success" onClick={handleCollect}>
            💰 Collect $5.00 — Send to Copperleaf Bank
          </button>
        </div>
      )}

      {collected && (
        <div
          style={{
            background: "#d4edda",
            border: "4px solid #1f4d3d",
            padding: 14,
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: 9,
            color: "#1f4d3d",
          }}
        >
          ✓ $5.00 sent to your Copperleaf Bank Everyday Checking account!
        </div>
      )}

      {phase === "watching" && (
        <p
          style={{
            textAlign: "center",
            fontSize: 16,
            color: "#888",
            fontFamily: "var(--font-body)",
            marginTop: 12,
          }}
        >
          ⚠ Do not close this page. Your reward will be ready when the ad finishes.
        </p>
      )}
    </div>
  );
}

function HomePage() {
  const { navigate } = useBrowser();
  return (
    <div style={{ padding: 24, fontFamily: "var(--font-body)", fontSize: 20 }}>
      <div
        style={{
          background: "#ff6600",
          color: "#fff",
          padding: "10px 18px",
          fontFamily: "var(--font-sans)",
          fontSize: 10,
          letterSpacing: 1,
          marginBottom: 20,
          boxShadow: "0 4px 0 #212529",
        }}
      >
        ★ AdRewards — Earn Cash for Your Attention ★
      </div>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 11, marginBottom: 8 }}>
        Get Paid to Watch Ads!
      </h2>
      <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
        Watch a 5-minute sponsored advertisement and receive <strong>$5.00</strong> deposited
        directly into your Copperleaf Bank account. Fast, easy, and completely free.
      </p>
      <button className="nes-btn is-warning" onClick={() => navigate(`${BASE}/watch`)}>
        ▶ Watch Ad — Earn $5.00
      </button>
    </div>
  );
}

export function AdRewards({ url }: { url: PageUrl }) {
  if (url.path === "/watch") return <WatchPage />;
  return <HomePage />;
}
