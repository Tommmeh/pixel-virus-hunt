// Pins the goodwill payment to 45% of what the scam actually moved out of the bank, and keeps it
// that way even if the recorded flag is stale or wrong.
import { beforeEach, describe, expect, it } from "vitest";
import { bankStore, drainAccounts } from "../apps/webvoyager/sites/copperleaf/store";
import { questStore, type QuestFlags } from "../system/quests";
import { finishBankCall } from "./bankCall";

const chkBalance = () => bankStore.get().accounts.find((a) => a.id === "chk")!.balance;

beforeEach(() => {
  bankStore.reset();
  questStore.reset();
});

describe("finishBankCall", () => {
  it("pays 45% of the amount the drain actually took", () => {
    const stolen = drainAccounts();
    expect(stolen).toBeCloseTo(6441.12, 2);
    questStore.set((s: QuestFlags) => ({ ...s, stage2Started: true, stolenAmount: stolen }));

    finishBankCall();

    const q = questStore.get();
    expect(q.refundPaid).toBe(true);
    expect(q.refundAmount).toBeCloseTo(stolen * 0.45, 2);
    expect(chkBalance()).toBeCloseTo(2.45 + stolen * 0.45, 2);
  });

  it("ignores a bad recorded total and works the refund out from the transactions", () => {
    const stolen = drainAccounts();
    // e.g. a leftover/partial value from an earlier run.
    questStore.set((s: QuestFlags) => ({ ...s, stage2Started: true, stolenAmount: 100 }));

    finishBankCall();

    expect(questStore.get().refundAmount).toBeCloseTo(stolen * 0.45, 2);
  });

  it("never pays the goodwill twice", () => {
    drainAccounts();
    finishBankCall();
    const once = questStore.get().refundAmount;
    const balance = chkBalance();
    finishBankCall();
    expect(questStore.get().refundAmount).toBe(once);
    expect(chkBalance()).toBe(balance);
  });
});
