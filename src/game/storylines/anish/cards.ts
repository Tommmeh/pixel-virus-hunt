// Anish's storyline (the bank line) — lesson cards for the Achievements app.
// $5 ad → Amazing gift card → VideoVault "paid" trial → $500 prize draw → empty account.
// Each unlocks silently at the matching point (AdRewards, HotPost, VideoVault, QuestFlow); the trophy
// unlocks with the last one, when the story ends.
import type { LessonCard } from "../../scams/ai";

export const ANISH_CARD_IDS = {
  easyMoney: "bank-easy-money",
  giftCard: "bank-amazing",
  paidTrial: "bank-videovault",
  prize: "bank-prize",
  aftermath: "bank-aftermath",
} as const;

export const ANISH_CARDS: LessonCard[] = [
  {
    id: ANISH_CARD_IDS.easyMoney,
    name: "Easy Money",
    type: "Bait: paid-to-watch offer",
    whatHappened:
      "An email offered $5 for watching an ad, and it really paid. That's the trick: a small payout that actually arrives makes you trust the next, bigger offer, and tells the scammers you're short of money and willing to click.",
    redFlags: [
      "Money for almost nothing, from a company you've never heard of",
      "Paid straight into your bank account",
      "Arrived out of the blue, at a time you needed cash",
    ],
    tip: "Real companies don't pay strangers to watch ads by email. Treat 'easy money' offers as the start of a scam, even when the first payment is real.",
  },
  {
    id: ANISH_CARD_IDS.giftCard,
    name: "The Free Gift Card",
    type: "Phishing + password reuse",
    whatHappened:
      "A 'free $100 gift card' asked you to sign in 'with your usual email and password'. You typed them into a fake page, and because the same password opened your email and FriendSpace, the scammers were in all of them within minutes.",
    redFlags: [
      "You were 'randomly selected' for a prize",
      "A 24-hour deadline",
      "Asked for your usual email and password on a shopping site",
      "The address was amazing-shop.com, not the real shop",
    ],
    tip: "Never sign in from a link in a prize email. Use a different password for every account (a password manager helps), so one leak can't open everything.",
  },
  {
    id: ANISH_CARD_IDS.paidTrial,
    name: "Paid to Sign Up",
    type: "Fake free trial / bank phishing",
    whatHappened:
      "A 'free trial that pays you $100' asked you to sign in with your online banking details. The $100 really arrived, so it felt legit, but now the scammers had your bank login and had set themselves up to take more.",
    redFlags: [
      "A video service asking for your BANK password",
      "They pay you to sign up: backwards for a real business",
      "'Use your usual bank login' on someone else's website",
    ],
    tip: "Only ever type your bank password on your bank's own site, reached by typing its address yourself. No other company needs it, ever.",
  },
  {
    id: ANISH_CARD_IDS.prize,
    name: "You're the 1000th!",
    type: "Repeat scam",
    whatHappened:
      "The same scammers came back with a bigger prize: '$500 for the 1000th sign-up, just verify your bank account again'. Signing in a second time handed the account over, and everything in it was moved out.",
    redFlags: [
      "Same sender as the last too-good-to-be-true offer",
      "A prize draw you never entered",
      "'Verify your bank account again' to claim it",
      "Entry closes at midnight",
    ],
    tip: "Once a company has asked for your bank login, it's a scammer, and they will be back. Block them, and tell your bank straight away.",
  },
  {
    id: ANISH_CARD_IDS.aftermath,
    name: "The Empty Account",
    type: "Account takeover: the aftermath",
    whatHappened:
      "Payments bounced, the rent couldn't be paid and the savings were gone. Each step on its own felt small: $5, a gift card, a free trial. Every one of them asked for the same thing in a different costume: your login details.",
    redFlags: [
      "Every offer ended with 'sign in with your usual details'",
      "Each payout was bait for the next, bigger ask",
      "Money worries made the offers harder to say no to",
    ],
    tip: "If it happens for real: call your bank on the number on your card straight away, change your passwords (email first), check your statements, and report it. Acting fast can save some of the money.",
  },
];
