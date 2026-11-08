// The Copperleaf disputes phone call. Deliberately tedious: queues, holds, a transfer, and an
// offer that only comes after the review team has had a very long look at it.
import { bankStore, deposit } from "../apps/webvoyager/sites/copperleaf/store";
import { receiveMail } from "../apps/webvoyager/sites/hotpost/store";
import { questStore, type QuestFlags } from "../system/quests";

const CASE = "CR-4471";
const REFUND_PCT = 0.45;
/** Only used if the drain never recorded a total. */
const FALLBACK_STOLEN = 6441.12;

export interface CallChoice {
  text: string;
  next: string;
}

export interface CallStep {
  id: string;
  /** What the other end says, one line at a time. */
  lines: string[];
  /** Continue automatically to another step after the lines. */
  next?: string;
  /** Extra pause before auto-continuing. */
  pause?: number;
  /** Player options. The call waits for one of these. */
  choices?: CallChoice[];
  /** Last step: the line goes dead and the payment is made. */
  end?: boolean;
}

export const BANK_CALL: CallStep[] = [
  {
    id: "queue",
    lines: [
      "Thank you for calling Copperleaf Bank.",
      "Your call is important to us. You are number seven in the queue.",
    ],
    next: "queue2",
    pause: 7_000,
  },
  {
    id: "queue2",
    lines: [
      "You are number four in the queue.",
      "Calls may be recorded for training and quality purposes.",
    ],
    next: "queue3",
    pause: 7_000,
  },
  {
    id: "queue3",
    lines: ["You are number two in the queue."],
    next: "agent",
    pause: 6_000,
  },
  {
    id: "agent",
    lines: ["Good afternoon, Copperleaf Bank, Daniel speaking. How can I help?"],
    choices: [
      { text: "I'm calling about the money taken from my account", next: "a2" },
      { text: "Someone was meant to ring me about case CR-4471", next: "a2" },
    ],
  },
  {
    id: "a2",
    lines: [
      "Right. I've got a note about a case, but I don't deal with those myself.",
      "I'll put you through to our Disputes team. Please hold.",
    ],
    next: "hold1",
    pause: 6_000,
  },
  {
    id: "hold1",
    lines: [
      "…",
      "Thank you for holding. You are still in the queue for Disputes.",
      "You are number one in the queue.",
    ],
    next: "disputes",
    pause: 8_000,
  },
  {
    id: "disputes",
    lines: [
      "Disputes, Priya speaking.",
      "Can I take your full name, the last four digits of the account, and the case reference?",
    ],
    choices: [
      { text: "Jamie Taylor, account ending 4821, case CR-4471", next: "d2" },
      { text: "Taylor — 4821 — CR-4471", next: "d2" },
    ],
  },
  {
    id: "d2",
    lines: [
      "Thank you. I can see those payments left your account after your online banking details were used on another website.",
      "Under our terms those payments are authorised, so I have to tell you there may be nothing we can do.",
    ],
    choices: [
      { text: "They tricked me into typing my password", next: "d3" },
      { text: "So that's it? You're not going to do anything?", next: "d3b" },
    ],
  },
  {
    id: "d3",
    lines: [
      "I understand. That is what the review is for.",
      "I'm going to send it to be reviewed. It will take a few minutes.",
    ],
    next: "hold2",
    pause: 4_000,
  },
  {
    id: "d3b",
    lines: [
      "I didn't say that. I said I have to tell you what the terms say.",
      "I'm going to send it to be reviewed anyway. It will take a few minutes.",
    ],
    next: "hold2",
    pause: 4_000,
  },
  {
    id: "hold2",
    lines: [
      "…",
      "I'm sorry to keep you waiting. The review team are looking at it now.",
      "Please hold.",
    ],
    next: "offer",
    pause: 9_000,
  },
  {
    id: "offer",
    lines: [
      "Thank you for holding. The review team can offer a goodwill payment of 45 per cent — not a refund.",
      "Do you want to accept that?",
    ],
    choices: [
      { text: "I'll take it", next: "finish" },
      { text: "45% isn't good enough", next: "push" },
    ],
  },
  {
    id: "push",
    lines: [
      "I understand. If you don't accept, the case closes today with no payment at all.",
      "Do you want to accept the 45 per cent?",
    ],
    choices: [
      { text: "Fine. I'll take it", next: "finish" },
      { text: "Can I think about it?", next: "push2" },
    ],
  },
  {
    id: "push2",
    lines: ["You can, but the offer closes when this call ends.", "Do you want to accept it?"],
    choices: [{ text: "Yes. Accept it", next: "finish" }],
  },
  {
    id: "finish",
    lines: [
      "I've put the payment through. It will show in your online banking within the hour.",
      "You'll get an email confirming it. Is there anything else?",
    ],
    choices: [
      { text: "Can you give me the case number again?", next: "finish2" },
      { text: "No. Thank you", next: "bye" },
    ],
  },
  {
    id: "finish2",
    lines: [
      "Case CR-4471. It will be in the email and on your statement as a goodwill payment.",
      "Anything else?",
    ],
    choices: [{ text: "No, that's everything", next: "bye" }],
  },
  {
    id: "bye",
    lines: ["Thank you for calling Copperleaf Bank. Goodbye."],
    end: true,
  },
];

export const getCallStep = (id: string) => BANK_CALL.find((s) => s.id === id);

const money = (n: number) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Runs when the call ends: the goodwill payment lands, and the confirmation email goes out. */
/** What actually left the account: summed from the scammer's own outgoing payments. */
const takenByScam = () =>
  bankStore
    .get()
    .tx.filter((t) => t.amount < 0 && t.desc.startsWith("TO VIDEOVAULT"))
    .reduce((sum, t) => sum - t.amount, 0);

export function finishBankCall() {
  const q = questStore.get();
  if (q.refundPaid) return; // the case is closed: never pay the goodwill twice
  // Trust the transactions over the flag: a stale or partial flag must never shrink the refund.
  const stolen = Math.max(takenByScam(), q.stolenAmount || 0) || FALLBACK_STOLEN;
  const amount = Math.round(stolen * REFUND_PCT * 100) / 100;

  deposit({ account: "chk", amount, desc: "FRAUD RECOVERY - GOODWILL REFUND" });
  questStore.set((s: QuestFlags) => ({ ...s, refundPaid: true, refundAmount: amount }));

  receiveMail({
    fromName: "Copperleaf Bank Support",
    from: "support@copperleafbank.com",
    subject: `Case ${CASE} — goodwill payment made`,
    body:
      "Dear Mr Taylor,\n\n" +
      "Following our telephone conversation today, case " +
      CASE +
      " has been closed.\n\n" +
      "    Payment: " +
      money(amount) +
      " (45% of the disputed amount)\n" +
      "    Paid to: Everyday Checking, ending 4821\n" +
      "    Reference: GOODWILL REFUND\n\n" +
      "This payment is a gesture of goodwill and is not an admission of liability. It will show " +
      "in your online banking shortly.\n\n" +
      "This is our final response. No further correspondence about this matter will be entered " +
      "into.\n\n" +
      "Copperleaf Bank Support",
  });
}
