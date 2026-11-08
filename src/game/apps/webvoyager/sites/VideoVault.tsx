import { useState, type CSSProperties, type FormEvent } from "react";
import { PROFILE } from "../../../system/profile";
import { questStore, type QuestFlags } from "../../../system/quests";
import { unlockScam } from "../../../scams/store";
import { ANISH_CARD_IDS } from "../../../storylines/anish/cards";
import { continueConversation } from "../../messenger/store";
import { useBrowser } from "../BrowserContext";
import type { PageUrl } from "../url";
import { deposit, drainAccounts } from "./copperleaf/store";
import { receiveMail } from "./hotpost/store";

const BASE = "https://www.videovault-tv.com";
const BONUS = 100;
const MASKED = "****4821";

const banner: CSSProperties = {
  background: "#2b1b4a",
  color: "#fff",
  padding: "10px 18px",
  fontFamily: "var(--font-sans)",
  fontSize: 10,
  letterSpacing: 1,
  marginBottom: 18,
  boxShadow: "0 4px 0 #212529",
};

const page: CSSProperties = {
  padding: 24,
  maxWidth: 560,
  fontFamily: "var(--font-body)",
  fontSize: 20,
};

const okBox: CSSProperties = {
  background: "#d4edda",
  border: "4px solid #1f4d3d",
  padding: 14,
  marginBottom: 16,
  color: "#1f4d3d",
  lineHeight: 1.5,
};

const bankButton = (label: string, onClick: () => void) => (
  <button className="nes-btn is-success" onClick={onClick}>
    {label}
  </button>
);

/** The bank only tells the player about it afterwards — nothing is blocked or reversed. */
function sendBankAlert() {
  receiveMail({
    fromName: "Copperleaf Bank Alerts",
    from: "alerts@copperleafbank.com",
    subject: "Unusual activity on Everyday Checking (ending 4821)",
    body:
      "Dear Jamie Taylor,\n\n" +
      "We are writing about some activity on your Everyday Checking account that is unusual for you.\n\n" +
      "Amount:   $100.00 credit\n" +
      "Paid by:  VIDEOVAULT MEDIA\n" +
      "Date:     " +
      new Date().toLocaleDateString("en-GB") +
      "\n\n" +
      "We also noticed your online banking details were used to verify your account with a website that is not Copperleaf.\n\n" +
      "Your account, card and payments have not been blocked and nothing has been held — everything will keep working as normal, and payments that have already cleared cannot be reversed by us.\n\n" +
      "If you recognise this activity, no action is needed.\n\n" +
      "You can view the transaction in Online Banking:\nhttps://www.copperleafbank.com/accounts\n\n" +
      "Copperleaf Bank — helping you keep track of your money.",
  });
}

/** Everything the scammer can reach is gone; the bank only reports the payment it had to refuse. */
function sendInsufficientFundsAlert() {
  receiveMail({
    fromName: "Copperleaf Bank",
    from: "alerts@copperleafbank.com",
    subject: "Payment declined — insufficient balance",
    body:
      "Dear Jamie Taylor,\n\n" +
      "A payment from your Everyday Checking account (ending 4821) has been declined.\n\n" +
      "Amount:   $600.00\n" +
      "Paid to:  VIDEOVAULT MEDIA\n" +
      "Reason:   Insufficient balance\n\n" +
      "Your account and card have not been blocked. Please make sure there are enough funds in your account before trying again.\n\n" +
      "You can review the recent activity on your account in Online Banking:\nhttps://www.copperleafbank.com/accounts\n\n" +
      "Copperleaf Bank — helping you keep track of your money.",
  });
}

/** Shared "verify your bank account" form — the same details as the bank's own login. */
function BankSignIn({
  blurb,
  cta,
  onVerified,
}: {
  blurb: string;
  cta: string;
  onVerified: () => void;
}) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const id = email.trim().toLowerCase();
    const ok = (id === PROFILE.bankUser || id === PROFILE.email) && pw === PROFILE.bankPassword;
    if (!ok) {
      setErr(
        "We couldn't verify those details. Use the same email and password you log in to your bank with.",
      );
      return;
    }
    setErr("");
    onVerified();
  }

  return (
    <>
      <p style={{ lineHeight: 1.6, marginBottom: 16 }}>{blurb}</p>
      <form
        onSubmit={submit}
        style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Email address
          <input
            className="nes-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Online banking password
          <input
            className="nes-input"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        {err && <p className="form-error">{err}</p>}
        <button className="nes-btn is-warning" type="submit">
          {cta}
        </button>
        <small>
          Your bank details are encrypted and stored securely by our payments partner. We never
          share them with anyone.
        </small>
      </form>
    </>
  );
}

function Login() {
  const { navigate } = useBrowser();
  const [signedIn, setSignedIn] = useState(() => questStore.get().videoVaultSignedIn);

  if (signedIn) {
    return (
      <div style={page}>
        <div style={banner}>▶ VideoVault — PLAYER PRO</div>
        <p style={okBox}>
          ✅ You&apos;re signed in to VideoVault Player Pro. $100.00 has been credited to your bank
          account (Everyday Checking {MASKED}) and your 14-day free trial starts now.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {bankButton("Check my bank account", () =>
            navigate("https://www.copperleafbank.com/accounts"),
          )}
          <button className="nes-btn" onClick={() => navigate(`${BASE}/`)}>
            Back to VideoVault
          </button>
        </div>
      </div>
    );
  }

  function signIn() {
    questStore.set((s: QuestFlags) => ({ ...s, videoVaultSignedIn: true }));
    unlockScam(ANISH_CARD_IDS.paidTrial); // silent: the lesson waits in Achievements
    setSignedIn(true);
    deposit({ account: "chk", amount: BONUS, desc: "VIDEOVAULT SIGN-UP BONUS" });
    sendBankAlert();

    // Emma finds out what he signed up to. The prize draw mail only arrives once that
    // conversation has played out and he still won't take Marcus's money — see shell/QuestFlow.
    if (!questStore.get().wifeFollowUpStarted) {
      setTimeout(() => {
        continueConversation("emma", "rent2");
        questStore.set((s: QuestFlags) => ({ ...s, wifeFollowUpStarted: true }));
      }, 6_000);
    }
  }

  return (
    <div style={page}>
      <div style={banner}>▶ VideoVault — SIGN IN TO CLAIM</div>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 11, marginBottom: 10 }}>
        Sign in to claim your $100
      </h2>
      <BankSignIn
        blurb="To activate your 14-day free trial, sign in with the same email and password you use for your bank account — that is where your $100.00 bonus will be paid."
        cta="Sign in & pay me $100"
        onVerified={signIn}
      />
    </div>
  );
}

/** The "1000th sign-up" prize: the second bank sign-in is what hands the account over. */
function Prize() {
  const { navigate } = useBrowser();
  const [entered, setEntered] = useState(() => questStore.get().bankDrained);

  if (entered) {
    return (
      <div style={page}>
        <div style={banner}>▶ VideoVault — PRIZE DRAW</div>
        <p style={okBox}>
          🎉 Entry confirmed! You&apos;re in Friday&apos;s draw to win $500.00. Your bank account
          has been verified and we&apos;ll be in touch if you win.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {bankButton("Check my bank account", () =>
            navigate("https://www.copperleafbank.com/accounts"),
          )}
          <button className="nes-btn" onClick={() => navigate(`${BASE}/`)}>
            Back to VideoVault
          </button>
        </div>
      </div>
    );
  }

  function enterDraw() {
    questStore.set((s: QuestFlags) => ({ ...s, bankDrained: true }));
    unlockScam(ANISH_CARD_IDS.prize);
    setEntered(true);
    drainAccounts();
    sendInsufficientFundsAlert();
  }

  return (
    <div style={page}>
      <div style={banner}>▶ VideoVault — CLAIM YOUR PRIZE ENTRY</div>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 11, marginBottom: 10 }}>
        Confirm your entry to win $500
      </h2>
      <BankSignIn
        blurb="You're our 1000th sign-up! Sign in and verify your bank account again to confirm your entry in Friday's $500.00 draw."
        cta="Sign in & claim my entry"
        onVerified={enterDraw}
      />
    </div>
  );
}

function Home() {
  const { navigate } = useBrowser();
  const claimed = questStore.use().videoVaultSignedIn;
  return (
    <div style={page}>
      <div style={banner}>▶ VideoVault — PLAYER PRO</div>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 11, marginBottom: 10 }}>
        Watch anything. Get paid for trying.
      </h2>
      <p style={{ lineHeight: 1.6, marginBottom: 12 }}>
        VideoVault Player Pro plays every video format there is — and our 14-day free trial pays you{" "}
        <strong>$100.00</strong> straight into your bank account the moment you sign in.
      </p>
      <ul style={{ lineHeight: 1.6, marginBottom: 18, paddingLeft: 22 }}>
        <li>No credit card needed — we verify your bank instead</li>
        <li>$100.00 paid within seconds of signing in</li>
        <li>Cancel any time</li>
      </ul>
      {claimed ? (
        <p style={okBox}>✓ You have already claimed your $100.00 bonus.</p>
      ) : (
        <button className="nes-btn is-warning" onClick={() => navigate(`${BASE}/login`)}>
          Claim my $100
        </button>
      )}
    </div>
  );
}

export function VideoVault({ url }: { url: PageUrl }) {
  if (url.path === "/login") return <Login />;
  if (url.path === "/win") return <Prize />;
  return <Home />;
}
