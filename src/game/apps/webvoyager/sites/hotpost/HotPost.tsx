import { useEffect, useState } from "react";
import { emit } from "../../../../system/events";
import { PEOPLE } from "../../../../system/people";
import { PROFILE } from "../../../../system/profile";
import { A, useBrowser } from "../../BrowserContext";
import type { PageUrl } from "../../url";
import { mailStore, markRead, sendMail, useMail, type Mail } from "./store";

const BASE = "https://mail.hotpost.com";

function SignIn() {
  const [email, setEmail] = useState(PROFILE.email);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="hp-signin">
      <div className="hp-brand">
        <span className="hp-logo">
          Hot<b>Post</b>
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
        <b>Sign in to HotPost Mail</b>
        <label>
          E-mail address
          <input className="xp-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input
            className="xp-input"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
        </label>
        {err && <p className="form-error">{err}</p>}
        <button className="xp-btn" type="submit">
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

function ReadMail({ mail }: { mail: Mail | undefined }) {
  const { navigate } = useBrowser();
  if (!mail) return <p className="hp-empty">This message could not be found.</p>;
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
      <pre className="hp-body">{mail.body}</pre>
      {mail.from !== PROFILE.email && (
        <button
          className="xp-btn"
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
          className="xp-input"
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
        <input className="xp-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>
      <textarea
        className="xp-input hp-compose-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-label="Message"
      />
      {err && <p className="form-error">{err}</p>}
      <span className="flex gap-2">
        <button className="xp-btn" type="submit">
          Send
        </button>
        <button className="xp-btn" type="button" onClick={() => navigate(`${BASE}/`)}>
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
          Hot<b>Post</b> Mail
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
