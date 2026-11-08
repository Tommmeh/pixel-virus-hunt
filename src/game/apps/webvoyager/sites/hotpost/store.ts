// HotPost Mail data. Inbox seed is plain data so later stages can add (scam) emails easily.
import { playDing } from "../../../../components/sound";
import { emit } from "../../../../system/events";
import { notify } from "../../../../system/notify";
import { personByEmail } from "../../../../system/people";
import { PROFILE } from "../../../../system/profile";
import { questStore } from "../../../../system/quests";
import { createStore } from "../../../../system/store";
import {
  isSupportEmail,
  SUPPORT_REPLY_DELAY,
  supportReplyTo,
} from "../../../../storylines/bankSupport";

export interface Mail {
  id: string;
  fromName: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
}

export const SEED_INBOX: Mail[] = [
  {
    id: "seed-adrewards",
    fromName: "AdRewards Official",
    from: "rewards@adrewards.com",
    to: PROFILE.email,
    subject: "Watch 5 minutes of Ad for 5 dollars",
    body: "★ SPECIAL SPONSOR PROMOTION ★\n\nWatch 5 minutes of Ad for 5 dollars!\n\nWe pay you instant cash for your attention! Watch our 5-minute sponsor advertisement, and $5.00 will be credited directly to your Copperleaf Bank checking account.\n\nClick the link below to watch the ad and claim your $5:\nhttp://www.adrewards.com/watch\n\nOffer limited to one payout per customer.",
    date: "Tue 14/09/2004",
  },
];

export interface MailState {
  signedIn: boolean;
  inbox: Mail[];
  sent: Mail[];
  read: string[];
}

export const mailStore = createStore<MailState>("vh-mail", {
  signedIn: false,
  inbox: SEED_INBOX,
  sent: [],
  read: [],
});
export const useMail = mailStore.use;

const stamp = () =>
  new Date().toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });

let seq = 0;

export function markRead(id: string) {
  mailStore.set((s) => (s.read.includes(id) ? s : { ...s, read: [...s.read, id] }));
}

export function receiveMail(mail: Omit<Mail, "id" | "date" | "to">) {
  const m: Mail = { ...mail, id: `in-${Date.now()}-${++seq}`, to: PROFILE.email, date: stamp() };
  mailStore.set((s) => ({ ...s, inbox: [m, ...s.inbox] }));
  playDing();
  notify({
    title: "HotPost Mail",
    text: `New message from ${m.fromName}: ${m.subject}`,
    icon: "mail",
    open: { app: "webvoyager", args: { url: "https://mail.hotpost.com/" } },
  });
}

export function sendMail(to: string, subject: string, body: string) {
  const m: Mail = {
    id: `sent-${Date.now()}-${++seq}`,
    fromName: "Me",
    from: PROFILE.email,
    to: to.trim(),
    subject: subject.trim() || "(no subject)",
    body,
    date: stamp(),
  };
  mailStore.set((s) => ({ ...s, sent: [m, ...s.sent] }));
  emit({ type: "mail.send", to: m.to, subject: m.subject });

  // Stage 2: Copperleaf support answers by case number and gets more obstructive each time.
  const support = isSupportEmail(m.to) ? supportReplyTo(m.subject) : null;
  if (support) {
    setTimeout(() => receiveMail(support), SUPPORT_REPLY_DELAY);
    return;
  }

  const person = personByEmail(to);
  if (!person) return;

  // Once the bank's decline letter has reached Emma she cuts contact, so replies bounce back
  // instead of getting her usual answer. Before that mail arrives she still replies normally.
  if (person.id === "emma" && questStore.get().wifeAngryEmailSent) {
    setTimeout(
      () =>
        receiveMail({
          fromName: "HotPost Mail Delivery",
          from: "postmaster@hotpost.com",
          subject: `Undeliverable: ${m.subject}`,
          body:
            "Your message could not be delivered.\n\n" +
            `To:      ${person.email}\n` +
            `Subject: ${m.subject}\n\n` +
            "This mailbox is not accepting new messages at the moment. Your email was not delivered and has not been read.\n\n" +
            "Please try again later, or contact this person another way.\n\n" +
            "This is an automated message from HotPost Mail. Please do not reply to it.",
        }),
      2500,
    );
    return;
  }

  setTimeout(
    () =>
      receiveMail({
        fromName: person.name,
        from: person.email,
        subject: `RE: ${m.subject}`,
        body: person.autoReply,
      }),
    8000,
  );
}
