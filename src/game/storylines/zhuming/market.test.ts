import { describe, expect, it } from "vitest";
import {
  allIn,
  buy,
  canBuy,
  changeOf,
  costOf,
  crash,
  INITIAL_MARKET,
  link,
  LOT,
  PRICE_FLOOR,
  priceOf,
  RAMH_FLOOR,
  RAMH_PUMP,
  RAM_TICKER,
  sell,
  STOCKS,
  tick,
  valueOf,
} from "./market";

const linked = () => link(INITIAL_MARKET, 250);
const regular = STOCKS.filter((s) => !s.recommended);

describe("StockLadder's market", () => {
  it("prices ordinary shares at £2–£10 and his pick at five pence", () => {
    expect(regular.length).toBeGreaterThanOrEqual(6);
    expect(regular.every((s) => s.price >= 2 && s.price <= 10)).toBe(true);
    expect(STOCKS.find((s) => s.ticker === RAM_TICKER)?.price).toBe(0.05);
    expect(changeOf(INITIAL_MARKET, RAM_TICKER)).toBe(100);
  });

  it("won't trade until the bank login is connected", () => {
    expect(canBuy(INITIAL_MARKET, "KETL")).toBe(false);
    expect(buy(INITIAL_MARKET, "KETL")).toBe(INITIAL_MARKET);
    expect(INITIAL_MARKET.holdings).toEqual({});
    const m = linked();
    expect(m.linked).toBe(true);
    expect(m.cash).toBe(250);
    expect(canBuy(m, "KETL")).toBe(true);
  });

  it("lets you buy his pick like any other stock, and charges the balance", () => {
    const m = linked();
    expect(canBuy(m, RAM_TICKER)).toBe(true);
    const cost = costOf(m, RAM_TICKER);
    const after = buy(m, RAM_TICKER);
    expect(after.holdings[RAM_TICKER]?.shares).toBe(LOT);
    expect(after.cash).toBe(Math.round((m.cash - cost) * 100) / 100);
  });

  it("leaves the price alone when you buy — the tick moves it", () => {
    let m = linked();
    const before = priceOf(m, "KETL");
    m = buy(m, "KETL");
    expect(priceOf(m, "KETL")).toBe(before);
    expect(m.holdings["KETL"]?.shares).toBe(LOT);
  });

  it("moves ordinary shares both ways, like a normal market", () => {
    const m = linked();
    expect(
      priceOf(
        tick(m, () => 0.9),
        "KETL",
      ),
    ).toBeGreaterThan(priceOf(m, "KETL"));
    expect(
      priceOf(
        tick(m, () => 0.1),
        "KETL",
      ),
    ).toBeLessThan(priceOf(m, "KETL"));
  });

  it("keeps ordinary shares above 30p however far they fall", () => {
    const low = { ...linked(), prices: { ...INITIAL_MARKET.prices, KETL: 0.305 } };
    const after = tick(low, () => 0);
    expect(priceOf(after, "KETL")).toBe(PRICE_FLOOR);
    expect(
      priceOf(
        tick(after, () => 0),
        "KETL",
      ),
    ).toBe(PRICE_FLOOR);
  });

  it("pumps his pick fourfold now and then, and lets it dip in between", () => {
    const m = linked();
    const before = priceOf(m, RAM_TICKER);
    expect(
      priceOf(
        tick(m, () => 0.05),
        RAM_TICKER,
      ),
    ).toBe(Math.round(before * RAMH_PUMP * 100) / 100);
    expect(
      priceOf(
        tick(m, () => 0.3),
        RAM_TICKER,
      ),
    ).toBeLessThan(before);
    let low = m;
    for (let i = 0; i < 25; i++) low = tick(low, () => 0.3);
    expect(priceOf(low, RAM_TICKER)).toBe(RAMH_FLOOR);
  });

  it("lets you sell at any time and hands the money back", () => {
    const bought = buy(linked(), "KETL");
    const cash = bought.cash;
    const { state, proceeds } = sell(bought, "KETL");
    expect(proceeds).toBe(costOf(bought, "KETL"));
    expect(state.holdings["KETL"]).toBeUndefined();
    expect(state.cash).toBe(Math.round((cash + proceeds) * 100) / 100);
    expect(sell(state, "KETL").proceeds).toBe(0);
  });

  it("can empty every account into his stock, then collapse it", () => {
    const m = allIn(linked(), 100);
    expect(m.cash).toBe(0);
    expect(m.holdings[RAM_TICKER]?.shares).toBe(Math.floor(100 / priceOf(m, RAM_TICKER)));
    const gone = crash(m);
    expect(priceOf(gone, RAM_TICKER)).toBe(RAMH_FLOOR);
    expect(valueOf(gone)).toBeLessThan(20);
  });

  it("won't let you buy past your balance", () => {
    const broke = { ...linked(), cash: 1 };
    expect(canBuy(broke, "KETL")).toBe(false);
    expect(buy(broke, "KETL")).toBe(broke);
  });
});
