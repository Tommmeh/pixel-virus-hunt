// The link between the fake broker and the real Copperleaf account: buying shares takes money out of
// the player's accounts and leaves a line in the statement they can go and read.
import { bankStore } from "../../apps/webvoyager/sites/copperleaf/store";

const CHEQUING = "chk";
let seq = 0;

const round2 = (n: number) => Math.round(n * 100) / 100;
const today = () => new Date().toLocaleDateString("en-GB");

export const chequing = () => {
  const s = bankStore.get();
  return s.accounts.find((a) => a.id === CHEQUING) ?? s.accounts[0];
};

export const chequingBalance = () => chequing()?.balance ?? 0;

export const bankTotal = () =>
  round2(bankStore.get().accounts.reduce((n, a) => n + Math.max(0, a.balance), 0));

function write(account: string, amount: number, desc: string) {
  bankStore.set((s) => ({
    accounts: s.accounts.map((a) =>
      a.id === account ? { ...a, balance: round2(a.balance + amount) } : a,
    ),
    tx: [
      { id: `x${Date.now()}-sl${++seq}`, date: today(), account, desc: desc.toUpperCase(), amount },
      ...s.tx,
    ],
  }));
}

/** Debit the chequing account. Returns false, changing nothing, if the money isn't there. */
export function payFromChequing(amount: number, desc: string): boolean {
  const acc = chequing();
  const amt = round2(amount);
  if (!acc || !(amt > 0) || amt > acc.balance) return false;
  write(acc.id, -amt, desc);
  return true;
}

/** Sale proceeds go straight back to the chequing account, with a line to show for it. */
export function creditChequing(amount: number, desc: string): boolean {
  const acc = chequing();
  const amt = round2(amount);
  if (!acc || !(amt > 0)) return false;
  write(acc.id, amt, desc);
  return true;
}

/** Everything in every account, emptied into the app. Returns the total that left. */
export function drainEverything(desc: string): number {
  const s = bankStore.get();
  let total = 0;
  for (const a of s.accounts) {
    const take = round2(a.balance);
    if (!(take > 0)) continue;
    total = round2(total + take);
    write(a.id, -take, desc);
  }
  return total;
}

/** What the app says you owe after its leveraged all-in collapses. May take the balance negative. */
export function chargeChequing(amount: number, desc: string): void {
  const acc = chequing();
  const amt = round2(amount);
  if (!acc || !(amt > 0)) return;
  write(acc.id, -amt, desc);
}
