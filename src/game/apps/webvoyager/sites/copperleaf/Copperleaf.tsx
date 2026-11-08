import { useEffect, useState } from "react";
import { Check, Select, formatMoney } from "../../../../components/ui";
import { emit } from "../../../../system/events";
import { PROFILE } from "../../../../system/profile";
import { A, useBrowser } from "../../BrowserContext";
import type { PageUrl } from "../../url";
import { bankSession, bankStore, transfer } from "./store";

const BASE = "https://www.copperleafbank.com";

function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="cl-header">
      <span className="cl-logo">
        <span className="cl-leaf">❦</span> Copperleaf <small>BANK</small>
      </span>
      <nav>
        {signedIn ? (
          <>
            <A href={`${BASE}/accounts`}>My accounts</A>
            <A href={`${BASE}/transfer`}>Transfer money</A>
            <A href={`${BASE}/signout`}>Log out</A>
          </>
        ) : (
          <>
            <span>Personal</span>
            <span>Savings</span>
            <span>Help</span>
          </>
        )}
      </nav>
    </div>
  );
}

function Login() {
  const { navigate } = useBrowser();
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="cl-home">
      <form
        className="cl-login"
        onSubmit={(e) => {
          e.preventDefault();
          const ok = user.trim().toLowerCase() === PROFILE.bankUser && pw === PROFILE.bankPassword;
          emit({ type: "bank.login", ok });
          if (!ok) {
            setErr("Sorry, those details don't match our records.");
            return;
          }
          bankSession.set({ signedIn: true });
          navigate(`${BASE}/accounts`);
        }}
      >
        <h3>Log in to Online Banking</h3>
        <label>
          User ID
          <input className="nes-input" value={user} onChange={(e) => setUser(e.target.value)} />
        </label>
        <label>
          Password
          <input
            className="nes-input"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </label>
        {err && <p className="form-error">{err}</p>}
        <button className="nes-btn is-warning cl-btn" type="submit">
          Log in
        </button>
        <small>We will never ask for your password by email or phone.</small>
      </form>
      <div className="cl-promo">
        <h2>Saving for something special?</h2>
        <p>Our Rainy Day Savings account pays 3.5% AER. Open one in minutes online.</p>
        <h4>Banking safely</h4>
        <ul>
          <li>Always check for the padlock before logging in.</li>
          <li>Log out when you've finished.</li>
        </ul>
      </div>
    </div>
  );
}

function Accounts() {
  const bank = bankStore.use();
  return (
    <div className="cl-page">
      <h2>Welcome back, {PROFILE.fullName}</h2>
      <table className="cl-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Number</th>
            <th className="num">Balance</th>
          </tr>
        </thead>
        <tbody>
          {bank.accounts.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.number}</td>
              <td className="num">{formatMoney(a.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Recent transactions</h3>
      <table className="cl-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Account</th>
            <th>Description</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bank.tx.slice(0, 10).map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{bank.accounts.find((a) => a.id === t.account)?.name}</td>
              <td>{t.desc}</td>
              <td className={`num ${t.amount < 0 ? "is-out" : "is-in"}`}>
                {t.amount < 0 ? "-" : "+"}
                {formatMoney(Math.abs(t.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Transfer() {
  const bank = bankStore.use();
  const [from, setFrom] = useState("chk");
  const [mode, setMode] = useState<"own" | "payee">("own");
  const [toAcc, setToAcc] = useState("sav");
  const [payee, setPayee] = useState("");
  const [sort, setSort] = useState("");
  const [accNo, setAccNo] = useState("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="cl-page">
      <h2>Transfer money</h2>
      <form
        className="cl-form"
        onSubmit={(e) => {
          e.preventDefault();
          const r = transfer({
            from,
            to: mode === "own" ? { account: toAcc } : { payee, sortCode: sort, accountNo: accNo },
            amount: Number(amount),
            reference: ref,
          });
          if (r.ok) {
            setMsg({ ok: true, text: `Done! ${formatMoney(Number(amount))} has been sent.` });
            setAmount("");
            setRef("");
          } else setMsg({ ok: false, text: r.error });
        }}
      >
        <label>
          From
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            {bank.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({formatMoney(a.balance)})
              </option>
            ))}
          </Select>
        </label>
        <fieldset className="cl-radio">
          <Check radio name="cl-mode" checked={mode === "own"} onChange={() => setMode("own")}>
            Between my accounts
          </Check>
          <Check radio name="cl-mode" checked={mode === "payee"} onChange={() => setMode("payee")}>
            Pay someone else
          </Check>
        </fieldset>
        {mode === "own" ? (
          <label>
            To
            <Select value={toAcc} onChange={(e) => setToAcc(e.target.value)}>
              {bank.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </label>
        ) : (
          <>
            <label>
              Payee name
              <input
                className="nes-input"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
              />
            </label>
            <label>
              Sort code
              <input
                className="nes-input"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                placeholder="12-34-56"
              />
            </label>
            <label>
              Account number
              <input
                className="nes-input"
                value={accNo}
                onChange={(e) => setAccNo(e.target.value)}
                placeholder="8 digits"
              />
            </label>
          </>
        )}
        <label>
          Amount (£)
          <input
            className="nes-input"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label>
          Reference
          <input className="nes-input" value={ref} onChange={(e) => setRef(e.target.value)} />
        </label>
        {msg && <p className={msg.ok ? "form-ok" : "form-error"}>{msg.text}</p>}
        <button className="nes-btn is-warning cl-btn" type="submit">
          Send money
        </button>
      </form>
    </div>
  );
}

function SignOut() {
  useEffect(() => bankSession.set({ signedIn: false }), []);
  return (
    <div className="cl-page">
      <h2>You have logged out</h2>
      <p>Thank you for banking with Copperleaf. Close this window to keep your account safe.</p>
      <A href={`${BASE}/`}>Log in again</A>
    </div>
  );
}

export function Copperleaf({ url }: { url: PageUrl }) {
  const { signedIn } = bankSession.use();
  let page;
  if (url.path === "/signout") page = <SignOut />;
  else if (!signedIn) page = <Login />;
  else if (url.path === "/transfer") page = <Transfer />;
  else page = <Accounts />;
  return (
    <div className="copperleaf">
      <Header signedIn={signedIn && url.path !== "/signout"} />
      {page}
      <div className="cl-foot">
        Copperleaf Bank plc · Member of the Fictional Deposit Scheme · Not a real bank
      </div>
    </div>
  );
}
