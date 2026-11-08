import { beforeEach, describe, expect, it } from "vitest";
import { bankStore } from "../../apps/webvoyager/sites/copperleaf/store";
import { chequingBalance, payFromChequing } from "./bank";

describe("StockLadder taking the money", () => {
  beforeEach(() => bankStore.reset());

  it("debits the chequing account and logs the trade", () => {
    const before = chequingBalance();
    expect(payFromChequing(24.2, "STOCKLADDER TRADE KETL")).toBe(true);
    expect(chequingBalance()).toBe(Math.round((before - 24.2) * 100) / 100);
    expect(bankStore.get().tx[0]).toMatchObject({
      account: "chk",
      desc: "STOCKLADDER TRADE KETL",
      amount: -24.2,
    });
  });

  it("takes nothing out when the money isn't there", () => {
    const before = chequingBalance();
    const logged = bankStore.get().tx.length;
    expect(payFromChequing(before + 1, "STOCKLADDER TRADE VOLT")).toBe(false);
    expect(chequingBalance()).toBe(before);
    expect(bankStore.get().tx).toHaveLength(logged);
  });
});
