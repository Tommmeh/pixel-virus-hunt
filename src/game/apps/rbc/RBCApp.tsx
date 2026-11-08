// RBC Online Banking as an installed program: sign in with the same details as before, see the
// recovered money sitting in the new account, then the whole screen washes slowly to white.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PROFILE } from "../../system/profile";
import { questStore } from "../../system/quests";
import { goodEnd } from "../../system/session";

const money = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RBC_BLUE = "#0051a5";
const RBC_GOLD = "#f7d51d";
const RBC_LOGO = "/rbc-logo.svg";

const label = { fontFamily: "var(--font-sans)", fontSize: 9, letterSpacing: 1 } as const;

/** How long the account sits there before the white wash starts, and how long the wash takes. */
const READ_MS = 3_000;
const FADE_MS = 3_400;

export function RBCApp() {
  const { refundAmount } = questStore.use();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [fading, setFading] = useState(false);

  // Once the transfer is on screen, hold it long enough to read, then fade out to the ending.
  useEffect(() => {
    if (!signedIn) return;
    const hold = setTimeout(() => setFading(true), READ_MS);
    const done = setTimeout(() => goodEnd(), READ_MS + FADE_MS);
    return () => {
      clearTimeout(hold);
      clearTimeout(done);
    };
  }, [signedIn]);

  function signIn() {
    if (user.trim().toLowerCase() === PROFILE.bankUser && pass === PROFILE.bankPassword) {
      setError("");
      setSignedIn(true);
      return;
    }
    setError("That username or password doesn't match this account.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      <div
        style={{
          background: RBC_BLUE,
          color: "#fff",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <img src={RBC_LOGO} alt="RBC" style={{ height: 30, width: "auto" }} />
        <span style={{ ...label, fontSize: 8, opacity: 0.9 }}>ONLINE BANKING</span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          fontFamily: "var(--font-body)",
          fontSize: 19,
          color: "#111",
        }}
      >
        {!signedIn ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ ...label, margin: 0, color: RBC_BLUE }}>SIGN IN</p>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              Use the same username and password you used at your old bank.
            </p>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 16, color: "#444" }}>Username</span>
              <input
                className="nes-input"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="jamie.taylor"
                autoFocus
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 16, color: "#444" }}>Password</span>
              <input
                className="nes-input"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && signIn()}
              />
            </label>
            {error && <p style={{ margin: 0, color: "#ce372b" }}>{error}</p>}
            <button className="nes-btn is-primary" onClick={signIn}>
              Sign in
            </button>
            <p style={{ margin: 0, fontSize: 16, color: "#666" }}>
              RBC will never ask for this password by email, text or phone.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ ...label, margin: 0, color: RBC_BLUE }}>WELCOME BACK, JAMIE</p>

            <div
              style={{
                border: `4px solid ${RBC_BLUE}`,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <p style={{ ...label, margin: 0, fontSize: 8 }}>EVERYDAY CHEQUING ****7712</p>
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 16 }}>
                {money(refundAmount)}
              </p>
              <p style={{ margin: 0, fontSize: 16, color: "#444" }}>Available balance</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ ...label, margin: 0, fontSize: 8, color: "#444" }}>RECENT ACTIVITY</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  borderBottom: "2px dashed #ccc",
                  paddingBottom: 6,
                }}
              >
                <span>TRANSFER IN — COPPERLEAF BANK</span>
                <span style={{ color: "#1f7a4d", whiteSpace: "nowrap" }}>
                  +{money(refundAmount)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 16, color: "#444" }}>
                Reference: GOODWILL REFUND · 45% of the amount taken
              </p>
            </div>

            <p style={{ margin: 0, lineHeight: 1.45 }}>
              Your money arrived and it stayed. Every payment from here is checked against your
              usual pattern, and anything odd is held until you say yes.
            </p>
            {refundAmount > 0 && (
              <p style={{ margin: 0, fontSize: 16, color: "#666" }}>
                The rest of what was taken is still gone. This is the part that came back.
              </p>
            )}
            <p
              style={{
                ...label,
                margin: 0,
                fontSize: 8,
                color: RBC_GOLD,
                filter: "brightness(0.8)",
              }}
            >
              SIGNING OUT OF THE STORY…
            </p>
          </div>
        )}
      </div>

      {/* The wash covers the whole screen, not just this window, and hands over to the ending. */}
      {fading &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "#fff",
              zIndex: 100_000,
              pointerEvents: "none",
              animation: `vh-fade-in ${FADE_MS}ms ease both`,
            }}
          />,
          document.body,
        )}
    </div>
  );
}
