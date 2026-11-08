// Tracks which one-shot quest events have fired (session-only, not persisted).
import { createStore } from "./store";

export interface QuestFlags {
  amazingEmailSent: boolean;
  amazingSignedIn: boolean;
  videoVaultSignedIn: boolean;
  trialEmailSent: boolean;
  prizeEmailSent: boolean;
  bankDrained: boolean;
}

export const questStore = createStore<QuestFlags>(null, {
  amazingEmailSent: false,
  amazingSignedIn: false,
  videoVaultSignedIn: false,
  trialEmailSent: false,
  prizeEmailSent: false,
  bankDrained: false,
});
