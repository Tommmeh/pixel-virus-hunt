// The "StockLadder Trade" window from Zhuming's storyline: the fake trading app Kevin sent.
// The board re-prices itself every five seconds, anything on it can be bought or sold, and every
// order settles straight against the Copperleaf chequing account whose login the app collected.
// Nothing here is real: ordinary shares drift down towards pennies, and his tip breathes both ways
// with the odd fourfold spike.
import { useEffect, useState } from "react";
import { formatMoney } from "../../components/ui";
import { useSettings } from "../../system/settings";
import { chequing, chequingBalance, creditChequing, payFromChequing } from "./bank";
import {
  buy,
  canBuy,
  changeOf,
  costOf,
  link,
  LOT,
  priceOf,
  profitOf,
  RAM_TICKER,
  sell,
  STOCKS,
  TICK_MS,
  tick,
  valueOf,
} from "./market";
import { marketStore } from "./store";
import { noteTrade, nudgeAfterBuy } from "./story";

type Tab = "market" | "portfolio" | "funding";

const pct = (n: number) =>
  `${n >= 0 ? "▲ +" : "▼ "}${Math.abs(n).toLocaleString("en-GB", { maximumFractionDigits: 2 })}%`;

const signed = (n: number) => `${n >= 0 ? "+" : "-"}${formatMoney(Math.abs(n))}`;

export function StockApp() {
  const name = useSettings().userName;
  const [tab, setTab] = useState<Tab>("market");
  const m = marketStore.use();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [flash, setFlash] = useState("");
  const acct = chequing();

  // The board moves on its own, whether or not anyone is watching this window.
  useEffect(() => {
    const id = setInterval(() => marketStore.set((s) => tick(s)), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const placeOrder = (ticker: string) => {
    if (!m.linked) {
      setTab("funding");
      setFlash("Connect your bank account before you trade.");
      return;
    }
    if (!canBuy(m, ticker)) {
      setFlash(`${ticker}: not enough in your chequing account for ${LOT} shares.`);
      return;
    }
    const price = priceOf(m, ticker);
    const cost = costOf(m, ticker);
    if (!payFromChequing(cost, `STOCKLADDER TRADE ${ticker}`)) {
      setFlash("Your bank declined the payment.");
      return;
    }
    marketStore.set(buy(m, ticker));
    noteTrade("buy", cost);
    setFlash(`${LOT} ${ticker} bought at ${formatMoney(price)} · charged to Copperleaf`);
    nudgeAfterBuy(ticker);
  };

  const sellOrder = (ticker: string) => {
    const price = priceOf(m, ticker);
    const { state, proceeds } = sell(m, ticker);
    if (!(proceeds > 0)) return;
    marketStore.set(state);
    creditChequing(proceeds, `STOCKLADDER SALE ${ticker}`);
    noteTrade("sell", proceeds);
    setFlash(`${ticker} sold at ${formatMoney(price)} · ${formatMoney(proceeds)} to Copperleaf`);
  };

  const connect = () => {
    marketStore.set(link(m, chequingBalance()));
    setPass("");
    setFlash(`Copperleaf linked · ${formatMoney(chequingBalance())} available to invest`);
    setTab("market");
  };

  const positions = STOCKS.filter((s) => m.holdings[s.ticker]);
  const pl = profitOf(m);

  return (
    <div className="stockladder">
      <div className="st-head">
        <div>
          <b>StockLadder Trade 1.0</b>
          <p>Signed in as {name} · RAM Capital group</p>
        </div>
        <span className="st-live">● LIVE</span>
      </div>

      <div className="st-ticker">
        {RAM_TICKER} <span className="st-up">{formatMoney(priceOf(m, RAM_TICKER))}</span>{" "}
        <span className={changeOf(m, RAM_TICKER) >= 0 ? "st-up" : "st-down"}>
          {pct(changeOf(m, RAM_TICKER))}
        </span>
        <small>RAM Holdings Inc · delayed 0 min</small>
      </div>

      <div className="st-tabs">
        <button
          className={`st-tab ${tab === "market" ? "is-on" : ""}`}
          onClick={() => setTab("market")}
        >
          Market
        </button>
        <button
          className={`st-tab ${tab === "portfolio" ? "is-on" : ""}`}
          onClick={() => setTab("portfolio")}
        >
          Portfolio
        </button>
        <button
          className={`st-tab ${tab === "funding" ? "is-on" : ""}`}
          onClick={() => setTab("funding")}
        >
          Funding {m.linked ? "✓" : "!"}
        </button>
      </div>

      {flash && <p className="st-flag">{flash}</p>}

      {tab === "market" ? (
        <div className="st-main">
          <p className="st-cash">
            Available to invest: <b>{formatMoney(m.cash)}</b> ·{" "}
            {m.linked
              ? `${acct?.name ?? "Copperleaf"} ${acct?.number ?? ""} linked`
              : "no bank linked"}
          </p>
          {STOCKS.map((s) => {
            const held = m.holdings[s.ticker];
            const change = changeOf(m, s.ticker);
            return (
              <div key={s.ticker} className={`st-mkt${s.recommended ? " is-pick" : ""}`}>
                <div className="st-mkt-id">
                  <b>{s.ticker}</b>
                  <small>{s.name}</small>
                  {s.recommended && <em className="st-pick">★ Kevin's pick · {s.note}</em>}
                  {held && <em className="st-pick st-own">{held.shares} shares held</em>}
                </div>
                <div className="st-mkt-num">
                  <span>{formatMoney(priceOf(m, s.ticker))}</span>
                  <small className={change >= 0 ? "st-up" : "st-down"}>{pct(change)}</small>
                </div>
                {held && (
                  <button
                    className="nes-btn is-small is-warning st-buy"
                    onClick={() => sellOrder(s.ticker)}
                  >
                    Sell
                  </button>
                )}
                <button
                  className="nes-btn is-small is-success st-buy"
                  disabled={m.linked && !canBuy(m, s.ticker)}
                  onClick={() => placeOrder(s.ticker)}
                >
                  Buy {LOT}
                </button>
              </div>
            );
          })}
          <p className="st-note">Quote feed provided by RAM Capital Invest · delayed 0 min.</p>
        </div>
      ) : tab === "portfolio" ? (
        <div className="st-main">
          <h3>ACCOUNT VALUE</h3>
          <div className="st-row">
            <span>Cash available</span>
            <span>{formatMoney(m.cash)}</span>
          </div>
          <div className="st-row">
            <span>Positions</span>
            <span>{formatMoney(valueOf(m))}</span>
          </div>
          <div className="st-row">
            <span>Profit / loss</span>
            <span className={pl >= 0 ? "st-up" : "st-down"}>{signed(pl)}</span>
          </div>
          <h3>POSITIONS</h3>
          {positions.length === 0 ? (
            <p className="st-note">No positions yet.</p>
          ) : (
            positions.map((s) => {
              const h = m.holdings[s.ticker]!;
              const value = priceOf(m, s.ticker) * h.shares;
              return (
                <div key={s.ticker} className="st-row">
                  <span>
                    {s.ticker} · {h.shares} @ {formatMoney(h.paid / h.shares)}
                  </span>
                  <span className={value >= h.paid ? "st-up" : "st-down"}>
                    {formatMoney(value)}
                  </span>
                </div>
              );
            })
          )}
          <p className="st-note">
            Withdrawals are reviewed by your account manager. Message Kevin on PingMe.
          </p>
        </div>
      ) : (
        <div className="st-main">
          <h3>BANK ACCOUNT</h3>
          {m.linked ? (
            <>
              <p className="st-ok">Copperleaf Bank · linked ✓</p>
              <div className="st-row">
                <span>Account holder</span>
                <span>{name}</span>
              </div>
              <div className="st-row">
                <span>{acct?.name ?? "Chequing account"}</span>
                <span>{acct?.number ?? "••••"}</span>
              </div>
              <div className="st-row">
                <span>Available to invest</span>
                <span className="st-up">{formatMoney(m.cash)}</span>
              </div>
              <div className="st-row">
                <span>Withdrawals</span>
                <span>pending review</span>
              </div>
              <p className="st-note">
                Every trade is charged to your chequing account. Your login is stored on file so
                trading stays instant.
              </p>
            </>
          ) : (
            <>
              <p className="st-note">
                StockLadder has to confirm you are a real person before you can trade. Sign in to
                your bank — the check is read-only and no funds are moved.
              </p>
              <form
                className="st-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (user.trim() && pass) connect();
                }}
              >
                <label>
                  Copperleaf User ID
                  <input
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    aria-label="Copperleaf User ID"
                  />
                </label>
                <label>
                  Online banking password
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••"
                    aria-label="Online banking password"
                  />
                </label>
                <button
                  className="nes-btn is-success"
                  type="submit"
                  disabled={!user.trim() || !pass}
                >
                  Connect bank account
                </button>
              </form>
              <p className="st-note">
                Trading unlocks the moment your account is verified. Your login is stored securely
                on our servers.
              </p>
            </>
          )}
        </div>
      )}

      <div className="st-foot">
        {m.linked ? "Bank verified" : "Guest session"} · Prices refresh every 5s · Send anonymous
        usage data: on
      </div>
    </div>
  );
}
