// Tracks which one-shot quest events have fired (session-only, not persisted).
import { createStore } from "./store";

export interface QuestFlags {
  amazingEmailSent: boolean;
  amazingSignedIn: boolean;
  videoVaultSignedIn: boolean;
  trialEmailSent: boolean;
  /** Emma's second conversation (about asking Marcus for the money) has begun. */
  wifeFollowUpStarted: boolean;
  prizeEmailSent: boolean;
  bankDrained: boolean;
  /** Emma's mail after the bank's declined-payment alert. */
  wifeAngryEmailSent: boolean;
  /** The bank's follow-up asking Jamie to review his balance history. */
  balanceReviewSent: boolean;
  /** What the scammers actually took, so the goodwill refund can be worked out from it. */
  stolenAmount: number;
  /** Stage 2 (three days later): the recovery story after the bad ending. */
  stage2Started: boolean;
  /** The "three days later" caption has played. */
  stage2CaptionSeen: boolean;
  /** Marcus's "email the bank" conversation has begun. */
  friendConcernStarted: boolean;
  /** Emails the player has sent to Copperleaf support (each one advances the thread). */
  supportRound: number;
  /** The bank has answered the first email and promised to telephone. */
  supportEmailSent: boolean;
  /** The disputes call has started (the phone app opens for it). */
  callStarted: boolean;
  /** Support finally agreed a goodwill refund. */
  refundPaid: boolean;
  refundAmount: number;
  /** The player has logged into the bank and seen the refund. */
  refundChecked: boolean;
  /** Marcus's check-in after the refund has begun. */
  friendCheckInStarted: boolean;
  /** RBC was installed from the link Marcus gave. */
  rbcInstalled: boolean;
}

export const questStore = createStore<QuestFlags>(null, {
  amazingEmailSent: false,
  amazingSignedIn: false,
  videoVaultSignedIn: false,
  trialEmailSent: false,
  wifeFollowUpStarted: false,
  prizeEmailSent: false,
  bankDrained: false,
  wifeAngryEmailSent: false,
  balanceReviewSent: false,
  stolenAmount: 0,
  stage2Started: false,
  stage2CaptionSeen: false,
  friendConcernStarted: false,
  supportRound: 0,
  supportEmailSent: false,
  callStarted: false,
  refundPaid: false,
  refundAmount: 0,
  refundChecked: false,
  friendCheckInStarted: false,
  rbcInstalled: false,
});
