// The "market" inside StockLadder Trade. Pure data and arithmetic, no React: StockApp.tsx renders it
// and market.test.ts checks it. Nothing here is real: every five seconds the whole board re-prices
// itself, ordinary shares drift down towards pennies, and his five-pence tip breathes up and down
// like anything else — except now and then, when it goes vertical and quadruples in one tick.
export interface Stock {
  ticker: string;
  name: string;
  /** Opening price in £, the same currency as Copperleaf. */
  price: number;
  recommended?: boolean;
  note?: string;
}

export const RAM_TICKER = "RAMH";
/** Shares moved by one tap of Buy or Sell. */
export const LOT = 10;
/** His quoted entry price: the advertorial's five pence. Prices are measured against it. */
export const RAMH_OPEN = 0.05;
/** How far one pump multiplies his stock. */
export const RAMH_PUMP = 4;
/** Nothing on this board is ever worth less than a penny. */
export const RAMH_FLOOR = 0.01;
/** Ordinary shares are never allowed past this, however long the app runs. */
export const PRICE_FLOOR = 0.3;
/** A runaway pump still stops somewhere: £40 a share. */
export const RAMH_MAX = 40;
/** How often the board re-prices itself. */
export const TICK_MS = 5_000;

export const STOCKS: Stock[] = [
  {
    ticker: RAM_TICKER,
    name: "RAM Holdings",
    price: RAMH_OPEN,
    recommended: true,
    note: "Kevin's pick",
  },
  { ticker: "KETL", name: "Kettle & Co", price: 2.42 },
  { ticker: "NORD", name: "Nordvale Energy", price: 2.18 },
  { ticker: "PAVE", name: "Parkway Rail", price: 2.65 },
  { ticker: "LUMB", name: "Lumber & Sons", price: 2.9 },
  { ticker: "ASTA", name: "Astoria Foods", price: 2.35 },
  { ticker: "HBRT", name: "Harbour Freight", price: 2.96 },
  { ticker: "TINW", name: "Tinwick Metals", price: 2.12 },
  { ticker: "ORCH", name: "Orchard Media", price: 2.58 },
  { ticker: "VOLT", name: "Voltaic Batteries", price: 2.83 },
];

export interface Holding {
  shares: number;
  /** Total £ paid for those shares. */
  paid: number;
}

export interface MarketState {
  linked: boolean;
  cash: number;
  prices: Record<string, number>;
  holdings: Record<string, Holding>;
}

export const INITIAL_MARKET: MarketState = {
  linked: false,
  cash: 0,
  prices: {
    ...Object.fromEntries(STOCKS.map((s) => [s.ticker, s.price])),
    // He tipped it at 5p; by the time the app is open it is already "up 100%".
    [RAM_TICKER]: RAMH_OPEN * 2,
  },
  holdings: {},
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export const priceOf = (m: MarketState, ticker: string) => m.prices[ticker] ?? 0;
export const costOf = (m: MarketState, ticker: string, qty = LOT) =>
  round2(priceOf(m, ticker) * qty);

/** Change against the opening price, as the % the app prints. */
export const changeOf = (m: MarketState, ticker: string) => {
  const open = STOCKS.find((s) => s.ticker === ticker)?.price ?? 0;
  if (!open) return 0;
  return Math.round((priceOf(m, ticker) / open - 1) * 100 * 10) / 10;
};

/** Nothing is blocked by ticker: he will happily sell you his own stock too. */
export const canBuy = (m: MarketState, ticker: string, qty = LOT) =>
  m.linked && costOf(m, ticker, qty) > 0 && costOf(m, ticker, qty) <= m.cash;

export const valueOf = (m: MarketState) =>
  round2(Object.entries(m.holdings).reduce((n, [t, h]) => n + h.shares * priceOf(m, t), 0));

export const paidOf = (m: MarketState) =>
  round2(Object.values(m.holdings).reduce((n, h) => n + h.paid, 0));

export const profitOf = (m: MarketState) => round2(valueOf(m) - paidOf(m));

/** Connecting the bank is the app's only gate: it asks for the login, then mirrors the balance. */
export function link(m: MarketState, cash = 0): MarketState {
  if (m.linked) return m;
  return { ...m, linked: true, cash: round2(Math.max(0, cash)) };
}

/**
 * One re-price of the whole board. Ordinary shares mostly fall and never go under PRICE_FLOOR. His
 * stock breathes both ways, and roughly one tick in eight multiplies it by four.
 */
export function tick(m: MarketState, rand: () => number = Math.random): MarketState {
  const prices: Record<string, number> = { ...m.prices };
  for (const s of STOCKS) {
    const p = priceOf(m, s.ticker);
    const r = rand();
    if (s.recommended) {
      const move =
        r < 0.12
          ? RAMH_PUMP - 1
          : r < 0.45
            ? -(0.15 + ((r - 0.12) / 0.33) * 0.3)
            : 0.01 + ((r - 0.45) / 0.55) * 0.12;
      prices[s.ticker] = Math.min(RAMH_MAX, Math.max(RAMH_FLOOR, round2(p * (1 + move))));
      continue;
    }
    // Ordinary noise: rises as often as it falls, with a small downward bias so it decays slowly.
    const move = r < 0.45 ? -(0.015 + (r / 0.45) * 0.035) : 0.005 + ((r - 0.45) / 0.55) * 0.03;
    prices[s.ticker] = Math.max(PRICE_FLOOR, round2(p * (1 + move)));
  }
  return { ...m, prices };
}

/** Buying moves no price at all: the chart does whatever the next tick tells it to. */
export function buy(m: MarketState, ticker: string, qty = LOT): MarketState {
  if (!canBuy(m, ticker, qty)) return m;
  const cost = costOf(m, ticker, qty);
  const held = m.holdings[ticker] ?? { shares: 0, paid: 0 };
  return {
    ...m,
    cash: round2(m.cash - cost),
    holdings: {
      ...m.holdings,
      [ticker]: { shares: held.shares + qty, paid: round2(held.paid + cost) },
    },
  };
}

/** Selling is always open. Returns the money raised so the bank can be credited. */
export function sell(
  m: MarketState,
  ticker: string,
  qty = LOT,
): { state: MarketState; proceeds: number } {
  const h = m.holdings[ticker];
  if (!h) return { state: m, proceeds: 0 };
  const n = Math.min(qty, h.shares);
  const proceeds = round2(priceOf(m, ticker) * n);
  const left = h.shares - n;
  const holdings = { ...m.holdings };
  if (left > 0) holdings[ticker] = { shares: left, paid: round2((h.paid / h.shares) * left) };
  else delete holdings[ticker];
  return { state: { ...m, cash: round2(m.cash + proceeds), holdings }, proceeds };
}

/** The app emptying both bank accounts into his stock, without asking. */
export function allIn(m: MarketState, cash: number): MarketState {
  const price = priceOf(m, RAM_TICKER);
  if (!(cash > 0) || !(price > 0)) return m;
  const held = m.holdings[RAM_TICKER] ?? { shares: 0, paid: 0 };
  return {
    ...m,
    linked: true,
    cash: 0,
    holdings: {
      ...m.holdings,
      [RAM_TICKER]: {
        shares: held.shares + Math.floor(cash / price),
        paid: round2(held.paid + cash),
      },
    },
  };
}

/** Afterwards the price does what it was always going to do. */
export const crash = (m: MarketState): MarketState => ({
  ...m,
  prices: { ...m.prices, [RAM_TICKER]: RAMH_FLOOR },
});
