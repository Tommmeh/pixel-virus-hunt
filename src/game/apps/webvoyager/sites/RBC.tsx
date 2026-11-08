import { useState, type CSSProperties } from "react";
import { questStore, type QuestFlags } from "../../../system/quests";
import { wm } from "../../../system/windows";
import { useBrowser } from "../BrowserContext";
import type { PageUrl } from "../url";

const BASE = "https://www.rbc.com";

/** The real mark, used wherever the bank's name appears. */
function RbcMark() {
  return (
    <img
      src="/rbc-logo.svg"
      alt="RBC"
      style={{ height: 24, width: "auto", verticalAlign: "middle", marginRight: 8 }}
    />
  );
}

const banner: CSSProperties = {
  background: "#0a4f9e",
  color: "#fff",
  padding: "10px 18px",
  fontFamily: "var(--font-sans)",
  fontSize: 10,
  letterSpacing: 1,
  marginBottom: 18,
  display: "flex",
  alignItems: "center",
  boxShadow: "0 4px 0 #212529",
};

const page: CSSProperties = {
  padding: 24,
  maxWidth: 560,
  fontFamily: "var(--font-body)",
  fontSize: 20,
};

const okBox: CSSProperties = {
  background: "#e6f0fb",
  border: "4px solid #0a4f9e",
  padding: 14,
  marginBottom: 16,
  color: "#0a2540",
  lineHeight: 1.5,
};

function Home() {
  const { navigate } = useBrowser();
  const installed = questStore.use().rbcInstalled;

  return (
    <div style={page}>
      <div style={banner}>
        <RbcMark /> RBC — ONLINE BANKING
      </div>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 11, marginBottom: 10 }}>
        Banking that checks before it pays
      </h2>
      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
        Most banks tell you about a payment after it has gone. RBC holds payments that don&apos;t
        fit your usual pattern and rings you before a penny leaves the account.
      </p>
      <ul style={{ lineHeight: 1.6, marginBottom: 18, paddingLeft: 22 }}>
        <li>Unrecognised payments are held, not paid</li>
        <li>A call or text before any unusual payment clears</li>
        <li>We will never ask for your password — not by email, text or phone</li>
      </ul>
      {installed ? (
        <p style={okBox}>✓ RBC Online Banking is installed on this computer.</p>
      ) : (
        <button className="nes-btn is-primary" onClick={() => navigate(`${BASE}/switch`)}>
          Switch my account
        </button>
      )}
    </div>
  );
}

function Switch() {
  const { navigate } = useBrowser();
  const installed = questStore.use().rbcInstalled;
  const [installing, setInstalling] = useState(false);

  function install() {
    setInstalling(true);
    setTimeout(() => {
      questStore.set((s: QuestFlags) => ({ ...s, rbcInstalled: true }));
      setInstalling(false);
    }, 2_200);
  }

  if (installed) {
    return (
      <div style={page}>
        <div style={banner}>
          <RbcMark /> RBC — SET UP
        </div>
        <p style={okBox}>
          ✓ RBC Online Banking is installed. It&apos;s on your desktop now — open it and sign in
          with the same username and password you used before.
        </p>
        <button className="nes-btn is-primary" onClick={() => wm.open("rbc")}>
          Open RBC Online Banking
        </button>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={banner}>
        <RbcMark /> RBC — INSTALL ONLINE BANKING
      </div>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 11, marginBottom: 10 }}>
        Install RBC Online Banking
      </h2>
      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
        You&apos;re a few clicks from an account that stops money before it leaves. Install RBC
        Online Banking on this computer and we&apos;ll walk you through moving your payments across.
      </p>
      <ul style={{ lineHeight: 1.6, marginBottom: 18, paddingLeft: 22 }}>
        <li>Payment checks on every transfer and direct debit</li>
        <li>Alerts by text and email the moment something unusual is attempted</li>
        <li>Set up in one sitting — no branch visit, no paperwork</li>
      </ul>
      {installing ? (
        <p style={okBox}>Installing RBC Online Banking… don&apos;t close this window.</p>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="nes-btn is-primary" onClick={install}>
            Install RBC Online Banking
          </button>
          <button className="nes-btn" onClick={() => navigate(`${BASE}/`)}>
            Not now
          </button>
        </div>
      )}
    </div>
  );
}

export function RBC({ url }: { url: PageUrl }) {
  if (url.path === "/switch") return <Switch />;
  return <Home />;
}
