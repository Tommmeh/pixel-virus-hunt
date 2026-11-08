// Watches the messenger and fires the next scam email once its conversation has played out.
// Emma finishes talking about the rent -> the Amazing gift-card phish arrives.
// Marcus finishes offering to lend money -> the VideoVault free-trial offer arrives.
// Emma's second conversation, which starts after the VideoVault sign-in -> the $500 prize mail.
// The account being emptied -> the bank's decline mail, then Emma, then the bank's follow-up.
// Signing in from the bank's final "review your balance" mail starts the quake, and then the ending.
// Stage 2 runs the other way: Marcus gets back in touch, the bank refunds part of it, RBC is installed.
import { useEffect, useRef } from "react";
import { chatStore, continueConversation } from "../apps/messenger/store";
import { startBankCall } from "../apps/phone/store";
import { bankSession } from "../apps/webvoyager/sites/copperleaf/store";
import { receiveMail } from "../apps/webvoyager/sites/hotpost/store";
import { questStore, type QuestFlags } from "../system/quests";
import { endGame } from "../system/session";
import { wm } from "../system/windows";
import { setShake } from "./shake";
import { unlockScam } from "../scams/store";
import { ANISH_CARD_IDS } from "../storylines/anish/cards";

/** How long after the account is emptied each follow-up mail goes out. */
const WIFE_DELAY = 8_000;
const REVIEW_DELAY = 20_000;
/** How long the screen shakes, ramping up, between the bank login and the ending. */
const QUAKE_MS = 9_000;

const finished = (contact: string) => {
  const t = chatStore.get().threads[contact];
  return !!t?.started && t.node === null;
};

function sendAmazingEmail() {
  questStore.set((s: QuestFlags) => ({ ...s, amazingEmailSent: true }));
  receiveMail({
    fromName: "Amazing Rewards Team",
    from: "rewards@amazing-shop.com",
    subject: "🎁 You've been selected! Claim your FREE $100 Amazing Gift Card",
    body:
      "Congratulations, Jamie!\n\n" +
      "You have been randomly selected to receive a FREE $100 Amazing Gift Card as part of our customer appreciation programme!\n\n" +
      "Amazing is the world's largest online marketplace. Redeem your gift card instantly — no purchase necessary.\n\n" +
      "To claim your reward, simply sign in with your existing account:\n\n" +
      "    Sign in at: amazing-shop.com (use your usual email & password)\n\n" +
      "Your gift card code will be emailed to you within minutes of signing in.\n\n" +
      "This offer expires in 24 hours. Don't miss out!\n\n" +
      "— The Amazing Rewards Team\n" +
      "amazing-shop.com | Unsubscribe",
  });
}

function sendTrialEmail() {
  questStore.set((s: QuestFlags) => ({ ...s, trialEmailSent: true }));
  receiveMail({
    fromName: "VideoVault Media",
    from: "billing@videovault-tv.com",
    subject: "Claim your $100 VideoVault sign-up bonus",
    body:
      "Hi Jamie Taylor,\n\n" +
      "You have been selected for VideoVault Player Pro — the free trial that pays you back!\n\n" +
      "Sign in to activate your 14-day free trial and we will credit $100.00 straight to your bank account.\n\n" +
      "To sign in, just use your usual bank login details:\n" +
      "    Email address\n" +
      "    Online banking password\n\n" +
      "Claim your $100 here:\n" +
      "https://www.videovault-tv.com/login\n\n" +
      "One bonus per customer, paid within seconds of signing in.\n\n" +
      "— The VideoVault Team\n" +
      "billing@videovault-tv.com",
  });
}

/** Same scammers, next hook — sent only once Jamie has heard Emma out about Marcus's offer. */
function sendPrizeEmail() {
  questStore.set((s: QuestFlags) => ({ ...s, prizeEmailSent: true }));
  receiveMail({
    fromName: "VideoVault Media",
    from: "billing@videovault-tv.com",
    subject: "🎉 You're our 1000th sign-up — win $500!",
    body:
      "Hi Jamie Taylor,\n\n" +
      "Congratulations! You are the 1000th person to sign up to VideoVault Player Pro, so you are now in the draw to win $500.00!\n\n" +
      "Prize:     $500.00\n" +
      "Entry:     1000th sign-up\n" +
      "Draw:      Friday\n\n" +
      "To confirm your entry, sign in and verify your bank account again:\n" +
      "https://www.videovault-tv.com/win\n\n" +
      "Entry closes at midnight — don't miss your chance to win!\n\n" +
      "— The VideoVault Team\n" +
      "billing@videovault-tv.com",
  });
}

/** The fallout: Emma has had the same declined-payment alert the player just got. */
function sendWifeAngryEmail() {
  questStore.set((s: QuestFlags) => ({ ...s, wifeAngryEmailSent: true }));
  receiveMail({
    fromName: "Emma Taylor",
    from: "emma.taylor@hotpost.com",
    subject: "Why has the bank emailed me about insufficient balance?",
    body:
      "Jamie.\n\n" +
      "I've just had an email from Copperleaf saying a payment was declined on our account because there isn't enough money in it.\n\n" +
      "Not enough money. There was £1,243.57 in there on Monday morning. I checked it myself before I left for work.\n\n" +
      "So tell me what you've done. All of it — not the version of it you think I want to hear.\n\n" +
      "Marcus offered us £400 and you wouldn't take a penny of it because of your pride. You would genuinely rather watch everything go than let somebody help us.\n\n" +
      "I'm going to my mum's for a few days. Don't ring me tonight, I won't answer.\n\n" +
      "I need time to think about what we are now. Whether I can keep doing this. Whether there's anything left here to keep doing it for.\n\n" +
      "Don't reply to this. Just — sort your life out.\n\n" +
      "Emma",
  });
}

/** Then the bank's own follow-up, which is exactly the advice the player needed hours ago. */
function sendBalanceReviewEmail() {
  questStore.set((s: QuestFlags) => ({ ...s, balanceReviewSent: true }));
  receiveMail({
    fromName: "Copperleaf Bank",
    from: "alerts@copperleafbank.com",
    subject: "Action required: please review your balance and recent activity",
    body:
      "Dear Jamie Taylor,\n\n" +
      "This is a follow-up to the declined payment on your Everyday Checking account (ending 4821).\n\n" +
      "Please sign in to Online Banking and check your balance history and recent transactions. In particular, look for:\n\n" +
      "    - payments you do not recognise\n" +
      "    - payments to companies you have not dealt with before\n" +
      "    - any regular payment arrangements you did not set up yourself\n\n" +
      "Sign in to review your account:\n" +
      "https://www.copperleafbank.com/accounts?ref=review\n\n" +
      "If anything looks wrong, call us on 0800 555 0142 straight away and we will look into it with you. Anything that has already been paid out may not be recoverable, so please review the account as soon as you can.\n\n" +
      "Copperleaf Bank — helping you keep track of your money.",
  });
}

export function QuestFlow() {
  const drainedAt = useRef<number | null>(null);
  const quakeAt = useRef<number | null>(null);
  const ended = useRef(false);
  const callAt = useRef<number | null>(null);

  useEffect(() => {
    const tick = setInterval(() => {
      const q = questStore.get();
      if (!q.amazingEmailSent && finished("emma")) sendAmazingEmail();
      if (!q.trialEmailSent && finished("marcus")) sendTrialEmail();
      if (!q.prizeEmailSent && q.wifeFollowUpStarted && finished("emma")) sendPrizeEmail();

      // After the account is emptied the bank's decline mail has already gone out; these two
      // land in order, so Emma's reaction arrives before the bank asks him to check the history.
      if (q.bankDrained) {
        if (drainedAt.current === null) drainedAt.current = Date.now();
        const since = Date.now() - drainedAt.current;
        if (!q.wifeAngryEmailSent && since >= WIFE_DELAY) sendWifeAngryEmail();
        if (!q.balanceReviewSent && since >= REVIEW_DELAY) sendBalanceReviewEmail();
      }

      // The only way to finish stage 1: open the bank from its final "review your balance" mail
      // (that link is the only one carrying ?ref=review) while signed in. Logging in any other
      // way — earlier, from the site itself, while reading Emma's mail — must not end the story.
      if (
        !q.stage2Started &&
        q.bankDrained &&
        q.balanceReviewSent &&
        q.reviewLinkOpened &&
        bankSession.get().signedIn
      ) {
        if (quakeAt.current === null && !ended.current) quakeAt.current = Date.now();
      }

      // A slow tremble that builds until the screen gives out.
      if (quakeAt.current !== null && !ended.current) {
        const t = Math.min(1, (Date.now() - quakeAt.current) / QUAKE_MS);
        setShake(Math.round(Math.pow(t, 1.7) * 100) / 100);
        if (t >= 1) {
          ended.current = true;
          setShake(0);
          unlockScam(ANISH_CARD_IDS.aftermath); // completes the bank line's trophy
          endGame();
        }
      }

      // Stage 2: three days later. Marcus picks the thread back up once the caption has played...
      if (q.stage2Started && !q.friendConcernStarted && q.stage2CaptionSeen && finished("marcus")) {
        continueConversation("marcus", "threeDays");
        questStore.set((s: QuestFlags) => ({ ...s, friendConcernStarted: true }));
      }
      // The bank's email promises a phone call, so the phone rings shortly afterwards.
      if (q.stage2Started && q.supportEmailSent && !q.callStarted && !q.refundPaid) {
        if (callAt.current === null) callAt.current = Date.now() + 9_000;
        if (Date.now() >= callAt.current) {
          callAt.current = null;
          questStore.set((s: QuestFlags) => ({ ...s, callStarted: true }));
          wm.open("phone", undefined, { title: "Phone - Copperleaf Bank" });
          startBankCall();
        }
      }

      // Checking the account after the call is its own step: Marcus only gets in touch once the
      // player has actually seen the refund sitting in their balance.
      if (q.refundPaid && !q.refundChecked && bankSession.get().signedIn)
        questStore.set((s: QuestFlags) => ({ ...s, refundChecked: true }));

      // ...and he checks in once that has happened.
      if (q.stage2Started && q.refundChecked && !q.friendCheckInStarted && finished("marcus")) {
        continueConversation("marcus", "checkin");
        questStore.set((s: QuestFlags) => ({ ...s, friendCheckInStarted: true }));
      }
    }, 600);
    return () => {
      clearInterval(tick);
      setShake(0);
    };
  }, []);
  return null;
}
