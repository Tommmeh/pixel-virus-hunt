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
}

export const questStore = createStore<QuestFlags>(null, {
  amazingEmailSent: false,
  amazingSignedIn: false,
  videoVaultSignedIn: false,
  trialEmailSent: false,
  wifeFollowUpStarted: false,
  prizeEmailSent: false,
  bankDrained: false,
});
