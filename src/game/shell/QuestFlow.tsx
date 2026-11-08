// Watches the messenger and fires the next scam email once its conversation has played out.
// Emma finishes talking about the rent -> the Amazing gift-card phish arrives.
// Marcus finishes offering to lend money -> the VideoVault free-trial offer arrives.
// Emma's second conversation, which starts after the VideoVault sign-in -> the $500 prize mail.
import { useEffect } from "react";
import { chatStore } from "../apps/messenger/store";
import { receiveMail } from "../apps/webvoyager/sites/hotpost/store";
import { questStore, type QuestFlags } from "../system/quests";

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

export function QuestFlow() {
  useEffect(() => {
    const tick = setInterval(() => {
      const q = questStore.get();
      if (!q.amazingEmailSent && finished("emma")) sendAmazingEmail();
      if (!q.trialEmailSent && finished("marcus")) sendTrialEmail();
      if (!q.prizeEmailSent && q.wifeFollowUpStarted && finished("emma")) sendPrizeEmail();
    }, 600);
    return () => clearInterval(tick);
  }, []);
  return null;
}
