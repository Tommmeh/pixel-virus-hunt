// HotPost Mail data. Inbox seed is plain data so later stages can add (scam) emails easily.
import { playDing } from "../../../../components/sound";
import { emit } from "../../../../system/events";
import { notify } from "../../../../system/notify";
import { personByEmail } from "../../../../system/people";
import { PROFILE } from "../../../../system/profile";
import { questStore } from "../../../../system/quests";
import { createStore } from "../../../../system/store";

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
  {
    id: "seed-mum",
    fromName: "Mum",
    from: "linda.taylor@hotpost.com",
    to: PROFILE.email,
    subject: "Sunday lunch",
    body: "Hi love,\n\nGrandma is coming for lunch on Sunday so please be home by 1. Sam's family is coming too.\n\nLove, Mum x",
    date: "Mon 13/09/2004",
  },
  {
    id: "seed-alex",
    fromName: "Alex Chen",
    from: "alex.chen@hotpost.com",
    to: PROFILE.email,
    subject: "galaxy blasters level 7",
    body: "dude i finally beat level 7!!! the trick is to save your shields for the boss. come online later and i'll tell you the rest",
    date: "Sun 12/09/2004",
  },
  {
    id: "seed-priya",
    fromName: "Priya Patel",
    from: "priya.patel@hotpost.com",
    to: PROFILE.email,
    subject: "Art project - group ideas",
    body: "Hi {name},\n\nFor the group project I was thinking we could do a mural of the town. Can you bring the photos from the trip? They're on your USB stick I think.\n\nPriya",
    date: "Sat 11/09/2004",
  },
  {
    id: "seed-bank",
    fromName: "Copperleaf Bank",
    from: "statements@copperleafbank.com",
    to: PROFILE.email,
    subject: "Your September statement is ready",
    body: "Dear {name},\n\nYour monthly statement for Everyday Checking (ending 4821) is ready to view in Online Banking.\n\nFor your security, we will never ask for your password by email.\n\nCopperleaf Bank",
    date: "Fri 10/09/2004",
  },
  {
    id: "seed-dailybyte",
    fromName: "The Daily Byte",
    from: "newsletter@dailybyte.com",
    to: PROFILE.email,
    subject: "This week: MP3 players, broadband & more",
    body: "This week on The Daily Byte:\n- New MP3 players hold 1,000 songs\n- Broadband reaches more homes\n- 5 tips to keep your PC running smoothly\n\nRead more at www.dailybyte.com",
    date: "Thu 09/09/2004",
  },
  {
    id: "seed-welcome",
    fromName: "HotPost Team",
    from: "welcome@hotpost.com",
    to: PROFILE.email,
    subject: "Welcome to HotPost Mail!",
    body: "Welcome to HotPost Mail!\n\nYour free account comes with 25 MB of storage. Keep your password secret and never share it with anyone.\n\nThe HotPost Team",
    date: "Mon 06/09/2004",
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
  // The id is returned so quest code can watch for this exact message being opened.
  mailStore.set((s) => ({ ...s, inbox: [m, ...s.inbox] }));
  playDing();
  notify({
    title: "HotPost Mail",
    text: `New message from ${m.fromName}: ${m.subject}`,
    icon: "mail",
    open: { app: "webvoyager", args: { url: "https://mail.hotpost.com/" } },
  });
  return m;
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
