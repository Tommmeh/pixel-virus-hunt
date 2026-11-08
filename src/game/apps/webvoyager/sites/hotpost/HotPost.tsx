import { useEffect, useState } from "react";
import { emit } from "../../../../system/events";
import { PEOPLE } from "../../../../system/people";
import { PROFILE } from "../../../../system/profile";
import { questStore, type QuestFlags } from "../../../../system/quests";
import { unlockScam } from "../../../../scams/store";
import { ANISH_CARD_IDS } from "../../../../storylines/anish/cards";
import { startConversation } from "../../../messenger/store";
import { A, useBrowser } from "../../BrowserContext";
import type { PageUrl } from "../../url";
import { mailStore, markRead, receiveMail, sendMail, useMail, type Mail } from "./store";

const BASE = "https://mail.hotpost.com";

function SignIn() {
  const [email, setEmail] = useState(PROFILE.email);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="hp-signin">
      <div className="hp-brand">
        <span className="hp-logo">
          E-<b>mail</b>
        </span>
        <span>Free web-based email</span>
      </div>
      <form
        className="hp-signin-box"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = email.trim().toLowerCase() === PROFILE.email && pw === PROFILE.mailPassword;
          emit({ type: "mail.signin", ok });
          if (ok) mailStore.set((s) => ({ ...s, signedIn: true }));
          else setErr("The e-mail address or password is incorrect. Please try again.");
        }}
      >
        <b>Sign in to E-mail</b>
        <label>
          E-mail address
          <input className="nes-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input
            className="nes-input"
            type="password"
            data-tour="mail-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
        </label>
        {err && <p className="form-error">{err}</p>}
        <button className="nes-btn is-warning" type="submit">
          Sign In
        </button>
        <small>Forgot your password? Check the place you keep your notes.</small>
      </form>
    </div>
  );
}

function MailList({ list, read, folder }: { list: Mail[]; read: string[]; folder: string }) {
  if (list.length === 0) return <p className="hp-empty">There are no messages in this folder.</p>;
  return (
    <table className="hp-table">
      <thead>
        <tr>
          <th>{folder === "sent" ? "To" : "From"}</th>
          <th>Subject</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {list.map((m) => (
          <tr key={m.id} className={folder === "inbox" && !read.includes(m.id) ? "is-unread" : ""}>
            <td>{folder === "sent" ? m.to : m.fromName}</td>
            <td>
              <A href={`${BASE}/read?id=${m.id}`}>{m.subject}</A>
            </td>
            <td>{m.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderMailBody(text: string, navigate: (url: string) => void) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          style={{ textDecoration: "underline", color: "#2f6fe0", cursor: "pointer", fontWeight: "bold" }}
          onClick={(e) => {
            e.preventDefault();
            navigate(part);
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function AmazingSignIn({ mail }: { mail: Mail }) {
  const [signedIn, setSignedIn] = useState(() => questStore.get().amazingSignedIn);
  const [user, setUser] = useState(PROFILE.email);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  if (signedIn) {
    return (
      <div
        style={{
          background: "#fff8e1",
          border: "4px solid #f7a800",
          padding: 12,
          marginTop: 10,
          fontFamily: "var(--font-body)",
          fontSize: 18,
        }}
      >
        ✅ You are now signed in to Amazing. Your gift card confirmation has been sent to your inbox!
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff8e1",
        border: "4px solid #f7a800",
        padding: 14,
        marginTop: 10,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 9,
          color: "#b34700",
          marginBottom: 10,
          letterSpacing: 1,
        }}
      >
        🛒 AMAZING — Sign in to claim your $100 Gift Card
      </div>
      <form
        style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 300 }}
        onSubmit={(e) => {
          e.preventDefault();
          const ok =
            user.trim().toLowerCase() === PROFILE.email && pw === PROFILE.mailPassword;
          if (!ok) {
            setErr("Incorrect email or password. Please try again.");
            return;
          }
          // Mark done so we can't fire twice
          questStore.set((s: QuestFlags) => ({ ...s, amazingSignedIn: true }));
          unlockScam(ANISH_CARD_IDS.giftCard); // silent: the lesson waits in Quests
          setSignedIn(true);

          // 1) FriendSpace login alert (arrives quickly)
          setTimeout(
            () =>
              receiveMail({
                fromName: "FriendSpace Security",
                from: "security@friendspace.com",
                subject: "New sign-in to your FriendSpace account",
                body:
                  "Hi jamie_t,\n\n" +
                  "We noticed a new sign-in to your FriendSpace account from an unrecognised device.\n\n" +
                  "Date/Time: " + new Date().toLocaleString() + "\n" +
                  "Location:  Unknown\n" +
                  "Device:    Unknown Browser\n\n" +
                  "If this was you, no action is needed.\n" +
                  "If you don't recognise this activity, please change your password immediately.\n\n" +
                  "— The FriendSpace Team",
              }),
            3_000,
          );

          // 2) HotPost login alert (arrives a bit later)
          setTimeout(
            () =>
              receiveMail({
                fromName: "HotPost Security Team",
                from: "security@hotpost.com",
                subject: "Alert: New sign-in detected on your HotPost account",
                body:
                  "Dear jamie.taylor,\n\n" +
                  "A new sign-in to your e-mail account was detected.\n\n" +
                  "Date/Time: " + new Date().toLocaleString() + "\n" +
                  "IP Address: 94.102.49.190\n" +
                  "Location:  Unknown\n\n" +
                  "If this was you, you can ignore this message.\n" +
                  "If you did NOT sign in, your password may be compromised. " +
                  "We recommend changing it right away.\n\n" +
                  "— HotPost Security",
              }),
            7_000,
          );

          // 3) Amazing gift card confirmation (arrives last)
          setTimeout(
            () =>
              receiveMail({
                fromName: "Amazing Rewards Team",
                from: "rewards@amazing-shop.com",
                subject: "🎁 Your $100 Amazing Gift Card — Order Confirmed!",
                body:
                  "Thank you for signing in, Jamie!\n\n" +
                  "Your $100 Amazing Gift Card has been confirmed and is now active.\n\n" +
                  "Gift Card Code:  AMZN-2004-GIFT-X9K2\n" +
                  "Value:           $100.00\n" +
                  "Expires:         Never\n\n" +
                  "Redeem at checkout on amazing-shop.com.\n\n" +
                  "Enjoy your reward!\n\n" +
                  "— The Amazing Rewards Team",
              }),
            12_000,
          );

          // 4) Marcus has had a call from Emma — the money conversation has to play out before
          // the next email. QuestFlow sends the VideoVault trial offer once it ends.
          setTimeout(() => startConversation("marcus"), 16_000);
        }}
      >
        <label style={{ fontFamily: "var(--font-sans)", fontSize: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          Email address
          <input
            className="nes-input"
            type="email"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label style={{ fontFamily: "var(--font-sans)", fontSize: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          Password
          <input
            className="nes-input"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        {err && <p className="form-error">{err}</p>}
        <button className="nes-btn is-warning" type="submit">
          Sign In to Amazing
        </button>
      </form>
    </div>
  );
}

function ReadMail({ mail }: { mail: Mail | undefined }) {
  const { navigate } = useBrowser();
  if (!mail) return <p className="hp-empty">This message could not be found.</p>;

  const isAmazingPhish = mail.from === "rewards@amazing-shop.com" &&
    mail.subject.includes("FREE $100");

  return (
    <div className="hp-read">
      <div className="hp-read-head">
        <h3>{mail.subject}</h3>
        <p>
          <b>From:</b> {mail.fromName} &lt;{mail.from}&gt;
        </p>
        <p>
          <b>To:</b> {mail.to}
        </p>
        <p>
          <b>Date:</b> {mail.date}
        </p>
      </div>
      <pre className="hp-body">{renderMailBody(mail.body, navigate)}</pre>
      {mail.body.includes("http://www.adrewards.com/watch") && (
        <div style={{ marginBottom: 12 }}>
          <button
            className="nes-btn is-success is-small"
            onClick={() => navigate("http://www.adrewards.com/watch")}
          >
            ▶ Watch 5-Minute Ad ($5.00 Payout)
          </button>
        </div>
      )}
      {isAmazingPhish && <AmazingSignIn mail={mail} />}
      {mail.from !== PROFILE.email && !isAmazingPhish && (
        <button
          className="nes-btn is-primary"
          onClick={() =>
            navigate(
              `${BASE}/compose?to=${encodeURIComponent(mail.from)}&subject=${encodeURIComponent(
                mail.subject.startsWith("RE:") ? mail.subject : `RE: ${mail.subject}`,
              )}`,
            )
          }
        >
          Reply
        </button>
      )}
    </div>
  );
}

function Compose({ to0, subject0 }: { to0: string; subject0: string }) {
  const { navigate } = useBrowser();
  const [to, setTo] = useState(to0);
  const [subject, setSubject] = useState(subject0);
  const [body, setBody] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      className="hp-compose"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to.trim())) {
          setErr("Please enter a valid e-mail address in the To: box.");
          return;
        }
        sendMail(to, subject, body);
        navigate(`${BASE}/sent`);
      }}
    >
      <label>
        To:
        <input
          className="nes-input"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          list="hp-contacts"
        />
        <datalist id="hp-contacts">
          {PEOPLE.map((p) => (
            <option key={p.id} value={p.email}>
              {p.name}
            </option>
          ))}
        </datalist>
      </label>
      <label>
        Subject:
        <input className="nes-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>
      <textarea
        className="nes-textarea hp-compose-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-label="Message"
      />
      {err && <p className="form-error">{err}</p>}
      <span className="flex gap-2">
        <button className="nes-btn is-primary" type="submit">
          Send
        </button>
        <button className="nes-btn" type="button" onClick={() => navigate(`${BASE}/`)}>
          Cancel
        </button>
      </span>
    </form>
  );
}

export function HotPost({ url }: { url: PageUrl }) {
  const mail = useMail();
  if (url.path === "/signout") return <SignOut />;
  if (!mail.signedIn) return <SignIn />;

  const unread = mail.inbox.filter((m) => !mail.read.includes(m.id)).length;
  const id = url.query.get("id");
  const reading =
    url.path === "/read" ? [...mail.inbox, ...mail.sent].find((m) => m.id === id) : undefined;

  let main;
  if (url.path === "/read") main = <ReadMail mail={reading} />;
  else if (url.path === "/compose")
    main = <Compose to0={url.query.get("to") ?? ""} subject0={url.query.get("subject") ?? ""} />;
  else if (url.path === "/sent")
    main = <MailList list={mail.sent} read={mail.read} folder="sent" />;
  else main = <MailList list={mail.inbox} read={mail.read} folder="inbox" />;

  return (
    <div className="hotpost">
      <ReadMarker mail={reading} />
      <div className="hp-header">
        <span className="hp-logo">
          E-<b>mail</b>
        </span>
        <span className="hp-user">
          {PROFILE.email} · <A href={`${BASE}/signout`}>Sign out</A>
        </span>
      </div>
      <div className="hp-layout">
        <nav className="hp-nav">
          <A href={`${BASE}/compose`} className="hp-compose-btn">
            ✉ New Message
          </A>
          <A href={`${BASE}/`}>Inbox {unread > 0 && <b>({unread})</b>}</A>
          <A href={`${BASE}/sent`}>Sent Items</A>
        </nav>
        <section className="hp-main">{main}</section>
      </div>
    </div>
  );
}

/** Marks the open message as read and tells the event bus. */
function ReadMarker({ mail }: { mail: Mail | undefined }) {
  const id = mail?.id;
  const from = mail?.from;
  useEffect(() => {
    if (!id || !from) return;
    markRead(id);
    emit({ type: "mail.open", id, from });
  }, [id, from]);
  return null;
}

function SignOut() {
  useEffect(() => {
    mailStore.set((s) => ({ ...s, signedIn: false }));
  }, []);
  return <SignIn />;
}
