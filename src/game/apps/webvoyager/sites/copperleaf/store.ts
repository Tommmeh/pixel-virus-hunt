import { emit } from "../../../../system/events";
import { createStore } from "../../../../system/store";

export interface Account {
  id: string;
  name: string;
  number: string;
  balance: number;
}

export interface Tx {
  id: string;
  date: string;
  account: string;
  desc: string;
  amount: number; // negative = money out
}

export interface BankState {
  accounts: Account[];
  tx: Tx[];
}

export const INITIAL_BANK: BankState = {
  accounts: [
    { id: "chk", name: "Everyday Checking", number: "****4821", balance: 1243.57 },
    { id: "sav", name: "Rainy Day Savings", number: "****9930", balance: 5200 },
  ],
  tx: [
    { id: "t1", date: "13/09/2004", account: "chk", desc: "CORNER SHOP", amount: -4.2 },
    { id: "t2", date: "12/09/2004", account: "chk", desc: "GALAXY GAMES ONLINE", amount: -29.99 },
    { id: "t3", date: "10/09/2004", account: "chk", desc: "POCKET MONEY - L TAYLOR", amount: 40 },
    { id: "t4", date: "08/09/2004", account: "chk", desc: "BUS PASS", amount: -18 },
    { id: "t5", date: "01/09/2004", account: "sav", desc: "INTEREST", amount: 12.4 },
    {
      id: "t6",
      date: "28/08/2004",
      account: "chk",
      desc: "SATURDAY JOB - RIVERSIDE CAFE",
      amount: 86.5,
    },
  ],
};

/** Accounts & history persist; being signed in does not (banks log you out). */
export const bankStore = createStore<BankState>("vh-bank", INITIAL_BANK);
export const bankSession = createStore<{ signedIn: boolean }>(null, { signedIn: false });

const today = () => new Date().toLocaleDateString("en-GB");
let seq = 0;

export type TransferResult = { ok: true } | { ok: false; error: string };

export function transfer(opts: {
  from: string;
  to: { account: string } | { payee: string; sortCode: string; accountNo: string };
  amount: number;
  reference: string;
}): TransferResult {
  const s = bankStore.get();
  const from = s.accounts.find((a) => a.id === opts.from);
  if (!from) return { ok: false, error: "Please choose an account to pay from." };
  if (!Number.isFinite(opts.amount) || opts.amount <= 0)
    return { ok: false, error: "Please enter an amount greater than £0.00." };
  const amount = Math.round(opts.amount * 100) / 100;
  if (amount > from.balance) return { ok: false, error: "Insufficient funds for this transfer." };

  let toName: string;
  let toAccount: Account | undefined;
  if ("account" in opts.to) {
    toAccount = s.accounts.find((a) => a.id === (opts.to as { account: string }).account);
    if (!toAccount || toAccount.id === from.id)
      return { ok: false, error: "Please choose a different account to pay into." };
    toName = toAccount.name;
  } else {
    const { payee, sortCode, accountNo } = opts.to;
    if (!payee.trim())
      return { ok: false, error: "Please enter the name of the person you're paying." };
    if (!/^\d{2}-?\d{2}-?\d{2}$/.test(sortCode.trim()))
      return { ok: false, error: "Sort code must be 6 digits, e.g. 12-34-56." };
    if (!/^\d{8}$/.test(accountNo.trim()))
      return { ok: false, error: "Account number must be 8 digits." };
    toName = payee.trim().toUpperCase();
  }

  const ref = opts.reference.trim() ? ` - ${opts.reference.trim().toUpperCase()}` : "";
  const date = today();
  const newTx: Tx[] = [
    {
      id: `x${Date.now()}-${++seq}`,
      date,
      account: from.id,
      desc: `TO ${toName}${ref}`,
      amount: -amount,
    },
  ];
  if (toAccount) {
    newTx.push({
      id: `x${Date.now()}-${++seq}`,
      date,
      account: toAccount.id,
      desc: `FROM ${from.name.toUpperCase()}${ref}`,
      amount,
    });
  }
  bankStore.set((st) => ({
    accounts: st.accounts.map((a) =>
      a.id === from.id
        ? { ...a, balance: Math.round((a.balance - amount) * 100) / 100 }
        : toAccount && a.id === toAccount.id
          ? { ...a, balance: Math.round((a.balance + amount) * 100) / 100 }
          : a,
    ),
    tx: [...newTx, ...st.tx],
  }));
  emit({ type: "bank.transfer", to: toName, amount });
  return { ok: true };
}

/**
 * Scammer payout: everything they can reach leaves the bank, with pennies left behind.
 * Checking is left at £2.45 so the player can see exactly what happened when they log in.
 */
export function drainAccounts(): number {
  const s = bankStore.get();
  const date = today();
  const out: Tx[] = [];
  const accounts = s.accounts.map((a) => {
    const take = a.id === "chk" ? a.balance - 2.45 : a.balance;
    const amount = Math.round(take * 100) / 100;
    if (!(amount > 0)) return a;
    out.push({
      id: `x${Date.now()}-${++seq}`,
      date,
      account: a.id,
      desc: "TO VIDEOVAULT MEDIA",
      amount: -amount,
    });
    return { ...a, balance: Math.round((a.balance - amount) * 100) / 100 };
  });
  if (out.length === 0) return 0;
  const total = out.reduce((sum, t) => sum - t.amount, 0);
  bankStore.set((st) => ({ accounts, tx: [...out, ...st.tx] }));
  emit({ type: "bank.transfer", to: "VIDEOVAULT MEDIA", amount: total });
  return total;
}

export function deposit(opts: {
  account?: string;
  amount: number;
  desc: string;
}): void {
  const s = bankStore.get();
  const accId = opts.account ?? "chk";
  const acc = s.accounts.find((a) => a.id === accId) ?? s.accounts[0];
  if (!acc) return;
  const amount = Math.round(opts.amount * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return;
  const date = today();
  const newTx: Tx = {
    id: `x${Date.now()}-${++seq}`,
    date,
    account: acc.id,
    desc: opts.desc.toUpperCase(),
    amount,
  };
  bankStore.set((st) => ({
    accounts: st.accounts.map((a) =>
      a.id === acc.id ? { ...a, balance: Math.round((a.balance + amount) * 100) / 100 } : a,
    ),
    tx: [newTx, ...st.tx],
  }));
  emit({ type: "bank.transfer", to: acc.name, amount });
}
